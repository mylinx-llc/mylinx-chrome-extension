console.log('This is the background page.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getOGData') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ['contentScript.bundle.js']
          },
          () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getOGData' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
              } else {
                sendResponse(response);
              }
            });
          }
        );
      }
    });
    return true; // Indicates async response
  }
});