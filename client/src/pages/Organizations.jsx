import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Navbar";
import "./Organizations.css";

/* ===== PAGINATION ===== */
const ITEMS_PER_PAGE = 10;
/* ====================== */

const Organizations = () => {
  const VITE_ORG_BASE_URL = import.meta.env.VITE_ORG_BASE_URL;

  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${VITE_ORG_BASE_URL}`);
      setOrganizations(res.data || []);
    } catch (err) {
      console.error("Error fetching organizations:", err);
    }
  };

  const handleAddOrganization = async () => {
    if (!newOrgName.trim()) return;
    try {
      const res = await axios.post(`${VITE_ORG_BASE_URL}`, {
        name: newOrgName.trim(),
      });
      setOrganizations([...organizations, res.data]);
      setNewOrgName("");
      setError("");
      setCurrentPage(1); // reset to first page
    } catch (err) {
      console.error(err);
      setError("Organization already exists or invalid");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${VITE_ORG_BASE_URL}/${id}`);
      setOrganizations(organizations.filter((org) => org._id !== id));
    } catch (err) {
      console.error("Error deleting organization:", err);
      setError("Failed to delete organization");
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil(organizations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrganizations = organizations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  /* ============================ */

  return (
    <div className="container mt-5">
      <Header />

      <div className="card shadow p-4 mt-5">
        <h2 className="mb-4 text-primary">Organizations</h2>

        <div className="mb-3 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Enter organization name"
          />
          <button className="btn btn-success" onClick={handleAddOrganization}>
            Add Organization
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <ul className="list-group">
          {paginatedOrganizations.map((org, index) => (
            <li
              key={org._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <strong>{startIndex + index + 1}.</strong> {org.name}
              </span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(org._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* ===== PAGINATION UI ===== */}
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
        {/* ========================= */}
      </div>
    </div>
  );
};

export default Organizations;
