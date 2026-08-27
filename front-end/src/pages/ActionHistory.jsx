import Header from "../component/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";

const ActionHistory = () => {
  const [dataActionHistory, setDataActionHistory] = useState([]);
  //lưu trữ tổng số bản ghi để phân trang
  const [number, setNumber] = useState(1);

  //dùng để lưu trữ dữ liệu cho dataSearch
  const [dataFilter, setDataFilter] = useState({
    device: "all",
    action: "all",
    datetime: "",
  });

  const [dataSearch, setDataSearch] = useState({
    device: "all",
    action: "all",
    datetime: "",
  });
  //lưu trữ bản ghi của 1 trang
  const [sizePage, setSizePage] = useState(10);
  //lưu trữ trang hiện tại
  const [page, setPage] = useState(1);
  //lưu trữ sắp xếp theo trường dữ liệu nào
  const [sortBy, setSortBy] = useState({
    name: "id",
    status: true,
  });
  const handleDataFilter = (e) => {
    const { name, value } = e.target;
    setDataFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePage = (page) => {
    setPage(page);
    setSortBy({
      name: "id",
      status: true,
    });
  };

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

  useEffect(() => {
    const fetch = async () => {
      //hàm xử lý về đúng định dạng ngày với database
      let searchDate = "";
      const words = dataSearch.datetime.trim().split(" ");
      if (words.length === 2) {
        const [day, month, year] = words[1].split("/");
        const reversedDate = `${year}-${month}-${day}`;
        searchDate = reversedDate.trim() + " " + words[0].trim();
      } else if (words.length === 1) {
        const date = dataSearch.datetime.trim().split("/");
        if (date.length === 3) {
          searchDate = `${date[2]}-${date[1]}-${date[0]}`;
        } else if (date.length === 2) {
          searchDate = `${date[1]}-${date[0].padStart(2, 0)}`;
        }
      }

      try {
        const res = await axios.get("http://localhost:3001/action-history", {
          params: {
            page: page,
            sizePage: sizePage,
            sortBy: sortBy.name,
            device: dataSearch.device,
            action: dataSearch.action,
            datetime: searchDate,
            statusSortBy: sortBy.status,
          },
        });
        // console.log(res);
        setDataActionHistory(res.data.data);
        setNumber(res.data.totalRecord);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, [page, sortBy, dataSearch,sizePage]);
  return (
    <>
      <Header />
      <div className="" style={{ background: "#D9E5F6" }}>
        <p className="fw-bold fs-2 ms-5  ">Action History</p>
        <div className="container">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // chặn reload
              setPage(1);
              setDataSearch(dataFilter);
            }}
          >
            <div className="row">
              {/* lọc thiết bị */}
              <div className="col-2 d-flex align-items-center">
                <label
                  htmlFor="deviceSelect"
                  className="form-label fw-bold me-3"
                >
                  Device
                </label>
                <select
                  name="device"
                  id="deviceSelect"
                  className="form-select border border-dark p-2"
                  onChange={(e) => {
                    handleDataFilter(e);
                  }}
                >
                  <option selected value="all">
                    All
                  </option>
                  <option value="led">Led</option>
                  <option value="fan">Fan</option>
                  <option value="ac">AC(Air Conditioner)</option>
                  {/* <option value="rd">RD</option> */}
                </select>
              </div>
              {/* lọc theo hành động */}
              <div className="col-2 d-flex align-items-center">
                <label
                  htmlFor="deviceSelect"
                  className="form-label fw-bold me-3"
                >
                  Action
                </label>
                <select
                  onChange={(e) => {
                    handleDataFilter(e);
                  }}
                  id="deviceSelect"
                  name="action"
                  className="form-select border border-dark p-2"
                >
                  <option selected value="all">
                    All
                  </option>
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div className="col-5">
                <input
                  name="datetime"
                  onChange={(e) => {
                    handleDataFilter(e);
                  }}
                  type="text"
                  className="form-control border border-dark p-2"
                  placeholder="Search Datetime"
                />
              </div>

              <div className="col-3">
                <button className="btn btn-primary py-2 px-4" type="submit">
                  Search
                </button>

              </div>
            </div>
          </form>
          <div className="row">
            <div className="col mt-2">
              <small className="text-start d-block">
                <div className="fw-bold ">Định đạng tìm kiếm theo ngày</div>
                <div>
                  HH:mm:ss dd/MM/yyyy &nbsp; ví dụ:{" "}
                  <strong>15:53:48 10/09/2025</strong>
                </div>
              </small>
            </div>
            <div className="col-2 mt-2">
              <select
                name="device"
                id="selectPage"
                className="form-select border border-dark p-2"
                onChange={(e) => {
                  setSizePage(e.target.value);
                }}
              >
                <option selected value="10">
                  10 bản ghi
                </option>
                <option value="15">15 bản ghi</option>
                <option value="20">20 bản ghi</option>
              </select>
            </div>
            <div className="col-3"></div>
          </div>


          <div className="row text-center mt-3">
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
                    Device
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("device");
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
                    Action
                    <span type="button">
                      <svg
                        onClick={() => {
                          handleSortBy("action");
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
                {dataActionHistory &&
                  dataActionHistory.map((item) => {
                    return (
                      <>
                        <tr key={item.id}>
                          <th scope="row">{item.id}</th>
                          <td>{item.device}</td>
                          <td>{item.action}</td>
                          <td>
                            {" "}
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
                    );
                  })}
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
                    console.log(value);
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
export default ActionHistory;
