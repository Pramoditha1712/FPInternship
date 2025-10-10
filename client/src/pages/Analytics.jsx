import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Navbar'
import './Analytics.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

const Analytics = () => {
  const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL;
  const GUEST_BASE_URL= import.meta.env.VITE_GUEST_BASE_URL;

  const [branchData, setBranchData] = useState([]);
  
  const [companyData, setCompanyData] = useState([]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('');
  const [yearlyAnalytics, setYearlyAnalytics] = useState([]);
  const [sectionFilter, setSectionFilter] = useState('');

  const knownBranches = ["CSE", "CSBS"];
  const semesterOrder = ["2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];
  const knownYears = [2023, 2024, 2025, 2026];

  const romanToNumber = {
    'I': 1,
    'II': 2,
    'III': 3,
    'IV': 4,
    'V': 5
  };

  const normalizeCompanyData = (data) => {
    const years = [2023, 2024, 2025, 2026];
  
    if (Array.isArray(data)) {
      const yearMap = {};
      data.forEach(item => {
        yearMap[item.year] = item.companyCount;
      });
  
      return years.map(year => ({
        year: year,
        companyCount: yearMap[year] || 0
      }));
    } else if (data && data.year === 'All Years') {
      const perYear = Math.floor(data.companyCount / years.length);
      return years.map(year => ({
        year: year,
        companyCount: perYear
      }));
    }
  
    return years.map(year => ({
      year: year,
      companyCount: 0
    }));
  };
  const fetchBranchAndSemesterAnalytics = async () => {
    try {
      const res = await axios.get(`${ADMIN_BASE_URL}/analytics`, {
        params: {
          status: statusFilter,
          year: yearFilter,
          section: sectionFilter
        }
      });

      const sortedBranchData = [...res.data.branchData].sort(
        (a, b) => knownBranches.indexOf(a.branch) - knownBranches.indexOf(b.branch)
      );
      setBranchData(sortedBranchData);



    } catch (err) {
      console.error('Failed to fetch branch/semester analytics:', err);
    }
  };
  

const fetchYearlyAnalytics = async () => {
  try {
    const res = await axios.get(`${ADMIN_BASE_URL}/yearly-analytics`, {
      params: {
        year: yearFilter
      }
    });
    setYearlyAnalytics(res.data);
  } catch (err) {
    console.error('Failed to fetch yearly analytics:', err);
  }
};

useEffect(() => {
  fetchBranchAndSemesterAnalytics();
 
  fetchYearlyAnalytics();  // <-- Added this line
}, [statusFilter, yearFilter, sectionFilter]);


  return (
    <div className="analytics-container" >
      <div className="header-wrapper">
        <Header />
      </div>
      <h2 className="mb-4  text-center">📊 Internship Analytics</h2>

      {/* Filters */}
      <div className="d-flex gap-3 justify-content-center  flex-wrap mb-3">
  <select
    className="form-select"
    style={{ width: "150px" }}
    value={yearFilter}
    onChange={(e) => setYearFilter(e.target.value)}
  >
    <option value="">Select Year</option>
    {[2023, 2024, 2025, 2026].map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>

  <select
    className="form-select"
    style={{ width: "150px" }}
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="ongoing">Ongoing</option>
    <option value="past">Past</option>
    <option value="future">Upcoming</option>
  </select>

  <select
    className="form-select"
    style={{ width: "150px" }}
    value={sectionFilter}
    onChange={(e) => setSectionFilter(e.target.value)}
  >
    <option value="">All Sections</option>
    {['A', 'B', 'C', 'D'].map((sec) => (
      <option key={sec} value={sec}>{sec}</option>
    ))}
  </select>
</div>

      {/* Branch-wise Chart */}
      <h4 className='text-center mt-5 mb-3'>Branch-wise Internships</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={branchData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="branch" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#6a5acd" barSize={40}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

     

      {/* Year-wise Company Visits Chart */}
      <h4 className='text-center mt-5 mb-3'>Year-wise Students & Company Visits</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyAnalytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#4caf50" name="Students Placed">
              <LabelList dataKey="students" position="top" />
            </Bar>
            <Bar dataKey="companies" fill="#ff9800" name="Companies Visited">
              <LabelList dataKey="companies" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

    </div>
  );
};

export default Analytics;
