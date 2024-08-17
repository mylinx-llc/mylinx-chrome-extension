import "./index.css";
import React from 'react';
import { Settings } from 'lucide-react';

const Footer = () => {
    const openOptions = () => {
        chrome.runtime.openOptionsPage();
    };

    const handleLogin = () => {
        
    };

    return (
        <div className="w-full">
            <div className="flex flex-row justify-between items-center">
                {/* Left side - Login Link */}
                <div>
                    {/* <span 
                        onClick={handleLogin} 
                        className="text-blue-500 hover:underline cursor-pointer"
                    >
                        Login
                    </span> */}
                </div>
                {/* Right side - Settings Icon */}
                <div className="cursor-pointer" onClick={openOptions}>
                    <Settings size={"1.75rem"} className="settings-icon" />
                </div>
            </div>
        </div>
    );
};

export default Footer;
