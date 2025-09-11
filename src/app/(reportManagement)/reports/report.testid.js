// --------- (Report Management) ----------
const REPORT_MANAGEMENT = {
  // page
  root: "report-management-root",
  headerBar: "report-management-header-bar",
  title: "report-management-title",

  // menu toggle button
  menuToggleButton: "report-management-menu-toggle-button",

  // report cards section
  reportCardSection: "report-management-report-cards-section",

  // individual report cards
  partnerProfitsReportCard: "report-partner-profits-report-card",
  partnerCreditLimitReportCard: "report-partner-credit-limit-report-card",
  unpaidPartnerBalancesReportCard: "report-unpaid-partner-balances-report-card",
  productsSaleReportCard: "report-products-sale-report-card",
  customersReportCard: "report-customers-report-card",
};

// --------- (Customer Report) ----------
const CUSTOMER_REPORT = {
  // page
  root: "customer-report-root",
  headerBar: "customer-report-header-bar",
  title: "customer-report-title",

  // filter section
  filterSection: "customer-report-filter-section",
  filterSelect: "customer-report-filter-select",
  filterStartDate: "customer-report-filter-start-date",
  filterEndDate: "customer-report-filter-end-date",
  filterClearBtn: "customer-report-filter-clear-btn",

  // table
  tableWrapper: "customer-report-table-wrapper",
  table: "customer-report-table",

  // dynamic per-row ids
  row: (id) => `customer-report-row-${id}`,
  rowViewBtn: (id) => `customer-report-row-${id}-view-btn`,
  rowSelect: (id) => `customer-report-row-${id}-select`,
  rowDetailsBtn: (id) => `customer-report-row-${id}-details-btn`,
};

// --------- (Partner Commission Report) ----------
const PARTNER_COMMISSION_REPORT = {
  // page
  root: "partner-commission-report-root",
  headerBar: "partner-commission-report-header-bar",
  title: "partner-commission-report-title",

  // filter section
  filterSection: "partner-commission-report-filter-section",
  filterSelect: "partner-commission-report-filter-select",
  filterStartDate: "partner-commission-report-filter-start-date",
  filterEndDate: "partner-commission-report-filter-end-date",
  filterClearBtn: "partner-commission-report-filter-clear-btn",

  // table
  tableWrapper: "partner-commission-report-table-wrapper",
  table: "partner-commission-report-table",

  // dynamic per-row ids
  row: (id) => `partner-commission-report-row-${id}`,
  rowViewBtn: (id) => `partner-commission-report-row-${id}-view-btn`,
};

// --------- (Partner Credit Limit Report) ----------
const PARTNER_CREDIT_LIMIT_REPORT = {
  // page
  root: "partner-credit-limit-report-root",
  headerBar: "partner-credit-limit-report-header-bar",
  title: "partner-credit-limit-report-title",

  // filter section
  filterSection: "partner-credit-limit-report-filter-section",
  filterSelect: "partner-credit-limit-report-filter-select",
  filterStartDate: "partner-credit-limit-report-filter-start-date",
  filterEndDate: "partner-credit-limit-report-filter-end-date",
  filterClearBtn: "partner-credit-limit-report-filter-clear-btn",

  // table
  tableWrapper: "partner-credit-limit-report-table-wrapper",
  table: "partner-credit-limit-report-table",

  // dynamic per-row ids
  row: (id) => `partner-credit-limit-report-row-${id}`,
  rowViewBtn: (id) => `partner-credit-limit-report-row-${id}-view-btn`,
};

// --------- (Product Sale Report) ----------
const PRODUCT_SALE_REPORT = {
  // page
  root: "product-sale-report-root",
  headerBar: "product-sale-report-header-bar",
  title: "product-sale-report-title",

  // filter section
  filterSection: "product-sale-report-filter-section",
  filterSelect: "product-sale-report-filter-select",
  filterStartDate: "product-sale-report-filter-start-date",
  filterEndDate: "product-sale-report-filter-end-date",
  filterClearBtn: "product-sale-report-filter-clear-btn",

  // table
  tableWrapper: "product-sale-report-table-wrapper",
  table: "product-sale-report-table",

  // dynamic per-row ids
  row: (id) => `product-sale-report-row-${id}`,
  rowViewBtn: (id) => `product-sale-report-row-${id}-view-btn`,
};

// --------- (Unpaid Partner Balance Report) ----------
const UNPAID_PARTNER_BALANCE_REPORT = {
  // page
  root: "unpaid-partner-balance-report-root",
  headerBar: "unpaid-partner-balance-report-header-bar",
  title: "unpaid-partner-balance-report-title",

  // filter section
  filterSection: "unpaid-partner-balance-report-filter-section",
  filterSelect: "unpaid-partner-balance-report-filter-select",
  filterStartDate: "unpaid-partner-balance-report-filter-start-date",
  filterEndDate: "unpaid-partner-balance-report-filter-end-date",
  filterClearBtn: "unpaid-partner-balance-report-filter-clear-btn",

  // table
  tableWrapper: "unpaid-partner-balance-report-table-wrapper",
  table: "unpaid-partner-balance-report-table",

  // dynamic per-row ids
  row: (id) => `unpaid-partner-balance-report-row-${id}`,
  rowViewBtn: (id) => `unpaid-partner-balance-report-row-${id}-view-btn`,
};


export { REPORT_MANAGEMENT, CUSTOMER_REPORT, PARTNER_COMMISSION_REPORT, PARTNER_CREDIT_LIMIT_REPORT, PRODUCT_SALE_REPORT, UNPAID_PARTNER_BALANCE_REPORT };
