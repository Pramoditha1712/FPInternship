import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './Profile.css'

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

  const styles = {
    globalFont: { fontFamily: 'Inter, sans-serif', background: 'linear-gradient(to right, #fdfbfb, #ebedee)', minHeight: '100vh' },
    label: { fontWeight: 600, color: '#374151' },
    value: { marginLeft: '8px', color: '#1f2937' },
    card: {
      maxWidth: '800px',
      width: '100%',
      borderRadius: '1rem',
      padding: '2rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      animation: 'fadeInUp 0.6s ease-in-out'
    },
    fadeInStyle: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  };

  return (
    <div style={styles.globalFont}>
      <style>{styles.fadeInStyle}</style>

      <header className="header">
  <div className="logo-section d-flex justify-content-between align-items-center p-3">
    <div className="d-flex align-items-center">
      <img
        src="https://imgs.search.brave.com/fdlkfHICQa7zEoIDVWVgwHT3udeRthoABe7I9X06kmo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vdGh1bWIv/ZS9lNS9PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZy8y/NTBweC1PZmZpY2lh/bF9sb2dvX29mX1ZO/UlZKSUVULnBuZw"
        alt="VNR VJIET Logo"
        className="logo-img me-3"
        style={{ width: "70px", height: "70px" }}
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

    <button className="btn btn-outline-light" style={{marginLeft:"200px" , fontSize:"20px"}} onClick={handleLogout}>
      Logout
    </button>
  </div>
</header>

      <div className="container my-5">
        <h2 className="text-center mb-5 text-primary fw-bold">👤 Your Profile</h2>

        {loading && <div className="alert alert-info">Loading your profile...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {userProfile && (
          <>
            <ul className="nav nav-pills justify-content-center mb-4" id="profileTabs" role="tablist">
              <li className="nav-item">
                <button className="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details" type="button">Details</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" id="internships-tab" data-bs-toggle="tab" data-bs-target="#internships" type="button">Internships</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" id="feedbacks-tab" data-bs-toggle="tab" data-bs-target="#feedbacks" type="button">Feedback</button>
              </li>
            </ul>

            <div className="tab-content" id="profileTabsContent">

              {/* === Student Details === */}
              <div className="tab-pane fade show active" id="details">
                <div className="d-flex justify-content-center">
                  <div style={styles.card}>
                    <h5 className="text-center text-secondary mb-4">📄 Student Details</h5>
                    {[{ label: "Name", value: userProfile.student ? userProfile.student.name : userProfile.user.name },
                      { label: "Roll No", value: userProfile.student ? (userProfile.student.rollNo || userProfile.user.rollNo) : userProfile.user.rollNo },
                      { label: "Email", value: userProfile.student ? userProfile.student.email : userProfile.user.email },
                      { label: "Branch", value: userProfile.student ? userProfile.student.branch : userProfile.user.branch },
                      { label: "Semester", value: userProfile.student ? userProfile.student.semester : userProfile.user.semester }].map((item, i) => (
                      <div key={i} style={{ marginBottom: '1rem' }}>
                        <span style={styles.label}>{item.label}:</span>
                        <span style={styles.value}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* === Internships === */}
              <div className="tab-pane fade" id="internships">
                <div className="d-flex justify-content-center">
                  <div style={styles.card}>
                    <h5 className="text-center text-secondary mb-4">💼 Your Internships</h5>
                    {(userProfile.internships || []).length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {(userProfile.internships || []).map((internship) => (
                          <li key={internship._id || internship.internshipID} className="list-group-item">
                            <strong className=''>Company: {internship.organizationName}</strong><br />
                            <strong>Role: {internship.role}</strong><br />
                            <small className="text-muted ">
                              {new Date(internship.startingDate).toLocaleDateString()} — {new Date(internship.endingDate).toLocaleDateString()}
                            </small>
                            <div className="mt-3 d-flex flex-wrap gap-4">
                              {/* Offer Letter */}
                              {internship.offerLetter && (
                                <div className="text-center">
                                  <div>Offer Letter</div>
                                  <a href={internship.offerLetter.includes("drive.google.com") ? convertDriveLink(internship.offerLetter) : `http://localhost:8080${internship.offerLetter}`} target="_blank" rel="noopener noreferrer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt="Offer Letter" style={{ width: '50px', height: '50px' }} />
                                  </a>
                                </div>
                              )}
                              {/* Application Letter */}
                              {internship.applicationLetter && (
                                <div className="text-center">
                                  <div>Approval Letter</div>
                                  <a href={internship.applicationLetter.includes("drive.google.com") ? convertDriveLink(internship.applicationLetter) : `http://localhost:8080${internship.applicationLetter}`} target="_blank" rel="noopener noreferrer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt="Approval Letter" style={{ width: '50px', height: '50px' }} />
                                  </a>
                                </div>
                              )}
                              {/* NOC */}
                              {internship.noc ? (
                                <div className="text-center">
                                  <div>NOC</div>
                                  <a href={internship.noc.includes("drive.google.com") ? convertDriveLink(internship.noc) : `http://localhost:8080${internship.noc}`} target="_blank" rel="noopener noreferrer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt="NOC" style={{ width: '50px', height: '50px' }} />
                                  </a>
                                </div>
                              ) : (
                                <div className="text-muted text-center">NOC not uploaded</div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-center">No internships found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* === Feedback === */}
              <div className="tab-pane fade" id="feedbacks">
                <div className="d-flex justify-content-center">
                  <div style={styles.card}>
                    <h5 className="text-center text-secondary mb-4">📝 Your Feedback</h5>
                    {(userProfile.feedbacks || []).length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {(userProfile.feedbacks || []).map((feedback) => (
                          <li key={feedback._id} className="list-group-item">
                            <strong>{feedback.title || "Feedback"}</strong> for <em>{feedback.organizationName || "Unknown"}</em>:<br />
                            <span>{feedback.content || feedback.feedback}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-center">No feedbacks submitted.</p>
                    )}
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