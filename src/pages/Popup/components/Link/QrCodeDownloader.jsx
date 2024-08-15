import { QRCode } from 'react-qrcode-logo';
import React, { useState } from 'react';
import { delay  } from "../../../util";

const QrCodeDownloader = ({ contentString, watermark }) => {
  const [eyeColor, setEyeColor] = useState('#0BA976')
  const [eyeRadius, setEyeRadius] = useState(0)
  const [qrStyle, setQrStyle] = useState('squares')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#1A202C')
  const [size, setSize] = useState(148);

  const handleDownload = async(filename) => {
    const canvas = document.getElementById('qr-code');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1);
    link.download = `${filename}.png`;
    link.click();
    
    await delay(150);
    setSize(128)
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4">
        <QRCode
           fgColor={fgColor}
           bgColor={bgColor}
           enableCORS={true}
           quietZone={0}
           qrStyle={"squares"}
           eyeColor={eyeColor}
           eyeRadius={eyeRadius}
           id="qr-code"
           value={contentString}
           logoImage={'/logo.png'}
           logoWidth={50}
           logoHeight={16}
           logoPadding={2}
           removeQrCodeBehindLogo={true}
           logoPaddingStyle={"square"}
           size={size}
        />
      </div>
      <div className="flex space-x-2 mt-2">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSize(64);
            handleDownload(`${contentString && contentString.replace("https://","")}-QRCode-64.png`)
          }}
        >
          64px
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSize(128);
            handleDownload(`${contentString && contentString.replace("https://","")}-QRCode-128.png`)
          }}
        >
          128px
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSize(256);
            handleDownload(`${contentString && contentString.replace("https://","")}-QRCode-256.png`)
          }}
        >
          256px
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setSize(512);
            handleDownload(`${contentString && contentString.replace("https://","")}-QRCode-512.png`)
          }}
        >
          512px
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleDownload}
        >
          SVG
        </button>
      </div>
    </div>
  );
};

export default QrCodeDownloader;