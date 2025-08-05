// src/components/DashboardStats.js
import React from "react";
import "./DashboardStats.css";

const DashboardStats = ({ stats }) => {
  const statItems = [
    { label: "Total Students", value: stats.totalUsers },
    { label: "Total Internships", value: stats.totalInternships },
    { label: "Total Feedbacks", value: stats.totalFeedbacks },
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card">
          <h5>{item.label}</h5>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
