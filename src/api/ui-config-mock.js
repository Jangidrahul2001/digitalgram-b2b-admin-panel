// Mock Sidebar Sections and Items
import {
  House,
  Users,
  Settings,
  BarChart,
  FileText,
  UserCheck,
  Banknote,
  Landmark,
  Package,
  Percent,
  CreditCard,
  Headphones,
  IdCard,
  ShoppingBag,
  LifeBuoy,
  MessageCircle,
  Wallet,
  Mail,
  Ticket,
  Bell,
} from "@/components/icons";

// Helper to map icon names to Lucide components if coming from API as strings
export const getIcon = (iconName) => {
  const icons = {
    House,
    Users,
    Settings,
    BarChart,
    FileText,
    UserCheck,
    Banknote,
    Landmark,
    Package,
    Percent,
    CreditCard,
    Headphones,
    IdCard,
    ShoppingBag,
    LifeBuoy,
    MessageCircle,
    Wallet,
    Mail,
    Ticket,
    Bell,
  };
  return icons[iconName] || House;
};

export const MOCK_SIDEBAR_CONFIG = [
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        iconName: "House",
        key: "DASHBOARD",
      },
      { title: "Users", href: "/users", iconName: "Users", key: "USERS" },
      {
        title: "User Request",
        href: "/user-requests",
        iconName: "Users",
        key: "USER_REQUEST",
      },
      {
        title: "KYC Request",
        href: "/kyc-requests",
        iconName: "UserCheck",
        key: "KYC",
      },
      {
        title: "Service Request",
        href: "/service-requests",
        iconName: "IdCard",
        key: "USERS",
      },
      {
        title: "Whitelist Request",
        href: "/account-whitelist",
        iconName: "UserCheck",
        key: "ACCOUNT_WHITELIST",
      },
      {
        title: "ID Charges",
        href: "/id-charges",
        iconName: "IdCard",
        key: "IDCHARGE",
      },
    ],
  },
  {
    label: "WALLET MANAGE",
    items: [
      {
        title: "Fund Request",
        href: "/wallet/fund-request",
        iconName: "Banknote",
        key: "FUND-REQUEST",
      },
      {
        title: "Wallet System",
        href: "/wallet/system",
        iconName: "Wallet",
        key: "WALLET",
      },
      {
        title: "AEPS Payout Request",
        href: "/wallet/payout-request",
        iconName: "Landmark",
        key: "PAYOUT_BANK",
      },
    ],
  },
  {
    label: "PACKAGE & COMMISSION",
    items: [
      {
        title: "Package",
        href: "/package",
        iconName: "Package",
        key: "PACKAGE",
      },
      {
        title: "Commission & Charges",
        href: "/commission",
        iconName: "Percent",
        key: "COMMISSION",
      },
    ],
  },
  {
    label: "OFFLINE & ONLINE SERVICES",
    items: [
      {
        title: "Offline Services",
        href: "/services/offline",
        iconName: "CreditCard",
        key: "OFFLINE_SERVICE",
      },
      {
        title: "Online Services",
        href: "/services/online",
        iconName: "Headphones",
        key: "ONLINE_SERVICE",
      },
    ],
  },
  {
    label: "REPORTS",
    items: [
      {
        title: "Wallet Ledger",
        href: "/reports/ledger",
        iconName: "Landmark",
        key: "REPORTS",
      },
      {
        title: "Service Wise Report",
        href: "/reports/service-wise",
        iconName: "FileText",
        key: "REPORTS",
      },
      {
        title: "Transaction Search",
        href: "/reports/transactions",
        iconName: "Search",
        key: "REPORTS",
      },
      {
        title: "Commission Wise Report",
        href: "/reports/commission-wise",
        iconName: "Percent",
        key: "REPORTS",
      },
      {
        title: "Aeps To Wallet",
        href: "/wallet/aeps-to-wallet",
        iconName: "Wallet",
        key: "REPORTS",
      },
    ],
  },
  {
    label: "SETTINGS & MANAGE",
    items: [
      {
        title: "Settings",
        href: "/settings",
        iconName: "Settings",
        key: "SETTINGS",
      },
      {
        title: "Notifications",
        href: "/notifications",
        iconName: "Bell",
        key: "SETTINGS",
      },
    ],
  },
  {
    label: "ECOMMERCE & MANAGEMENT",
    items: [
      {
        title: "eCommerce",
        href: "/ecommerce",
        iconName: "ShoppingBag",
        key: "ECOMMERCE",
      },
      { title: "Coupon", href: "/coupon", iconName: "Ticket", key: "COUPON" },
      {
        title: "Employee Management",
        href: "/employees",
        iconName: "Users",
        key: "EMPLOYEE",
      },
      {
        title: "Support System",
        href: "/support",
        iconName: "LifeBuoy",
        key: "SUPPORT",
      },
      {
        title: "Web Enquiries",
        href: "/enquiries",
        iconName: "MessageCircle",
        key: "ENQUIRY",
      },
    ],
  },
];



export const permissionCheckData = {
  "/dashboard": "DASHBOARD",
  "/analytics": "DASHBOARD",
  "/commission": "COMMISSION",
  "/content": "",
  "/notifications": "",
  "/package": "PACKAGE",
  "/profile": "",
  "/settings": "SETTINGS",
  "/settings/notifications/new": "SETTINGS",
  "/ecommerce": "ECOMMERCE",
  "/coupon": "COUPON",
  "/employees": "EMPLOYEE",
  "/support": "SUPPORT",
  "/enquiries": "ENQUIRY",

  // Users
  "/users": "USERS",
  "/users/new": "USERS",
  "/users/upgrade": "USERS",
  "/service-requests": "USERS",
  "/user-requests": "USER_REQUEST",
  "/kyc-requests": "KYC",
  "/kyc-requests/:userId": "KYC",
  "/id-charges": "IDCHARGE",
  "/id-charges/offline-charges": "IDCHARGE",
  "/users/:userId": "USERS",
  "/account-whitelist": "ACCOUNT_WHITELIST",

  // Services
  "/services/offline": "OFFLINE_SERVICE",
  "/services/offline/new": "OFFLINE_SERVICE",
  "/services/offline/requests": "OFFLINE_SERVICE",
  "/services/online": "ONLINE_SERVICE",
  "/services/online/new": "ONLINE_SERVICE",

  // Wallet
  "/wallet/fund-request": "FUND-REQUEST",
  "/wallet/payout-request": "PAYOUT_BANK",
  "/wallet/system": "WALLET",
  "/wallet/system/credit-debit": "WALLET",
  "/wallet/system/hold-release": "WALLET",
  "/wallet/aeps-to-wallet": "REPORTS",

  // Reports
  "/reports/ledger": "REPORTS",
  "/reports/service-wise": "REPORTS",
  "/reports/transactions": "REPORTS",
  "/transactions": "REPORTS",
  "/reports/commission-wise": "REPORTS",

  // Special
  "/no-permission": "",
};
