
import { apiClient, ENDPOINTS } from "../lib/api-config";
import { Activity, Wallet, Users, Send, FileText } from "@/components/icons";

// --- Mock Data ---
import { 
  MOCK_DASHBOARD_WALLET_BALANCES as MOCK_WALLET_BALANCES, 
  MOCK_TRANSACTION_FEED, 
  MOCK_BUSINESS_VOLUME, 
  MOCK_SUCCESS_FAILED_DATA, 
  MOCK_CHANNEL_DATA,
  MOCK_SELECT_OPTIONS,
  MOCK_SERVICES,
  MOCK_USERS,
  MOCK_REPORTS_DATA,
  MOCK_AEPS_TRANSACTIONS
} from "./mock-data";

// --- Service Functions ---

/**
 * Fetches wallet balances for dashboard.
 * @returns {Promise<typeof MOCK_WALLET_BALANCES>}
 */
export const fetchDashboardWalletBalances = async () => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_WALLET_BALANCES);
        }, 500);
    });
    // return apiClient(ENDPOINTS.DASHBOARD_WALLET);
};

/**
 * Fetches latest transactions.
 * @returns {Promise<typeof MOCK_TRANSACTION_FEED>}
 */
export const fetchLatestTransactions = async (filters = {}) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data = [...MOCK_TRANSACTION_FEED];

            // 1. Filter by "Select" (was Status, now Service Category/Type based on screenshot)
            if (filters.status && filters.status !== 'all') { // 'status' matches the first dropdown state 'selectedOption'
                const typeMap = {
                    'aeps': ['AEPS'],
                    'bbps': ['Bill Payment'],
                    'bus': ['Bus'],
                    'cms': ['CMS'],
                    'credit_card': ['Credit Card'],
                    'crm': ['CRM']
                };
                const allowed = typeMap[filters.status] || [];
                if (allowed.length > 0) {
                     data = data.filter(txn => allowed.some(s => txn.service.includes(s)));
                }
            }

            // 2. Filter by "Select Service" (The second dropdown)
            if (filters.service && filters.service !== 'all_services') {
                 const serviceMap = {
                    'dmt': ['Money Transfer', 'DMT'],
                    'merchant': ['Merchant'],
                    'utility': ['Bill Payment', 'Recharge'],
                    'travel': ['Bus', 'Flight'],
                    'insurance': ['Insurance']
                };
                const allowed = serviceMap[filters.service] || [];
                 if (allowed.length > 0) {
                     data = data.filter(txn => allowed.some(s => txn.service.includes(s)));
                }
            }

            // 3. Filter by User
            if (filters.user && filters.user !== 'all_users') {
                 // Match by ID logic or just simulate
                 if (filters.user === 'ret1045') data = data.slice(0, 3);
                 else if (filters.user === 'ret1044') data = data.slice(2, 5);
                 else data = data.slice(0, 1);
            }

            resolve(data);
        }, 700);
    });
    // return apiClient(ENDPOINTS.DASHBOARD_TRANSACTIONS, { params: filters });
};

/**
 * Fetches business volume stats.
 * @returns {Promise<typeof MOCK_BUSINESS_VOLUME>}
 */
export const fetchBusinessVolume = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_BUSINESS_VOLUME);
        }, 400);
    });
    // return apiClient(ENDPOINTS.DASHBOARD_STATS);
};

/**
 * Fetches transaction status chart data.
 * @returns {Promise<typeof MOCK_SUCCESS_FAILED_DATA>}
 */
export const fetchTransactionStatusData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_SUCCESS_FAILED_DATA);
        }, 600);
    });
    // return apiClient(ENDPOINTS.DASHBOARD_CHART_STATUS);
};

/**
 * Fetches dropdown options (generic).
 */
export const fetchDropdownOptions = async () => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_SELECT_OPTIONS), 300));
};

/**
 * Fetches available services.
 */
export const fetchServices = async () => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_SERVICES), 300));
};

/**
 * Fetches user list.
 */
export const fetchUsers = async () => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS), 300));
};

/**
 * Fetches channel wise stats chart data.
 * @returns {Promise<typeof MOCK_CHANNEL_DATA>}
 */
export const fetchChannelStatsData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_CHANNEL_DATA);
        }, 600);
    });
    // return apiClient(ENDPOINTS.DASHBOARD_CHART_CHANNEL);
};

/**
 * Fetches reports preview data.
 * @returns {Promise<typeof MOCK_REPORTS_DATA>}
 */
export const fetchReportsData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_REPORTS_DATA);
        }, 500);
    });
};

export const fetchFundRequests = async (period = 'today') => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_REPORTS_DATA.fundRequests[period] || MOCK_REPORTS_DATA.fundRequests.today);
        }, 600);
    });
};

export const fetchAepsToWalletTransactions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_AEPS_TRANSACTIONS);
        }, 1000);
    });
};
