import "./index.css";
import React from 'react';
import { Link } from 'lucide-react';
import { Clock3 } from 'lucide-react';
import logo from "../../../../assets/img/icon-34.png"

const NavHeader = ({ activeIcon, setActiveIcon }) => {
    const handleLinkClick = (url) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url });
        });
    };
  
    return (
        <>
            <div className="w-full h-full">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row space-x-5">
                        <div
                            onClick={() => setActiveIcon('link')}
                        >
                            <Link size={24}  className={`cursor-pointer ${activeIcon === 'link' ? 'active-icon' : ''} default-icon`} />
                        </div>
                        <div
                            onClick={() => setActiveIcon('clock')}
                        >
                            <Clock3 size={24} className={`cursor-pointer ${activeIcon === 'clock' ? 'active-icon' : ''} default-icon`} />
                        </div>
                    </div>
                    <div className="">
                    <button onClick={() => handleLinkClick("https://mylinx.cc/")} aria-label="mylinx dashboard">
                        <img src={logo} alt="logo" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default NavHeader;
