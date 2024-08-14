// extract the main domain from a given hostname
export function extractMainDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join('.');
  }
  
  export const getKeyFromLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        resolve(result[key]);
      });
    });
  };
  
  export const getCurrentTabDomain = async () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const domain = extractMainDomain(new URL(currentTab.url).hostname);
        resolve(domain);
      });
    });
  };
  