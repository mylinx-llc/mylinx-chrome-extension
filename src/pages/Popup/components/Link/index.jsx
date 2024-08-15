import { useState } from 'react';
import './index.css';
import React, { useEffect } from 'react';
import { extractOpenGraphData, getCurrentTabURL } from '../../../util';
import { Copy, Share, QrCode } from 'lucide-react';

const Link = ({ initPopup }) => {
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

  useEffect(async () => {
    const fetchData = async () => {
      setIsLoading(true);
      const currentTabURL = await getCurrentTabURL();
      const hasLogged = sessionStorage.getItem('firstOpenLogged');
      const storedURL = localStorage.getItem('firstOpenedURL');

      // user already shorten this url use saved data
      if (storedURL === currentTabURL) {
        const storedOgData = localStorage.getItem('firstOpenedOgData');
        if (storedOgData) {
          setOgData(JSON.parse(storedOgData));
        }
        setCurrentTabURL(currentTabURL);
        setIsLoading(false);
        return;
      }
        
      if (initPopup && !hasLogged ) {
        console.log('first open');
        // Set the flag in sessionStorage so it won't log again
        sessionStorage.setItem('firstOpenLogged', 'true');

        setCurrentTabURL(currentTabURL);

        const data = await extractOpenGraphData();
        console.log(data);
        setOgData(data);
        localStorage.setItem('firstOpenedURL', currentTabURL); // Corrected the key here

        await shortenURL(currentTabURL);
      }
    };

    fetchData();
  }, [initPopup]);

  const shortenURL = async (currentTabURL) => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/link-shortener/chrome-extension-shorten-links',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: currentTabURL }),
        }
      );

      if (response.status === 429) {
        setIsLoading(false);
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
            localStorage.setItem('firstOpenedOgData', JSON.stringify(updatedData)); // Save to localStorage
            return updatedData;
          });
          
        console.log('Shortened URL:', result);
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
      }
    } catch (error) {
      console.log('Fetch error:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">
      {isLoading && <span className="loader"></span>}
      {!isLoading && (
        <div className="flex items-center space-x-4">
          {ogData.favicon && (
            <img
              src={ogData.favicon}
              alt="Shorten Url Favicon"
              className="w-16 h-16 object-cover"
            />
          )}
          <div className="text-xl font-medium">
            {ogData.shortUrl ? ogData.shortUrl.replace('https://', '') : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default Link;
