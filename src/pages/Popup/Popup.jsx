import React, { useState, useEffect } from 'react';
import './Popup.css';
import NavHeader from './components/NavHeader';
import Footer from './components/Footer';
import Link from './components/Link';
import LinkHistory from './components/LinkHistory';

const Popup = () => {
  // State to track which icon is active
  const [activeIcon, setActiveIcon] = useState('link');
  const [initPopup, setInitPopup] = useState(false);

  useEffect(() => {
    if (!initPopup) {
      setInitPopup(true);
      console.log('Popup mounted');
    }

    return () => {
      console.log('Popup unmounted');
    };
  }, []);

  return (
    <div className="App">
      <div className="popup-container">
        {/* Navigation Bar */}
        <nav className="popup-nav">
          <NavHeader activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
        </nav>

        {/* Content Area */}
        <div className="popup-content">
          {activeIcon === "link" && ( <Link initPopup={initPopup} />)}
          {activeIcon === "clock" && ( <LinkHistory />)}
        </div>

        {/* Footer */}
        <footer className="popup-footer">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Popup;
