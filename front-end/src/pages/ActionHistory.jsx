import React from "react";
import { Container, Row, Col, Button, Card, Table } from 'react-bootstrap';
import { Link } from "react-router-dom";


function ActionHistory() {
  return (
    <div>
      <Container fluid className="p-4"style={{ backgroundColor: "#CFE1EA", minHeight: "100vh"}}>
  {     }
  <h3 className="fw-bold text-secondary mb-6">ActionHistory</h3>
     
  {/* Thanh điều hướng */}
  <Row className="mb-4">
    <Col>
       <div className="d-flex justify-content-center gap-5">
                 {/* Sử dụng Link để chuyển trang */}
            <Link to="/Dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="outline-secondary">Dashboard</Button>
            </Link>
            <Link to="/DataSensor" style={{ textDecoration: 'none' }}>
              <Button variant="danger">Data Sensor</Button>
            </Link>
            <Link to="/ActionHistory" style={{ textDecoration: 'none' }}>
              <Button variant="warning">Action History</Button>
            </Link>
            <Link to="/Profile" style={{ textDecoration: 'none' }}>
              <Button variant="info" style={{ width: '130px' }}>Profile</Button>
            </Link>
               </div>
    </Col>
  </Row>

  {/* Thanh tìm kiếm và bộ lọc */}
  <Row className="mb-4">
    <Col>
      <div className="d-flex align-items-center justify-content-center gap-3">
        <div className="input-group" style={{ width: '400px' }}>
          <input type="text" className="form-control" placeholder="Time(hh/mm/ss dd/mm/yyyy)" />
          <span className="input-group-text">🔍</span>
        </div>
        <select className="form-select" style={{ width: '100px' }}>
          <option>Tất cả</option>
        </select>
        <Button variant="primary">Search</Button>
      </div>
    </Col>
  </Row>

  {/* Bảng lịch sử hành động */}
  <Row className="justify-content-center">
    <Col md={10}>
      <Card className="shadow">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Device</th>
                <th>Action</th>
                <th><div className="d-flex align-items-center">Time <span className="ms-2">↕️</span></div></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>327</td>
                <td>Air_CONDITIONER</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
              <tr>
                <td>328</td>
                <td>FAN</td>
                <td>OFF</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
              <tr>
                <td>329</td>
                <td>Air_CONDITIONER</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
              <tr>
                <td>330</td>
                <td>LED</td>
                <td>OFF</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
              <tr>
                <td>331</td>
                <td>LED</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
                <tr>
                <td>332</td>
                <td>LED</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
                <tr>
                <td>333</td>
                <td>LED</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
                <tr>
                <td>334</td>
                <td>LED</td>
                <td>ON</td>
                <td>21:11:20 18/08/2025</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  {/* Phân trang */}
  <Row className="mt-4">
    <Col className="d-flex justify-content-center align-items-center gap-2">
      <Button variant="light">&lt;&lt;</Button>
      <Button variant="dark">1</Button>
      <Button variant="light">2</Button>
      <Button variant="light">...</Button>
      <Button variant="light">30</Button>
      <Button variant="light">&gt;&gt;</Button>
    </Col>
  </Row>

</Container>
    </div>
  );
}

export default ActionHistory;