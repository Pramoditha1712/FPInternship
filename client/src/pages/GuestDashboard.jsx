import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

// === Styled Components ===
// Put this near your other styled-components
const ReportContainer = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  max-width: 900px;
  margin: 30px auto;
`;

const ReportHeading = styled.h2`
  display: flex;
  align-items: center;
  font-size: 22px;
  margin-bottom: 20px;
  color: #1f2937;

  &::before {
    content: '📄';
    margin-right: 10px;
  }
`;

const SectionHeading = styled.h4`
  margin: 15px 0 10px 0;
  color: #4f46e5;
`;

const rollNoBadge = styled.span`
  display: inline-block;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 4px;
  margin: 4px;
  font-family: monospace;
  transition: background 0.3s;

  &:hover {
    background: #e5e7eb;
  }
`;

const StyledHR = styled.hr`
  border: none;
  border-top: 1px solid #ddd;
  margin: 20px 0;
`;


const Dashboard = styled.div`
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #1f2937;
  color: #fff;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.h2`
  margin-bottom: 15px;
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  flex: 1;
`;

const BranchButton = styled.button`
  background: none;
  border: none;
  color: #cbd5e1;
  text-align: left;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 15px;

  &:hover {
    background-color: #374151;
  }

  &.active {
    background-color: #4b5563;
    font-weight: bold;
    color: #fff;
  }
`;

const SectionList = styled.ul`
  margin-left: 10px;
`;

const LogoutButton = styled.button`
  background: #ef4444;
  border: none;
  color: #fff;
  width: 100%;
  padding: 10px;
  margin-top: 30px;
  cursor: pointer;
  font-size: 15px;
  border-radius: 5px;
  transition: background 0.3s;

  &:hover {
    background: #dc2626;
  }
`;

const Details = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: linear-gradient(to bottom right, #f9fafb, #ffffff);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f3f4f6;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #555;
  text-align: center;
`;

const float = keyframes`
  0% { transform: translatey(0px); }
  50% { transform: translatey(-5px); }
  100% { transform: translatey(0px); }
`;

const EmptyImage = styled.img`
  width: 120px;
  opacity: 0.5;
  margin-bottom: 20px;
  animation: ${float} 3s ease-in-out infinite;
`;

const Loading = styled.div`
  margin: auto;
  font-size: 20px;
`;

const Error = styled.div`
  margin: auto;
  font-size: 20px;
  color: red;
`;

const ExpandIcon = styled.span`
  margin-right: 5px;
  display: inline-block;
`;

const groupStudentsBySemesterAsYear = (students) => {
  const grouped = {};
  const romanToNumber = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };

  students.forEach(student => {
    let semester = student.semester || 'Unknown';
    let yearLabel = 'Unknown Year';

    const romanMatch = semester.match(/^([IVXLCDM]+)-[IVXLCDM]+$/i);
    if (romanMatch) {
      const roman = romanMatch[1].toUpperCase();
      const yearNum = romanToNumber[roman];
      if (yearNum) {
        const suffix = yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th';
        yearLabel = `${yearNum}${suffix} Year`;
      }
    } else {
      const arabicMatch = semester.match(/^(\d+)-\d+$/);
      if (arabicMatch) {
        const yearNum = parseInt(arabicMatch[1], 10);
        const suffix = yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th';
        yearLabel = `${yearNum}${suffix} Year`;
      } else {
        yearLabel = semester;
      }
    }

    if (!grouped[yearLabel]) {
      grouped[yearLabel] = [];
    }
    grouped[yearLabel].push(student);
  });

  return grouped;
};

const getInternsReportData = (categorizedData) => {
  let result = '';
  const today = new Date().toLocaleDateString('en-GB');
  result += `Details of Interns on ${today}\n\n`;

  Object.entries(categorizedData).forEach(([branch, sections]) => {
    Object.entries(sections).forEach(([section, students]) => {
      const studentsBySemester = {};
      students.forEach((s) => {
        const sem = s.semester || 'Unknown';
        if (!studentsBySemester[sem]) studentsBySemester[sem] = [];
        studentsBySemester[sem].push(s);
      });

      Object.entries(studentsBySemester).forEach(([sem, group]) => {
        result += ` ${sem} ${branch} ${section}\n`;
        if (group.length === 0) {
          result += '--\n\n';
        } else {
          const rollNos = group.map(s => s.rollNo).join(', ');
          result += rollNos + '\n\n';
        }
      });
    });
  });

  return result;
};


const GuestDashboard = () => {
  const [categorizedData, setCategorizedData] = useState({});
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInternsReport, setShowInternsReport] = useState(false);

  useEffect(() => {
    const fetchGuestDashboard = async () => {
      try {
        const res = await axios.get('http://localhost:8080/guest/guest-dashboard');
        setCategorizedData(res.data.categorized || {});
      } catch (err) {
        console.error(err);
        setError('Failed to fetch guest dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestDashboard();
    const interval = setInterval(fetchGuestDashboard, 5 * 60 * 1000);

    return () => clearInterval(interval);
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

  if (loading) return <Loading>Loading guest dashboard...</Loading>;
  if (error) return <Error>{error}</Error>;

  const groupedStudents = groupStudentsBySemesterAsYear(students);

  return (
    <Dashboard>
      <Sidebar>
        <SidebarHeader>Branches</SidebarHeader>
        <List>
          {Object.keys(categorizedData).map((branch) => (
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
                  {Object.keys(categorizedData[branch]).map((section) => (
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
          style={{
            color: '#fff',
            textDecoration: 'underline',
            marginTop: '20px',
            cursor: 'pointer'
          }}
          onClick={() => {
            setSelectedBranch('');
            setSelectedSection('');
            setShowInternsReport(true);
          }}
        >
          Interns Report
        </a>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Sidebar>

      <Details>
        {showInternsReport ? (
          <ReportContainer>
    <ReportHeading>Interns Report on {new Date().toLocaleDateString('en-GB')}</ReportHeading>

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
            <SectionHeading> {sem} {branch} {section}</SectionHeading>
            {group.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {group.map((s) => (
                  <rollNoBadge key={s.rollNo}>
                    {s.rollNo} ,
                  </rollNoBadge>
                ))}
              </div>
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
            <h3>Branch: {selectedBranch} | Section: {selectedSection}</h3>
            <p>Total students: {students.length}</p>

            {students.length > 0 ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label>Select Year: </label>
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
                </div>

                {selectedYear ? (
                  (() => {
                    const group = groupedStudents[selectedYear] || [];
                    if (group.length === 0) {
                      return <p>No data found for this year.</p>;
                    }
                    return (
                      <div style={{ marginBottom: '25px' }}>
                        <h4>{selectedYear} Students</h4>
                        <Table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Roll Number</th>
                              <th>Email</th>
                              <th>Organization</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((student) => (
                              <tr key={student._id}>
                                <td>{student.name}</td>
                                <td>{student.rollNo}</td>
                                <td>{student.email}</td>
                                <td>{student.organizationName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    );
                  })()
                ) : (
                  <p>Please select a year to display students.</p>
                )}
              </>
            ) : (
              <p>No students in this section.</p>
            )}
          </>
        ) : (
          <EmptyState>
            <EmptyImage
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Dashboard"
            />
            <h3>Welcome to the Guest Dashboard!</h3>
            <p>Select a branch, section, and year to view internship details.</p>
          </EmptyState>
        )}
      </Details>
    </Dashboard>
  );
};

export default GuestDashboard;
