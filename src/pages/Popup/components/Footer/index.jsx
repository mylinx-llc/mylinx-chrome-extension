import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { isUnpackedExtension } from "../../../util";
import placeholderAvatar from "../../../../assets/img/transparent.png"

const HOST = isUnpackedExtension()
  ? 'http://localhost:3000'
  : 'https://mylinx.cc';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUserData = async () => {
    try {
      chrome.storage.local.get(['cookies'], function (result) {
        const cookies = result.cookies || '';
          fetch(`${HOST}/api/auth/getuser`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': window.location.href,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': navigator.userAgent, // Dynamically pass User-Agent
            'sec-ch-ua': navigator.userAgentData?.brands.map(b => `${b.brand};v="${b.version}"`).join(', ') || '',
            'sec-ch-ua-mobile': navigator.userAgentData?.mobile ? '?1' : '?0',
            'sec-ch-ua-platform': `"${navigator.platform}"`, // Pass platform dynamically
            'Cookie': cookies, 
          },
          credentials: 'include', 
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch user data: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            setUser(data.user);
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    const checkLoginAndFetchLinks = () => {
        chrome.storage.local.get('isLoggedIn', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error fetching login status:', chrome.runtime.lastError);
            } else {
                setIsLoggedIn(result.isLoggedIn || false);

                if (result.isLoggedIn) {
                  fetchUserData()
                }
            }
        });
    };

    checkLoginAndFetchLinks();

    // Listen for updates from the background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateLoginStatus') {
            setIsLoggedIn(message.isLoggedIn);
            if (message.isLoggedIn) {
                checkLoginAndFetchLinks();
            } 
        }
    });
}, []);

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const openAvatar = () => {
    const url = isLoggedIn 
      ? `${HOST}/edit` 
      : `${HOST}/signup`;
  
    chrome.tabs.update({ url });
  };

  const handleLoginClick = () => {
    // Open login page in a new tab
    chrome.tabs.create({ url: `${HOST}/login` });

    // Send message to background script to check authentication status
    chrome.runtime.sendMessage({ action: 'auth-check' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error sending auth-check message:',
          chrome.runtime.lastError
        );
      } else {
        console.log('Auth-check message sent:', response);
      }
    });
  };

  const handleSignUpClick = () => {
    chrome.tabs.create({ url: `${HOST}/signup`})
  }
  
  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center">
        {/* Left side - Login Link */}
        <div>
          {!isLoggedIn ? (
            <div className='flex space-x-1'>
              <span
              onClick={handleSignUpClick}
              className="text-green-500 hover:underline cursor-pointer"
            >
              Sign Up
            </span>
            <span>or</span>
            <span
              onClick={handleLoginClick}
              className="text-green-500 hover:underline cursor-pointer"
            >
              Login
            </span>
              </div>
          ) : (
            <div onClick={openAvatar} className="flex flex-row items-center hover:text-green-500 cursor-pointer ease-in duration-150">
              <div className="bg-white h-7 w-7 rounded-full">
                <img
                  src={user?.pfp ? user?.pfp : placeholderAvatar}
                  alt="placeholder"
                  className="object-cover rounded-full h-full w-full"
                />
              </div>
              <div className="ml-2">{user?.username ? user?.username : 'null'}</div>
            </div>
          )}
        </div>
        {/* Right side - Settings Icon */}
        <div className="cursor-pointer" onClick={openOptions}>
          <Settings size={'1.75rem'} className="settings-icon" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
