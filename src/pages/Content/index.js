import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

function getFavicon() {
  const faviconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  return faviconLink ? faviconLink.href : ''
}

function extractOpenGraphData() {
  const favicon = getFavicon();

  const ogData = {
    favicon: favicon ? favicon : null,
    image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    title: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    description: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''
  };

  
  return { ...ogData }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getOGData') {
    if (!/^chrome:\/\/|^about:/.test(window.location.href)) {
      // Only execute if it's not a special page
      sendResponse(extractOpenGraphData());
    }
  }
});

function onUrlChange() {
  if (window.location.pathname === '/edit/links') {
    chrome.runtime.sendMessage({ action: 'auth-check' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending auth-check message:', chrome.runtime.lastError);
      } else {
        console.log('Auth-check message sent:', response);
      }
    });
  }
}

// Run the check on page load
onUrlChange();
// Monitor URL changes
window.addEventListener('popstate', onUrlChange);
window.addEventListener('hashchange', onUrlChange);