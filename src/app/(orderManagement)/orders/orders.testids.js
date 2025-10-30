// --------- (Create Order) ----------
const ORDERS_CREATE = {
  root: "root",
  headerBar: "header-bar",

  // filters/search
  categorySelect: "category-select",
  searchInput: "search-input",

  // product list
  productsGrid: "products-grid",
  productCard: (id) => `product-${id}-card`,

  // floating action
  openDrawerBtn: "open-drawer-btn",
};

// --------- drawer (Create Order -> DrawerBeans) ----------
const ORDERS_CREATE_DRAWER = {
  modal: "drawer-modal",
  title: "drawer-title",
  
  directPartnerSwitch: "direct-partner-switch",
  selfOrderSwitch: "self-order-switch",
  companySelect: "company-select",
  emailInput: "email-input",

  addressSelect: "address-select",
  paymentMethodSelect: "payment-method-select",
  frequencySelect: "frequency-select",

  noteInput: "note-input",
  poNumberInput: "po-number-input",

  itemsList: "items-list",
  itemQtyBadge: (id) => `item-${id}-qty-badge`,
  itemMinusBtn: (id) => `item-${id}-minus-btn`,
  itemPlusBtn: (id) => `item-${id}-plus-btn`,
  itemDeleteBtn: (id) => `item-${id}-delete-btn`,

  subtotalValue: "subtotal-value",
  shippingValue: "shipping-value",
  discountLine: (categoryId) => `discount-${categoryId}-row`,

  submitBtn: "submit-btn",
};

// --------- (New Orders) ----------
const NEW_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  table: "table",
  tableWrapper: "table-wrapper",

  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (All Orders) ----------
const ALL_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  filtersBar: "filters-bar",
  filterAllBtn: "filter-all-btn",
  filterPaidBtn: "filter-paid-btn",
  filterUnpaidBtn: "filter-unpaid-btn",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",

  row: (id) => `row-${id}`,
};

// --------- (Upcoming Orders) ----------
const UPCOMING_ORDERS = {
  root: "root",
  headerBar: "header-bar",
  headerFilterSelect: "header-filter-select",

  rebookBtn: "rebook-btn",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,

  itemsDialog: "items-dialog",
  itemsDialogHeader: "items-dialog-header",
  itemsTableWrapper: "items-table-wrapper",
  itemsTable: "items-table",
  itemsCancelBtn: "items-cancel-btn",
};

// --------- (Dispatched Orders) ----------
const DISPATCHED_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",

  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Acknowledged Orders) ----------
const ACKNOWLEDGED_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",

  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Shipped Orders) ----------
const SHIPPED_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",

  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Cancelled Orders) ----------
const CANCELLED_ORDERS = {
  root: "root",
  headerBar: "header-bar",

  statsGrid: "stats-grid",
  totalOrdersCard: "total-orders-card",

  tableWrapper: "table-wrapper",
  table: "table",

  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
};

// --------- (Order Detail) ----------
const ORDER_DETAIL = {
  root: "root",
  headerBar: "header-bar",
  breadcrumbOrdersLink: "breadcrumb-orders-link",
  orderIdText: (id) => `id-${id}`,
  statusPill: "status-pill",

  actionsBar: "actions-bar",
  dispatchFlowBtn: "dispatch-flow-btn",
  sendInvoiceBtn: "send-invoice-btn",
  viewPdfBtn: "view-pdf-btn",
  addOrUpdateInvoiceBtn: "add-or-update-invoice-btn",
  cancelOrderBtn: "cancel-btn",
  deleteOrderBtn: "delete-btn",

  infoBanner: "info-banner",
  paymentStatusReadonly: "payment-status-readonly",
  paymentStatusSelect: "payment-status-select",

  summaryCard: {
    wrapper: "summary-wrapper",
    orderedOnRow: "summary-ordered-on",
    companyRow: "summary-company",
    createdByRow: "summary-created-by",
    supplierRow: "summary-supplier",
    salesRepRow: "summary-sales-rep",
    poNumberRow: "summary-po-number",
    invoiceNumberRow: "summary-invoice-number",
    shippingCompanyRow: "summary-shipping-company",
    pulloutIntentIdRow: "summary-pullout-transfer-id",
    trackingNumberRow: "summary-tracking-number",
    frequencyRow: "summary-frequency",
    invoiceDateRow: "summary-invoice-date",
    invoicePaidDateRow: "summary-invoice-paid-date",
  },

  deliverTo: { wrapper: "deliver-to" },
  invoiceTo: { wrapper: "invoice-to" },

  invoiceCard: "invoice-card",
  dispatchedCard: "dispatched-card",

  trackOrderSection: "track-order",
  orderCardSection: "order-card",

  dialog: {
    root: "dialog",
    title: "dialog-title",
    submitBtn: "dialog-submit-btn",
    cancelBtn: "dialog-cancel-btn",
    chequeNumberInput: "dialog-cheque-number",
    chequeDateInput: "dialog-cheque-date",
    chequeStatusSelect: "dialog-cheque-status",
    bankNameInput: "dialog-bank-name",
    bankBranchInput: "dialog-bank-branch",
    chequeTypeSelect: "dialog-cheque-type",
    chequeReceiptDateInput: "dialog-cheque-receipt-date",
  },

  pageLoader: "page-loader",
  miniLoader: "mini-loader",
};

// --------- (Order Add/Update Invoice) ----------
const ORDER_ADD_INVOICE = {
  root: "root",
  headerBar: "header-bar",
  breadcrumbOrdersLink: "breadcrumb-orders-link",
  breadcrumbOrderIdLink: (id) => `breadcrumb-order-${id}`,

  invoiceNumberInput: "invoice-number-input",
  poNumberInput: "po-number-input",
  invoiceDateInput: "invoice-date-input",
  termsSelect: "terms-select",
  dueDateInput: "due-date-input",
  discountPercentageInput: "discount-percentage-input",

  itemsTable: "items-table",
  checkAllInput: "checkall",
  itemRow: (id) => `item-row-${id}`,
  itemQtyInput: (id) => `item-qty-${id}`,
  extraRow: (id) => `extra-row-${id}`,
  extraChargeRow: (id) => `extra-charge-row-${id}`,
  addItemBtn: "add-item-btn",
  addExtraChargesBtn: "add-extra-charges-btn",
  toggleManualShippingBtn: "toggle-manual-shipping-btn",
  shippingChargesInput: "shipping-charges-input",
  totalWeightRow: "total-weight-row",
  totalUsdRow: "total-usd-row",

  commentsTextarea: "comments-textarea",

  paymentOptionsSection: "payment-options",
  savedCardRadio: (id) => `saved-card-${id}`,
  immediatePaymentCheckbox: "immediate-payment-checkbox",
  otherPaymentTextarea: "other-payment-textarea",
  emailInvoiceCheckbox: "email-invoice-checkbox",

  submitBtn: "submit-btn",

  modal: {
    root: "modal-root",
    title: "modal-title",
    searchInput: "modal-search-input",
    categorySelect: "modal-category-select",
    productRow: (id) => `modal-product-row-${id}`,
  },

  pageLoader: "page-loader",
  miniLoader: "mini-loader",
};

export {
  ORDERS_CREATE,
  ORDERS_CREATE_DRAWER,
  NEW_ORDERS,
  ALL_ORDERS,
  UPCOMING_ORDERS,
  DISPATCHED_ORDERS,
  ACKNOWLEDGED_ORDERS,
  SHIPPED_ORDERS,
  CANCELLED_ORDERS,
  ORDER_DETAIL,
  ORDER_ADD_INVOICE,
};
