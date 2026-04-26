import axios from "axios";

// export const BASE_URL = "http://localhost:5093/api";
export const BASE_URL = "https://portal-api.idealsmartsolutions.com/api";

const PORTAL_ALLOWED_ROLES = new Set(["student", "parent", "staff", "aspirant"]);

const isAllowedPortalRole = (role?: string) => {
  const normalizedRole = role?.trim().toLowerCase();
  return normalizedRole ? PORTAL_ALLOWED_ROLES.has(normalizedRole) : false;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    const schoolId = sessionStorage.getItem("SchoolId");
    const schoolDomain = sessionStorage.getItem("SchoolDomain");
    const authStorage = sessionStorage.getItem("auth-storage");

    if (token && authStorage) {
      try {
        const parsedAuthStorage = JSON.parse(authStorage);
        const role = parsedAuthStorage?.state?.user?.role;

        if (role && !isAllowedPortalRole(role)) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("SchoolId");
          sessionStorage.removeItem("auth-storage");
          return Promise.reject(new Error("Access denied for this dashboard role."));
        }
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("SchoolId");
        sessionStorage.removeItem("auth-storage");
        return Promise.reject(new Error("Invalid session data. Please login again."));
      }
    }

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
        config.headers["X-School-Domain"] = "famzadschools.com"; 
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("SchoolId")
      sessionStorage.removeItem("auth-storage")
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
);

export default axiosInstance;
