  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import Header from '../components/Navbar';
  import './Organizations.css'
  const Organizations = () => {
    const VITE_ORG_BASE_URL=import.meta.env.VITE_ORG_BASE_URL
    const [organizations, setOrganizations] = useState([]);
    const [newOrgName, setNewOrgName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
      fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
      try {
        const res = await axios.get(`${VITE_ORG_BASE_URL}`);
        setOrganizations(res.data || []);
        console.log(res.data)
      
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    const handleAddOrganization = async () => {
      if (!newOrgName.trim()) return;
      try {
        const res = await axios.post(`${VITE_ORG_BASE_URL}`, {
          name: newOrgName.trim(),
        });
        setOrganizations([...organizations, res.data]);
        setNewOrgName('');
        setError('');
      } catch (err) {
        console.error(err);
        setError('Organization already exists or invalid');
      }
    };

    const handleDelete = async (id) => {
      try {
        await axios.delete(`${VITE_ORG_BASE_URL}/${id}`);
        setOrganizations(organizations.filter((org) => org._id !== id));
      } catch (err) {
        console.error('Error deleting organization:', err);
        setError('Failed to delete organization');
      }
    };

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
            {organizations.map((org, index) => (
              <li key={org._id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{index + 1}.</strong> {org.name}
                </span>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(org._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  export default Organizations;