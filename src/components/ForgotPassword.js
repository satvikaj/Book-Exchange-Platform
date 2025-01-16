import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [formData, setFormData] = useState({ identifier: "", dob: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/forgot-password", formData);
      setMessage(response.data.message);

      if (response.data.message === "Verification successful! You can reset your password.") {
        navigate("/reset-password"); // Redirect to ResetPassword page
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error occurred.");
    }
  };

  return (
    <div className="forgot-password-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <div className="forgot-password-form">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px" }}>
              Username or Email:
            </label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={formData.identifier}
              onChange={handleChange}
              required
              style={{ width: "300px" }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px" }}>
              Date of Birth:
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              style={{ width: "300px" }}
            />
          </div>
          <button type="submit" className="btn">Verify</button>
        </form>
        <p className="message" style={{ marginTop: "20px" }}>{message}</p>
      </div>
    </div>
  );
}

export default ForgotPassword;