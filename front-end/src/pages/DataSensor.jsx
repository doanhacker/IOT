import Header from "../component/Header";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import axios from "axios";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { parse, format, isValid } from "date-fns";

const DataSensor = () => {
  const [dataSensor, setDataSensor] = useState([]);
  //lưu trữ tổng số trang
  const [number, setNumber] = useState(1);
  const [page, setPage] = useState(1);
  const [sizePage, setSizePage] = useState(10);
  //lưu trữ số lượng bản ghi của 1 trang

  //biến lữu trữ tạm của searchBy
  const [temp1, setTemp1] = useState("all");
  //dữ liệu tìm kiếm theo trường dữ liệu nào
  const [searchBy, setSearchBy] = useState("all");

  //biến lữu trữ tạm của searchValue
  const [temp2, setTemp2] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [error, setError] = useState([]);
  //dữ liệu sắp xếp theo trường dữ liệu nào
  const [sortBy, setSortBy] = useState({
    name: "id",
    status: true,
  });
  const handleSortBy = (name) => {
    if (sortBy.name === name) {
      setSortBy((pre) => ({
        ...pre,
        status: !pre.status,
      }));
    } else {
      setSortBy({
        name: name,
        status: true,
      });
    }
  };
  const handlePage = (page) => {
    setPage(page);
    setSortBy({
      name: "id",
      status: true,
    });
  };
  // lấy dữ liệu data sensor
  useEffect(() => {
    const fetch = async () => {
      const isNumber = !isNaN(searchValue);
      let searchDate = "";
      // nếu là chuỗi , xử lý theo đúng format ngày của database
      if (!isNumber) {
        const words = searchValue.trim().split(" ");
        if (words.length === 2) {
          const [day, month, year] = words[1].split("/");
          const reversedDate = `${year}-${month}-${day}`;
          searchDate = reversedDate.trim() + " " + words[0].trim();
        } else if (words.length === 1) {
          const date = searchValue.trim().split("/");
          if (date.length === 3) {
            searchDate = `${date[2]}-${date[1]}-${date[0]}`;
          } else if (date.length === 2) {
            searchDate = `${date[1]}-${date[0].padStart(2, 0)}`;
          }
        }
      }
      try {
        const res = await axios.get("http://localhost:3001/data-sensor", {
          params: {
            page: page,
            sizePage: sizePage,
            searchBy: searchBy,
            searchValue: isNumber ? searchValue : searchDate,
            sortBy: sortBy.name,
            statusSortBy: sortBy.status,
          },
        });
        console.log(res);
        setDataSensor(res.data.data);
        setNumber(res.data.totalRecord);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, [page, searchValue, searchBy, sortBy,sizePage]);

  return (
    <>
      <Header />
      <div className="" style={{ background: "#D9E5F6" }}>
        <p className="fw-bold fs-2 ms-5  ">Data Sensor</p>
        <div className="container text-center ">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // chặn reload
              setSearchBy(temp1);
              setSearchValue(temp2.trim());
              setPage(1);
            }}
          >
            <div className="row">
              <div id="search" className="col" >
                <input
                  onChange={(e) => {
                    setTemp2(e.target.value);
                  }}
                  type="text"
                  class="form-control border border-dark p-2"
                  placeholder="Search(ID,Temperature, Humidity, Light or DateTime)"
                />
                <small className="text-start d-block">
                  <div className="fw-bold ">Định đạng tìm kiếm theo ngày</div>
                  <div>
                    HH:mm:ss dd/MM/yyyy &nbsp; ví dụ:{" "}
                    <strong>15:53:48 10/09/2025</strong>
                  </div>
                </small>

                {error && (
                  <>
                    <p style={{ color: "red" }}>{error} </p>
                  </>
                )}
              </div>
              <div id="select" className="col-2 ">
                <select
                  onChange={(e) => {
                    setTemp1(e.target.value);
                  }}
                  class="form-select border border-dark p-2"
                  aria-label="Default select example"
                >
                  <option selected value="all">
                    All
                  </option>
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="light">Light</option>
                  <option value="dust">Dust</option>
                  <option value="created_at">Datetime</option>
                </select>

                <select
                  onChange={(e) => {
                   setSizePage(e.target.value);
                  }}
                  class="form-select border border-dark p-2 mt-2"
                  aria-label="Default select example"
                >
                  <option selected value="10">
                    10 bản ghi
                  </option>
                  <option value="15">15 bản ghi</option>
                  <option value="20">20 bản ghi</option>
                </select>
              </div>

              <div className="col-3">
                <button className="btn btn-primary py-2 px-4 " type="submit">
                  Search
                </button>
              </div>
            </div>
          </form>
          <div className="row">
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th scope="col">
                    ID
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("id");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="24"
                        height="24"
                        fill="currentColor"
                        style={{ verticalAlign: "middle" }}
                        aria-label="Sort icon"
                        role="img"
                      >
                        {/* Font Awesome Free v7.0.1 by @fontawesome */}
                        <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                      </svg>
                    </span>
                  </th>
                  <th scope="col">
                    <div className="row align-items-center">
                      <div className="col">
                        Temperature (&deg;C)
                        <span type="button">
                          <svg
                            onClick={() => {
                              handleSortBy("temperature");
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                            width="24"
                            height="24"
                            fill="currentColor"
                            style={{ verticalAlign: "middle" }}
                            aria-label="Sort icon"
                            role="img"
                          >
                            {/* Font Awesome Free v7.0.1 by @fontawesome */}
                            <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </th>
                  <th scope="col">
                    Humidity(%)
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("humidity");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="24"
                        height="24"
                        fill="currentColor"
                        style={{ verticalAlign: "middle" }}
                        aria-label="Sort icon"
                        role="img"
                      >
                        {/* Font Awesome Free v7.0.1 by @fontawesome */}
                        <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                      </svg>
                    </span>
                  </th>
                  <th scope="col">
                    Light(Lux)
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("light");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="24"
                        height="24"
                        fill="currentColor"
                        style={{ verticalAlign: "middle" }}
                        aria-label="Sort icon"
                        role="img"
                      >
                        {/* Font Awesome Free v7.0.1 by @fontawesome */}
                        <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                      </svg>
                    </span>
                  </th>
                    <th scope="col">
                    Dust
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("dust");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="24"
                        height="24"
                        fill="currentColor"
                        style={{ verticalAlign: "middle" }}
                        aria-label="Sort icon"
                        role="img"
                      >
                        {/* Font Awesome Free v7.0.1 by @fontawesome */}
                        <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                      </svg>
                    </span>
                  </th>
              
                  <th scope="col">
                    Time
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("created_at");
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        width="24"
                        height="24"
                        fill="currentColor"
                        style={{ verticalAlign: "middle" }}
                        aria-label="Sort icon"
                        role="img"
                      >
                        {/* Font Awesome Free v7.0.1 by @fontawesome */}
                        <path d="M130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2zM130.4 371.7C125.4 383.7 128.2 397.4 137.3 406.6L297.3 566.6C309.8 579.1 330.1 579.1 342.6 566.6L502.6 406.6C511.8 397.4 514.5 383.7 509.5 371.7C504.5 359.7 492.9 352 480 352L160 352C147.1 352 135.4 359.8 130.4 371.8z" />
                      </svg>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(dataSensor) &&
                  dataSensor.map((item) => (
                    <>
                      <tr key={item.id}>
                        <th scope="row">{item.id}</th>
                        <td>{item.temperature}</td>
                        <td>{item.humidity}</td>
                        <td>{item.light}</td>
                         <td>{item.dust}</td>
                        <td>
                          {new Date(item.created_at).toLocaleString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </td>
                      </tr>
                    </>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="row  d-flex justify-content-center align-items-center">
            <div className="col-4">
              <Stack
                spacing={4}
                sx={{
                  backgroundColor: "black",
                  display: "flex",
                  justifyContent: "center", // căn giữa theo chiều ngang
                  alignItems: "center", // căn giữa theo chiều dọc nếu có chiều cao
                  // ví dụ để có chiều cao cho căn giữa dọc
                }}
              >
                <Pagination
                  count={Math.ceil(number / sizePage)}
                  page={page}
                  variant="outlined"
                  shape="rounded"
                  onChange={(event, value) => {
                    handlePage(value);
                  }}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "white", // chữ trắng
                      // viền trắng
                    },
                    "& .Mui-selected": {
                      backgroundColor: "white",
                      color: "blue",
                    },
                  }}
                />
              </Stack>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DataSensor;
