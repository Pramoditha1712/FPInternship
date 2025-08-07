import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import StudySVG from '../assets/internE.svg';
import Header from '../components/Navbar'

const Landing = () => {
  const navigate = useNavigate();

  return (
    
    <div className="landing-container">
      
    <Header />


      {/* HERO SECTION */}
      <section className="hero-section d-flex align-items-center justify-content-center flex-wrap">
  <div className="hero-text text-center text-md-start">
    <h1 className="gradient-text display-4 fw-bold">Welcome to InternE</h1>
    
    <p className="text-dark mt-3" style={{ maxWidth: '720px', margin: '0 auto' }}>
  <strong>InternE</strong> is a centralized platform that streamlines internship workflows at <strong>VNRVJIET</strong>.<br />
  It allows <strong>companies</strong> to explore past internships for insights and transparency.<br />
  <strong>Administrators</strong> can access detailed analytics and download structured Excel reports.<br />
  <strong>Faculty</strong> can log in as guests to manage and monitor intern attendance.<br />
  <strong>Students</strong> can submit offer letters, NOCs, approvals, and feedback, with automated email alerts every <strong>Monday and Thursday at 10 AM</strong>.
</p>



  </div>
  
      <div className="hero-image ms-md-5 mt-4 mt-md-0">
      <img src={StudySVG} alt="Student Illustration" className="floating-svg" />
    </div>
</section>


      {/* ROLE SELECTION */}
      <section className="roles-section py-5">
        <div className="row justify-content-center gap-4">
          {/* Admin Card */}
          <div className="card role-card" onClick={() => navigate('/admin-login')}>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="card-img-top p-3" alt="Admin" />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Admin Login</h5>
              <p className="card-text text-muted">For placement cell and admin staff.</p>
              <button className="gradient-button w-100">Login as Admin</button>
            </div>
          </div>

          {/* Student Card */}
          <div className="card role-card" onClick={() => navigate('/student-login')}>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" className="card-img-top p-3" alt="Student" />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Student Login</h5>
              <p className="card-text text-muted">For VNRVJIET students.</p>
              <button className="gradient-button w-100">Login as Student</button>
            </div>
          </div>

          {/* Guest Card */}
          <div className="card role-card" onClick={() => navigate('/guest-dashboard')}>
            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" className="card-img-top p-3" alt="Guest" />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Guest Login</h5>
              <p className="card-text text-muted">For visitors and recruiters.</p>
              <button className="gradient-button w-100">Login as Guest</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
