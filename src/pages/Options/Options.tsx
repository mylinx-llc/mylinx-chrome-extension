import React, { useEffect, useState } from 'react';
// @ts-ignore
import Logo from "../../assets/img/logo-long.svg";

const Options: React.FC = () => {
  const [brandingBehaviourChecked, setBrandingBehaviourChecked] = useState(true);
  const [autoURLShortenChecked, setAutoURLShortenChecked] = useState(true);
  const [version, setVersion] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Get version from manifest
    const manifestData = chrome.runtime.getManifest();
    setVersion(manifestData.version);

    // Check login status on component mount
    chrome.storage.local.get('isLoggedIn', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching login status:', chrome.runtime.lastError);
      } else {
        setIsLoggedIn(result.isLoggedIn || false);
      }
    });

    // Listen for updates from the background script
    const handleMessage = (message: any) => {
      if (message.action === 'updateLoginStatus') {
        setIsLoggedIn(message.isLoggedIn);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [version]);

  useEffect(() => {
    localStorage.setItem('brandingBehaviour', brandingBehaviourChecked.toString());
  }, [brandingBehaviourChecked]);

  useEffect(() => {
    localStorage.setItem('autoURLShorten', autoURLShortenChecked.toString());
  }, [autoURLShortenChecked]);

  const handleLogout = () => {
    chrome.storage.local.set({ isLoggedIn: false });
    setIsLoggedIn(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <header className="flex items-center mb-8">
        <div className="flex items-center w-full">
          <img src={Logo} alt="Logo" className="h-12 mr-3" />
          <span className="text-2xl font-semibold text-gray-700">Chrome Extension Options</span>
        </div>
      </header>
      
      <main className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <label className="block text-lg text-gray-800 mb-2">
            <div className='font-bold'>Branding Behaviour</div>
            <div className="flex items-center mt-2">
              <input 
                disabled
                type="checkbox" 
                id="brandingBehaviour" 
                className="mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                checked={brandingBehaviourChecked}
                onChange={() => setBrandingBehaviourChecked(!brandingBehaviourChecked)}
              />
              <label htmlFor="brandingBehaviour" className="text-gray-600 cursor-pointer">
                Enable automatic copy to clipboard
              </label>
            </div>
          </label>
        </div>
        
        <div className="mb-6">
          <label className="block text-lg text-gray-800 mb-2">
            <div className='font-bold'>Auto URL Shorten</div>
            <div className="flex items-center mt-2">
              <input 
                disabled
                type="checkbox" 
                id="autoURLShorten" 
                className="mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                checked={autoURLShortenChecked}
                onChange={() => setAutoURLShortenChecked(!autoURLShortenChecked)}
              />
              <label htmlFor="autoURLShorten" className="text-gray-600 cursor-pointer">
                Enable auto shorten current tab on click
              </label>
            </div>
          </label>
        </div>
        
        <div className="mb-6">
          <label className="block text-lg text-gray-800 mb-2">
            <div className='font-bold'>Service Status</div>
            <div className="mt-2 text-gray-600">
              Check our <a href="https://status.mylinx.cc/" target='_blank' className="text-green-600 hover:underline">status page</a> for updates.
            </div>
          </label>
        </div>
        
        <div className="mb-6">
          <label className="block text-lg text-gray-800 mb-2">
            <div className='font-bold'>Rate Our Extension</div>
            <div className="text-gray-600">
              Your opinion means a lot to us! If you like our extension, please <a href="https://chromewebstore.google.com/detail/koeafilbladcecfhnfjkegnfniifglko" target='_blank' className="text-green-600 hover:underline">rate us on the Chrome Web Store</a>.
            </div>
          </label>
        </div>

        {isLoggedIn && (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2">
              <div className="mt-2 text-gray-600">
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 px-4 py-1 bg-red-500 text-white  text-md rounded hover:bg-red-600"
              >
                Logout
              </button>
            </label>
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-3xl mt-8">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <a href="https://mylinx.cc/features/link-in-bio" className="text-green-600 hover:underline">Other ways to use Mylinx</a>
          <span>v{version}</span>
          <a href="https://discord.gg/fanWUQgygx" target='_blank' className="text-green-600 hover:underline">Get in touch with us</a>
        </div>
      </footer>
    </div>
  );
};

export default Options;
