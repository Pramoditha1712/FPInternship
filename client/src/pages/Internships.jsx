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
    
    const normalizeCompanyName = (name) => {
      if (!name) return "";
      const trimmedName = name.trim();
      return companyAliasMap[trimmedName] || trimmedName;
    };
    const Internships = () => {
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

      const toggleFilters = () => {
        setShowFilters(!showFilters);
      };
      const BACKEND_URL = "http://localhost:8080";
      const convertDriveLink = (url) => {
        if (!url) return null;
        const match = url.match(/[-\w]{25,}/);
        return match ? `https://drive.google.com/file/d/${match[0]}/view` : url;
      };

      const buildQuery = () => {
        const queryParams = Object.entries(filters)
          .filter(([key, value]) => value)
          .map(([key, value]) => {
            let val = value;
            if (key === "company") {
              val = normalizeCompanyName(value.toLowerCase());
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
          });
        return queryParams.join("&");
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
          const res = await axios.get(`http://localhost:8080/api/admin/internships/filter?${query}`);
          setInternships(Array.isArray(res.data) ? res.data : res.data.internships || []);
        } catch (err) {
          console.error("Error fetching internships:", err);
          setInternships([]);
        }
      };

      useEffect(() => {
        fetchInternships();
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
        await axios.delete(`${BACKEND_URL}/api/admin/internships/${id}`);
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

      return (
        <div className="internship-page container ">
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
                    <input
                      type="text"
                      className="form-control"
                      name="company"
                      value={filters.company}
                      onChange={handleChange}
                    />
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
                    <label className="form-label">Start Year</label>
                    <select className="form-select" name="year" value={filters.year} onChange={handleChange}>
                      <option value="">All Years</option>
                      {[2023, 2024, 2025, 2026].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Month */}
                  <div className="col-md-3">
                    <label className="form-label">Start Month</label>
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

                  {/* End Month */}
                  <div className="col-md-3">
                    <label className="form-label">End Month</label>
                    <select className="form-select" name="endMonth" value={filters.endMonth} onChange={handleChange}>
                      <option value="">All Months</option>
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December",
                      ].map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* End Year */}
                  <div className="col-md-3">
                    <label className="form-label">End Year</label>
                    <select className="form-select" name="endYear" value={filters.endYear} onChange={handleChange}>
                      <option value="">All Years</option>
                      {[2023, 2024, 2025, 2026].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-primary w-100" onClick={handleFilter}>
                      Apply Filter
                    </button>
                  </div>

                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-outline-secondary w-100" onClick={handleClear}>
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card shadow-sm internship-table">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle " >
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
                      <th style={{ width: "150px" }}>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internships.map((i) => (
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
                                : `${BACKEND_URL}${i.applicationLetter}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span >📑</span> Application
                          </a>
                          )}{" "}
                          {i.offerLetter && (
                            <a
                              href={
                                i.offerLetter.includes("drive.google.com")
                                  ? convertDriveLink(i.offerLetter)
                                  : `${BACKEND_URL}${i.offerLetter}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              📄 Offer
                            </a>
                          )}{" "}
                          {i.noc ? (
                            <a
                              href={
                                i.noc.includes("drive.google.com")
                                  ? convertDriveLink(i.noc)
                                  : `${BACKEND_URL}${i.noc}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              📄 NOC
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
                <div className="form-check" key={field.key}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => {
                      setSelectedFields((prev) =>
                        prev.includes(field.key)
                          ? prev.filter((key) => key !== field.key)
                          : [...prev, field.key]
                      );
                    }}
                  />
                  <label className="form-check-label">{field.label}</label>
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
