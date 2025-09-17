// --------- (Supplier Management) ----------
const SUPPLIER_MANAGEMENT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // stats
  statsGrid: "stats-grid",
  totalSupplierCard: "total-supplier-card",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowViewBtn: (id) => `row-${id}-view-btn`,
  rowEditBtn: (id) => `row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `row-${id}-status-switch`,
  
  // modal
  modal: "modal",
  modalTitle: "modal-title",
  modalSubmitBtn: "modal-submit-btn",

  // action buttons
  addNewSupplierBtn: "add-new-supplier-btn",
  deleteSupplierBtn: "delete-supplier-btn",
  cancelBtn: "cancel-btn",
};

// --------- (Add New Supplier) ----------
const ADD_NEW_SUPPLIER = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // image upload
  imageUploadButton: "image-upload-btn",
  imagePreview: "image-preview",

  // form fields
  supplierNameField: "name-field",
  businessWebField: "business-web-field",
  supplierTypeSelect: "supplier-type-select",
  statusSelect: "status-select",
  registerDateField: "register-date-field",
  countrySelect: "country-select",
  stateSelect: "state-select",
  citySelect: "city-select",
  zipCodeField: "zip-code-field",
  addressOneField: "address-one-field",
  addressTwoField: "address-two-field",
  phoneNumField: "phone-num-field",
  bankAccountField: "bank-account-field",
  emailField: "email-field",
  passwordField: "password-field",

  // submit buttons
  submitButton: "submit-btn",
  cancelButton: "cancel-btn",

  // modal
  modal: "modal",
  modalSubmitBtn: "modal-submit-btn",
  modalCancelBtn: "modal-cancel-btn",
};

// --------- (Edit Supplier) ----------
const EDIT_SUPPLIER = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // image upload
  imageUploadButton: "image-upload-btn",
  imagePreview: "image-preview",

  // form fields
  supplierNameField: "name-field",
  businessWebField: "business-web-field",
  supplierTypeSelect: "supplier-type-select",
  statusSelect: "status-select",
  registerDateField: "register-date-field",
  countrySelect: "country-select",
  stateSelect: "state-select",
  citySelect: "city-select",
  zipCodeField: "zip-code-field",
  addressOneField: "address-one-field",
  addressTwoField: "address-two-field",
  phoneNumField: "phone-num-field",
  bankAccountField: "bank-account-field",
  emailField: "email-field",
  passwordField: "password-field",

  // password visibility toggle
  passwordVisibilityToggle: "password-visibility-toggle",

  // submit buttons
  submitButton: "submit-btn",
  cancelButton: "cancel-btn",

  // modal
  modal: "modal",
  modalSubmitBtn: "modal-submit-btn",
  modalCancelBtn: "modal-cancel-btn",

  // toggle password change option
  passwordChangeToggle: "password-change-toggle",
};

// --------- (Detail Supplier) ----------
const DETAIL_SUPPLIER = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // back button
  backButton: "back-button",

  // supplier status
  supplierStatusBadge: "status-badge",

  // supplier details section
  contactSection: "contact-section",
  supplierName: "name",
  supplierEmail: "email",
  supplierCreatedAt: "created-at",
  supplierRegisteredBy: "registered-by",
  supplierPhone: "phone",
  supplierBankAccount: "bank-account",
  supplierType: "type",

  // address section
  addressSection: "address-section",
  companyAddress: "company-address",
  addressLineOne: "address-line-one",
  addressLineTwo: "address-line-two",
  cityStateZip: "city-state-zip",
  country: "country",

  // actions
  editButton: "edit-button",
  deleteButton: "delete-button",

  // delete confirmation modal
  deleteModal: "delete-modal",
  deleteModalConfirmButton: "delete-modal-confirm",
  deleteModalCancelButton: "delete-modal-cancel",
  deleteModalMessage: "delete-modal-message",

  // loader
  loader: "loader",
};

export { SUPPLIER_MANAGEMENT, ADD_NEW_SUPPLIER, EDIT_SUPPLIER, DETAIL_SUPPLIER };
