console.log("background script running");

chrome.webRequest.onCompleted.addListener(
  async function (details) {
    if (
      details.url.includes("json") &&
      details.url.includes(`${new Date().getFullYear()}`) &&
      details.initiator !== "chrome-extension://" + chrome.runtime.id
    ) {
      let response = await fetch(details.url);
      response = await response.json();

      console.log(response.solution);

      const wordOfTheDay = response.solution;

      chrome.storage.local.set({
        wordOfTheDay,
      });
    }
  },
  { urls: ["<all_urls>"] }
);

// listen for requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWord") {
    chrome.storage.local.get(["wordOfTheDay"], (result) => {
      sendResponse(result.wordOfTheDay);
    });
    return true;
  }
});
