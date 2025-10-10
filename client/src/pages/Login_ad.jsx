import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Navbar';
import './Login_ad.css'
import feather from 'feather-icons';
function Login_ad() {
  const VITE_ADMIN_BASE_URL=import.meta.env.VITE_ADMIN_BASE_URL
  const [adminID, setAdminID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${VITE_ADMIN_BASE_URL}/login`, {
        adminID,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log(response.data);
      localStorage.setItem('adminToken', response.data.token);
      navigate('/admin');
    } catch (error) {
      console.error(error);
      setError('Invalid Credentials');
    }
  };
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffff' }}>
     
    
      <Header />
      <div className="text-center mb-4" style={{textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontWeight: '700',marginTop:'4rem' }}>“Empowering Administrators with Precision.”</h2>
          <p style={{ fontSize: '16px', marginTop: '0.5rem' }}>Your secure gateway to control and manage effortlessly.</p>
        </div>
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: 'auto', marginTop: '10 rem' }}>
        <div className="login-card p-4">
          <h3>Admin Login</h3>
          <p style={{"color": "#666", "fontSize": "14px"}}>Enter your credentials to access the admin dashboard</p>


          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Admin ID</label>
              <input
                type="text"
                className="form-control"
                value={adminID}
                onChange={(e) => setAdminID(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  boxShadow: 'none'
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  boxShadow: 'none'
                }}
              />
            </div>

            <button
                type="submit"
                className="gradient-button w-100"
              >
                Login
              </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login_ad;
