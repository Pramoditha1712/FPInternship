import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Header from '../components/Navbar';
import Student from '../assets/students.svg'
export default function Home  () {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="homepage-container">
      
      <header className="header">
        <div className="header-content">
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

          <div className="header-buttons">
            <button className="icon-button" onClick={() => navigate('/profile')}>👤 Profile</button>
            <button className="icon-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Welcome Section with SVG */}
      <section className="homepage-welcome-section  d-flex justify-content-around align-items-center flex-wrap" style={{fontSize:"20px"}}>
        <div className="text-center mb-4" >
          <h1 className="portal-title" style={{fontSize:"50px"}}>UG/PG Internship Portal</h1>
          <p className="portal-subtext">Manage your internship applications and documents with ease.</p>
          <a
      href="https://drive.google.com/file/d/1UBVSU94Vi9QukXg8MkDP7w9LtWh2VFiZ/view?usp=sharing"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        padding: "10px 20px",
        background: "linear-gradient(to right, #10b981, #059669)",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "500",
        marginTop: "15px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
      }}
    >
      🎥 Internship Portal Walkthrough
    </a>
        </div>
        
        <img
          src={Student}
          alt="Student working"
          className="welcome-illustration "
          style={{width:"340px"}}
        />
      </section>
      

      {/* Quote */}
  

      {/* Cards Section */}
      <section className="homepage-cards-section d-flex justify-content-around align-items-center flex-wrap">
        <div className="homepage-document-card shadow">
          <h3>📄 Document Templates</h3>
          <ul className="document-grid">
            <li><a href="/docs/LOR.docx" download>Letter of Recommendation</a></li>
            <li><a href="/docs/NOC-Application.docx" download>NOC Application</a></li>
            <li><a href="/docs/NOC.docx" download>No Objection Certificate (NOC)</a></li>
            <li><a href="/docs/Rules.docx" download>VNR CSE Internship Rules</a></li>
            <li><a href="/docs/VNR-Bonafide-by-HOD-Template.docx" download>VNR Bonafide by HOD</a></li>
          
            <li><a href="/docs/VNRVJIET-Header.docx" download>VNRVJIET Header</a></li>
          </ul>
        </div>

        <div className="homepage-action-card shadow">
          <h3>📝 Apply</h3>
          <button onClick={() => navigate('/apply')}>Fill Application Form</button>
        </div>

        <div className="homepage-action-card shadow">
          <h3>📤 Submit Feedback</h3>
          <button onClick={() => navigate('/upload')}>Upload Feedback Form</button>
        </div>
      </section>
    </div>
  );
}
