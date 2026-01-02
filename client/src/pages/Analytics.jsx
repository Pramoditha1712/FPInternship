import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Navbar';
import './Analytics.css';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

const Analytics = () => {
  const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL;

  const [branchData, setBranchData] = useState([]);
  const [yearlyAnalytics, setYearlyAnalytics] = useState([]);
  const [academicYears, setAcademicYears] = useState([]); // ✅ NEW

  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const knownBranches = ['CSE', 'CSBS'];

  /* ---------------- Fetch Academic Years (FROM DB) ---------------- */
  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(
        `${ADMIN_BASE_URL}/internships/academic-years`
      );
      setAcademicYears(res.data); // [{ label: "2026-27", value: 2026 }]
    } catch (err) {
      console.error('Academic year fetch error:', err);
    }
  };

  /* ---------------- Fetch Branch Analytics ---------------- */
  const fetchBranchAnalytics = async () => {
    try {
      const academicYearParam = yearFilter
        ? `${yearFilter}-${(Number(yearFilter) + 1).toString().slice(-2)}`
        : '';

      const res = await axios.get(`${ADMIN_BASE_URL}/analytics`, {
        params: {
          status: statusFilter,
          academicYear: academicYearParam,
          section: sectionFilter
        }
      });

      const sorted = [...res.data.branchData].sort(
        (a, b) => knownBranches.indexOf(a.branch) - knownBranches.indexOf(b.branch)
      );

      setBranchData(sorted);
    } catch (err) {
      console.error('Branch analytics error:', err);
    }
  };

  /* ---------------- Fetch Yearly Analytics ---------------- */
  const fetchYearlyAnalytics = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE_URL}/yearly-analytics`);
      setYearlyAnalytics(res.data);
    } catch (err) {
      console.error('Yearly analytics error:', err);
    }
  };

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    fetchAcademicYears(); // ✅ once on load
  }, []);

  useEffect(() => {
    fetchBranchAnalytics();
    fetchYearlyAnalytics();
  }, [statusFilter, yearFilter, sectionFilter]);

  return (
    <div className="analytics-container">
      <Header />

      <h2 className="text-center mb-4">📊 Internship Analytics</h2>

      {/* ---------------- Filters ---------------- */}
      <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
        {/* Academic Year */}
        <select
          className="form-select"
          style={{ width: '220px' }}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">Select Academic Year</option>
          {academicYears.map((yr) => (
            <option key={yr.value} value={yr.value}>
              {yr.label}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          className="form-select"
          style={{ width: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
          <option value="future">Upcoming</option>
        </select>

        {/* Section */}
        <select
          className="form-select"
          style={{ width: '150px' }}
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          <option value="">All Sections</option>
          {['A', 'B', 'C', 'D'].map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      {/* ---------------- Branch-wise Chart ---------------- */}
      <h4 className="text-center mb-3">Branch-wise Internships</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={branchData}
          margin={{ top: 30, right: 20, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="branch" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#6a5acd" barSize={40}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ---------------- Year-wise Chart ---------------- */}
      <h4 className="text-center mt-5 mb-3">
        Year-wise Students & Company Visits
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={yearlyAnalytics}>
          <XAxis dataKey="academicYear" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="students" fill="#4caf50" name="Students">
            <LabelList dataKey="students" position="top" />
          </Bar>
          <Bar dataKey="companies" fill="#ff9800" name="Companies">
            <LabelList dataKey="companies" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;
