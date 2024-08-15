import "./index.css";
import React from 'react';
import { Settings } from 'lucide-react';

const Footer = () => {
    const openOptions = () => {
        chrome.runtime.openOptionsPage();
    }
    return (
        <>
            <div className="w-full">
                <div className="flex flex-row justify-between">
                   <div></div>
                   <div className="cursor-pointer" onClick={openOptions}>
                    <Settings size={"1.75rem"} className="settings-icon" />
                   </div>
                </div>
            </div>
        </>
    )
};

export default Footer;