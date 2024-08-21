import { useState } from 'react';
import './index.css';
import React, { useEffect } from 'react';
import { extractOpenGraphData, getCurrentTabURL, isUnpackedExtension } from '../../../util';
import { Copy, Share, QrCode } from 'lucide-react';
import { useToast } from '../../ToastContext';
import QrCodeDownloader from './QrCodeDownloader';
import { parseDataToOgDataArray } from "../../util";

const HOST = isUnpackedExtension()
? 'http://localhost:3000'
: 'https://mylinx.cc';


const Link = ({ initPopup, qrCodeOpen, setQrCodeOpen  }) => {
  const [ogData, setOgData] = useState({
    favicon: '',
    image: '',
    title: '',
    description: '',
    shortUrl: '',
    longUrl: '',
    dateCreated: '',
  });
  const [currentTabURL, setCurrentTabURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { triggerToast } = useToast();
  const [loggedIn, setIsLoggedIn] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(async () => {
    const fetchData = async () => {
      setIsLoading(true);
      const currentTabURL = await getCurrentTabURL();
      const hasLogged = sessionStorage.getItem('firstOpenLogged');
      const storedURL = localStorage.getItem('firstOpenedURL');
      
      const forbiddenURLs = ["chrome://", "edge://", "chrome-extension"];
      if (forbiddenURLs.some(url => currentTabURL.includes(url))){
        setCurrentTabURL("null")
        setIsLoading(false);
        return        
      } 

      // User is not logged in, check if they exceeded the limit
      const ogDataArray = JSON.parse(localStorage.getItem('ogDataArray')) || [];
      if (!loggedIn && ogDataArray.length >= 5) {
        setLimitReached(true);
      }

      // user already shorten this url use saved data
      if (storedURL === currentTabURL) {
        const storedOgData = localStorage.getItem('firstOpenedOgData');
        if (storedOgData) {
          setOgData(JSON.parse(storedOgData));
        }
        setCurrentTabURL(currentTabURL);
        handleCopy()

        setIsLoading(false);
        return;
      }

      if (initPopup && !hasLogged) {
        // Set the flag in sessionStorage so it won't log again
        sessionStorage.setItem('firstOpenLogged', 'true');
        setCurrentTabURL(currentTabURL);

        const extactedOpenGraphData = await extractOpenGraphData();
        setOgData(extactedOpenGraphData);
        localStorage.setItem('firstOpenedURL', currentTabURL); // Corrected the key here


        const checkLoginAndFetchLinks = async () => {
          chrome.storage.local.get('isLoggedIn', async (result) => {
              if (chrome.runtime.lastError) {
                  console.error('Error fetching login status:', chrome.runtime.lastError);
              } else {
                  setIsLoggedIn(result.isLoggedIn || false);

                  if (result.isLoggedIn) {
                      chrome.cookies.getAll({ domain: `${HOST === "http://localhost:3000" ? 'localhost:3000' : 'mylinx.cc'}` }, async (cookies) => {
                          const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
                          await shortenURLForLoggedInUser(currentTabURL, cookieString, extactedOpenGraphData);
                      });
                  } else {
                     // User is not logged in, check if they exceeded the limit
                    const ogDataArray = JSON.parse(localStorage.getItem('ogDataArray')) || [];
                    if (ogDataArray.length >= 5) {
                      setLimitReached(true);
                      setIsLoading(false);
                    } else {
                      await shortenURL(currentTabURL);
                    }
                  }
              }
          });
      };

      checkLoginAndFetchLinks();

      }
    };

    fetchData();
  }, [initPopup]);


  const shortenURL = async (currentTabURL) => {
    const host = isUnpackedExtension()
    ? 'http://localhost:3000'
    : 'https://mylinx.cc';

    try {
      const response = await fetch(`${host}/api/link-shortener/chrome-extension-shorten-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentTabURL }),
      });

      if (response.status === 429) {
        console.log('Too many requests');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        const { shortUrl, longUrl, dateCreated } = result;

        setOgData((prevData) => {
          const updatedData = {
            ...prevData,
            shortUrl,
            longUrl,
            dateCreated,
          };

          localStorage.setItem(
            'firstOpenedOgData',
            JSON.stringify(updatedData)
          ); // Save to localStorage
          
          // Retrieve exisitng ogData array from localStorage
          const existingOgDataArray = JSON.parse(localStorage.getItem('ogDataArray')) || [];
          // Check if the new data is already in the array
          const isDataUnique = !existingOgDataArray.some(
            (data) => data.shortUrl === updatedData.shortUrl
          );

          if (isDataUnique) {
            // Append new data to the array and save it to localStorage
            existingOgDataArray.push(updatedData);
            localStorage.setItem('ogDataArray', JSON.stringify(existingOgDataArray));
          }

          handleCopy()
          return updatedData;
        });
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shortenURLForLoggedInUser = async (currentTabURL, cookies, extactedOpenGraphData) => {
    const host = isUnpackedExtension()
    ? 'http://localhost:3000'
    : 'https://mylinx.cc';

    try {

      console.log(cookies);
      const response = await fetch(`${host}/api/link-shortener/chrome-extension-user-shorten-link`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'User-Agent': navigator.userAgent,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          url: currentTabURL,
          ogImage: extactedOpenGraphData.image,
          ogDesc:  extactedOpenGraphData.description,
          ogTitle: extactedOpenGraphData.title
         }),
      });

      if (response.ok) {
        const result = await response.json();
        const { shortUrl, longUrl, dateCreated } = result;

        setOgData((prevData) => {
          const updatedData = {
            ...prevData,
            shortUrl,
            longUrl,
            dateCreated,
          };

          localStorage.setItem(
            'firstOpenedOgData',
            JSON.stringify(updatedData)
          ); // Save to localStorage
  
          handleCopy()
          return updatedData;
        });

      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
      }
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCopy = () => {
    if (ogData.shortUrl) {
      navigator.clipboard.writeText(ogData.shortUrl);
      triggerToast('Link copied to clipboard')
    }
  };

  const handleShare = () => {};

  const handleQRCode = () => {
    setQrCodeOpen((prev) => !prev);
  };

  return (
    <div className="w-full h-full">
      {isLoading && <span className="loader"></span>}
      {!isLoading && (
        <div className="h-full flex flex-col items-start justify-between">
          
          { !qrCodeOpen ? (
            <div className="flex justify-center text-md">
              {currentTabURL === "null" && (
                <div className="flex flex-col">
                  <div className='font-bold text-lg'>This is not a valid URL</div>
                  <div>If you believe this is wrong, please report any issues at our
                    <span>&nbsp;<a href="https://discord.gg/fanWUQgygx" target='_blank' className='text-green-500'>Discord.</a></span>
                  </div>
                </div>
              )}
            <div className="flex items-center space-x-4 px-2 py-1 ">
              { limitReached ? (
                <div className='w-full flex flex-col justify-center items-center text-lg'>
                  <div className="text-md font-bold">You've reached your 5-link limit</div>
                  <div className="text-md font-bold">Sign up to receieve 50 links/month FREE</div>
                </div>
              ): (
                <>
                {(ogData.favicon || ogData.image) && (
                <img
                  src={ogData.favicon || ogData.image}
                  alt="Shorten Url Favicon"
                  className="w-12 h-12 object-cover"
                  height={48}
                  width={48}
                />
              )}
              <div className="text-2xl font-medium">
                {ogData.shortUrl ? ogData.shortUrl.replace('https://', '') : ''}
              </div>
                </>
              )}
            </div>
          </div>
          ) : (
            <div className='w-full '>
                <QrCodeDownloader
                contentString={ogData.shortUrl}
                watermark={false}
                />
            </div>
          )}
          {!limitReached && (
            <div className="flex flex-row space-x-2 px-2 pt-2 ">
            <button onClick={handleCopy} className="p-2 default-icon">
              <Copy size={26} />
            </button>
            {/* <button onClick={handleShare} className="p-2 default-icon">
              <Share size={26} />
            </button> */}
            <button onClick={handleQRCode} className={`cursor-pointer default-icon p-2 ${qrCodeOpen ? 'active-icon': ''}`}>
              <QrCode size={26} />
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Link;
