import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginGuest = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/guest/login', { name, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', 'guest');
        localStorage.setItem('userName', 'Guest');
        navigate('/guest-dashboard');
      } else {
        setError('Invalid guest login response');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Guest login failed');
    }
  };

  return (
    <div>
      <div className="header d-flex align-items-center p-3 mb-5">
        <img
          src="https://media.licdn.com/dms/image/v2/C560BAQFKt8O5GdaFjw/company-logo_200_200/company-logo_200_200/0/1680080095222/vnr_vignanajyothiinstituteofengineeringandtechnology_logo?e=2147483647&v=beta&t=nV3OFiSPyeDZdeZib-pHBlNwN-i1S73KwQljcRw3FvY"
          alt="VNR Vignana Jyothi Logo"
          style={{ width: '80px', height: '80px'}}
        />
        <h1 className="text-light">VNR Vignana Jyothi Institute of Engineering and Technology</h1>
      </div>
    <div className="d-flex justify-content-center align-items-center">
      <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Guest Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            Login as Guest
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default LoginGuest;
