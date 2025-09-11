// --------- (Sales Representative) ----------
const SALES_REPRESENTATIVE = {
  // page
  root: "sales-representative-root",
  headerBar: "sales-representative-header-bar",
  title: "sales-representative-title",

  // stats
  statsGrid: "sales-representative-stats-grid",
  totalSalesRepCard: "sales-representative-total-sales-rep-card",

  // table
  tableWrapper: "sales-representative-table-wrapper",
  table: "sales-representative-table",

  // dynamic per-row ids
  row: (id) => `sales-representative-row-${id}`,
  rowEditBtn: (id) => `sales-representative-row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `sales-representative-row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `sales-representative-row-${id}-status-switch`,
  rowDetailsBtn: (id) => `sales-representative-row-${id}-details-btn`,

  // modal
  modal: "sales-representative-modal",
  modalTitle: "sales-representative-modal-title",
  modalSubmitBtn: "sales-representative-modal-submit-btn",
};

export { SALES_REPRESENTATIVE };
