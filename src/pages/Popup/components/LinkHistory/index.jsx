import "./index.css";
import React, { useEffect, useState } from 'react';
import { Copy, QrCode } from 'lucide-react'; 
import QrCodeDownloader from "../Link/QrCodeDownloader";
import logo from "../../../../assets/img/icon-128.png";
import { useToast } from '../../ToastContext';

const LinkHistory = ({ qrCodeOpen, setQrCodeOpen }) => {
    const [ogDataArray, setOgDataArray] = useState([]);
    const [qrCodeData, setQrCodeData] = useState(null);
    const { triggerToast } = useToast();

    useEffect(() => {
        // Load the ogDataArray from localStorage when the component mounts
        const storedOgDataArray = JSON.parse(localStorage.getItem('ogDataArray')) || [];
        setOgDataArray(storedOgDataArray);
    }, []);

    const handleCopy = (shortUrl) => {
        navigator.clipboard.writeText(shortUrl);
        triggerToast('Link copied to clipboard')
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
        <div className="w-full p-4">
            {ogDataArray.length === 0 ? (
                <p>No link history found.</p>
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
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleCopy(ogData.shortUrl)} className="p-2 default-icon">
                                <Copy size={26} />
                            </button>
                            <button onClick={() => handleQRCode(ogData.shortUrl)} className="p-2 default-icon">
                                <QrCode size={26} />
                            </button>
                        </div>
                    </div>
                ))
            )}
            {qrCodeOpen && qrCodeData && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
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
