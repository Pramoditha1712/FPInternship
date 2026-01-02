import axios from 'axios';

// ✅ Read from Vite environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL;
const VITE_INTERNSHIP_BASE_URL = import.meta.env.VITE_INTERNSHIP_BASE_URL;
const VITE_AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;

// ------------------ ADMIN APIs ------------------
export const getDashboardStats = async () => {
  try {
    const res = await axios.get(`${VITE_ADMIN_BASE_URL}/dashboard-stats`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getAllInternships = async () => {
  try {
    const res = await axios.get(`${VITE_ADMIN_BASE_URL}/internships`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const updateInternshipStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${VITE_INTERNSHIP_BASE_URL}/${id}/status`, { status });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ------------------ AUTH APIs ------------------
export const registerUser = async (form) => {
  try {
    const { rollNo, name, email, section, branch, semester, password } = form;
    const res = await axios.post(`${VITE_AUTH_BASE_URL}/register`, {
      rollNo, name, email, section, branch, semester, password,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log(credentials)
    const res = await axios.post(`${VITE_AUTH_BASE_URL}/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ------------------ FORGOT PASSWORD FLOW ------------------

  /**
   * Step 1: Send reset code to user's email
   * @param {Object} data - { email }
   */
  export const sendResetCode = async (data) => {
    try {
      const res = await axios.post(`${VITE_AUTH_BASE_URL}/send-reset-code`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Step 2: Verify the reset code and update the password
   * @param {Object} data - { email, otp, newPassword }
   */
  export const verifyResetCode = async (data) => {
    try {
      const res = await axios.post(`${VITE_AUTH_BASE_URL}/verify-reset-code`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };


  