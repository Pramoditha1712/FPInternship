import React, { useState } from "react";
import { sendResetCode, verifyResetCode } from "../services/Api";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendResetCode({ email });
      setMessage(res.message || "Verification code sent to your email.");
      setOtpSent(true);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyResetCode({ email, otp, newPassword });
      setMessage(res.message || "Password updated successfully.");
      setOtpSent(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid code or request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="shadow p-4 rounded" style={{ width: "350px", background: "white" }}>
        <h5 className="text-center mb-4 fw-semibold">Forgot Password</h5>

        {message && <div className="alert alert-info">{message}</div>}

        {!otpSent ? (
          <form onSubmit={handleSendCode}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Verification Code</label>
              <input
                type="text"
                className="form-control py-2"
                placeholder="Enter code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">New Password</label>
              <input
                type="password"
                className="form-control py-2"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <small>
            <Link to="/login" className="text-decoration-none fw-medium">Back to Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
