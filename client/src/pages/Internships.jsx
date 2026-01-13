    import React, { useEffect, useState } from "react";
    import axios from "axios";
    import ExcelJS from "exceljs";
    import Header from '../components/Navbar'
    import { saveAs } from "file-saver";
    import "./Internship.css"; 


    const companyAliasMap = {
      "jpmorgan chase": "JPMC",
      "jp morgan chase": "JPMC",
      "jpmorgan chase & co.": "JPMC",
      "jpmorgan chase and co": "JPMC",
      "jpmorgan chase & co": "JPMC",
      "jp morgan chase & co.":"JPMC",
      "jpmorgan and chase": "JPMC",
      "jp morgan chase and co":"JPMC",
      "jpmc": "JPMC",
      "j p morgan": "JPMC",
      "jpmorganchase": "JPMC",
    
      "amazon": "Amazon",
      "amazon inc": "Amazon",
      "amazon.com": "Amazon",
    
      "google": "Google",
      "google inc": "Google",
      "alphabet": "Google",
    
      "microsoft": "Microsoft",
      "msft": "Microsoft",
    
      "tcs": "TCS",
      "tata consultancy services": "TCS",
    
      "infosys": "Infosys",
      "infy": "Infosys",
    
      "wipro": "Wipro",
    
      "cognizant": "Cognizant",
      "cts": "Cognizant",
    
      "accenture": "Accenture",
    
      "uravu labs": "Uravu Labs",
      "tech mahindra": "Tech Mahindra",
      "choice solutions limited": "Choice Solutions",
      "choice solutions": "Choice Solutions",
      "drdo": "DRDO"
      
    };
    /* ===== PAGINATION (ADDED) ===== */
    const ITEMS_PER_PAGE = 7;
  
    /* ============================= */

    
    
    const normalizeCompanyName = (name) => {
      if (!name) return "";
      const trimmedName = name.trim();
      return companyAliasMap[trimmedName] || trimmedName;
    };
    const Internships = () => {
      const VITE_ADMIN_BASE_URL=import.meta.env.VITE_ADMIN_BASE_URL
      const VITE_INTERNSHIP_BASE_URL=import.meta.env.VITE_INTERNSHIP_BASE_URL
      const VITE_AUTH_BASE_URL=import.meta.env.VITE_AUTH_BASE_URL
      const VITE_GUEST_BASE_URL=import.meta.env.VITE_GUEST_BASE_URL
      const VITE_ORG_BASE_URL=import.meta.env.VITE_ORG_BASE_URL
      const VITE_USER_BASE_URL=import.meta.env.VITE_USER_BASE_URL
      const VITE_BACKEND_URL=import.meta.env.VITE_BACKEND_URL
      const [internships, setInternships] = useState([]);
      const [filters, setFilters] = useState({
        type: "",
        semester: "",
        section: "",
        branch: "",
        year: "",
        month: "",
        endMonth: "",
        endYear: "",
        company: "",
      });
      const [showFilters, setShowFilters] = useState(false);
      const [showExportModal, setShowExportModal] = useState(false);
      const [selectedFields, setSelectedFields] = useState([]);
      const [academicYears, setAcademicYears] = useState([]);

      const exportableFields = [
      { key: "rollNo", label: "Roll No" },
      { key: "organizationName", label: "Organization" },
      { key: "role", label: "Role" },
      { key: "startingDate", label: "Start Date" },
      { key: "endingDate", label: "End Date" },
      { key: "status", label: "Status" },
      { key: "semester", label: "Semester" },
      { key: "branch", label: "Branch" },
      { key: "section", label: "Section" },
      { key: "package", label: "Stipend" },
      { key: "hrEmail", label: "HR Email" },
      { key: "hrPhone", label: "HR Phone" },
    ];

    const getPageNumbers = () => {
      const maxVisible = 5; // how many page buttons to show
      const pages = [];
    
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
    
      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }
    
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    
      return pages;
    };
    

    useEffect(() => {
      const fetchAcademicYears = async () => {
        try {
          const res = await axios.get(
            `${VITE_ADMIN_BASE_URL}/internships/academic-years`
          );
          setAcademicYears(res.data); 
          // [{ label: "2025-26", value: 2025 }, ...]
        } catch (err) {
          console.error("Failed to fetch academic years:", err);
        }
      };
    
      fetchAcademicYears();
    }, []);
    
    useEffect(() => {
      const fetchOrganizations = async () => {
        try {
          const res = await fetch(`${VITE_ORG_BASE_URL}`);
          const data = await res.json();
          console.log("Fetched organizations from API:", data); // ✅ This confirms fetch worked
          setCompanies(data); // ✅ This sets the state
        } catch (err) {
          console.error("Failed to fetch organizations:", err);
        }
      };
      fetchOrganizations();
    }, []);
    const [companies, setCompanies] = useState([]);


      const toggleFilters = () => {
        setShowFilters(!showFilters);
      };

        const [currentPage, setCurrentPage] = useState(1);
      
      const convertDriveLink = (url) => {
        if (!url) return null;
        const match = url.match(/[-\w]{25,}/);
        return match ? `https://drive.google.com/file/d/${match[0]}/view` : url;
      };
      const buildQuery = () => {
        const params = new URLSearchParams();
      
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== "" && val !== null && val !== undefined) {
            params.append(key, val);
          }
        });
      
        return params.toString();
      };
      

      const exportToExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Internships");

      // Add header
      const headerRow = selectedFields.map((key) => {
        const field = exportableFields.find(f => f.key === key);
        return field ? field.label : key;
      });
      worksheet.addRow(headerRow);

      // Add data rows
      internships.forEach((entry) => {
        const row = selectedFields.map((field) => {
          if (field === "startingDate" || field === "endingDate") {
            return new Date(entry[field]).toLocaleDateString();
          }
          return entry[field] || "-";
        });
        worksheet.addRow(row);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "internships.xlsx");
    };


      const fetchInternships = async () => {
        const query = buildQuery();
        try {
          const res = await axios.get(`${VITE_ADMIN_BASE_URL}/internships/filter?${query}`);
          setInternships(Array.isArray(res.data) ? res.data : res.data.internships || []);
        } catch (err) {
          console.error("Error fetching internships:", err);
          setInternships([]);
        }
      };

      useEffect(() => {
        fetchInternships();
      }, [filters]);

      useEffect(() => {
        setCurrentPage(1);
      }, [filters]);
      
     
      

      const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

      const handleFilter = () => {
        fetchInternships();
      };

      const generateSummary = () => {
      if (internships.length === 0) return "No matching internships found.";

      const count = internships.length;
      const {
        year,
        endYear,
        month,
        endMonth,
        branch,
        semester,
        section,
        type,
        company,
      } = filters;
      return `There ${count === 1 ? "is" : "are"} ${count} student${count > 1 ? "s" : ""}.`;
    };

    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this internship?")) return;

      try {
        await axios.delete(`${VITE_ADMIN_BASE_URL}internships/${id}`);
        setInternships(prev => prev.filter(i => i._id !== id));
      } catch (error) {
        console.error("Error deleting internship:", error);
        alert("Failed to delete internship.");
      }
    };


      const handleClear = () => {
      const cleared = {
        type: "",
        semester: "",
        branch: "",
        year: "",
        month: "",
        endMonth: "",
        endYear: "",
        company: "",
      };
      setFilters(cleared);
      // Call fetchInternships with cleared filters
      setTimeout(() => fetchInternships(), 0); // ensures filters are updated first
    };

      useEffect(() => {
      console.log("Internship NOC links:");
      internships.forEach(i => {
        console.log(i.rollNo, i.noc); // or just console.log(i.noc);
      });
    }, [internships]);

      const renderStatusBadge = (status) => {
        let color = "secondary";
        if (status === "ongoing") color = "success";
        else if (status === "past") color = "danger";
        else if (status === "future") color = "info";

        return (
          <span className={`badge border border-${color} text-${color} text-capitalize`}>
            {status}
          </span>
        );
      };
      const totalPages = Math.ceil(internships.length / ITEMS_PER_PAGE);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedInternships = internships.slice(startIndex, endIndex);

      return (
        <div className="internship-page container-fluid ">
          <Header/>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-center flex-grow-1 fw-bold mb-0 mt-4 border-bottom pb-2">Internships</h1>
            <button className="btn btn-success ms-3" onClick={() => setShowExportModal(true)}>
              Export to Excel
            </button>
          </div>
          <div className="mb-3 text-center">
            <button className="btn btn-outline-dark" onClick={toggleFilters}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          {internships.length > 0 && (
            <div className="alert alert-warning text-center mb-4">
              {generateSummary()}
            </div>
          )}
          {showFilters && (
            <div className="card shadow-sm mb-5 filter-card">
              <div className="card-body">
                <h5 className="card-title mb-3 fw-semibold">Filter Internships</h5>
                <div className="row g-3">
                  {/* Company */}
                  <div className="col-md-3">
                    <label className="form-label">Company</label>
                    <select
                        className="form-select"
                        name="company"
                        value={filters.company}
                        onChange={handleChange}
                      >
                        <option value="">Select Organization</option>
                        {companies.map((org) => (
                          <option key={org._id} value={org.name}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    
                  </div>

                  {/* Status */}
                  <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="type" value={filters.type} onChange={handleChange}>
                      <option value="">All Status</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="past">Past</option>
                      <option value="future">Upcoming</option>
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="col-md-3">
                    <label className="form-label">Semester</label>
                    <select className="form-select" name="semester" value={filters.semester} onChange={handleChange}>
                      <option value="">All Semesters</option>
                      <option value="II-I">2-1</option>
                      <option value="II-II">2-2</option>
                      <option value="III-I">3-1</option>
                      <option value="III-II">3-2</option>
                      <option value="IV-I">4-1</option>
                      <option value="IV-II">4-2</option>
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="col-md-3">
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select me-4"
                      value={filters.branch}
                      onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                    >
                      <option value="">All Branches</option>
                      {[
                        "CSE", "CSBS"
                      ].map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div className="col-md-3">
                    <label className="form-label">Section</label>
                    <select className="form-select" name="section" value={filters.section} onChange={handleChange}>
                      <option value="">All Sections</option>
                      {["A", "B", "C", "D"].map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Year */}
                  <div className="col-md-3">
                    <label className="form-label">Academic Year</label>
                    <select
                      className="form-select"
                      name="year"
                      value={filters.year}
                      onChange={handleChange}
                    >
                      <option value="">All Academic Years</option>
                      {academicYears.map((yr) => (
                        <option key={yr.value} value={yr.value}>
                          {yr.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Month */}
                  <div className="col-md-3">
                    <label className="form-label">Month</label>
                    <select className="form-select" name="month" value={filters.month} onChange={handleChange}>
                      <option value="">All Months</option>
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                      ].map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  

                  {/* Buttons */}
                  
                  <div className="col-md-3">
                        <label className="form-label invisible">Clear</label>
                        <button className="btn btn-outline-secondary w-100" onClick={handleClear}>
                          Clear Filters
                        </button>
                      </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card shadow-sm internship-table" >
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle"  >
                  <thead className="table-light">
                    <tr>
                      <th>Roll No</th>
                      <th>Organization</th>
                      <th>Role</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th>Semester</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Stipend</th>
                      <th>Hr mail</th>
                      <th>Hr phone</th>
                      <th >Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {paginatedInternships.map((i) => (

                      <tr key={i._id}>
                        <td>{i.rollNo}</td>
                        <td>{normalizeCompanyName(i.organizationName.toLowerCase())}</td>
                        <td>{i.role}</td>
                        <td>{new Date(i.startingDate).toLocaleDateString()}</td>
                        <td>{new Date(i.endingDate).toLocaleDateString()}</td>
                        <td>{renderStatusBadge(i.status)}</td>
                        <td>{i.semester || "-"}</td>
                        <td>{i.branch || "-"}</td>
                        <td>{i.section || "-"}</td>
                        <td>{i.package || "unpaid"}</td>
                        <td>{i.hrEmail || "-"}</td>
                        <td>{i.hrPhone || "-"}</td>
                        <td className="docs">
                          {i.applicationLetter && (
                            <a
                            href={
                              i.applicationLetter.includes("drive.google.com")
                                ? convertDriveLink(i.applicationLetter)
                                : `${VITE_BACKEND_URL}${i.applicationLetter}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span ></span> Application
                          </a>
                          )}{" "}
                          {i.offerLetter && (
                            <a
                              href={
                                i.offerLetter.includes("drive.google.com")
                                  ? convertDriveLink(i.offerLetter)
                                  : `${VITE_BACKEND_URL}${i.offerLetter}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                               Offer
                            </a>
                            
                          )}{" "}
                          <br />
                          {i.noc ? (
                          
                            <a
                              href={
                                i.noc.includes("drive.google.com")
                                  ? convertDriveLink(i.noc)
                                  : `${VITE_BACKEND_URL}${i.noc}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              NOC
                            </a>
                          ) : (
                            <span className="text-muted">NOC not uploaded</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-danger" onClick={() => handleDelete(i._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {internships.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center text-muted">
                          No internships found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {totalPages > 1 && (
  <div className="d-flex justify-content-center mt-4">
    <ul className="pagination">

      {/* Prev */}
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>
      </li>

      {/* First */}
      {currentPage > 3 && (
        <>
          <li className="page-item">
            <button className="page-link" onClick={() => setCurrentPage(1)}>
              1
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        </>
      )}

      {/* Dynamic Pages */}
      {getPageNumbers().map((page) => (
        <li
          key={page}
          className={`page-item ${currentPage === page ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        </li>
      ))}

      {/* Last */}
      {currentPage < totalPages - 2 && (
        <>
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          </li>
        </>
      )}

      {/* Next */}
      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </li>

    </ul>
  </div>
)}


          {showExportModal && (
      <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Fields to Export</h5>
              <button type="button" className="btn-close" onClick={() => setShowExportModal(false)}></button>
            </div>
            <div className="modal-body">
                  {exportableFields.map((field) => (
                    <div
                      className="form-check d-flex align-items-center mb-2"
                      key={field.key}
                    >
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id={`export-${field.key}`}
                        checked={selectedFields.includes(field.key)}
                        onChange={() => {
                          setSelectedFields((prev) =>
                            prev.includes(field.key)
                              ? prev.filter((key) => key !== field.key)
                              : [...prev, field.key]
                          );
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`export-${field.key}`}
                      >
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  exportToExcel();
                  setShowExportModal(false);
                }}
                disabled={selectedFields.length === 0}
              >
                Download
              </button>
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

        </div>
      );
    };

    export default Internships;
