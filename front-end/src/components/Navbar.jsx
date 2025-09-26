import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ background: "#87CEEB", padding: "10px", display: "flex", gap: "20px" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/datasensor">Data Sensor</Link>
      <Link to="/actionhistory">Action History</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
};

export default Navbar;
