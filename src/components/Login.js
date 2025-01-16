import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);
      setMessage(response.data.message);

      if (response.status === 200) {
        // Assuming the backend sends the user data (including username) in the response
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData)); // Save user data to localStorage
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="login-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"black" }}>
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
            <label className="form-label" style={{ display: "inline-block", width: "150px",color:"black" }}>
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
          <button type="submit" className="btn">Login</button>
        </form>
        <p className="message" style={{ marginTop: "20px" }}>{message}</p>
        <p>
          Forgot your password?{" "}
          <span
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
            style={{ color: "blue", cursor: "pointer" }}
          >
            Click here
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;