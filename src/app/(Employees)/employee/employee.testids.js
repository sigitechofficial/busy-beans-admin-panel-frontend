// --------- (Employees) ----------
const EMPLOYEES = {
  // page
  root: "employees-root",
  headerBar: "employees-header-bar",
  title: "employees-title",

  // loader
  pageLoader: "employees-page-loader",
  miniLoader: "employees-mini-loader",

  // table
  tableWrapper: "employees-table-wrapper",
  table: "employees-table",

  // dynamic per-row ids
  row: (id) => `employees-row-${id}`,
  rowEditBtn: (id) => `employees-row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `employees-row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `employees-row-${id}-status-switch`,

  // modal
  modal: "employees-modal",
  modalTitle: "employees-modal-title",
  modalCloseBtn: "employees-modal-close-btn",
  modalSubmitBtn: "employees-modal-submit-btn",
  
  // form fields
  nameInput: "employees-name-input",
  emailInput: "employees-email-input",
  phoneInput: "employees-phone-input",
  passwordInput: "employees-password-input",
  countryCodeInput: "employees-countryCode-input",
  featuresCheckbox: (feature) => `employees-feature-checkbox-${feature}`,
  changePasswordCheckbox: "employees-change-password-checkbox",
  passwordVisibilityToggle: "employees-password-visibility-toggle",
};

export { EMPLOYEES };