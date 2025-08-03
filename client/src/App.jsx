// src/App.js
import './App.css';  
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute'; // For admin

import AdminDashboard from './pages/AdminDashboard';
import Students from './pages/Students';
import Internships from './pages/Internships';
import Feedbacks from './pages/Feedbacks';
import Analytics from './pages/Analytics';
import Home from './pages/Home';
import Login_ad from './pages/Login_ad';
import Login from './pages/Login'; 
import Register from './pages/Register';
import InternshipForm from './pages/InternshipForm';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
// import LoginGuest from './pages/Login_guest';
import GuestDashboard from './pages/GuestDashboard';

import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/admin-login" element={<Login_ad />} />
        <Route path="/student-login" element={<Login />} />
        {/* <Route path="/guest-login" element={<LoginGuest />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<InternshipForm />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="internships" element={<Internships />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
