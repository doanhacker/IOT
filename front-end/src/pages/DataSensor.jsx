import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Form, InputGroup, Pagination } from "react-bootstrap";
import { Link } from 'react-router-dom';


function DataSensor() {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/DataSensor")
      .then((res) => res.json())
      .then((data) => setSensors(data))
      .catch((err) => console.error("❌ Lỗi fetch:", err));
  }, []);

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#CFE1EA", minHeight: "100vh" }}>
      {/* Title */}
      <h3 className="fw-bold text-secondary mb-6">Data Sensor</h3>

      {/* Navbar Tabs */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-center gap-5">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant="outline-secondary">Dashboard</Button>
            </Link>
            <Button variant="danger">Data Sensor</Button>
           <Link to="/ActionHistory" style={{ textDecoration: 'none' }}>
                        <Button variant="warning">Action History</Button>
                      </Link>
            <Button variant="info" style={{ width: "140px" }}>Profile</Button>
          </div>
        </Col>
      </Row>

      {/* Search bar */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control placeholder="Search" />
            <Button variant="outline-secondary">🔍</Button>
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select>
            <option>Tất cả</option>
            <option>Temperature</option>
            <option>Humidity</option>
            <option>Light</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button variant="primary" className="w-100">Search</Button>
        </Col>
      </Row>

      {/* Table */}
      <Table striped bordered hover responsive className="shadow bg-white">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Light (Lux)</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sensors.length > 0 ? (
            sensors.map((sensor) => (
              <tr key={sensor.id}>
                <td>{sensor.id}</td>
                <td>{sensor.temperature}</td>
                <td>{sensor.humidity}</td>
                <td>{sensor.light}</td>
                <td>{new Date(sensor.time).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination (chưa làm chức năng, chỉ demo) */}
      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First />
          <Pagination.Prev />
          <Pagination.Item active>{1}</Pagination.Item>
          <Pagination.Item>{2}</Pagination.Item>
          <Pagination.Item>{3}</Pagination.Item>
          <Pagination.Ellipsis />
          <Pagination.Item>{30}</Pagination.Item>
          <Pagination.Next />
          <Pagination.Last />
        </Pagination>
      </div>
    </Container>
  );
}

export default DataSensor;
