import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Pages.css";
import Header from "../components/Navbar";

const Students = () => {
  const VITE_ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL;

  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    semester: "",
    branch: "",
    section: "",
  });
  

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    semester: "",
    section: "",
    branch: "",
  });

 
  /* ========== PAGINATION (ADDED) ========== */
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  /* ====================================== */

  const fetchStudents = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`${VITE_ADMIN_BASE_URL}/Users?${query}`);
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  /* ========== RESET PAGE ON FILTER CHANGE (ADDED) ========== */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  /* ======================================================== */

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  /* ========== PAGINATION LOGIC (ADDED) ========== */
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStudents = students.slice(startIndex, endIndex);
  /* ============================================ */

  const openModal = async (rollNo) => {
    try {
      const res = await axios.get(`${VITE_ADMIN_BASE_URL}/roll/${rollNo}`);
      setSelectedStudent(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
    }
  };

  const openEditModal = (student) => {
    setEditForm({
      email: student.email,
      semester: student.semester,
      section: student.section,
      branch: student.branch,
    });
    setSelectedStudent(student);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `${VITE_ADMIN_BASE_URL}/roll/${selectedStudent.rollNo}`,
        editForm
      );
      setEditModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Failed to update student:", err);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="mb-5"></div>

      {/* FILTERS */}
      <div className="mb-4 row g-3 align-items-end">

  {/* Student Name Search */}
  <div className="col-md-3">
    <label className="form-label">Student Name</label>
    <input
      type="text"
      className="form-control"
      placeholder="Search by name"
      name="name"
      value={filters.name}
      onChange={handleChange}
    />
  </div>

  {/* Semester */}
  <div className="col-md-2">
    <label className="form-label">Semester</label>
    <select
      name="semester"
      value={filters.semester}
      onChange={handleChange}
      className="form-select"
    >
      <option value="">All</option>
      <option value="I-I">1-1</option>
      <option value="I-II">1-2</option>
      <option value="II-I">2-1</option>
      <option value="II-II">2-2</option>
      <option value="III-I">3-1</option>
      <option value="III-II">3-2</option>
      <option value="IV-I">4-1</option>
      <option value="IV-II">4-2</option>
    </select>
  </div>

  {/* Branch */}
  <div className="col-md-2">
    <label className="form-label">Branch</label>
    <select
      name="branch"
      value={filters.branch}
      onChange={handleChange}
      className="form-select"
    >
      <option value="">All</option>
      <option value="CSE">CSE</option>
      <option value="CSBS">CSBS</option>
    </select>
  </div>

  {/* Section */}
  <div className="col-md-2">
    <label className="form-label">Section</label>
    <select
      name="section"
      value={filters.section}
      onChange={handleChange}
      className="form-select"
    >
      <option value="">All</option>
      {["A", "B", "C", "D"].map((sec) => (
        <option key={sec} value={sec}>{sec}</option>
      ))}
    </select>
  </div>

</div>

      {/* TABLE */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Section</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.map((student) => (
            <tr key={student._id}>
              <td>{student.rollNo}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.branch}</td>
              <td>{student.section}</td>
              <td>{student.semester}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => openModal(student.rollNo)}
                >
                  View
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => openEditModal(student)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ========== PAGINATION UI (ADDED) ========== */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>
            </li>

            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
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
      {/* ========================================= */}

      {/* ===== VIEW MODAL (UNCHANGED) ===== */}
      {showModal && selectedStudent && (
       <div
       className="modal"
       style={{
         position: "fixed",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         backgroundColor: "rgba(0, 0, 0, 0.7)",
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         zIndex: 1000
       }}
     >
       <div
         className="modal-content"
         style={{
           backgroundColor: "#fff",
           padding: "20px",
           borderRadius: "10px",
           width: "90%",
           maxWidth: "600px",
           maxHeight: "90vh",
           overflowY: "auto"
         }}
       >
         <h3>{selectedStudent.user.name}</h3>
         <p>Email: {selectedStudent.user.email}</p>
         <p>Roll No: {selectedStudent.user.rollNo}</p>
         <p>Semester: {selectedStudent.user.semester}</p>
         <p>Section: {selectedStudent.user.section}</p>
   
         <h4 className="mt-3">Internships:</h4>
         {selectedStudent.internships.length === 0 ? (
           <p>No internships found</p>
         ) : (
           <ul>
             {selectedStudent.internships.map((i, index) => (
               <li key={index}>
                 <strong>{i.organizationName}</strong> - {i.role}<br />
                 From {new Date(i.startingDate).toLocaleDateString()} to {new Date(i.endingDate).toLocaleDateString()}<br />
                 Status: <strong>{i.status}</strong><br />
               </li>
             ))}
           </ul>
         )}
   
         <button className="btn btn-danger mt-3" onClick={() => setShowModal(false)}>
           Close
         </button>
       </div>
     </div>
   
   
      )}

      {/* ===== EDIT MODAL (UNCHANGED) ===== */}
      {editModal && selectedStudent && (
        <div
        className="modal"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px"
          }}
        >
          <h4>Edit Student Details</h4>
          <p><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
    
          <label>Email:</label>
          <input
            type="email"
            className="form-control mb-2"
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
          />
    
          <label>Semester:</label>
          <select
            className="form-select mb-2"
            name="semester"
            value={editForm.semester}
            onChange={handleEditChange}
          >
            <option value="">Select Semester</option>
            <option value="I-I">1-1</option>
            <option value="I-II">1-2</option>
            <option value="II-I">2-1</option>
            <option value="II-II">2-2</option>
            <option value="III-I">3-1</option>
            <option value="III-II">3-2</option>
            <option value="IV-I">4-1</option>
            <option value="IV-II">4-2</option>
          </select>
    
          <label>Branch:</label>
          <select
            className="form-select mb-2"
            name="branch"
            value={editForm.branch}
            onChange={handleEditChange}
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="CSBS">CSBS</option>
          </select>
    
          <label>Section:</label>
          <select
            className="form-select mb-3"
            name="section"
            value={editForm.section}
            onChange={handleEditChange}
          >
            <option value="">Select Section</option>
            {["A", "B", "C", "D"].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
    
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary me-2" onClick={() => setEditModal(false)}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleEditSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    
      )}
    </div>
  );
};

export default Students;
