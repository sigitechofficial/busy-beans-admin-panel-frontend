// --------- (Leftbar) ----------
const LEFTBAR = {
  // Container and Header
  root: "root",
  logoContainer: "logo-container",
  logoImage: "logo-image",
  closeButton: "close-button",

  // User Info and Navigation
  userInfo: "user-info",
  userType: "user-type",
  userLogoutButton: "user-logout-button",
  
  // Sections
  dashboardSection: "dashboard-section",
  profileSection: "profile-section",
  orderManagementSection: "order-management-section",
  supplierManagementSection: "supplier-management-section",
  shippingChargesManagementSection: "shipping-charges-management-section",
  clientManagementSection: "client-management-section",
  localPartnersSection: "local-partners-section",
  subscriptionManagementSection: "subscription-management-section",
  invoiceManagementSection: "invoice-management-section",
  inventoryManagementSection: "inventory-management-section",
  reportManagementSection: "report-management-section",
  employeeManagementSection: "employee-management-section",
  zoneManagementSection: "zone-management-section",
  categoryManagementSection: "category-management-section",
  accountManagementSection: "account-management-section",
  walletManagementSection: "wallet-management-section",
  quotationManagementSection: "quotation-management-section",
  pulloutsManagementSection: "pullouts-management-section",

  // List items inside each section
  listItem: (section, title) =>
    `${section}-list-item-${title.toLowerCase().replace(/\s+/g, '-')}`,

  // Active Indicators
  activeIndicator: (section) => `${section}-active-indicator`,

  // Toggle buttons and icons
  toggleButton: (section) => `${section}-toggle-button`,
  sectionIcon: (section) => `${section}-icon`,
  
  // Special Actions
  stripeActionButton: "stripe-action-button",
  notificationsButton: "notifications-button",
  notificationsAlert: "notifications-alert",
  campaignBuilder: "campaign-builder",
  employeeStripeDashboard: "employee-stripe-dashboard",
};

export { LEFTBAR };
