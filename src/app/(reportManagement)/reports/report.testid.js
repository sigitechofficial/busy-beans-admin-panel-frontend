// --------- (Report Management) ----------
const REPORT_MANAGEMENT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // menu toggle button
  menuToggleButton: "menu-toggle-button",

  // report cards section
  reportCardSection: "report-cards-section",

  // individual report cards
  partnerProfitsReportCard: "partner-profits-report-card",
  partnerCreditLimitReportCard: "partner-credit-limit-report-card",
  unpaidPartnerBalancesReportCard: "unpaid-partner-balances-report-card",
  productsSaleReportCard: "products-sale-report-card",
  customersReportCard: "customers-report-card",
  pulledOrdersReceivableReportCard: "pulled-orders-receivable-report-card",
};

// --------- (Customer Report) ----------
const CUSTOMER_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
  rowSelect: (id) => `row-${id}-select`,
  rowDetailsBtn: (id) => `row-${id}-details-btn`,
};

// --------- (Partner Commission Report) ----------
const PARTNER_COMMISSION_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Partner Credit Limit Report) ----------
const PARTNER_CREDIT_LIMIT_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Product Sale Report) ----------
const PRODUCT_SALE_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Pulled Orders Receivable Report) ----------
const PULLED_ORDERS_RECEIVABLE_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",
  salesRepSelect: "sales-rep-select",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Pullout intent → QBO custom field sync) ----------
const PULLOUT_INTENT_QBO_SYNC = {
  root: "pullout-intent-qbo-sync-root",
  headerBar: "pullout-intent-qbo-sync-header-bar",
  title: "pullout-intent-qbo-sync-title",
  filterSection: "pullout-intent-qbo-sync-filter-section",
  filterSelect: "pullout-intent-qbo-sync-filter-select",
  filterStartDate: "pullout-intent-qbo-sync-filter-start-date",
  filterEndDate: "pullout-intent-qbo-sync-filter-end-date",
  filterClearBtn: "pullout-intent-qbo-sync-filter-clear-btn",
  salesRepSelect: "pullout-intent-qbo-sync-sales-rep-select",
  tabNotSynced: "pullout-intent-qbo-sync-tab-not-synced",
  tabSynced: "pullout-intent-qbo-sync-tab-synced",
  syncButton: "pullout-intent-qbo-sync-submit",
  syncSelectedButton: "pullout-intent-qbo-sync-submit",
  retryFailedButton: "pullout-intent-qbo-sync-retry-failed",
  resultsPanel: "pullout-intent-qbo-sync-results-panel",
  tableWrapper: "pullout-intent-qbo-sync-table-wrapper",
  row: (id) => `pullout-intent-qbo-sync-row-${id}`,
};

// --------- (Unpaid Partner Balance Report) ----------
const UNPAID_PARTNER_BALANCE_REPORT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter section
  filterSection: "filter-section",
  filterSelect: "filter-select",
  filterStartDate: "filter-start-date",
  filterEndDate: "filter-end-date",
  filterClearBtn: "filter-clear-btn",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

export { 
  REPORT_MANAGEMENT, 
  CUSTOMER_REPORT, 
  PARTNER_COMMISSION_REPORT, 
  PARTNER_CREDIT_LIMIT_REPORT, 
  PRODUCT_SALE_REPORT, 
  UNPAID_PARTNER_BALANCE_REPORT,
  PULLED_ORDERS_RECEIVABLE_REPORT,
  PULLOUT_INTENT_QBO_SYNC,
};
