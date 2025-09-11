// --------- (Create Order) ----------
const ORDERS_CREATE = {
  root: "orders-create-root",
  headerBar: "orders-create-header-bar",

  // filters/search
  categorySelect: "orders-create-category-select",
  searchInput: "orders-create-search-input",

  // product list
  productsGrid: "orders-create-products-grid",
  // each card root (dynamic)
  productCard: (id) => `orders-create-product-${id}-card`,

  // floating action
  openDrawerBtn: "orders-create-open-drawer-btn",
};

// --------- drawer (Create Order -> DrawerBeans) ----------
const ORDERS_CREATE_DRAWER = {
  modal: "orders-create-drawer-modal",
  title: "orders-create-drawer-title",

  // company + email
  companySelect: "orders-create-drawer-company-select",
  emailInput: "orders-create-drawer-email-input",

  // address & payments
  addressSelect: "orders-create-drawer-address-select",
  paymentMethodSelect: "orders-create-drawer-payment-method-select",
  frequencySelect: "orders-create-drawer-frequency-select",

  // notes
  noteInput: "orders-create-drawer-note-input",
  poNumberInput: "orders-create-drawer-po-number-input",

  // cart list
  itemsList: "orders-create-drawer-items-list",
  // per item controls (dynamic by product id)
  itemQtyBadge: (id) => `orders-create-drawer-item-${id}-qty-badge`,
  itemMinusBtn: (id) => `orders-create-drawer-item-${id}-minus-btn`,
  itemPlusBtn: (id) => `orders-create-drawer-item-${id}-plus-btn`,
  itemDeleteBtn: (id) => `orders-create-drawer-item-${id}-delete-btn`,

  // totals
  subtotalValue: "orders-create-drawer-subtotal-value",
  shippingValue: "orders-create-drawer-shipping-value",
  // per-item category discount line (dynamic by categoryId)
  discountLine: (categoryId) => `orders-create-drawer-discount-${categoryId}-row`,

  // submit
  submitBtn: "orders-create-drawer-submit-btn",
};

// --------- (New Orders) ----------
const NEW_ORDERS = {
  // page
  root: "new-orders-root",
  headerBar: "new-orders-header-bar",

  // summary tiles
  statsGrid: "new-orders-stats-grid",
  totalOrdersCard: "new-orders-total-orders-card",

  // data table
  table: "new-orders-table",
  tableWrapper: "new-orders-table-wrapper",

  // dynamic row & action buttons (use the order id)
  row: (id) => `new-orders-row-${id}`,
  rowViewBtn: (id) => `new-orders-row-${id}-view-btn`,
};

// --------- (All Orders) ----------
const ALL_ORDERS = {
  // page
  root: "all-orders-root",
  headerBar: "all-orders-header-bar",

  // filters
  filtersBar: "all-orders-filters-bar",
  filterAllBtn: "all-orders-filter-all-btn",
  filterPaidBtn: "all-orders-filter-paid-btn",
  filterUnpaidBtn: "all-orders-filter-unpaid-btn",

  // summary tiles
  statsGrid: "all-orders-stats-grid",
  totalOrdersCard: "all-orders-total-orders-card",

  // table
  tableWrapper: "all-orders-table-wrapper",
  table: "all-orders-table",

  // dynamic row id
  row: (id) => `all-orders-row-${id}`,
};

// --------- (Upcoming Orders) ----------
const UPCOMING_ORDERS = {
  // page
  root: "upcoming-orders-root",
  headerBar: "upcoming-orders-header-bar",
  headerFilterSelect: "upcoming-orders-header-filter-select",

  // actions
  rebookBtn: "upcoming-orders-rebook-btn",

  // stats
  statsGrid: "upcoming-orders-stats-grid",
  totalOrdersCard: "upcoming-orders-total-orders-card",

  // main table
  tableWrapper: "upcoming-orders-table-wrapper",
  table: "upcoming-orders-table",
  row: (id) => `upcoming-orders-row-${id}`,
  rowViewBtn: (id) => `upcoming-orders-row-${id}-view-btn`,

  // items dialog
  itemsDialog: "upcoming-orders-items-dialog",
  itemsDialogHeader: "upcoming-orders-items-dialog-header",
  itemsTableWrapper: "upcoming-orders-items-table-wrapper",
  itemsTable: "upcoming-orders-items-table",
  itemsCancelBtn: "upcoming-orders-items-cancel-btn",
};

