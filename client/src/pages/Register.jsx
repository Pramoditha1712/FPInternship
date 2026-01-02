import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/Api';
import './Register.css';
import Header from '../components/Navbar'
import RegisterPic from '../assets/Register.svg'
export default function Register() {
  const [form, setForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    branch: '',
    semester: '',
    section: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const semesterOptions = ['1-1', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  const sectionOptions = ['A', 'B', 'C', 'D'];

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const cleanedEmail = form.email.toLowerCase().trim();


    if (!cleanedEmail.endsWith('@vnrvjiet.in')) {
      setError('Email must end with @vnrvjiet.in');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (
      !form.rollNo || !form.name || !form.email ||
      !form.branch || !form.semester || !form.section || !form.password
    ) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await registerUser({ ...form, email: cleanedEmail });
      alert('Registered successfully!');
      setForm({
        rollNo: '',
        name: '',
        email: '',
        branch: '',
        semester: '',
        section: '',
        password: '',
        confirmPassword: '',
        agree: false
      });
      navigate('/student-login');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header/>
    <div className="register-container">
    
      {/* Left Side */}
      <div className="register-left-green">
      <div className="left-content">
        <img src={RegisterPic} alt="Sign Up Illustration" className="left-svg" style={{width:"800px"}} />
        <h1>Get Started</h1>
        <p>Already have an account?</p>
        <Link to="/student-login">
          <button className="left-login-btn">Log in</button>
        </Link>
      </div>
    </div>

      {/* Right Side */}
      <div className="register-right-form shiftup">
        <div className="form-card">
          <h2 className="form-title">Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="info-message">Registering...</div>}

          <form onSubmit={handleSubmit}>
            <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Roll No" required />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email (must end with @vnrvjiet.in)" required />
            <input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch" required />
            <select name="semester" value={form.semester} onChange={handleChange} required>
              <option value="">Select Semester</option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            <select name="section" value={form.section} onChange={handleChange} required>
              <option value="">Select Section</option>
              {sectionOptions.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
            <button type="submit" className="submit-btn gradient-button" disabled={loading}>
              {loading ? 'Registering...' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
