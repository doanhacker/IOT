import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./WeatherCard.css"; // CSS riêng cho hiệu ứng
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [isFanOn, setIsFanOn] = useState(false);
  const [isAcOn, setIsAcOn] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);

  // Giá trị sensor (có thể lấy từ API hoặc state sau này)
  const temperature = 10;
  const humidity = 40;
  const light = 1024;

  // Hàm xác định className theo nhiệt độ
  const getTemperatureClass = (temp) => {
    if (temp < 20) return "cold";
    if (temp >= 20 && temp <= 28) return "cool";
    if (temp > 28 && temp <= 35) return "hot";
    return "extreme";
  };

  return (
    <Container
      fluid
      className="p-4 bg-light"
      style={{ backgroundColor: "#CFE1EA", minHeight: "100vh" }}
    >
      {/* Title */}
      <h3 className="fw-bold text-secondary mb-6">Dashboard</h3>

      {/* Navbar Tabs */}
      <Row className="mb-5">
        <Col>
          <div className="d-flex justify-content-center gap-5">
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="outline-secondary">Dashboard</Button>
            </Link>
            <Link to="/DataSensor" style={{ textDecoration: "none" }}>
              <Button variant="danger">Data Sensor</Button>
            </Link>
            <Link to="/ActionHistory" style={{ textDecoration: "none" }}>
              <Button variant="warning">Action History</Button>
            </Link>
            <Link to="/Profile" style={{ textDecoration: "none" }}>
              <Button variant="info" style={{ width: "130px" }}>
                Profile
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Sensor Cards */}
        <Col md={9}>
          <Row
            className="g-3"
            style={{
              backgroundColor: "#CFE1EA",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            {/* Temperature */}
            <Col md={4}>
              <Card
                className={`text-center shadow weather-card ${getTemperatureClass(
                  temperature
                )}`}
              >
                <Card.Body>
                  <Card.Title>Temperature 🌡️</Card.Title>
                  <h2>{temperature}°C</h2>
                </Card.Body>
              </Card>
            </Col>

            {/* Humidity */}
            <Col md={4}>
              <Card className="text-center shadow">
                <Card.Body>
                  <Card.Title>Humidity 💧</Card.Title>
                  <h2>{humidity}%</h2>
                </Card.Body>
              </Card>
            </Col>

            {/* Light */}
            <Col md={4}>
              <Card className="text-center shadow">
                <Card.Body>
                  <Card.Title>Light 💡</Card.Title>
                  <h2>{light} Lux</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Chart placeholder */}
          <Card className="mt-4 shadow">
            <Card.Body>
              <Card.Title>Sensor Chart</Card.Title>
              <div
                style={{
                  height: "280px",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p className="text-muted">[Đồ thị sẽ hiện thị ở đây ]</p>

              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          {/* Device Title */}
          <Card className="shadow mb-4 w-100" style={{ borderRadius: "5px" }}>
            <div
              style={{
                backgroundColor: "#A7EFDC",
                padding: "20px",
                borderRadius:"5px 5px 0 0",
              }}
              
            >
              <Card.Title className="text-center fs-4 fw-bold">Device</Card.Title>
            </div>
          </Card>

          {/* Fan */}
          <Card
            className="shadow mb-4 w-100"
            style={{ borderRadius: "15px", minHeight: "90px" }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center px-4">
              <span className="fs-4 d-flex align-items-center">
                <span style={{ fontSize: "32px", marginRight: "12px" }}>🌀</span> Fan
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isFanOn}
                  onChange={() => setIsFanOn(!isFanOn)}
                />
                <span className="slider round"></span>
              </label>
            </Card.Body>
          </Card>

          {/* Air Conditioner */}
          <Card
            className="shadow mb-4 w-100"
            style={{ borderRadius: "15px", minHeight: "90px" }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center px-4">
              <span className="fs-4 d-flex align-items-center">
                <span style={{ fontSize: "32px", marginRight: "12px" }}>❄️</span> Air Conditioner
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isAcOn}
                  onChange={() => setIsAcOn(!isAcOn)}
                />
                <span className="slider round"></span>
              </label>
            </Card.Body>
          </Card>

          {/* Light */}
          <Card
            className="shadow mb-4 w-100"
            style={{ borderRadius: "15px", minHeight: "90px" }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center px-4">
              <span className="fs-4 d-flex align-items-center">
                <span style={{ fontSize: "32px", marginRight: "12px" }}>💡</span> Light
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isLightOn}
                  onChange={() => setIsLightOn(!isLightOn)}
                />
                <span className="slider round"></span>
              </label>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
}

export default Dashboard;
