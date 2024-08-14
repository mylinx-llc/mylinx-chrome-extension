import "./index.css";
import React from 'react';
import logo from '../../../../assets/img/logo.svg';

const NavHeader = () => {
    return (
        <>
            <div className="w-full">
                <div className="flex flex-row justify-between">
                    <h1 className="text-red-500">dsadsa</h1>
                    <img src={logo} alt="logo" height={32}  />
                </div>
            </div>
        </>
    )
};

export default NavHeader;