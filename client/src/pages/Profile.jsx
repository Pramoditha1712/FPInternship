import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ProfilePic from '../assets/profile.svg';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const convertDriveLink = (url) => {
    if (!url) return null;
    const match = url.match(/[-\w]{25,}/);
    return match ? `https://drive.google.com/file/d/${match[0]}/view` : url;
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authorization token missing. Please login again.');
        setLoading(false);
        return;
      }
      const res = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setError('Failed to fetch user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-light" style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <header className="profile-header">
        <div className="logo-section d-flex justify-content-between align-items-center p-3">
          <div className="d-flex align-items-center">
            <img src="https://imgs.search.brave.com/fdlkfHICQa7zEoIDVWVgwHT3udeRthoABe7I9X06kmo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/ZS9lNS9PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZy8y/NTBweC1PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZw"
              alt="VNR VJIET Logo" className="profile-logo-img" />
            <div>
              <h2 className="gradient-text fw-bold mb-1">VNR Vignana Jyothi Institute of Engineering and Technology</h2>
              <h5 className="fw-semibold text-light">Department of Computer Science and Engineering</h5>
            </div>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="container">
        <h2 className="text-center mb-5 text-primary fw-bold d-flex align-items-center justify-content-center gap-3">
          <img src={ProfilePic} alt="Profile" style={{ width: '100px', height: '200px' }} />
          Your Profile
        </h2>

        {loading && <div className="alert alert-info">Loading your profile...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {userProfile && (
          <>
            <ul className="nav profile-nav-pills justify-content-center mb-4">
              <li className="nav-item">
                <button className="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details">Details</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" id="internships-tab" data-bs-toggle="tab" data-bs-target="#internships">Internships</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" id="feedbacks-tab" data-bs-toggle="tab" data-bs-target="#feedbacks">Feedback</button>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="details">
                <div className="d-flex justify-content-center">
                  <div className="profile-card">
                    <h5 className="text-center text-secondary mb-4">📄 Student Details</h5>
                    {["Name", "Roll No", "Email", "Branch", "Semester"].map((label, i) => (
                      <div key={i} className="mb-3">
                        <span className="fw-semibold text-dark">{label}:</span>
                        <span className="ms-2">{userProfile.student?.[label.toLowerCase()] || userProfile.user?.[label.toLowerCase()]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="internships">
                <div className="d-flex justify-content-center py-4">
                  <div className="profile-card">
                    <h4 className="text-center text-secondary mb-4">💼 Your Internships</h4>
                    {userProfile.internships?.length > 0 ? (
                      userProfile.internships.map((internship, idx) => (
                        <div key={idx} className="profile-list-group-item">
                          <p><strong>Company:</strong> {internship.organizationName}</p>
                          <p><strong>Role:</strong> {internship.role}</p>
                          <p className="text-muted">
                            <small>{new Date(internship.startingDate).toLocaleDateString()} — {new Date(internship.endingDate).toLocaleDateString()}</small>
                          </p>
                          <div className="d-flex flex-wrap gap-3">
                            {["offerLetter", "applicationLetter", "noc"].map((docType) => internship[docType] && (
                              <div key={docType} className="text-center">
                                <div className="fw-semibold mb-1">{docType === "noc" ? "NOC" : docType.replace("Letter", " Letter")}</div>
                                <a href={internship[docType].includes('drive.google.com') ? convertDriveLink(internship[docType]) : `http://localhost:8080${internship[docType]}`} target="_blank" rel="noopener noreferrer">
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt={docType} className="profile-pdf-icon" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : <p className="text-center text-muted">No internships added yet.</p>}
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="feedbacks">
                <div className="d-flex justify-content-center py-4">
                  <div className="profile-card">
                    <h4 className="text-center text-secondary mb-4">📝 Feedback Section</h4>
                    <p className="text-center text-muted">No feedbacks yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
