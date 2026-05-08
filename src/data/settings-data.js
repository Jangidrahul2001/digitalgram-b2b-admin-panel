
// Mock data for Settings Page

// User Login Logs Data
export const userLoginLogs = [
    {
        id: 1,
        userName: "Monika Choudhary",
        ipAddress: "2401:4900:889a:1200:d58f:9af1:10e5:a787",
        device: "WEB",
        loggedAt: "31 Jan 2026 02:27 PM",
        lat: 26.9124,
        lng: 75.7873
    },
    {
        id: 2,
        userName: "Rahul Jangid",
        ipAddress: "192.168.1.1",
        device: "ANDROID",
        loggedAt: "01 Feb 2026 10:15 AM",
        lat: 28.6139,
        lng: 77.2090
    },
    {
        id: 3,
        userName: "Amit Sharma",
        ipAddress: "10.0.0.5",
        device: "WEB",
        loggedAt: "02 Feb 2026 09:30 AM",
        lat: 19.0760,
        lng: 72.8777
    }
];

// Notification Data
export const notificationsData = [
    {
        id: 1,
        heading: "Innovation Accross industries",
        status: "Active",
        createdAt: "2024-03-20"
    },
    {
        id: 2,
        heading: "System Maintenance Alert",
        status: "Active",
        createdAt: "2024-03-21"
    },
    {
        id: 3,
        heading: "New Feature: UPI AutoPay",
        status: "Inactive",
        createdAt: "2024-03-18"
    }
];

// Banner Data
export const bannerData = [
    {
        id: 1,
        image: "https://via.placeholder.com/400x200/4f46e5/ffffff?text=Mobile+Recharge", // Placeholder
        title: "Mobile Recharge",
        status: "Active"
    },
    {
        id: 2,
        image: "https://via.placeholder.com/400x200/10b981/ffffff?text=BBPS+Bill+Pay", // Placeholder
        title: "BBPS",
        status: "Active"
    },
    {
        id: 3,
        image: "https://via.placeholder.com/400x200/ef4444/ffffff?text=DTH+Recharge", // Placeholder
        title: "DTH",
        status: "Active"
    },
    {
        id: 4,
        image: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=AEPS+Withdrawal", // Placeholder
        title: "AEPS",
        status: "Active"
    }
];

// --- API Simulation Functions ---

export const fetchUserLoginLogs = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(userLoginLogs);
        }, 800);
    });
};

export const fetchNotifications = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(notificationsData);
        }, 600);
    });
};

export const fetchBanners = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(bannerData);
        }, 500);
    });
};
