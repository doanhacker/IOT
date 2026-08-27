// import logo from './logo.svg';
import './App.css';
// import Header from './component/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ActionHistory from './pages/ActionHistory';
import Home from './pages/Home';
import DataSensor from './pages/DataSensor';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Profile from './pages/Profile';



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/action-history" element={<ActionHistory />} />
          <Route path="/data-sensor" element={<DataSensor />} />
          <Route path="/profile" element={<Profile />} />

        </Routes>
      </BrowserRouter>



    </>
  );
}

export default App;
