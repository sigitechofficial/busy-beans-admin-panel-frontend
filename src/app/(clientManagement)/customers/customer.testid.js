// --------- (Client Management) ----------
const CLIENT_MANAGEMENT = {
  // page
  root: "client-management-root",
  headerBar: "client-management-header-bar",
  title: "client-management-title",

  // stats
  statsGrid: "client-management-stats-grid",
  totalCustomerCard: "client-management-total-customer-card",

  // table
  tableWrapper: "client-management-table-wrapper",
  table: "client-management-table",

  // dynamic per-row ids
  row: (id) => `client-management-row-${id}`,
  rowViewBtn: (id) => `client-management-row-${id}-view-btn`,
  rowEditBtn: (id) => `client-management-row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `client-management-row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `client-management-row-${id}-status-switch`,
  rowAssignBtn: (id) => `client-management-row-${id}-assign-btn`,
  
  // modal
  modal: "client-management-modal",
  modalTitle: "client-management-modal-title",
  modalSubmitBtn: "client-management-modal-submit-btn",
  modalCancelBtn: "client-management-modal-cancel-btn",
  
  // select filters
  stateSelect: "client-management-state-select",
  customerTypeFilter: "client-management-customer-type-filter",
};

export { CLIENT_MANAGEMENT };
