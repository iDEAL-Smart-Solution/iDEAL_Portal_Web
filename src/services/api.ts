import axios from "axios";

export const BASE_URL = "http://localhost:5093/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    const schoolId = sessionStorage.getItem("SchoolId");
    const schoolDomain = sessionStorage.getItem("SchoolDomain");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (schoolId) {
      config.headers["SchoolID"] = schoolId;
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      if (schoolDomain) {
        config.headers["X-School-Domain"] = schoolDomain;
      } else {
        config.headers["X-School-Domain"] = "famzadschools.com"; // Change this to match your school's domain in the database
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
