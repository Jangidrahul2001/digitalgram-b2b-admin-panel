
// --- Mock Data ---
// ... (imports)
import { MOCK_WALLET_BALANCE, MOCK_NOTIFICATIONS, MOCK_NEWS_TICKER, MOCK_WALLET_BREAKDOWN, MOCK_USER_PROFILE } from "./mock-data";

// ... (existing functions)

/**
 * Fetches user profile data.
 * @returns {Promise<typeof MOCK_USER_PROFILE>}
 */
export const fetchUserProfile = async () => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_USER_PROFILE);
        }, 300);
    });
};


// --- Service Functions ---

/**
 * Fetches current wallet balances.
 * @returns {Promise<typeof MOCK_WALLET_BALANCE>}
 */
export const fetchWalletBalance = async () => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...MOCK_WALLET_BALANCE, breakdown: MOCK_WALLET_BREAKDOWN });
        }, 500);
    });

    // Real API implementation (Uncomment when ready)
    // return apiClient(ENDPOINTS.WALLET_BALANCE);
};

/**
 * Fetches user notifications.
 * @returns {Promise<typeof MOCK_NOTIFICATIONS>}
 */
export const fetchNotifications = async () => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_NOTIFICATIONS);
        }, 600);
    });

    // Real API implementation (Uncomment when ready)
    // return apiClient(ENDPOINTS.NOTIFICATIONS);
};

/**
 * Fetches news ticker items.
 * @returns {Promise<string[]>}
 */
export const fetchNewsTicker = async () => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_NEWS_TICKER);
        }, 400);
    });

    // Real API implementation (Uncomment when ready)
    // return apiClient(ENDPOINTS.NEWS_TICKER);
};
