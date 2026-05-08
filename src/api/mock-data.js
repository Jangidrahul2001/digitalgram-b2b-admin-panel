
// Mock Data for the Application

// 1. Header & Wallet Data
export const MOCK_WALLET_BALANCE = {
  main: "6539745002.535",
  aeps: "210960655.54",
  fee: "6453036256"
};

export const MOCK_USER_PROFILE = {
    name: "Admin User",
    email: "admin@example.com",
    avatarUrl: "https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff", // Dynamic image URL
    role: "Super Admin"
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New User Logged In', time: 'Just now', color: 'bg-blue-500', isRead: false },
  { id: 2, title: 'Project "Alpha" Approved', time: '2 hours ago', color: 'bg-green-500', isRead: false },
  { id: 3, title: 'Server Load High', time: '5 hours ago', color: 'bg-orange-500', isRead: false },
  { id: 4, title: 'Database Backup Completed', time: '6 hours ago', color: 'bg-purple-500', isRead: false },
  { id: 5, title: 'New Comment on Post', time: '8 hours ago', color: 'bg-pink-500', isRead: false },
  { id: 6, title: 'System Update Scheduled', time: '1 day ago', color: 'bg-indigo-500', isRead: false },
  { id: 7, title: 'Payment Received', time: '1 day ago', color: 'bg-emerald-500', isRead: false },
  { id: 8, title: 'Subscription Expiring Soon', time: '2 days ago', color: 'bg-red-500', isRead: false },
];

export const MOCK_NEWS_TICKER = [
  "Welcome Administrator!",
  "System performance is optimal.",
  "Check your notifications for new updates.",
  "Have a productive day!"
];

// Wallet Breakdown Dropdown
export const MOCK_WALLET_BREAKDOWN = [
  { label: "DMT Wallet", amount: "4,00,000", iconName: "Send", color: "bg-blue-100 text-blue-600" },
  { label: "Recharge Wallet", amount: "2,10,000", iconName: "Smartphone", color: "bg-green-100 text-green-600" },
  { label: "BBPS Wallet", amount: "1,50,000", iconName: "FileText", color: "bg-orange-100 text-orange-600" },
  { label: "AEPS Wallet", amount: "3,20,000", iconName: "Activity", color: "bg-purple-100 text-purple-600" },
];

// 2. Dashboard Data
export const MOCK_DASHBOARD_WALLET_BALANCES = [
  { label: "Main Wallet", amount: "₹ 45,231.89", color: "bg-blue-500", icon: "Wallet", trend: "+2.5%" },
  { label: "AEPS Wallet", amount: "₹ 12,050.50", color: "bg-orange-500", icon: "Activity", trend: "+1.2%" },
  { label: "Service Balance", amount: "₹ 8,100.00", color: "bg-green-500", icon: "Users", trend: "+0.8%" },
];

export const MOCK_TRANSACTION_FEED = [
  { id: "TXN001", service: "Money Transfer", amount: "₹ 5,000", status: "Success", date: "Today, 10:42 AM", user: "Rahul J." },
  { id: "TXN002", service: "AEPS Withdrawal", amount: "₹ 2,500", status: "Success", date: "Today, 10:30 AM", user: "Vikram S." },
  { id: "TXN003", service: "Bill Payment", amount: "₹ 850", status: "Failed", date: "Today, 10:15 AM", user: "Anjali M." },
  { id: "TXN004", service: "Recharge", amount: "₹ 199", status: "Success", date: "Today, 09:55 AM", user: "Priya K." },
  { id: "TXN005", service: "DMT", amount: "₹ 10,000", status: "Pending", date: "Today, 09:40 AM", user: "Amit R." },
];

export const MOCK_BUSINESS_VOLUME = [
  { label: "Today's Volume", value: "₹ 1,24,500", trend: "+15%", color: "text-green-600" },
  { label: "This Month", value: "₹ 45,32,100", trend: "+8%", color: "text-blue-600" },
];

export const MOCK_SUCCESS_FAILED_DATA = [
  { name: 'Success', value: 75, color: '#22c55e' }, // green-500
  { name: 'Failed', value: 15, color: '#ef4444' }, // red-500
  { name: 'Pending', value: 10, color: '#f97316' }, // orange-500
];

export const MOCK_CHANNEL_DATA = [
  { name: 'API', value: 450, color: '#6366f1' }, // indigo-500
  { name: 'Mobile', value: 320, color: '#3b82f6' }, // blue-500
  { name: 'Web', value: 210, color: '#ec4899' }, // pink-500
];

