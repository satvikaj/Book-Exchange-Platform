import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // Import the CSS file for styling

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    mobileNumber: "", // Added mobile number field
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.dob || !formData.mobileNumber) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/signup", formData);
      setMessage(response.data.message);
      if (response.status === 200) {
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <div className="signup-card">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"white" }}>
              Username:
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: "300px" }} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"white" }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "300px" }} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px" ,color:"white"}}>
              Password:
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "300px" }} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"white" }}>
              Confirm Password:
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ width: "300px" }} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"white" }}>
              Mobile Number:
            </label>
            <input
              type="text"
              name="mobileNumber"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              style={{ width: "300px" }} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"white" }}>
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
          <button type="submit" className="btn">Signup</button>
        </form>
        <p className="message" style={{ marginTop: "20px" }}>{message}</p>
      </div>
    </div>
  );
}

export default Signup;