import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DataSensor from "./pages/DataSensor";
import ActionHistory from "./pages/ActionHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/DataSensor" element={<DataSensor/>}/>
        <Route path="/ActionHistory" element={<ActionHistory/>}/>
       
      </Routes>
    </Router>
  );
}

export default App;