export const MOCK_REPORTS_DATA = {
  daily: [
    { uv: 200 }, { uv: 400 }, { uv: 300 }, { uv: 600 }, { uv: 500 }, { uv: 800 }, { uv: 700 }
  ],
  monthly: [
    { uv: 1000 }, { uv: 2000 }, { uv: 1500 }, { uv: 3000 }, { uv: 2500 }, { uv: 4000 }
  ],
  service: [
    { name: 'DMT', value: 40 }, { name: 'AEPS', value: 30 }, { name: 'BBPS', value: 20 }, { name: 'Recharge', value: 10 }
  ],
  fundRequests: {
    today: [
      { name: 'Approved', value: 124500, color: '#10b981', count: 45 },
      { name: 'Pending', value: 45000, color: '#f59e0b', count: 12 },
      { name: 'Rejected', value: 12000, color: '#ef4444', count: 5 }
    ],
    week: [
      { name: 'Approved', value: 850000, color: '#10b981', count: 320 },
      { name: 'Pending', value: 120000, color: '#f59e0b', count: 45 },
      { name: 'Rejected', value: 45000, color: '#ef4444', count: 18 }
    ],
    month: [
      { name: 'Approved', value: 3400000, color: '#10b981', count: 1250 },
      { name: 'Pending', value: 250000, color: '#f59e0b', count: 85 },
      { name: 'Rejected', value: 120000, color: '#ef4444', count: 42 }
    ]
  }
};

// 3. Dropdown Options
export const MOCK_SELECT_OPTIONS = [ // Labelled "Select" in UI
  { label: "AEPS", value: "aeps" },
  { label: "BBPS", value: "bbps" },
  { label: "BUS", value: "bus" },
  { label: "CMS", value: "cms" },
  { label: "CreditCard", value: "credit_card" },
  { label: "CRM", value: "crm" },
];

export const MOCK_SERVICES = [ // Labelled "Select Service" in UI
  { label: "Money Transfer", value: "dmt" },
  { label: "Merchant Payment", value: "merchant" },
  { label: "Utility Bill", value: "utility" },
  { label: "Travel Booking", value: "travel" },
  { label: "Insurance", value: "insurance" },
];

export const MOCK_USERS = [ // Labelled "Select User" in UI
  { label: "RET1045-om das-Shopp", value: "ret1045", shortLabel: "om das" },
  { label: "RET1044-prasant-Webplat", value: "ret1044", shortLabel: "prasant" },
  { label: "RET1043-TEsting name-testtetst", value: "ret1043", shortLabel: "TEsting name" },
  { label: "4697898797-smita-", value: "smita", shortLabel: "smita" },
];

export const MOCK_AEPS_TRANSACTIONS = [
  {
    id: 1,
    userName: "Rahul Jangid",
    amount: "₹ 5,000.00",
    walletBefore: "₹ 1,200.00",
    walletAfter: "₹ 6,200.00",
    transactionDate: "2024-03-20 14:30:22"
  },
  {
    id: 2,
    userName: "Ishaan Patel",
    amount: "₹ 2,500.00",
    walletBefore: "₹ 500.00",
    walletAfter: "₹ 3,000.00",
    transactionDate: "2024-03-20 15:10:45"
  },
  {
    id: 3,
    userName: "Aditya Jain",
    amount: "₹ 1,000.00",
    walletBefore: "₹ 4,300.00",
    walletAfter: "₹ 5,300.00",
    transactionDate: "2024-03-20 16:05:12"
  },
  {
    id: 4,
    userName: "Monika Barman",
    amount: "₹ 10,000.00",
    walletBefore: "₹ 2,000.00",
    walletAfter: "₹ 12,000.00",
    transactionDate: "2024-03-21 10:20:00"
  },
  {
    id: 5,
    userName: "Sai Singh",
    amount: "₹ 3,200.00",
    walletBefore: "₹ 1,500.00",
    walletAfter: "₹ 4,700.00",
    transactionDate: "2024-03-21 11:45:30"
  }
];

// 4. Settings - Manage Services
export const MOCK_MANAGE_SERVICES_LIST = [
  { id: '1', label: "AEPS", value: "aeps", status: "active" },
  { id: '2', label: "DMT", value: "dmt", status: "active" },
  { id: '3', label: "Xpress Transfer", value: "xpress_transfer", status: "active" },
  { id: '4', label: "BBPS Services", value: "bbps", status: "active" },
  { id: '5', label: "RECHARGE", value: "recharge", status: "active" },
  { id: '6', label: "PAYOUT", value: "payout", status: "active" },
  { id: '7', label: "WALLET TRANSFER", value: "wallet_transfer", status: "active" }
];

// 5. Wallet Topup Bank
export const MOCK_BANK_ACCOUNTS = [
  {
    id: 1,
    accountNumber: "033311501002444",
    ifscCode: "NESF0000096",
    bankName: "NORTH EAST SMALL FINANCE BANK",
    holderName: "INDIPAY APP PRIVATE LIMITED",
    status: "Active"
  }
];

export const MOCK_BANK_OPTIONS = [
  { label: "North East Small Finance Bank", value: "nesf" },
  { label: "HDFC Bank", value: "hdfc" },
  { label: "ICICI Bank", value: "icici" },
  { label: "State Bank of India", value: "sbi" },
];
