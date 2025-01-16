import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Signout from "./components/Signout";
import SellPage from "./components/SellPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PurchasePage from "./components/PurchasePage";
import ExchangePage from "./components/ExchangePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signout" element={<Signout />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/exchange" element={<ExchangePage />} /> {/* ExchangePage Route */}
      </Routes>
    </Router>
  );
}

export default App;