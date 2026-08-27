const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "iot",
  waitForConnections: true,
});
const { parse, isValid } = require("date-fns");

//lưu dữ liệu
// getNumberThresholddata
//data sensor
//saveDataSensor, getDataSensor, getLatestDataSensor
//saveActionHistory, getActionHistory, getLatestActionHistory

async function saveThreshold(data) {
  const query = `INSERT INTO over_threshold(name,value) VALUES (?,?)`;
  const [result] = await pool.execute(query, [
    data.name,
    data.value,
  ]);
  return result.insertId;
}
//đếm số bản ghi bụi  vượt ngưỡng trong ngày 
async function getNumberThresholddata() {
  const query = `
    SELECT COUNT(*) AS count_today
    FROM over_threshold
    WHERE name="dust" and DATE(created_at) = CURDATE()
  `;
  const [rows] = await pool.execute(query);
  return rows[0].count_today;
}

async function saveDataSensor(data) {
  const query = `INSERT INTO data_sensor (temperature, humidity, light,dust) VALUES (?, ?, ?,?)`;
  const [result] = await pool.execute(query, [
    data.temperature,
    data.humidity,
    data.light,
    data.dust
  ]);
  return result.insertId;
}
// dữ liệu sensor
async function getDataSensor(
  page = 1,
  sizePage = 10,
  column = null, // tên cột muốn tìm kiếm
  searchValue = null, // giá trị tìm kiếm
  sortBy = null,
  statusSortBy = null
) {
  //phân trang
  const offset = (page - 1) * sizePage;
  let query = "select * from (SELECT * FROM data_sensor";

  //kiểm tra searchValue có phải ngày hay ko
  if (searchValue) {
    const isNumber = !isNaN(searchValue);

    if (column === "all") {
      query += isNumber
        ? ` WHERE id = ${searchValue} OR temperature = ${searchValue} OR humidity = ${searchValue} OR light = ${searchValue} OR dust = ${searchValue} `
        : ` WHERE created_at LIKE '%${searchValue}%'`;
    } else {
      //nếu là cột created_at thì tìm gần đúng, cột khác thì tìm chính xác
      const operator = column === "created_at" ? "LIKE" : "=";
      const value =
        column === "created_at" ? `'%${searchValue}%'` : searchValue;
      query += ` WHERE ${column} ${operator} ${value}`;
    }
  }
  //để lấy tổng số bản ghi để phân trang
  let query2 = query + ` ) as data`;
  const [totalRecord] = await pool.query(query2, [searchValue]);

  //dữ liệu khi  phân trang
  query += ` order by id desc LIMIT ${sizePage} OFFSET ${offset}`;
  query += ` ) as data`;
  //sắp xếp
  query += ` order by ${sortBy}`;
  if (statusSortBy === "true") {
    query += ` desc`;
  }
  const [row] = await pool.query(query, [searchValue]);

  console.log(statusSortBy);
  console.log(query);
  return {
    data: row,
    totalRecord: totalRecord.length,
  };
}

async function getLatestDataSensor() {
  const query = `
    SELECT * 
    FROM data_sensor
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const [rows] = await pool.query(query);
  return rows;
}

//lưu dữ liệu action history
async function saveActionHistory(data) {
  if (
    data.device !== null &&
    data.device !== "null" &&
    data.device !== "null" &&
    typeof data.device !== "undefined"
  ) {
    const action = data.status == 1 ? "ON" : "OFF";
    const query = `INSERT INTO action_history (device,action) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [data.device, action]);
    return result.insertId;
  }
}

//action history
async function getActionHistory(
  page = 1,
  sizePage = 10,
  device = "all",
  action = "all",
  datetime = "",
  sortBy = null,
  statusSortBy = null
) {
  const offset = (page - 1) * sizePage;
  let query = "SELECT * From ( select * from action_history where 1 = 1";
  if (device != "all") {
    query += ` and device like '%${device}%'`;
  }
  if (action != "all") {
    query += ` and action like '%${action}%'`;
  }
  if (datetime != "") {
    query += ` and created_at like '%${datetime}%'`;
  }

  let query2 = query + ` ) as data`;
  query += ` order by id desc LIMIT ${sizePage} OFFSET ${offset}`;
  query += ` ) as data`;
  //sắp xếp
  query += ` order by ${sortBy}`;
  if (statusSortBy === "true") {
    query += ` desc`;
  }
  const [totalRecord] = await pool.query(query2);
  const [row] = await pool.query(query);
  console.log(query);
  return {
    data: row,
    totalRecord: totalRecord.length,
  };
}

// lấy dữ liệu action history mới nhát
async function getLatestActionHistory() {
  const query = `
    SELECT ah.device, ah.action, ah.created_at
FROM action_history ah
JOIN (
    SELECT device, MAX(created_at) AS max_created
    FROM action_history
    GROUP BY device
) latest
ON ah.device = latest.device AND ah.created_at = latest.max_created;

  `;
  const [rows] = await pool.query(query);
  return rows;
}

module.exports = {
  pool,
  getDataSensor,
  getActionHistory,
  saveDataSensor,
  saveActionHistory,
  getLatestDataSensor,
  getLatestActionHistory,
  saveThreshold,
  getNumberThresholddata
};