// --------- (Dispatched Orders) ----------
const DISPATCHED_ORDERS = {
  // page
  root: "dispatched-orders-root",
  headerBar: "dispatched-orders-header-bar",

  // stats
  statsGrid: "dispatched-orders-stats-grid",
  totalOrdersCard: "dispatched-orders-total-orders-card",

  // table
  tableWrapper: "dispatched-orders-table-wrapper",
  table: "dispatched-orders-table",

  // dynamic per-row ids
  row: (id) => `dispatched-orders-row-${id}`,
  rowViewBtn: (id) => `dispatched-orders-row-${id}-view-btn`,
};

// --------- (Acknowledged Orders) ----------
const ACKNOWLEDGED_ORDERS = {
  // page
  root: "acknowledged-orders-root",
  headerBar: "acknowledged-orders-header-bar",

  // stats
  statsGrid: "acknowledged-orders-stats-grid",
  totalOrdersCard: "acknowledged-orders-total-orders-card",

  // table
  tableWrapper: "acknowledged-orders-table-wrapper",
  table: "acknowledged-orders-table",

  // dynamic per-row ids
  row: (id) => `acknowledged-orders-row-${id}`,
  rowViewBtn: (id) => `acknowledged-orders-row-${id}-view-btn`,
};

// --------- (Shipped Orders) ----------
const SHIPPED_ORDERS = {
  // page
  root: "shipped-orders-root",
  headerBar: "shipped-orders-header-bar",

  // stats
  statsGrid: "shipped-orders-stats-grid",
  totalOrdersCard: "shipped-orders-total-orders-card",

  // table
  tableWrapper: "shipped-orders-table-wrapper",
  table: "shipped-orders-table",

  // dynamic per-row ids
  row: (id) => `shipped-orders-row-${id}`,
  rowViewBtn: (id) => `shipped-orders-row-${id}-view-btn`,
};

// --------- (Cancelled Orders) ----------
const CANCELLED_ORDERS = {
  // page
  root: "cancelled-orders-root",
  headerBar: "cancelled-orders-header-bar",

  // stats
  statsGrid: "cancelled-orders-stats-grid",
  totalOrdersCard: "cancelled-orders-total-orders-card",

  // table
  tableWrapper: "cancelled-orders-table-wrapper",
  table: "cancelled-orders-table",

  // dynamic per-row ids
  row: (id) => `cancelled-orders-row-${id}`,
  rowViewBtn: (id) => `cancelled-orders-row-${id}-view-btn`,
};

// --------- (Order Detail) ----------
const ORDER_DETAIL = {
  // page
  root: "order-detail-root",
  headerBar: "order-detail-header-bar",
  breadcrumbOrdersLink: "order-detail-breadcrumb-orders-link",
  orderIdText: (id) => `order-detail-id-${id}`,
  statusPill: "order-detail-status-pill",

  // top actions
  actionsBar: "order-detail-actions-bar",
  dispatchFlowBtn: "order-detail-dispatch-flow-btn", // Dispatch/Acknowledge/Ship/Dispatch Order
  sendInvoiceBtn: "order-detail-send-invoice-btn",
  viewPdfBtn: "order-detail-view-pdf-btn",
  addOrUpdateInvoiceBtn: "order-detail-add-or-update-invoice-btn",
  cancelOrderBtn: "order-detail-cancel-btn",
  deleteOrderBtn: "order-detail-delete-btn",

  // banner (blue box)
  infoBanner: "order-detail-info-banner",
  paymentStatusReadonly: "order-detail-payment-status-readonly",
  paymentStatusSelect: "order-detail-payment-status-select",

  // summary grid (white card with rows)
  summaryCard: {
    wrapper: "order-detail-summary-wrapper",
    orderedOnRow: "order-detail-summary-ordered-on",
    companyRow: "order-detail-summary-company",
    createdByRow: "order-detail-summary-created-by",
    supplierRow: "order-detail-summary-supplier",
    salesRepRow: "order-detail-summary-sales-rep",
    poNumberRow: "order-detail-summary-po-number",
    invoiceNumberRow: "order-detail-summary-invoice-number",
    shippingCompanyRow: "order-detail-summary-shipping-company",
    pulloutIntentIdRow: "order-detail-summary-pullout-transfer-id",
    trackingNumberRow: "order-detail-summary-tracking-number",
    frequencyRow: "order-detail-summary-frequency",
    invoiceDateRow: "order-detail-summary-invoice-date",
    invoicePaidDateRow: "order-detail-summary-invoice-paid-date",
  },

  // left blocks
  deliverTo: {
    wrapper: "order-detail-deliver-to",
  },
  invoiceTo: {
    wrapper: "order-detail-invoice-to",
  },

  // small cards on right of summary
  invoiceCard: "order-detail-invoice-card",
  dispatchedCard: "order-detail-dispatched-card",

  // right column sections
  trackOrderSection: "order-detail-track-order",
  orderCardSection: "order-detail-order-card",

  // dialogs
  dialog: {
    root: "order-detail-dialog",
    title: "order-detail-dialog-title",
    submitBtn: "order-detail-dialog-submit-btn",
    cancelBtn: "order-detail-dialog-cancel-btn",

    // cheque inputs (add/edit)
    chequeNumberInput: "order-detail-dialog-cheque-number",
    chequeDateInput: "order-detail-dialog-cheque-date",
    chequeStatusSelect: "order-detail-dialog-cheque-status",
    bankNameInput: "order-detail-dialog-bank-name",
    bankBranchInput: "order-detail-dialog-bank-branch",
    chequeTypeSelect: "order-detail-dialog-cheque-type",
    chequeReceiptDateInput: "order-detail-dialog-cheque-receipt-date",
  },

  // loaders
  pageLoader: "order-detail-page-loader",
  miniLoader: "order-detail-mini-loader",
};

