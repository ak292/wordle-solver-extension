chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startWordle") {
    const play = setInterval(function () {
      const playButton = document.querySelector('button[data-testid="Play"]');
      playButton.click();
      console.log("done");

      // setTimeout required because button takes a second or two to load
      setTimeout(function () {
        const xButton = document.getElementsByClassName("Modal-module_closeIcon__TcEKb");
        console.log(xButton[0]);
        xButton[0].click();
      }, 2000);

      setTimeout(function () {
        function simulateKeypress(key) {
          const keyEventOptions = {
            key: key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true,
            cancelable: true,
          };

          // need to dispatch all 3 events to simulate a real keyboard click
          // otherwise Wordle website wont register it
          const keydownEvent = new KeyboardEvent("keydown", keyEventOptions);
          document.dispatchEvent(keydownEvent);

          const keypressEvent = new KeyboardEvent("keypress", keyEventOptions);
          document.dispatchEvent(keypressEvent);

          const keyupEvent = new KeyboardEvent("keyup", keyEventOptions);
          document.dispatchEvent(keyupEvent);
        }

        let wordToGuess = "";

        chrome.runtime.sendMessage({ action: "getWord" }, (response) => {
          if (response) {
            const word = response; // word of the day received from background
            console.log("Received word:", word);

            wordToGuess = word;
          } else {
            console.error("No word received");
          }
        });

        let index = 0;

        // function for typing actual word
        // delays required for it to be processed
        setTimeout(() => {
          function typeWord() {
            if (index < wordToGuess.length) {
              simulateKeypress(wordToGuess[index]);
              index++;
              setTimeout(typeWord, 200);
            } else {
              chrome.runtime.sendMessage({ action: "wordleSolved" });
              setTimeout(() => simulateKeypress("Enter"), 200);
            }
          }

          typeWord();
        }, 500);
      }, 2000);

      clearInterval(play);
    }, 1000);
  }
});
