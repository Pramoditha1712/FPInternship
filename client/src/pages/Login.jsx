import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './StudentLogin.css';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/Api';
import Header from '../components/Navbar'
import StudentPic from '../assets/StudentSvg.svg'

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanedEmail = credentials.email.toLowerCase().trim();
      const res = await loginUser({ email: cleanedEmail, password: credentials.password });

      console.log('Login response:', res);

      const { token, role, email } = res;
      alert('Login successful');
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('email', email);

      window.dispatchEvent(new Event('login'));

      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header/>
    <div className="d-flex vh-100">
     
      <div className="d-flex flex-column justify-content-center align-items-center w-50 shift-up">
        

        <div className="shadow p-4 rounded" style={{ width: '350px', background: 'white' }}>
          <h5 className="text-center mb-4 fw-semibold">Student Login</h5>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control py-2"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control py-2"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn gradient-button w-100 mt-2" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center mt-3">
              <small>
                Don’t have an account? <Link to="/register" className="text-decoration-none fw-medium">Register</Link>
              </small>
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex flex-column justify-content-center align-items-center w-50 bg-light text-center px-5 shift-up">
        <img
          src={StudentPic}
          alt="Student"
          style={{ width: '55rem', marginBottom: '20px' }}
        />
          <p style={{
            position: 'absolute',
            right: '60px',
            top: '150px',
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#555',
            maxWidth: '300px'
          }}>
            "Internships are the bridge between learning and leading."
          </p>
      </div>
    </div>
    </div>
  );
};

export default Login;


