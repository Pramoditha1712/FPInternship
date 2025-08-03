import './Navbar.css'
import React from 'react';
 // Optional: move header-specific CSS here

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img
          src="https://imgs.search.brave.com/fdlkfHICQa7zEoIDVWVgwHT3udeRthoABe7I9X06kmo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/ZS9lNS9PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZy8y/NTBweC1PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZw"
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
