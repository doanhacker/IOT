import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside style={{ width: "200px", background: "#f0f0f0", padding: "20px", minHeight: "100vh" }}>
      <h3>📊 Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/datasensor">Data Sensor</Link></li>
        <li><Link to="/actionhistory">Action History</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
