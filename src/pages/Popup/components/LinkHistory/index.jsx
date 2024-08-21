import "./index.css";
import React, { useEffect, useState } from 'react';
import { Copy, QrCode, Trash } from 'lucide-react'; 
import QrCodeDownloader from "../Link/QrCodeDownloader";
import logo from "../../../../assets/img/icon-128.png";
import { useToast } from '../../ToastContext';
import { parseDataToOgDataArray } from "../../util";
import { isUnpackedExtension } from "../../../util";

const LinkHistory = ({ qrCodeOpen, setQrCodeOpen }) => {
    const [ogDataArray, setOgDataArray] = useState([]);
    const [qrCodeData, setQrCodeData] = useState(null);
    const { triggerToast } = useToast();
    const [loggedIn, setIsLoggedIn] = useState(false);

    const MYLINX_HOST = isUnpackedExtension()
    ? 'http://localhost:3000'
    : 'https://mylinx.cc';


    // Function to fetch user links
    const fetchUserLinks = async (cookies) => {
        try {
            const response = await fetch(`${MYLINX_HOST}/api/link-shortener/user-get-links`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'Cookie': cookies,
                    'User-Agent': navigator.userAgent,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setOgDataArray(parseDataToOgDataArray(data.data) || []);
            } else {
                console.error('Failed to fetch user links:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user links:', error);
        }
    };

    const deleteUserLink = async (shortUrl) => {
        try {
            const response = await fetch(`${MYLINX_HOST}/api/link-shortener/chrome-extension-user-delete-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shortCode: shortUrl.replace("https://ezy.ovh/","") }),
            });

            if (response.ok) {
                setOgDataArray((prev) => prev.filter((ogData) => ogData.shortUrl !== shortUrl));
                triggerToast('Link deleted successfully');
            } else {
                console.error('Failed to delete link:', response.statusText);
                triggerToast('Failed to delete link');
            }
        } catch (error) {
            console.error('Error deleting link:', error);
            triggerToast('Error deleting link');
        }
    };

    // Fetch cookies from Chrome storage
    useEffect(() => {
        const checkLoginAndFetchLinks = () => {
            chrome.storage.local.get('isLoggedIn', (result) => {
                if (chrome.runtime.lastError) {
                    console.error('Error fetching login status:', chrome.runtime.lastError);
                } else {
                    setIsLoggedIn(result.isLoggedIn || false);

                    if (result.isLoggedIn) {
                        chrome.cookies.getAll({ domain: 'mylinx.cc' }, (cookies) => {
                            const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
                            fetchUserLinks(cookieString);
                        });
                    } else {
                        // guest users
                        const ogDataArray = JSON.parse(localStorage.getItem('ogDataArray')) || [];
                        if (ogDataArray){
                            setOgDataArray(ogDataArray)
                        }
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
                } else {
                    setOgDataArray([]);
                }
            }
        });
    }, []);

    const handleCopy = (shortUrl) => {
        navigator.clipboard.writeText(shortUrl);
        triggerToast('Link copied to clipboard');
    };

    const handleQRCode = (shortUrl) => {
        setQrCodeData(shortUrl);
        setQrCodeOpen(true); 
    };

    const handleCloseQRCode = () => {
        setQrCodeOpen(false); 
        setQrCodeData(null);
    };

    return (
        <div className={`w-full h-full ${ogDataArray.length === 0 ? 'flex justify-center items-center': ''}`}>
            {ogDataArray.length === 0 ? (
                <div className="flex flex-col justify-center items-center">
                    <div class="spinner"></div>
                    <div className="text-lg font-bold flex justify-center items-center mt-2">You don't have any links</div>
                </div>
            
            ) : (
                ogDataArray.map((ogData, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            {(ogData.favicon || ogData.image) ? (
                                <img
                                    src={ogData.favicon || ogData.image}
                                    alt="Shorten Url Favicon"
                                    className="w-12 h-12 object-cover"
                                    height={48}
                                    width={48}
                                />
                            ): (
                                <img
                                    src={logo}
                                    alt="Shorten Url Favicon"
                                    className="w-12 h-12 object-cover"
                                    height={48}
                                    width={48}
                                />
                            )}
                            <div className="flex flex-col">
                                <div className="text-xl font-medium">
                                    {ogData.shortUrl ? ogData.shortUrl.replace('https://', '') : ''}
                                </div>
                                {ogData.longUrl && (
                                    <div className="pt-1 text-gray-500 text-xs truncate line-clamp-1 w-44">
                                        {ogData.longUrl.replace("https://","")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => handleCopy(ogData.shortUrl)} className="p-2 default-icon">
                                <Copy size={22} />
                            </button>
                            <button onClick={() => handleQRCode(ogData.shortUrl)} className="p-2 default-icon">
                                <QrCode size={22} />
                            </button>
                            { loggedIn && (
                                <button onClick={() => deleteUserLink(ogData.shortUrl)} className="p-2 default-icon">
                                    <Trash size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
            {qrCodeOpen && qrCodeData && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                        <QrCodeDownloader
                            contentString={qrCodeData}
                            watermark={false}
                        />
                        <button onClick={handleCloseQRCode} className="mt-4 p-2 text-red-500">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkHistory;
