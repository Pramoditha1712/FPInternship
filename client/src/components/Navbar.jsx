import './Navbar.css'
import React from 'react';
import vnrImage from '../assets/vnrImage.webp'
 // Optional: move header-specific CSS here

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img
          src={vnrImage}
          alt="VNR VJIET Logo"
          className="logo-img"
        />
        <div>
          <h2 className="gradient-text fw-bold mb-1">
            VNR Vignana Jyothi Institute of Engineering and Technology
          </h2>
          <h5 className="fw-semibold text-light">
            Department of Computer Science and Engineering
          </h5>
        </div>
      </div>
    </header>
  );
};

export default Header;
