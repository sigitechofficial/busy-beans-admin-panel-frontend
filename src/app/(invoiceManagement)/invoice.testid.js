
// --------- (Invoices) ----------
const INVOICES = {
  // page
  root: "invoices-root",
  headerBar: "invoices-header-bar",
  title: "invoices-title",

  // stats
  statsGrid: "invoices-stats-grid",
  totalInvoicesCard: "invoices-total-invoices-card",

  // table
  tableWrapper: "invoices-table-wrapper",
  table: "invoices-table",

  // dynamic per-row ids
  row: (id) => `invoices-row-${id}`,
  rowViewBtn: (id) => `invoices-row-${id}-view-btn`,
  rowInvoiceEmail: (id) => `invoices-row-${id}-invoice-email`,
  rowTotalBalance: (id) => `invoices-row-${id}-total-balance`,
  rowOverdueOrders: (id) => `invoices-row-${id}-overdue-orders`,

  // modal
  modal: "invoices-modal",
  modalTitle: "invoices-modal-title",
  modalSubmitBtn: "invoices-modal-submit-btn",
};

// --------- (Individual Invoices) ----------
const INDIVIDUAL_INVOICES = {
  // page
  root: "individual-invoices-root",
  headerBar: "individual-invoices-header-bar",
  title: "individual-invoices-title",
  
  // stats
  statsGrid: "individual-invoices-stats-grid",
  totalInvoicesCard: "iindividual-invoices-total-invoices-card",

  // table
  tableWrapper: "individual-invoices-table-wrapper",
  table: "individual-invoices-table",

  // dynamic per-row ids
  row: (id) => `individual-invoices-row-${id}`,
  rowViewBtn: (id) => `individual-invoices-row-${id}-view-btn`,
  rowInvoiceNumber: (id) => `individual-invoices-row-${id}-invoice-number`,
  rowCompanyName: (id) => `individual-invoices-row-${id}-company-name`,
  rowOrderDate: (id) => `individual-invoices-row-${id}-order-date`,
  rowTotalBill: (id) => `individual-invoices-row-${id}-total-bill`,
  rowPaymentStatus: (id) => `individual-invoices-row-${id}-payment-status`,

  // modal
  modal: "individual-invoices-modal",
  modalTitle: "individual-invoices-modal-title",
  modalSubmitBtn: "individual-invoices-modal-submit-btn",
};

export { INVOICES, INDIVIDUAL_INVOICES };
