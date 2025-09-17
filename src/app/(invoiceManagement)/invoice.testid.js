// --------- (Invoices) ----------
const INVOICES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // stats
  statsGrid: "stats-grid",
  totalInvoicesCard: "total-invoices-card",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
  rowInvoiceEmail: (id) => `row-${id}-invoice-email`,
  rowTotalBalance: (id) => `row-${id}-total-balance`,
  rowOverdueOrders: (id) => `row-${id}-overdue-orders`,

  // modal
  modal: "modal",
  modalTitle: "modal-title",
  modalSubmitBtn: "modal-submit-btn",
};

// --------- (Individual Invoices) ----------
const INDIVIDUAL_INVOICES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",
  
  // stats
  statsGrid: "stats-grid",
  totalInvoicesCard: "total-invoices-card",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
  rowInvoiceNumber: (id) => `row-${id}-invoice-number`,
  rowCompanyName: (id) => `row-${id}-company-name`,
  rowOrderDate: (id) => `row-${id}-order-date`,
  rowTotalBill: (id) => `row-${id}-total-bill`,
  rowPaymentStatus: (id) => `row-${id}-payment-status`,

  // modal
  modal: "modal",
  modalTitle: "modal-title",
  modalSubmitBtn: "modal-submit-btn",
};

export { INVOICES, INDIVIDUAL_INVOICES };
