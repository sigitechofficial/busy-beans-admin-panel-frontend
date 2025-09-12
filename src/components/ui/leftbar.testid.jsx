// --------- (Leftbar) ----------
const LEFTBAR = {
  // Container and Header
  root: "leftbar-root",
  logoContainer: "leftbar-logo-container",
  logoImage: "leftbar-logo-image",
  closeButton: "leftbar-close-button",

  // User Info and Navigation
  userInfo: "leftbar-user-info",
  userType: "leftbar-user-type",
  userLogoutButton: "leftbar-logout-button",
  
  // Sections
  dashboardSection: "leftbar-dashboard-section",
  orderManagementSection: "leftbar-order-management-section",
  supplierManagementSection: "leftbar-supplier-management-section",
  shippingChargesManagementSection: "leftbar-shipping-charges-management-section",
  clientManagementSection: "leftbar-client-management-section",
  localPartnersSection: "leftbar-local-partners-section",
  invoiceManagementSection: "leftbar-invoice-management-section",
  inventoryManagementSection: "leftbar-inventory-management-section",
  reportManagementSection: "leftbar-report-management-section",
  employeeManagementSection: "leftbar-employee-management-section",
  zoneManagementSection: "leftbar-zone-management-section",
  categoryManagementSection: "leftbar-category-management-section",
  accountManagementSection: "leftbar-account-management-section",
  walletManagementSection: "leftbar-wallet-management-section",
  quotationManagementSection: "leftbar-quotation-management-section",
  pulloutsManagementSection: "leftbar-pullouts-management-section",

  // List items inside each section
  listItem: (section, title) => `leftbar-${section}-list-item-${title.toLowerCase().replace(/\s+/g, '-')}`,

  // Active Indicators
  activeIndicator: (section) => `leftbar-${section}-active-indicator`,

  // Toggle buttons and icons
  toggleButton: (section) => `leftbar-${section}-toggle-button`,
  sectionIcon: (section) => `leftbar-${section}-icon`,
  
  // Special Actions
  stripeActionButton: "leftbar-stripe-action-button",
  notificationsButton: "leftbar-notifications-button",
  notificationsAlert: "leftbar-notifications-alert",
};

export {LEFTBAR};