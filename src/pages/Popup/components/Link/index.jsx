import { useState } from 'react';
import './index.css';
import React, { useEffect } from 'react';
import { extractOpenGraphData, getCurrentTabURL } from '../../../util';
import { Copy, Share, QrCode } from 'lucide-react';
import { useToast } from '../../ToastContext';

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
  const { triggerToast } = useToast();

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
        handleCopy()

        setIsLoading(false);
        return;
      }

      if (initPopup && !hasLogged) {
        console.log('first open');
        // Set the flag in sessionStorage so it won't log again
        sessionStorage.setItem('firstOpenLogged', 'true');

        setCurrentTabURL(currentTabURL);

        const data = await extractOpenGraphData();
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

          console.log(updatedData);
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
      setIsLoading(false);
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
    // Handle QR Code generation and display logic here
    console.log('Generate QR Code for URL:', ogData.shortUrl);
  };

  return (
    <div className="w-full h-full flex justify-between items-center">
      {isLoading && <span className="loader"></span>}
      {!isLoading && (
        <div className="w-full flex flex-col items-start justify-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 px-2 py-1">
              {(ogData.favicon || ogData.image) && (
                <img
                  src={ogData.favicon || ogData.image}
                  alt="Shorten Url Favicon"
                  className="w-13 h-13 object-cover"
                />
              )}
              <div className="text-xl font-medium">
                {ogData.shortUrl ? ogData.shortUrl.replace('https://', '') : ''}
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-2 px-2 pt-4 ">
            <button onClick={handleCopy} className="p-2 default-icon">
              <Copy size={26} />
            </button>
            <button onClick={handleShare} className="p-2 default-icon">
              <Share size={26} />
            </button>
            <button onClick={handleQRCode} className="p-2 default-icon">
              <QrCode size={26} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Link;
