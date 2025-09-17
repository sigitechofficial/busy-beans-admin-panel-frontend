// --------- (Category Management) ----------
const CATEGORY_MANAGEMENT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",
  newCategory: "add-new-category",

  // stats
  statsGrid: "stats-grid",
  totalCategoriesCard: "total-categories-card",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowEditBtn: (id) => `row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `row-${id}-status-switch`,

  // modal
  modal: "modal",
  modalTitle: "modal-title",
  modalCloseBtn: "modal-close-btn",
  modalSubmitBtn: "modal-submit-btn",
  
  // form fields
  nameInput: "name-input",
  changeStatusSwitch: (id) => `change-status-switch-${id}`,
};

export { CATEGORY_MANAGEMENT };
