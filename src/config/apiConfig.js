// src/config/apiConfig.js
let API_BASE_URL = "";

if (process.env.NODE_ENV === "development") {
  // chạy local
  API_BASE_URL = "http://localhost:5000";
} else {
  // khi deploy production
  API_BASE_URL = "/api";
}

export default API_BASE_URL;
