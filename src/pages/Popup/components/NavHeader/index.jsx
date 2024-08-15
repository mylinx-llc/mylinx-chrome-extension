import "./index.css";
import React from 'react';
import logo from '../../../../assets/img/logo-long.svg';
import { Link } from 'lucide-react';
import { Clock3 } from 'lucide-react';

const NavHeader = ({ activeIcon, setActiveIcon }) => {
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
                        <img src={logo} alt="logo" />
                    </div>
                </div>
            </div>
        </>
    )
};

export default NavHeader;
