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
    sendResponse(extractOpenGraphData());
  }
});