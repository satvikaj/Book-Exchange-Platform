import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import SellPage from "./SellPage";
import PurchasePage from "./PurchasePage";
import Profile from "./Profile";
import ExchangePage from "./ExchangePage"; // Import ExchangePage

const Dashboard = () => {
  const [location, setLocation] = useState("Fetching location...");
  const [error, setError] = useState("");
  const [showSellPage, setShowSellPage] = useState(false);
  const [showPurchasePage, setShowPurchasePage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExchangePage, setShowExchangePage] = useState(false); // State for ExchangePage
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_AP_KEY`
            );
            const result = response.data.results[0];
            setLocation(result?.formatted || "Location not found");
          } catch {
            setError("Failed to fetch location.");
          }
        },
        () => setError("Unable to retrieve location.")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Toggle pages
  const toggleSellPage = () => {
    setShowSellPage(true);
    setShowPurchasePage(false);
    setShowProfile(false);
    setShowExchangePage(false); // Hide ExchangePage when switching pages
  };

  const togglePurchasePage = () => {
    setShowPurchasePage(true);
    setShowSellPage(false);
    setShowProfile(false);
    setShowExchangePage(false); // Hide ExchangePage when switching pages
  };

  const toggleProfilePage = () => {
    setShowProfile(true);
    setShowSellPage(false);
    setShowPurchasePage(false);
    setShowExchangePage(false); // Hide ExchangePage when switching pages
  };

  const toggleExchangePage = () => {
    setShowExchangePage(true);
    setShowSellPage(false);
    setShowPurchasePage(false);
    setShowProfile(false); // Hide other pages when showing ExchangePage
  };

  // Handle signout
  const handleSignout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="quote">
          "A room without books is like a body without a soul."
        </h1>
      </div>

      <div className="dashboard-location">
        <div className="location-wrapper">
          <span>{error ? error : `Your Location: ${location}`}</span>

          <img
            className="profile-icon"
            src={user?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} // Use user's profile image if available
            alt="Profile"
            onClick={toggleProfilePage}
          />
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <ul>
            <li>
              <button onClick={toggleProfilePage}>Profile</button>
            </li>
            <li>
              <button onClick={toggleSellPage}>Sell</button>
            </li>
            <li>
              <button onClick={togglePurchasePage}>Purchase</button>
            </li>
            <li>
              <button onClick={toggleExchangePage}>Exchange</button> {/* Added Exchange page button */}
            </li>
            <li>
              <button onClick={handleSignout}>Signout</button>
            </li>
          </ul>
        </div>

        <div className="dashboard-main-content">
          {showProfile && <Profile user={user} />}
          {showSellPage && <SellPage location={location} user={user} />}
          {showPurchasePage && <PurchasePage user={user} />}
          {showExchangePage && <ExchangePage location={location} user={user} />} {/* Display ExchangePage */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;