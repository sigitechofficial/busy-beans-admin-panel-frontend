// --------- (Category Management) ----------
const CATEGORY_MANAGEMENT = {
  // page
  root: "category-management-root",
  headerBar: "category-management-header-bar",
  title: "category-management-title",

  // stats
  statsGrid: "category-management-stats-grid",
  totalCategoriesCard: "category-management-total-categories-card",

  // table
  tableWrapper: "category-management-table-wrapper",
  table: "category-management-table",

  // dynamic per-row ids
  row: (id) => `category-management-row-${id}`,
  rowEditBtn: (id) => `category-management-row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `category-management-row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `category-management-row-${id}-status-switch`,

  // modal
  modal: "category-management-modal",
  modalTitle: "category-management-modal-title",
  modalCloseBtn: "category-management-modal-close-btn",
  modalSubmitBtn: "category-management-modal-submit-btn",
  
  // form fields
  nameInput: "category-management-name-input",
  changeStatusSwitch: (id) => `category-management-change-status-switch-${id}`,
};

export { CATEGORY_MANAGEMENT };
