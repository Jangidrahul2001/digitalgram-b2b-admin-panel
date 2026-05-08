import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.headers["Content-Type"] === "multipart/form-data") {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;

    if (error.code === "ERR_NETWORK") {
      return Promise.reject({
        success: false,
        status: 0,
        message:
          message || "Server not reachable — Please check your connection",
      });
    }

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("temp_auth_data");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject({
        success: false,
        status: 401,
        message: message || "Session expired — Please login again",
      });
    }

    if (status === 403) {
      return Promise.reject({
        success: false,
        status: 403,
        message: message || "Access Denied — You don't have permission",
      });
    }

    if (status === 500) {
      return Promise.reject({
        success: false,
        status: 500,
        message:
          message || "Server error — Something went wrong on the backend",
        errors: errors || [],
      });
    }

    return Promise.reject({
      success: false,
      status,
      message: message || "Unexpected error",
      errors: errors || [],
    });
  },
);

export default api;
