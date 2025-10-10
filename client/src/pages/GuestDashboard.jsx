import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Navbar';
import guestPic from '../assets/guest.png'

// ========== Styled Components ==========
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Dashboard = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.div`
  width: 250px;
  background: linear-gradient(135deg, #004e92 0%, #000428 100%);
  color: white;
  padding: 20px;
`;

const SidebarHeader = styled.h2`
  font-size: 18px;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const BranchButton = styled.button`
  background: none;
  border: none;
  color: #cbd5e1;
  padding: 8px 10px;
  text-align: left;
  width: 100%;
  cursor: pointer;
  font-size: 15px;

  &:hover {
    background: #1f2937;
  }

  &.active {
    background: #334155;
    font-weight: bold;
    color: white;
  }
`;

const SectionList = styled.ul`
  padding-left: 10px;
`;

const LogoutButton = styled.button`
  background: #ef4444;
  color: white;
  padding: 10px;
  margin-top: 30px;
  border: none;
  width: 100%;
  border-radius: 5px;

  &:hover {
    background: #dc2626;
  }
`;

const Details = styled.div`
  flex: 1;
  padding: 40px;
  background: linear-gradient(to bottom right, #f9fafb, #ffffff);
  overflow-y: auto;
`;

const ReportContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const ReportHeading = styled.h2`
  font-size: 22px;
  margin-bottom: 20px;
  color: #1f2937;
`;

const SectionHeading = styled.h4`
  margin: 15px 0 10px;
  color: #4f46e5;
`;

const RollNoBadge = styled.span`
  background: #e5e7eb;
  padding: 4px 10px;
  border-radius: 5px;
  margin: 5px;
  display: inline-block;
  font-family: monospace;
`;

const StyledHR = styled.hr`
  border-top: 1px solid #ddd;
  margin: 20px 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  th, td {
    padding: 10px;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f1f5f9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #555;
  padding: 40px;
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;

const EmptyImage = styled.img`
  width: 400px;
  opacity: 0.6;
  animation: ${float} 3s ease-in-out infinite;
`;

const ExpandIcon = styled.span`
  margin-right: 5px;
`;

// ========== Helper Functions ==========
const groupStudentsBySemesterAsYear = (students) => {

  
  const grouped = {};
  const romanToNumber = { I: 1, II: 2, III: 3, IV: 4 };
  students.forEach(student => {
    let semester = student.semester || 'Unknown';
    let yearLabel = 'Unknown';

    const romanMatch = semester.match(/^([IV]+)-[IV]+$/i);
    if (romanMatch) {
      const roman = romanMatch[1].toUpperCase();
      const yearNum = romanToNumber[roman];
      if (yearNum) {
        const suffix = ['st', 'nd', 'rd', 'th'][yearNum - 1] || 'th';
        yearLabel = `${yearNum}${suffix} Year`;
      }
    } else {
      const numMatch = semester.match(/^(\d+)-\d+$/);
      if (numMatch) {
        const yearNum = parseInt(numMatch[1]);
        const suffix = ['st', 'nd', 'rd'][yearNum - 1] || 'th';
        yearLabel = `${yearNum}${suffix} Year`;
      }
    }

    if (!grouped[yearLabel]) grouped[yearLabel] = [];
    grouped[yearLabel].push(student);
  });

  return grouped;
};

// ========== Main Component ==========
const GuestDashboard = () => {
  const VITE_GUEST_BASE_URL=import.meta.env.VITE_GUEST_BASE_URL;
  const [categorizedData, setCategorizedData] = useState({});
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInternsReport, setShowInternsReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${VITE_GUEST_BASE_URL}/guest-dashboard`);
        setCategorizedData(res.data.categorized || {});
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch === selectedBranch ? '' : branch);
    setSelectedSection('');
    setStudents([]);
    setSelectedYear('');
    setShowInternsReport(false);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section === selectedSection ? '' : section);
    const studentsList = categorizedData[selectedBranch][section];
    setStudents(studentsList);
    setSelectedYear('');
    setShowInternsReport(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const groupedStudents = groupStudentsBySemesterAsYear(students);

  return (
   <PageWrapper>
      <Header />
      <Dashboard>
        <Sidebar>
          <SidebarHeader>Branches</SidebarHeader>
          <List>
            {Object.keys(categorizedData).map(branch => (
              <li key={branch}>
                <BranchButton
                  className={branch === selectedBranch ? 'active' : ''}
                  onClick={() => handleBranchClick(branch)}
                >
                  <ExpandIcon>{branch === selectedBranch ? '▼' : '▶'}</ExpandIcon>
                  {branch}
                </BranchButton>
                {branch === selectedBranch && (
                  <SectionList>
                    {Object.keys(categorizedData[branch]).map(section => (
                      <li key={section}>
                        <BranchButton
                          className={section === selectedSection ? 'active' : ''}
                          onClick={() => handleSectionClick(section)}
                        >
                          <ExpandIcon>{section === selectedSection ? '▼' : '▶'}</ExpandIcon>
                          {section}
                        </BranchButton>
                      </li>
                    ))}
                  </SectionList>
                )}
              </li>
            ))}
          </List>
          <a
            href="#"
            style={{ color: '#93c5fd', marginTop: '20px', display: 'inline-block' }}
            onClick={() => {
              setSelectedBranch('');
              setSelectedSection('');
              setShowInternsReport(true);
            }}
          >
            View Interns Report
          </a>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </Sidebar>

        <Details>
          {loading ? (
            <p>Loading...</p>
          ) : showInternsReport ? (
            <ReportContainer>
              <ReportHeading>Interns Report – {new Date().toLocaleDateString()}</ReportHeading>
              {Object.entries(categorizedData).map(([branch, sections]) =>
                Object.entries(sections).map(([section, students]) => {
                  const studentsBySemester = {};
                  students.forEach(s => {
                    const sem = s.semester || 'Unknown';
                    if (!studentsBySemester[sem]) studentsBySemester[sem] = [];
                    studentsBySemester[sem].push(s);
                  });

                  return Object.entries(studentsBySemester).map(([sem, group]) => (
                    <div key={`${branch}-${section}-${sem}`}>
                      <SectionHeading>{sem} {branch} {section}</SectionHeading>
                      {group.length > 0 ? (
                        group.map(s => (
                          <RollNoBadge key={s.rollNo}>{s.rollNo}</RollNoBadge>
                        ))
                      ) : (
                        <p>--</p>
                      )}
                      <StyledHR />
                    </div>
                  ));
                })
              )}
            </ReportContainer>
          ) : selectedBranch && selectedSection ? (
            <>
              <h3>{selectedBranch} - {selectedSection}</h3>
              <p>Total Students: {students.length}</p>
              <label>Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">-- Select Year --</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              {selectedYear && groupedStudents[selectedYear]?.length ? (
                <>
                  <h4>{selectedYear} Students</h4>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Email</th>
                        <th>Organization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStudents[selectedYear].map(s => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>{s.rollNo}</td>
                          <td>{s.email}</td>
                          <td>{s.organizationName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <p>Please select a valid year to view students.</p>
              )}
            </>
          ) : (
            <EmptyState style={{ padding: '2rem', textAlign: 'center' }}>
 

  <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '0.4rem' }}>
    Welcome to the Guest Internship Dashboard
  </h2>

  <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.2rem' }}>
    Discover how students are gaining real-world experience through internships.
  </p>

  <EmptyImage
    src={guestPic}
    alt="Internship Insights"
    style={{  marginBottom: '1.5rem', opacity: 0.95 }}
  />

  <div style={{
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2rem',
  }}>
    <div style={{
      background: '#f9f9f9',
      padding: '1.2rem 1.5rem',
      borderRadius: '10px',
      maxWidth: '280px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      textAlign: 'left',
    }}>
      <h3 style={{ color: '#004e92', fontSize: '1.15rem' }}>🔍 Explore Insights</h3>
      <p style={{ fontSize: '0.95rem', color: '#555', marginTop: '0.5rem' }}>
        Filter by <strong>branch</strong> and <strong>year</strong> to explore which students are involved in internships today.
      </p>
    </div>

    <div style={{
      background: '#f9f9f9',
      padding: '1.2rem 1.5rem',
      borderRadius: '10px',
      maxWidth: '280px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      textAlign: 'left',
    }}>
      <h3 style={{ color: '#004e92', fontSize: '1.15rem' }}>📊 Domain & Company Stats</h3>
      <p style={{ fontSize: '0.95rem', color: '#555', marginTop: '0.5rem' }}>
        Discover where students are interning — from startups to top tech companies.
      </p>
    </div>

    <div style={{
      background: '#f9f9f9',
      padding: '1.2rem 1.5rem',
      borderRadius: '10px',
      maxWidth: '280px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      textAlign: 'left',
    }}>
      <h3 style={{ color: '#004e92', fontSize: '1.15rem' }}>💡 Real-Time Snapshot</h3>
      <p style={{ fontSize: '0.95rem', color: '#555', marginTop: '0.5rem' }}>
        Get a current-day snapshot of all active internship participation, updated instantly based on student submissions.
      </p>
    </div>
  </div>

  <p style={{ color: '#444', fontSize: '1rem', marginBottom: '1rem' }}>
    This guest view gives you a transparent lens into internship engagement across departments.
  </p>

  <p style={{ fontSize: '0.9rem', color: '#777' }}>
    No login required. Just insights — fast, reliable, and inspiring.
  </p>
</EmptyState>

          )}
        </Details>
      </Dashboard>
   </PageWrapper>
  );
};

export default GuestDashboard;
