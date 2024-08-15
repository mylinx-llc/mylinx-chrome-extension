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

  export const setKeyInLocalStorage = async (key, value) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  };

  export const getCurrentTabURL = async () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
          resolve(currentTab.url);
        } else {
          reject('Unable to retrieve the current tab URL');
        }
      });
    });
  };

  export const extractOpenGraphData = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getOGData' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
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
  