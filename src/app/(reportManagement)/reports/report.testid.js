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
  UNPAID_PARTNER_BALANCE_REPORT 
};
