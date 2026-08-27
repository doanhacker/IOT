import Header from "../component/Header";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:3001"); // Kết nối tới server

// biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Data Sensor",
    },
  },
  maintainAspectRatio: false, // Cho phép tự co dãn
};

const Home = () => {
  //dữ liệu danh sách các thiết bị
  const [device, setDevice] = useState([
    { id: 1, device: "fan", status: 0 },
    { id: 2, device: "led", status: 0 },
    { id: 3, device: "ac", status: 0 },
  ]);
  //dữ liệu lưu trữ thiết bị nào đã được sử dụng
  const [usedDevice, setUsedDevice] = useState([]);
  //dữ liệu cảm biến
  const [dataSensor, setDataSensor] = useState({});
  const [threshold, setThreshold] = useState(0)
  //dữ liệu cho đồ thị  một
  const [data, setData] = useState({
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Temperature",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "black",
        backgroundColor: "rgba(28, 59, 163, 0.2)",
        tension: 0.1, // smooth curves
      },
      {
        label: "Humidity",
        data: [1, 2, 3, 4, 5, 6, 7],
        fill: false,
        borderColor: "rgba(22, 131, 255, 1)",
        backgroundColor: "rgba(56, 195, 223, 0.2)",
        tension: 0.1, // smooth curves
      },
      {
        label: "Light",
        data: [40, 40, 40, 40, 40, 40, 40],
        fill: false,
        borderColor: "rgba(255, 242, 0, 1)",
        backgroundColor: "rgba(223, 252, 58, 0.2)",
        tension: 0.1, // smooth curves
      },
    ],
  });

  //dữ liệu cho đồ thị2
  const [data2, setData2] = useState({
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Temperature",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "red",
        backgroundColor: "rgba(235, 56, 110, 0.2)",
        tension: 0.1, // smooth curves
      },
      {
        label: "Humidity",
        data: [1, 2, 3, 4, 5, 6, 7],
        fill: false,
        borderColor: "rgba(22, 131, 255, 1)",
        backgroundColor: "rgba(56, 195, 223, 0.2)",
        tension: 0.1, // smooth curves
      },
      {
        label: "Light",
        data: [40, 40, 40, 40, 40, 40, 40],
        fill: false,
        borderColor: "rgba(255, 242, 0, 1)",
        backgroundColor: "rgba(223, 252, 58, 0.2)",
        tension: 0.1, // smooth curves
      },
    ],
  });
  //bật tắt thiết bị
  const toggleDevice = (id) => {
    let deviceUsed = device.find((item) => item.id === id);
    if (deviceUsed) {
      deviceUsed.status = !deviceUsed.status;
    }
    // cập nhập vào thiết bị nào được sử dụng
    setUsedDevice(deviceUsed);
    //đổi trạng thái thiết bị đó trong ds thiết bị là undefined trạng thái chờ
    setDevice((prev) => {
      const newDevice = prev.map((dev) =>
        dev.id === id ? { ...dev, status: undefined } : dev
      );
      return newDevice;
    });
  };
  //call api bật tắt thiết bị
  useEffect(() => {
    const postData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3001/pub-data-device",
          usedDevice
        );
        console.log("Response:", response);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    };
    postData();
  }, [usedDevice]);

  useEffect(() => {
    console.log(device);
  }, [device]);

  //lấy dữ liệu từ backend gửi cho qua socket
  useEffect(() => {
    socket.on("action_history", (data) => {
      console.log(data);
      setDevice((prev) =>
        //cập nhập  lại status của các device
        prev.map(
          (item) =>
            item.device.toLowerCase().trim() === data.device
              ? { ...item, status: data.status === 1 ? true : false } // cập nhật status
              : item // giữ nguyên phần tử khác
        )
      );
    });
    return () => {
      socket.off("action_history");
    };
  }, []);

  //cập nhập status thiết bị từ database mới nhật khi load lại trang
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/latest-action-history"
        );
        console.log("dữ liệu cập dc từ data base");
        console.log(res.data);
        setDevice((prev) =>
          prev.map((d) => {
            const found = res.data.find((item) => item.device === d.device);
            return found
              ? {
                ...d,
                status: String(found.action).toLowerCase().trim() === "on",
              }
              : d;
          })
        );
      } catch (e) {
        console.log(e);
      }
    };
    fetch();
  }, []);
  //kéo dữ liệu thời gian thực về cho  biếu đồ
  useEffect(() => {
    socket.on("thres_hold", (data) => {
      console.log(data);
      setThreshold(data)


    });

    return () => {
      socket.off("threshold");
    };
  }, []);

  //kéo dữ liệu thời gian thực về cho  biếu đồ
  useEffect(() => {
    socket.on("data_sensor", (data) => {
      console.log(data);
      setDataSensor(data);

      const dataRes = data;
      const temperatureData = [];
      const humidityData = [];
      const lightData = [];
      const dustData = [];
      const dateTimeData = [];

      for (let i = 8; i >= 0; i--) {
        temperatureData.push(dataRes[i]?.temperature);
        humidityData.push(dataRes[i]?.humidity);
        lightData.push(dataRes[i]?.light);
        dustData.push(dataRes[i]?.dust);
        dateTimeData.push(
          new Date(dataRes[i]?.created_at).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        );
      }
      setData({
        labels: dateTimeData,
        datasets: [
          {
            label: "Temperature",
            data: temperatureData,
            fill: false,
            borderColor: "black",
            backgroundColor: "rgba(35, 172, 90, 0.2)",
            tension: 0.1, // smooth curves
          },
          {
            label: "Humidity",
            data: humidityData,
            fill: false,
            borderColor: "rgba(22, 131, 255, 1)",
            backgroundColor: "rgba(56, 195, 223, 0.2)",
            tension: 0.1, // smooth curves
          },
          {
            label: "Light",
            data: lightData,
            fill: false,
            borderColor: "rgba(255, 242, 0, 1)",
            backgroundColor: "rgba(223, 252, 58, 0.2)",
            tension: 0.1, // smooth curves
          },
          {
            label: "Dust",
            data: dustData,
            fill: false,
            borderColor: "red",
            backgroundColor: "rgba(235, 56, 110, 0.2)",
            tension: 0.1, // smooth curves
          }
        ],
      });
      // setData2({
      //   labels: dateTimeData,
      //   datasets: [
      //     {
      //       label: "rain",
      //       data: rainData,
      //       fill: false,
      //       borderColor: "red",
      //       backgroundColor: "rgba(235, 56, 110, 0.2)",
      //       tension: 0.1, // smooth curves
      //     },
      //   ],
      // });
    });

    return () => {
      socket.off("data_sensor");
    };
  }, []);

  return (
    <>

      <Header />

      <div className="" style={{ background: "#D9E5F6", height: "90vh " }}>
        {/* <p className="fw-bold ms-5  ">Home</p> */}
        <div
          className="container text-center"
          style={{ overflow: "hidden", scale: "0.85" }}
        >
          <div className="row mb-2">
            <div
              className="col fw-bold d-flex justify-content-center align-items-center  me-2 fs-3"
              style={{ background: "#FFFFFF" }}
            >
              DEVICE
            </div>
            <div
              id="fan-control"
              className="col me-2 d-flex justify-content-center align-items-center"
              style={{ background: "#FFFFFF" }}
            >
              <div className="row d-flex justify-content-center align-items-center">
                <div className="col">
                  <svg
                    width="61"
                    height="100"
                    viewBox="0 0 31 73"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    style={{
                      transformOrigin: "50% 50%",
                      animation: device[0]?.status
                        ? "spin 1s linear infinite"
                        : "",
                    }}
                  >
                    <style>
                      {`
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
  `}
                    </style>
                    <rect width="31" height="73" fill="url(#pattern0_43_860)" />
                    <defs>
                      <pattern
                        id="pattern0_43_860"
                        patternContentUnits="objectBoundingBox"
                        width="1"
                        height="1"
                      >
                        <use
                          xlinkHref="#image0_43_860"
                          transform="matrix(0.0111111 0 0 0.00471842 0 0.287671)"
                        />
                      </pattern>
                      <image
                        id="image0_43_860"
                        width="90"
                        height="90"
                        preserveAspectRatio="none"
                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFNklEQVR4nO2c2W/VRRTHP6aF4ho1MVKNICga/wcftEhijER9MuqbEesWhWqC0ScRF9wwPIiJRjEuVCRaUdlSgxIEQfTFLRIRghtoIehtqULsmKGnSXPz+931N2fOLfNJzktzb+ec7/0tZ86cGUgkEolEIpFIJBKJxHEmA3OBp4HNwC/AEWAI2AN8ACwApo9+PFEv5wNLgT8AV4MdA3qBWbEdbxUmAT3A3zUKXG6DQHfsIKzTCWxrUGBXZotiB2OV84AfCxLZid0bOyhrTAG+KlhkJy/NmbGDs8TSACI7sb7YwVnhMskYQgk9kjKRUV4JKLITe5ATnDPkORpa6I+a8HEGcA+wAtgJ/C4ppL9TDgF7gX5gGXA9cDoGuUFBZAfsbiCXvwXY0cBYfsb6MnAphlimJHSpDp/mAN8VMOZR4BmgAwP0Kwl9rMaayvPySChy7C+BqURmr5LQA1X8OC3wj74LOJeIHFYSelcFH04Gtij48BnQTiRC5s+uhqzjJGC1kg/e5hOJIaUAH8kZv1tRZCcVSV/TUec3pQCvzBj7IslGnLL5TESdnQqB7QfaMsb+NILIY/74PF2VFQqBvZAx7tWRRB6za7WFvjvSY+PzyEIv0Rb6wsAB/ZmRUs2JLLK3T4jA9oABrc4Yb5UBofdF0JmbAwb0WNlYZwP/GBDap7Xq+Fv7WyWhuw2I7KTMGoXZAYo5DnitbJz3DYjcSNm2UJ4NVExqH1edizFBMbeO6ZP4DYGunpLSSo75mscYp0acsTkl8wsCF2Ckx2OVAUFC2ZsY47Ym+u+sWkmKWeaYAXxsQKCibB7GuRzYZECoZuxJWoirgJXAcI3BDUuT+lTpVO2p8l3fi/0q8DiwWKbwA00KfESKZy3JWXIb9lXJjb3I5dyf89mfcurW/m9dUm49UIfAfgL2rhTOJgSTKyyJZS3zd+Z81r94qzEm+qPAWln09Vf8f/L93bI+uRC4GAP4Lp6HgfXSclASZwekR3qdBNOVc5WVk5edeFFrFXpIfrQJgf+V19T5jDsALBfRs5br2+S2z/qufyaX80CFsUpSD+mWx1NL0lNAifIg8J68rPxb/A0p7ld6GfbIVdwpz+daffCfe1sWClqGhU0K7CLbNtmCZ5o7DAjlCrJNVrdqXCJFbjeBrGRxhtdrQBgXyN6RAlh0piv21rlItllKu1HpMSCEGzcNLsmEouj/vSFG59F4PjQgsJN3RMe4nLvWveX1mD8QIBp7DIjsMtbnXg8wxohMqKJgJduYV+bXE4HG+SZWo7mFxdBh4Ewlob3dFEPonw0IvTLDr77AM0h1LKxmd5X51C6bMEOOOU1b6Kcii7wlpyMq9Lh3aQs9N7LQszN8Wq4wrt/brsqkOpd+irT+DH/alPzx25rVeS6CyH/lrNNpPDa8/RpB5+NrdlqbNp3YrTm+LDa477xQFiiK3FvBj/WG9p0HwadUW5WK8lMq+FH0wVh55tPHaPgN5z8EDG4tcEoVHw4qCe0XiqPin9dfBCjmLKmxxqBVG9+IATqkpHi0gIC+Bq4wWOTyJ56ZwTfQvNRg8FuBGxuolGmVbU2ulvsDSa6Tk182ygrIIelaKklOukNmW3c2WUdYpyDyoMR0QvOQgtAvxg7SSuvDSECR/00HGersM2ypRvPQzKyjib0e2z6ROlGL4r6CRf4+9glglllU4OLCObGDsc7tTUxiDsudEe14tVZsjH+rjun5fpnZRj+ZsVWZJvuz18ikaVC2WuyTqqDPKK5JV3AikUgkEolEIpFIMMr/10rhY+fAlawAAAAASUVORK5CYII="
                      />
                    </defs>
                  </svg>
                </div>
                <div className="col" style={{ scale: "1.5" }}>
                  {device[0]?.status === undefined ? (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="fan"
                        checked={
                          device[0]?.status === true
                            ? true
                            : device[0]?.status === false
                              ? false
                              : undefined
                        }
                        onChange={() => {
                          toggleDevice(1);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              id="led-control"
              className="col me-2 d-flex justify-content-center align-items-center"
              style={{ background: "#FFFFFF" }}
            >
              <div className="row d-flex justify-content-center align-items-center">
                <div className="col text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 16 16"
                    fill={device[1]?.status ? "#FFD700" : "#6c757d"} // vàng khi bật, xám khi tắt
                    style={{
                      transition: "fill 0.3s ease",
                      filter: device[1]?.status
                        ? "drop-shadow(0 0 8px #FFD700)"
                        : "none",
                      cursor: "pointer",
                      scale: "0.5",
                    }}
                  >
                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5" />
                  </svg>
                </div>
                <div className="col" style={{ scale: "1.5" }}>
                  {device[1]?.status === undefined ? (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="led"
                        checked={
                          device[1]?.status === true
                            ? true
                            : device[1]?.status === false
                              ? false
                              : undefined
                        }
                        onChange={() => {
                          toggleDevice(2);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              id="ac-control"
              className="col me-2 d-flex justify-content-center align-items-center"
              style={{ background: "#FFFFFF" }}
            >
              <div className="row d-flex justify-content-center align-items-center">
                <div className="col">
                  <svg
                    width="100"
                    height="120"
                    viewBox="0 0 100 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Thân máy điều hòa */}
                    <rect
                      x="10"
                      y="20"
                      width="80"
                      height="50"
                      rx="12"
                      ry="12"
                      fill="#d0e8ff"
                      stroke="#3a8ee6"
                      strokeWidth="3"
                      filter="url(#shadow)"
                    />
                    {/* Lưới tản nhiệt */}
                    {[...Array(7)].map((_, i) => (
                      <line
                        key={i}
                        x1={20 + i * 10}
                        y1="40"
                        x2={20 + i * 10}
                        y2="65"
                        stroke="#3a8ee6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    ))}
                    {/* Núm điều khiển */}
                    <circle cx="80" cy="50" r="7" fill="#3a8ee6" />
                    <circle cx="80" cy="50" r="4" fill="#a9d1ff" />

                    {/* Khí lạnh thổi ra khi bật */}
                    {device[2]?.status && (
                      <>
                        <path
                          className="wind1"
                          d="M30 75 C40 90, 60 90, 70 75"
                          stroke="#5EDB3F"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          className="wind2"
                          d="M35 85 C45 100, 55 100, 65 85"
                          stroke="#5EDB3F"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          className="wind3"
                          d="M40 95 C50 110, 50 110, 60 95"
                          stroke="#5EDB3F"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    <defs>
                      <filter
                        id="shadow"
                        x="-10"
                        y="-10"
                        width="120"
                        height="120"
                      >
                        <feDropShadow
                          dx="0"
                          dy="4"
                          stdDeviation="3"
                          floodColor="#3a8ee6"
                          floodOpacity="0.3"
                        />
                      </filter>
                    </defs>

                    <style>{`
      .wind1, .wind2, .wind3 {
        stroke-dasharray: 80;
        stroke-dashoffset: 80;
        animation: dash 2s ease-in-out infinite;
      }
      .wind2 {
        animation-delay: 0.4s;
      }
      .wind3 {
        animation-delay: 0.8s;
      }
      @keyframes dash {
        0%, 100% {
          stroke-dashoffset: 80;
          opacity: 0;
        }
        50% {
          stroke-dashoffset: 0;
          opacity: 1;
        }
      }
    `}</style>
                  </svg>
                </div>
                <div className="col" style={{ scale: "1.5" }}>
                  {device[2]?.status === undefined ? (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ac"
                        checked={
                          device[2]?.status === true
                            ? true
                            : device[2]?.status === false
                              ? false
                              : undefined
                        }
                        onChange={() => {
                          toggleDevice(3);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              id="ac-control"
              className="col me-2 d-flex justify-content-center align-items-center"
              style={{ background: "#FFFFFF" }}
            >

            </div>

          </div>
          <div className="row mb-2">
            <div
              className="col fw-bold d-flex justify-content-center align-items-center  me-2   fs-3"
              style={{ background: "#FFFFFF" }}
            >
              DATA
            </div>
            <div id="temperature"
              className="col me-2 d-flex align-items-center justify-content-center "
              style={{
                background: "#FFFFFF",
                width: "auto",
                height: "auto",
                minHeight: "150px",
              }}
            >
              <div className="row  ">
                <div className="col ">
                  <div className="row fw-bold">
                    <small>Temperature</small>
                  </div>
                  <div className="row fw-bold fs-2 text-center">
                    <div className="col">
                      {dataSensor[0]?.temperature}&deg;C
                    </div>
                  </div>
                </div>
                <div
                  className="col d-flex align-items-center justify-content-center"
                  style={{ scale: "2" }}
                >
                  {/* <svg
                                width="25"
                                height="73"
                                viewBox="0 0 24 73"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                                <rect width="24" height="73" fill="url(#pattern0_81_30)" />
                                <defs>
                                    <pattern
                                        id="pattern0_81_30"
                                        patternContentUnits="objectBoundingBox"
                                        width="1"
                                        height="1"
                                    >
                                        <use
                                            xlinkHref="#image0_81_30"
                                            transform="matrix(0.0111111 0 0 0.00365297 0 0.335616)"
                                        />
                                    </pattern>
                                    <image
                                        id="image0_81_30"
                                        width="90"
                                        height="90"
                                        preserveAspectRatio="none"
                                        xlinkHref="data:image/png;base64,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"
                                    />
                                </defs>
                            </svg> */}
                  <>
                    {dataSensor[0]?.temperature <= 20 ? (
                      <img
                        height="40"
                        width="40"
                        src="/gif/cold.gif"
                        alt="cool"
                      />
                    ) : dataSensor[0]?.temperature <= 30 ? (
                      <img
                        height="50"
                        width="50"
                        src="/gif/beach-vacation.gif"
                        alt="warm"
                      />
                    ) : (
                      <img
                        height="40"
                        width="40"
                        src="/gif/high-heat.gif"
                        alt="hot"
                      />
                    )}
                  </>
                </div>
              </div>
            </div>
            <div id="humidity"
              className="col me-2 d-flex align-items-center justify-content-center "
              style={{
                background: "#FFFFFF",
                width: "auto",
                height: "auto",
                minHeight: "150px",
              }}
            >
              <div className="row  ">
                <div className="col ">
                  <div className="row fw-bold">
                    <small>Humidity</small>
                  </div>
                  <div className="row fw-bold fs-2 text-center">
                    <div className="col">{dataSensor[0]?.humidity}%</div>
                  </div>
                </div>
                <div
                  className="col d-flex align-items-center"
                  style={{ scale: "2" }}
                >
                  {/* <svg
                                    width="25"
                                    height="73"
                                    viewBox="0 0 25 73"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="25" height="73" fill="url(#pattern0_43_795)" />
                                    <defs>
                                        <pattern
                                            id="pattern0_43_795"
                                            patternContentUnits="objectBoundingBox"
                                            width="1"
                                            height="1"
                                        >
                                            <use
                                                xlinkHref="#image0_43_795"
                                                transform="matrix(0.0111111 0 0 0.00380518 0 0.328767)"
                                            />
                                        </pattern>
                                        <image
                                            id="image0_43_795"
                                            width="90"
                                            height="90"
                                            preserveAspectRatio="none"
                                            xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFNElEQVR4nO2cz4scRRTHe6Px11nFo3oRFRV/I67+BUbwsIqgIhLjD1iy82r2oBAn4CEqgoLZ6FkPghCieBEMBA9GkigIxtWDaMxBg66JUclMv/dqn9RkNm7cqe6Z3u6p1731hXeZ6a6u+vDmTb1XXZUkUVFRUVFRUVFRUVFRUVFRUVHr1qzIxYbsm4B8sm9k3+iIXFT1czsilwHZBUD+05CVPAPkf4D4oEF+fpvI5qRuMmT3rBkU2YUJPPedUQAPNz7SFrkqqYvmUe4zyMtrBoK8DCjTVT23I7LJIJ8pDto5Ax+uhWfP9kMGL2Z4zWJVIaQM0INw8lyiXYbsztzBIL+kM3Sc8+qDiWZt78n1Brk3AujefE+uq6IPLZFLgexbBvnUOjz6r0SzDNpPRh4Q2v2JAvn6l2gVMM+M6zltoodC97tWoDtu7or889g/U+Sf3E89ZN9rBRrIvuyPd/Zdg/a9DOA7Q/a9NqDnunItIHc9Hvv7rMgVzgB5yXPNme1duTpU/2sD2qD9wNfZFvMTK9dByk9meP37wfpfB9AG5e6hGSD14X2aiEydu1hkys00PF69bFDu1FQDSTQJiD/zzEPJzan/f737zH3nuedAlX0dN5FJtMgQbcno6B7ffUD2bW8IIXpAS2qeaNCMyAVA/K0nDJw2Ilf67nXf9a8ZOkA+6touu7+1BQ0pb/V2EvmF3PuRX/R6dcpbq+hz7UJHvzqHfNwD+fgoCYi7JqsN94zQNZAktFwJ0de5FvNjo7ZjmB/P+FU8W+0oVvVDI2hXR/al2kD8lYuFY7S1yd3jmYEcm8Syl1rQLeRn/D832jJue0D0oK+9dspPJxsRtFveAeIfPbOFr89LTkaVyFRor1YH2nmYd6bAPFO0XcP8cMYM5KlyR6EcdI43L44Tm4fOcT1rjED8Q0fkwmSjgAbmR0eZEpkKDJgf2TC1DrcEHwq0If5iQyQs7j2McJBt39oo9zQ+Bc+qN08sfOD66tXqQbsCECCnoUEb5B6IXN7Y0AHI7eCQacWrGRpb68h+tWvSxt8VSopyxxgYdH+ZKjhce57NodzRONBA9vXQYM1ae7VZoF0NAvmYArCy2lx2Wnb4CAq6hXJXaKjGZyi3NwY0IO/QC5pzl8rqBPqAXtB2fyNqHYP1vPx3nAMZIHc7IpfUPmHp7z9RANRkWBvl3tqn4G4bWGiQJs/GXLzVCXrItjWFtrv2ocP3Pp0mgwLv6amrdQDx96FBmlzjxbLGGwy0QT4RHqTNNuRfmgBa7dTOrJri1R60ikI/5Xp0rwke/UcNQP9Wf9Cqiv3WY3y0AR5t94UHaTMN0O6tfa0DkDuhQZoKNu2rS1gMyv36PVqma5+Cuzc4Nf8hAvLSuAeXqAStvd4BBY8LUhc6nFqp3OLbqBnUkJfbqdxcaEzaah0rMmg/1gfa7it9nKFBz6Vyo0FGNSEDmVqp3NQ40E5A9rXQgM1/tquKMaoAPTjx68vwkPlIVftZVIBeOY8jZOkUkH+t8jwPNaCd5lO5zb9/u0JDPg2p3Frl2FSBXgX7xCQ9GQpAHremofI4NtOVa1y8rBwy8eGi4aKMAwYN8edJaLk/SCD7SiVTP+y3uavoH19ZR2ZOci/6iPNs+1EpGSS6w2Hth6YnN6ynT+WA5kMqD4F1KTGQXShSiBqcHLa7aFpdwbHGh9Qfa7xNZLN7nczVs11hHoi/cSDdGuTAls5+ZveevUamq/Ccsc8mRf7bxWR3oIBKT46KioqKioqKioqKioqKiopKJq9/ATXFuWVARKWOAAAAAElFTkSuQmCC"
                                        />
                                    </defs>
                                </svg> */}
                  <>
                    {dataSensor[0]?.humidity <= 30 ? (
                      <img
                        width="40"
                        height="40"
                        src="/gif/low-humidity.gif"
                        alt="dim humidity"
                        className="rounded-circle"
                      />
                    ) : dataSensor[0]?.humidity <= 60 ? (
                      <img
                        width="50"
                        height="40"
                        src="/gif/medium-humidity.gif"
                        alt="normal humidity"
                        className="rounded-circle"
                      />
                    ) : (
                      <img
                        width="50"
                        height="50"
                        src="/gif/hight-humidity.gif"
                        alt="bright humidity"
                        className="rounded-circle"
                      />
                    )}
                  </>
                </div>
              </div>
            </div>
            <div id="light"
              className="col me-2 d-flex align-items-center justify-content-center "
              style={{
                background: "#FFFFFF",
                width: "auto",
                height: "auto",
                minHeight: "150px",
              }}
            >
              <div className="row  ">
                <div className="col ">
                  <div className="row fw-bold">
                    <small>Light(lux)</small>
                  </div>
                  <div className="row fw-bold text-center">
                    <div className="col fs-2">{dataSensor[0]?.light}L</div>
                  </div>
                </div>
                <div
                  className="col d-flex align-items-center"
                  style={{ scale: "2" }}
                >
                  {/* <svg
                                    width="31"
                                    height="73"
                                    viewBox="0 0 31 73"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="31" height="73" fill="url(#pattern0_43_835)" />
                                    <defs>
                                        <pattern
                                            id="pattern0_43_835"
                                            patternContentUnits="objectBoundingBox"
                                            width="1"
                                            height="1"
                                        >
                                            <use
                                                xlinkHref="#image0_43_835"
                                                transform="matrix(0.0111111 0 0 0.00471842 0 0.287671)"
                                            />
                                        </pattern>
                                        <image
                                            id="image0_43_835"
                                            width="90"
                                            height="90"
                                            preserveAspectRatio="none"
                                            xlinkHref="data:image/png;base64,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"
                                        />
                                    </defs>
                                </svg> */}

                  <>
                    {dataSensor[0]?.light <= 5 ? (
                      <img
                        width="40"
                        height="40"
                        src="/gif/dark.gif"
                        alt="dim light"
                        className="rounded-circle"
                      />
                    ) : dataSensor[0]?.light <= 100 ? (
                      <img
                        width="50"
                        height="50"
                        src="/gif/look.gif"
                        alt="normal light"
                        className="rounded-circle"
                      />
                    ) : (
                      <img
                        width="50"
                        height="50"
                        src="/gif/too-bright.gif"
                        alt="bright light"
                        className="rounded-circle"
                      />
                    )}
                  </>
                </div>
              </div>
            </div>
            <div id="light"
              className="col me-2 d-flex align-items-center justify-content-center "
              style={{
                background: "#FFFFFF",
                width: "auto",
                height: "auto",
                minHeight: "150px",
              }}
            >
              <div className="row  ">
                <div className="col ">
                  <div className="row fw-bold">
                    <small>Dust</small>
                  </div>
                  <div className="row fw-bold text-center">
                    <div className="col fs-2">
                      <div
                        style={{
                          color: dataSensor[0]?.dust >= 50 ? "red" : "black",
                          fontWeight: dataSensor[0]?.dust >= 50 ? "bold" : "normal",
                          animation: dataSensor[0]?.dust >= 50 ? "blink 1s infinite" : "none",
                          "@keyframes blink": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      >
                        {dataSensor[0]?.dust}
                      </div>


                      <div> {threshold}</div>
                    </div>
                  </div>
                </div>
                <div
                  className="col d-flex align-items-center"
                  style={{ scale: "2" }}
                >


                </div>
              </div>
            </div>
          </div>

          <div className="row" style={{ width: "101.3%", height: "43vh" }}>

            <Line
              options={options}
              data={data}
              style={{ backgroundColor: "#FFFFFF" }}
            />


            {/* <div className="col-6">
              <Line
                options={options}
                data={data2}
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
