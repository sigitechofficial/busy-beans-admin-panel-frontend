// --------- (Pullouts) ----------
const PULLOUTS = {
  // page
  root: "pullouts-root",
  headerBar: "pullouts-header-bar",
  title: "pullouts-title",

  // status buttons
  pendingPulloutsBtn: "pullouts-pending-btn",
  confirmPulloutsBtn: "pullouts-confirm-btn",

  // stats
  statsGrid: "pullouts-stats-grid",
  totalOrdersCard: "pullouts-total-orders-card",

  // table
  tableWrapper: "pullouts-table-wrapper",
  table: "pullouts-table",

  // dynamic per-row ids
  row: (id) => `pullouts-row-${id}`,
  rowViewBtn: (id) => `pullouts-row-${id}-view-btn`,
  rowStatusSwitch: (id) => `pullouts-row-${id}-status-switch`,
  rowInvoice: (id) => `pullouts-row-${id}-invoice`,
  rowPaymentStatus: (id) => `pullouts-row-${id}-payment-status`,
  rowPulloutTransferId: (id) => `pullouts-row-${id}-pullout-transfer-id`,

  // actions
  pulloutPaymentBtn: "pullouts-pullout-payment-btn",

  // modal
  modal: "pullouts-modal",
  modalTitle: "pullouts-modal-title",
  modalSubmitBtn: "pullouts-modal-submit-btn",
};

export { PULLOUTS };
