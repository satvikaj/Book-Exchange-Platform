import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import backgroundImage from "./home.jpg"; // Import the image

function Home() {
  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="content">
        <h1>Welcome to Our Book Exchange Platform</h1> {/* Smaller text, single line */}
        <p>Explore the world of possibilities with us.</p>
        <Link to="/login" style={{ marginRight: "10px" }}>
          <button className="btn">Login</button>
        </Link>
        <Link to="/signup">
          <button className="btn">Signup</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
