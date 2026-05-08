// Centralized API Configuration

// You can change this base URL to point to your backend server
// e.g., "https://api.yourdomain.com" or "http://localhost:5000"
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  SUPER_LOGIN: "http://192.168.1.16:8000/super-login",
  VERIFY_OTP: "http://192.168.1.16:8000/verify-otp",
  LOGOUT: "/api/auth/logout",

  // Users
  GET_ALL_USERS: "http://192.168.1.16:8000/admin/user/get-users",
  CREATE_USER: "http://192.168.1.16:8000/admin/user/create-user",
  USER_DETAILS: (id) => `/api/v1/users/${id}`,
  UPDATE_USER_STATUS: (id) =>
    `http://192.168.1.16:8000/admin/user/update-status/${id}`,

  // Dashboard & Analytics
  ANALYTICS: "/api/analytics/summary",
  CHART_DATA: "/api/analytics/chart",

  // Dashboard Specific
  DASHBOARD_WALLET: "/api/dashboard/wallet",
  DASHBOARD_TRANSACTIONS: "/api/dashboard/transactions",
  DASHBOARD_STATS: "/api/dashboard/stats",
  DASHBOARD_CHART_STATUS: "/api/dashboard/chart/status",
  DASHBOARD_CHART_CHANNEL: "/api/dashboard/chart/channel",

  // Wallet
  WALLET_BALANCE: "/api/wallet/balance",
  FUND_REQUEST: "/api/wallet/fund-request",
  PAYOUT_REQUEST: "/api/wallet/payout-request",

  // Services
  OFFLINE_SERVICES: "/api/services/offline",
  ONLINE_SERVICES: "/api/services/online",

  // Commission
  COMMISSION_STRUCTURE: "/api/commission/structure",

  // General
  // General
  ENQUIRY: "/api/enquiry",
  UPLOAD_FILE: "/api/upload",
  NEWS_TICKER: "/api/news/ticker",
  NOTIFICATIONS: "/api/notifications",

  // Roles & Packages
  GET_ROLES: "http://192.168.1.16:8000/admin/role/get-roles",
  GET_PACKAGES: "http://192.168.1.16:8000/admin/package/get-packages",
  CREATE_PACKAGE: "http://192.168.1.16:8000/admin/package/create-package",
  UPDATE_PACKAGE_NAME: (id) =>
    `http://192.168.1.16:8000/admin/package/update-package/${id}`,
  UPDATE_PACKAGE_STATUS: (id) =>
    `http://192.168.1.16:8000/admin/package/update-status/${id}`,
  DELETE_PACKAGE: (id) =>
    `http://192.168.1.16:8000/admin/package/delete-package/${id}`,

  // ID Charges
  GET_ID_CHARGES: "http://192.168.1.16:8000/admin/id-charge/get-charges",
  CREATE_ID_CHARGE: "http://192.168.1.16:8000/admin/id-charge/create-charge",
  UPDATE_ID_CHARGE: (id) =>
    `http://192.168.1.16:8000/admin/id-charge/update-charge/${id}`,
  UPDATE_ID_CHARGE_STATUS: (id) =>
    `http://192.168.1.16:8000/admin/id-charge/update-status/${id}`,
  DELETE_ID_CHARGE: (id) =>
    `http://192.168.1.16:8000/admin/id-charge/delete-charge/${id}`,
};

/**
 * Generic fetch wrapper to handle base URL and headers
 * @param {string} endpoint - The endpoint URL (from ENDPOINTS object)
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
    if (response.status === 401) {
      // window.location.href = "/login";
      console.warn("Unauthorized access");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};
