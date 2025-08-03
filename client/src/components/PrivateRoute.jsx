// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');  //

  // If token is not present, redirect to login
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default PrivateRoute;
