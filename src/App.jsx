import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import { LoadingScreen } from "./components/ui/loading-screen";

// Landing
import LandingPage from "./pages/page";

// Auth
import Login from "./pages/(auth)/login/page";
import ForgotPassword from "./pages/(auth)/forgot-password/page";
import OTP from "./pages/(auth)/otp/page";

// Dashboard
import Dashboard from "./pages/(dashboard)/dashboard/page";
import Analytics from "./pages/(dashboard)/analytics/page";
import Commission from "./pages/(dashboard)/commission/page";
import Content from "./pages/(dashboard)/content/page";
import Notifications from "./pages/(dashboard)/notifications/page";
import Package from "./pages/(dashboard)/package/page";
import Profile from "./pages/(dashboard)/profile/page";
import Settings from "./pages/(dashboard)/settings/page";
import NewNotification from "./pages/(dashboard)/settings/tabs/AddNotifications";
import EcommercePage from "./pages/(dashboard)/ecommerce/page";
import EmployeesPage from "./pages/(dashboard)/employees/page";
import SupportPage from "./pages/(dashboard)/support/page";
import EnquiriesPage from "./pages/(dashboard)/enquiries/page";
import CouponPage from "./pages/(dashboard)/coupon/page";

// Users
import UsersList from "./pages/(dashboard)/users/page";
import NewUser from "./pages/(dashboard)/users/new/page";
import UpgradeUser from "./pages/(dashboard)/users/upgrade/page";
import UserRequest from "./pages/(dashboard)/users/user-request/page";
import KYCRequests from "./pages/(dashboard)/users/kyc-requests/page";
import IdChargePage from "./pages/(dashboard)/users/id-charges/page";
import OfflineChargePage from "./pages/(dashboard)/users/offline-charges/page";
import UserDetails from "./pages/(dashboard)/users/[userId]/page";
import ViewKycRequest from "./pages/(dashboard)/users/kyc-requests/viewKycRequest";
import AccountWhitelistPage from "./pages/(dashboard)/users/account-whitelist/page";
import ServiceRequestsPage from "./pages/(dashboard)/users/service-request/page";

// Services
import OfflineServices from "./pages/(dashboard)/services/offline/page";
import NewOfflineService from "./pages/(dashboard)/services/offline/new/page";
import OfflineServiceRequests from "./pages/(dashboard)/services/offline/requests/page";
import OnlineServices from "./pages/(dashboard)/services/online/page";
import NewOnlineService from "./pages/(dashboard)/services/online/new/page";

// Wallet
import FundRequest from "./pages/(dashboard)/wallet/fund-request/page";
import PayoutRequest from "./pages/(dashboard)/wallet/payout-request/page";
import WalletSystem from "./pages/(dashboard)/wallet/system/page";
import CreditDebit from "./pages/(dashboard)/wallet/system/credit-debit/page";
import HoldRelease from "./pages/(dashboard)/wallet/system/hold-release/page";
import AepsToWalletPage from "./pages/(dashboard)/wallet/aeps-to-wallet/page";

// Reports
import LedgerReportPage from "./pages/(dashboard)/reports/ledger/page";
import ServiceWiseReportPage from "./pages/(dashboard)/reports/service-wise/page";
import TransactionSearchPage from "./pages/(dashboard)/reports/transactions/page";
import CommissionWiseReportPage from "./pages/(dashboard)/reports/commission-wise/page";
import TransactionDetailPage from "./pages/(dashboard)/reports/service-wise/view-transaction";
import LedgerDetailsPage from "./pages/(dashboard)/reports/ledger/view-ledger-details";

import { useDynamicFavicon } from "./hooks/use-dynamic-favicon";

import { Provider } from 'react-redux';
import { store } from './store/store';
import PageNotFound from "./pages/(auth)/PageNotFound";
import { PermissionCheck } from "./pages/(auth)/PermissionCheck";
import NoPermission from "./pages/(auth)/NoPermission";
import { setNavigateFunction } from "./api/api";

// Component to handle navigate function setup
const NavigateSetup = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");
  console.log(location.pathname, "ppppppp")

  if (!isAuthenticated || !token) {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  return (
    <PermissionCheck>
      {children};
    </PermissionCheck>)
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");

  if (isAuthenticated && token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const [loading, setLoading] = useState(true);

  useDynamicFavicon(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <LoadingScreen
        variant="full"
        message="Initializing Admin Panel"
        subtitle="Please wait..."
      />
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.VITE_BASENAME}>
        <NavigateSetup />
        <Routes>
          <Route element={<RootLayout />}>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />

            {/* Standalone Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/otp"
              element={
                <PublicRoute>
                  <OTP />
                </PublicRoute>
              }
            />

            {/* Dashboard Routes - Protected */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/no-permission" element={<NoPermission />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/commission" element={<Commission />} />
              <Route path="/content" element={<Content />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/package" element={<Package />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ecommerce" element={<EcommercePage />} />
              <Route path="/coupon" element={<CouponPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/enquiries" element={<EnquiriesPage />} />
              <Route
                path="/settings/notifications/new"
                element={<NewNotification />}
              />

              {/* Users */}
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/new" element={<NewUser />} />
              <Route path="/service-requests" element={<ServiceRequestsPage />} />
              <Route path="/users/upgrade" element={<UpgradeUser />} />
              <Route path="/user-requests" element={<UserRequest />} />
              <Route path="/kyc-requests" element={<KYCRequests />} />
              <Route path="/id-charges" element={<IdChargePage />} />
              <Route path="/id-charges/offline-charges" element={<OfflineChargePage />} />
              <Route path="/users/:userId" element={<UserDetails />} />
              <Route path="/kyc-requests/:userId" element={<ViewKycRequest />} />
              <Route path="/account-whitelist" element={<AccountWhitelistPage />} />

              {/* Services */}
              <Route path="/services/offline" element={<OfflineServices />} />
              <Route
                path="/services/offline/new"
                element={<NewOfflineService />}
              />
              <Route
                path="/services/offline/requests"
                element={<OfflineServiceRequests />}
              />
              <Route path="/services/online" element={<OnlineServices />} />
              <Route path="/services/online/new" element={<NewOnlineService />} />

              {/* Wallet */}
              <Route path="/wallet/fund-request" element={<FundRequest />} />
              <Route path="/wallet/payout-request" element={<PayoutRequest />} />
              <Route path="/wallet/system" element={<WalletSystem />} />
              <Route
                path="/wallet/system/credit-debit"
                element={<CreditDebit />}
              />
              <Route
                path="/wallet/system/hold-release"
                element={<HoldRelease />}
              />
              <Route
                path="/wallet/aeps-to-wallet"
                element={<AepsToWalletPage />}
              />

              {/* Reports */}
              <Route path="/reports/ledger" element={<LedgerReportPage />} />
              <Route path="/reports/ledger/details/:id" element={<LedgerDetailsPage />} />
              <Route path="/reports/service-wise" element={<ServiceWiseReportPage />} />
              <Route path="/reports/transactions" element={<TransactionSearchPage />} />
              <Route path="/reports/service-wise/details" element={<TransactionDetailPage />} />
              <Route path="/reports/commission-wise" element={<CommissionWiseReportPage />} />
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
