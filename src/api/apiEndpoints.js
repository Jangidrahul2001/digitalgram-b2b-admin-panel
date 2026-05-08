export const apiEndpoints = {
  //  admin
  verifyOtp: "/verify-otp",
  adminLogin: "/super-login",
  fetchProfile: "/fetch-profile",
  updateProfile: "/update-profile",
  fetchRole: "/admin/role/get-roles",
  changePassword: "/change-password",
  loginLogs: "/admin/logs/login-logs",

  // packages
  fetchPackages: "/admin/package/get-packages",
  deletePackage: "/admin/package/delete-package",
  updatePackage: "/admin/package/update-package",
  createPackage: "/admin/package/create-package",
  updatePackageStatus: "/admin/package/update-status",
  // fetchActivepackages: "/admin/package/get-active-packages",

  // users
  fetchUsers: "/admin/user/get-users",
  createUser: "/admin/user/create-user",
  assignPackage: "/admin/user/assign-package",
  fetchParticularUser: "/admin/user/particular-user",
  updateUserStatus: "/admin/user/update-user-status",

  // user requests
  fetchUserRequests: "/admin/userRequest/get-user-requests",
  updateUserRequest: "/admin/userRequest/update-request-status",

  // service Request
  serviceRequest: "/admin/serviceRequest/list-service-request",
  rejectServiceRequest: "/admin/serviceRequest/reject-service-request",

  // kyc
  fetchKyc: "/admin/kyc/get-kycs",
  fetchKycById: "/admin/kyc/get-kyc",
  requestReKyc: "/admin/kyc/request-rekyc",
  fetchKycByUserId: "/admin/kyc/get-kyc-by-userId",
  updateKycRequest: "/admin/kyc/update-kyc-status",
  updateKycSectionStatus: "/admin/kyc/update-section-status",

  //services
  fetchServices: "/admin/service/get-services",
  fetchServicesWithPipeline: "/admin/service/list",
  updateServiceStatus: "admin/service/update-service-status",

  // user services
  fetchUserStats: "/admin/user/stats",
  assignServices: "/admin/user/assign-service",
  fetchAssignServicesByUserId: "/admin/user/assigned-services",
  fetchAllUserWithoutPagination: "/admin/user/get-all-user-list",

  // settings
  fetchSetting: "/admin/setting/get-setting",
  updateSetting: "/admin/setting/update-setting",

  //topup bank
  fetchAllBankTopup: "/admin/topupBank/get-all-bank",
  addBankTopup: "/admin/topupBank/add-wallet-topup-bank",
  deleteTopUpBank: "/admin/topupBank/delete-wallet-topup-bank",
  updateBankTopupStatus: "/admin/topupBank/update-wallet-topup-bank-status",

  //fund request
  fetchFundStats: "/admin/fundRequest/stats",
  fetchFundRequest: "/admin/fundRequest/get-fund-requests",
  rejectFundRequest: "/admin/fundRequest/reject-fund-request",
  approveFundRequest: "/admin/fundRequest/approve-fund-request",

  //user wallet
  debitCreditAmount: "/admin/userWallet/credit-debit-amount",
  adminWalletBalance: "/admin/userWallet/get-wallet-balances",
  fetchAllUserWallets: "/admin/userWallet/get-all-user-wallet",
  holdAndReleaseAmount: "/admin/userWallet/hold-release-amount",

  //payout bank request
  aepsPayoutRequest: "/admin/aepsPayoutBankRequest/payout-bank-requests",
  approveAndRejectPayoutRequest:
    "/admin/aepsPayoutBankRequest/approve-reject-bank-request",

  //whitelist request
  whiteListRequest: "/admin/accountWhitelistRequest/account-whitelist-requests",
  approveAndRejectWhitelistRequest:
    "/admin/accountWhitelistRequest/approve-reject-request",

  //ecommerce
  addProducts: "/admin/ecommerce/add-product",
  fetchSingleProduct: "/admin/ecommerce/product",
  fetchProducts: "/admin/ecommerce/product-list",
  deleteProduct: "/admin/ecommerce/delete-product",
  updateProduct: "/admin/ecommerce/update-product",

  //permission
  permissionList: "/admin/permission/permission-list",

  //employee
  addEmployee: "/admin/employee/add-employee",
  employeeList: "/admin/employee/employee-list",
  fetchEmployeeById: "/admin/employee/employee",
  updateEmployee: "/admin/employee/update-employee",
  deleteEmployee: "/admin/employee/delete-employee",
  employeeStats: "/admin/employee/employee-stats",
  deleteEmployee: "/admin/employee/delete-employee",
  updateEmployee: "/admin/employee/update-employee",

  //support
  fetchSupportStats: "/admin/support/support-stats",
  addRemarkInSupportTicket: "/admin/support/add-remark",
  fetchSupportTicketById: "/admin/support/support-request",
  fetchSupportTickets: "/admin/support/all-support-requests",
  updateSupportStatus: "/admin/support/update-support-status",

  //wallet ledger
  aepsTowalletHistory: "/admin/walletLedger/aeps-to-ewallet-history",

  //order
  fetchOrderById: "/admin/order",
  fetchOrders: "/admin/order/all-orders",
  updateOrderStatus: "/admin/order/update-order-status",

  //field
  fetchFieldOptionsForOfflineService: "/admin/field/field-options",

  //document
  fetchDocumentOptionsForOfflineService: "/admin/document/document-options",

  //offline service
  fetchOfflineServiceById: "/admin/offlineService",
  fetchOfflineServices: "/admin/offlineService/list-offline-service",
  deleteOfflineService: "/admin/offlineService/delete-offline-service",
  updateOfflineService: "/admin/offlineService/update-offline-service",
  createOfflineServiceData: "/admin/offlineService/create-offline-service",
  offlineServiceRequest:
    "/admin/offlineServiceRequest/list-offline-service-requests",
  offlineServiceRequestDelete:
    "/admin/offlineServiceRequest/delete-offline-service-request",
  fetchOfflineServiceRequestData:
    "/admin/offlineServiceRequest/offline-service-request",
  updateOfflineServiceRequestStatus:
    "/admin/offlineServiceRequest/update-service-request-status",

  //online services
  addOnlineService: "/admin/onlineService/create-online-service",
  fetchOnlineService: "/admin/onlineService/list-online-service",
  fetchOnlineServiceById: "/admin/onlineService",
  updateOnlineService: "/admin/onlineService/update-online-service",
  deleteOnlineService: "/admin/onlineService/delete-online-service",

  //enquires
  fetchEnquires: "/admin/enquiry/all-enquiries",

  //recharge category
  fetchRechargeCategory: "/admin/operator/get-active-operators",

  //bbps category
  fetchBbpsCategory: "/admin/bbpsCategory/get-active-bbpsCategory",

  // pipeline
  fetchPipelineByServiceId: "/admin/service/get-pipeline",

  //commission

  commisionDetails: "/admin/commission/commission-list",
  createCommision: "/admin/commission/create-commission",
  deleteCommisionPlan: "/admin/commission/delete-commission-plan",

  //coupon
  createCoupon: "/admin/coupon/create-coupon",
  deleteCoupon: "/admin/coupon/delete-coupon",
  fetchCouponList: "/admin/coupon/coupon-list",
  toggleCouponStatus: "/admin/coupon/toggle-coupon",

  //wallet ledger
  allLedgerEntry: "/admin/walletLedger/all-ledger-entry-list",
  // serviceWiseReport:"/admin/report/service-wise-report"

  //recharge report
  rechargeStats: "/admin/rechargeReport/recharge-service-stats",
  rechargeReport: "/admin/rechargeReport/recharge-service-report",
  rechargeReportById: "/admin/rechargeReport/recharge-service-report",

  //bbps report
  bbpsStats: "/admin/bbpsReport/bbps-service-stats",
  bbpsReport: "/admin/bbpsReport/bbps-service-report",

  //banner
  addBanner: "/admin/banner/add-banner",
  deleteBanner: "/admin/banner/delete-banner",
  fetchAllBanners: "/admin/banner/all-banners",
  toggleBannerStatus: "/admin/banner/toggle-status",

  //notification
  createNotification: "/admin/notification/create-notification",
  deleteNotification: "/admin/notification/delete-notification",
  fetchAllNotifications: "/admin/notification/all-notifications",
  toogleNotificationStatus: "/admin/notification/toggle-notification",

  //charge
  fetchIdCharges: "admin/charge/get-charges",
  createIdCharge: "/admin/charge/set-charges",
  updateIdCharge: "/admin/charge/update-charge",
  togglePaymentRequired: "/admin/charge/toggle-payment-required",
  fetchOnBoardingRequests: "/admin/charge/get-id-charge-requests",
  rejectIdChargeRequest: "/admin/charge/reject-id-charge-request",
  approveIdChargeRequest: "/admin/charge/approve-id-charge-request",

  // policy
  addPolicy: "/admin/policy/add-policy",
  fetchPolicy: "/admin/policy/policy-by-type",
};
