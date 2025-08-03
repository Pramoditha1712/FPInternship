import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const INTERNSHIP_BASE_URL = `${BASE_URL}/api/internships`;
const ADMIN_BASE_URL = `${BASE_URL}/api/admin`;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

export const getDashboardStats = async () => {
  try {
    const res = await axios.get(`${ADMIN_BASE_URL}/dashboard-stats`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getAllInternships = async () => {
  try {
    const res = await axios.get(`${ADMIN_BASE_URL}/internships`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const updateInternshipStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${INTERNSHIP_BASE_URL}/${id}/status`, { status });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const registerUser = async (form) => {
  try {
    const { rollNo, name, email, section, branch, semester, password } = form;
    const res = await axios.post(`${AUTH_BASE_URL}/register`, {
      rollNo, name, email, section, branch, semester, password
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await axios.post(`${AUTH_BASE_URL}/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
