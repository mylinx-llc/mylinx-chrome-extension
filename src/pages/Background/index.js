console.log('This is the background page.');

function isUnpackedExtension() {
  try {
    // Access the extension's manifest
    const manifest = chrome.runtime.getManifest();
    
    // Check for specific attributes commonly found in packed extensions
    // Alternatively, you can use different criteria to determine the extension type
    // Note: This is a heuristic and might need adjustment based on your specific context
    const isUnpacked = !manifest.update_url && manifest.name && manifest.version;
    
    return isUnpacked;
  } catch (e) {
    // If accessing the manifest fails, assume the extension is packed
    console.error("Error accessing extension manifest:", e);
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getOGData') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const activeTab = tabs[0];

        if (activeTab.url.includes("chrome-extension://"))
          return;

        const tabUrl = new URL(activeTab.url);
        // Check if the URL is a chrome:// or about: page
        if (tabUrl.protocol === 'chrome:' || tabUrl.protocol === 'about:') {
          console.warn('Ignored chrome:// or about: page');
          sendResponse({ error: 'Unsupported page' });
          return; // Exit early
        }
        
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ['contentScript.bundle.js']
          },
          () => {
            chrome.tabs.sendMessage(activeTab.id, { action: 'getOGData' }, (response) => {
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

  if (message.action === 'auth-check') {
    initialize().then(() => { sendResponse({ status: 'completed' })});
    return true; // Indicates async response
  }
});

// Function to get a cookie
function getCookie(name) {
  const URL = isUnpackedExtension()
  ? 'http://localhost:3000'
  : 'https://mylinx.cc';

  return new Promise((resolve) => {
    chrome.cookies.get({ url: URL, name: name }, function (cookie) {
      if (chrome.runtime.lastError) {
        console.error(`Error getting cookie '${name}' from ${URL}:`, chrome.runtime.lastError);
        resolve(null);
      } else if (cookie) {
        resolve(cookie);
      } else {
        console.log(`Cookie '${name}' not found for ${URL}`);
        resolve(null); // Resolve with null if cookie is not found
      }
    });
  });
}

function checkIfLoggedIn() {
  return getCookie('__Secure-next-auth.session-token')
    .then(cookie => cookie !== null) // Check if cookie is not null
    .catch(() => false); // Fallback to false if any error occurs
}

// Function to store cookies in Chrome's local storage
function storeCookies(cookies) {
  const cookieObject = cookies.reduce((obj, cookie) => {
    obj[cookie.name] = cookie.value;
    return obj;
  }, {});

  return new Promise((resolve) => {
    chrome.storage.local.set({ cookies: cookieObject }, function () {
      console.log('Cookies have been stored.');
      resolve();
    });
  });
}

// Function to save login status to storage
function saveLoginStatusToStorage(isLoggedIn) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ isLoggedIn: isLoggedIn }, function () {
      console.log('Login status has been saved:', isLoggedIn);
      resolve();
    });
  });
}

// Main function to check and store cookies, then update login status
function initialize() {
  const prodTag = isUnpackedExtension()
  ? ''
  : '__Secure-'; // prod 

  Promise.all([
    getCookie(`__Secure-next-auth.callback-url`),
    getCookie(`__Secure-next-auth.session-token`)
  ])
    .then(results => {
     // Filter out null results
      const validCookies = results.filter(cookie => cookie !== null);
      return storeCookies(validCookies);
    })
    .then(() => checkIfLoggedIn())
    .then(isLoggedIn => saveLoginStatusToStorage(isLoggedIn))
    .catch(error => {
      // Log any error that occurs during the process
      console.error('Error occurred:', error);
    });
}

// Run initialize function on extension startup
initialize();