// --------- (Order Add/Update Invoice) ----------
const ORDER_ADD_INVOICE = {
  // page
  root: "order-add-invoice-root",
  headerBar: "order-add-invoice-header-bar",
  breadcrumbOrdersLink: "order-add-invoice-breadcrumb-orders-link",
  breadcrumbOrderIdLink: (id) => `order-add-invoice-breadcrumb-order-${id}`,

  // invoice fields
  invoiceNumberInput: "order-add-invoice-invoice-number-input",
  poNumberInput: "order-add-invoice-po-number-input",
  invoiceDateInput: "order-add-invoice-invoice-date-input",
  termsSelect: "order-add-invoice-terms-select",
  dueDateInput: "order-add-invoice-due-date-input",
  discountPercentageInput: "order-add-invoice-discount-percentage-input",

  // table
  itemsTable: "order-add-invoice-items-table",
  checkAllInput: "order-add-invoice-checkall",
  itemRow: (id) => `order-add-invoice-item-row-${id}`,
  itemQtyInput: (id) => `order-add-invoice-item-qty-${id}`,
  extraRow: (id) => `order-add-invoice-extra-row-${id}`,
  extraChargeRow: (id) => `order-add-invoice-extra-charge-row-${id}`,
  addItemBtn: "order-add-invoice-add-item-btn",
  addExtraChargesBtn: "order-add-invoice-add-extra-charges-btn",
  toggleManualShippingBtn: "order-add-invoice-toggle-manual-shipping-btn",
  shippingChargesInput: "order-add-invoice-shipping-charges-input",
  totalWeightRow: "order-add-invoice-total-weight-row",
  totalUsdRow: "order-add-invoice-total-usd-row",

  // comments
  commentsTextarea: "order-add-invoice-comments-textarea",

  // payment options
  paymentOptionsSection: "order-add-invoice-payment-options",
  savedCardRadio: (id) => `order-add-invoice-saved-card-${id}`,
  immediatePaymentCheckbox: "order-add-invoice-immediate-payment-checkbox",
  otherPaymentTextarea: "order-add-invoice-other-payment-textarea",
  emailInvoiceCheckbox: "order-add-invoice-email-invoice-checkbox",

  // submit
  submitBtn: "order-add-invoice-submit-btn",

  // modal
  modal: {
    root: "order-add-invoice-modal-root",
    title: "order-add-invoice-modal-title",
    searchInput: "order-add-invoice-modal-search-input",
    categorySelect: "order-add-invoice-modal-category-select",
    productRow: (id) => `order-add-invoice-modal-product-row-${id}`,
  },

  // loaders
  pageLoader: "order-add-invoice-page-loader",
  miniLoader: "order-add-invoice-mini-loader",
};

export { ORDERS_CREATE, ORDERS_CREATE_DRAWER, NEW_ORDERS, ALL_ORDERS, UPCOMING_ORDERS, DISPATCHED_ORDERS, ACKNOWLEDGED_ORDERS, SHIPPED_ORDERS, CANCELLED_ORDERS, ORDER_DETAIL, ORDER_ADD_INVOICE };
