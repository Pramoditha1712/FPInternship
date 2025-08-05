// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/Api';
import DashboardStats from '../components/DashboardStats';
import './AdminDashboard.css'; 
import Header from '../components/Navbar'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInternships: 0,
    totalFeedbacks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchedStats = await getDashboardStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <Header/>
      <h2 className="dashboard-heading  mt-5 ">Admin Dashboard</h2>
      <DashboardStats stats={stats} />
    </div>    
  );
};

export default AdminDashboard;
