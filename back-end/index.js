// index.js
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// API test
app.get("/", (req, res) => {
  res.send("Hello IoT Backend!");
});

// API lấy dữ liệu sensor
app.get("/sensors", (req, res) => {
  db.query("SELECT * FROM sensors ORDER BY id DESC LIMIT 10", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn database" });
    }
    res.json(results);
  });
});

// API thêm dữ liệu sensor
app.post("/sensors", (req, res) => {
  const { temperature, humidity, light } = req.body;
  db.query(
    "INSERT INTO sensors (temperature, humidity, light, time) VALUES (?, ?, ?, NOW())",
    [temperature, humidity, light],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi thêm dữ liệu" });
      }
      res.json({ message: "Thêm dữ liệu thành công!", id: results.insertId });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
