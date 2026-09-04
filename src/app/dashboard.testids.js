const DASHBOARD = {
  // page roots by role
  adminRoot: "dashboard-admin-root",
  salesRepRoot: "dashboard-sales-rep-root",
  supplierRoot: "dashboard-supplier-root",
  employeeRoot: "dashboard-employee-root",

  // common header
  header: "dashboard-header",

  // sales-rep: Stripe account banner
  connectBanner: "dashboard-connect-banner",
  connectBtn: "dashboard-connect-btn",

  // sales-rep: retry modal
  bankRetryModal: "dashboard-bank-retry-modal",
  bankRetryBtn: "dashboard-bank-retry-btn",

  // generic sections
  statsCardsGrid: "dashboard-stats-cards-grid",
  miniCardsGrid: "dashboard-mini-cards-grid",

  // HQ / local partner fulfillment (dashboard-2)
  fulfillmentRoot: "dashboard-fulfillment-root",
  fulfillmentTiles: "dashboard-fulfillment-tiles",
  fulfillmentSeeAll: (list) => `dashboard-fulfillment-see-all-${list}`,

  // supplier: top products
  topProductsSection: "dashboard-top-products-section",
  topProductsGrid: "dashboard-top-products-grid",
};

export default DASHBOARD;
