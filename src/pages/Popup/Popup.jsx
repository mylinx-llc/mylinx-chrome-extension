import React from 'react';
import './Popup.css';
import NavHeader from './components/NavHeader';

const Popup = () => {
  return (
    <div className="App">
      <div className="popup-container">
      {/* Navigation Bar */}
      <nav className="popup-nav">
        <NavHeader />
      </nav>

      {/* Content Area */}
      <div className="popup-content">
        <p>Base content goes here...</p>
      </div>

      {/* Footer */}
      <footer className="popup-footer">
        <p>Footer content</p>
      </footer>
    </div>
    </div>
  );
};

export default Popup;
