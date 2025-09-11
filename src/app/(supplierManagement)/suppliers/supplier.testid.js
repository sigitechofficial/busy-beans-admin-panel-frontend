// --------- (Supplier Management) ----------
const SUPPLIER_MANAGEMENT = {
  // page
  root: "supplier-management-root",
  headerBar: "supplier-management-header-bar",
  title: "supplier-management-title",

  // stats
  statsGrid: "supplier-management-stats-grid",
  totalSupplierCard: "supplier-management-total-supplier-card",

  // table
  tableWrapper: "supplier-management-table-wrapper",
  table: "supplier-management-table",

  // dynamic per-row ids
  row: (id) => `supplier-management-row-${id}`,
  rowViewBtn: (id) => `supplier-management-row-${id}-view-btn`,
  rowEditBtn: (id) => `supplier-management-row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `supplier-management-row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `supplier-management-row-${id}-status-switch`,
  
  // modal
  modal: "supplier-management-modal",
  modalTitle: "supplier-management-modal-title",
  modalSubmitBtn: "supplier-management-modal-submit-btn",

  // action buttons
  addNewSupplierBtn: "supplier-management-add-new-supplier-btn",
  deleteSupplierBtn: "supplier-management-delete-supplier-btn",
  cancelBtn: "supplier-management-cancel-btn",
};

// --------- (Add New Supplier) ----------
const ADD_NEW_SUPPLIER = {
  // page
  root: "add-new-supplier-root",
  headerBar: "add-new-supplier-header-bar",
  title: "add-new-supplier-title",

  // image upload
  imageUploadButton: "add-new-supplier-image-upload-btn",
  imagePreview: "add-new-supplier-image-preview",

  // form fields
  supplierNameField: "add-new-supplier-name-field",
  businessWebField: "add-new-supplier-business-web-field",
  supplierTypeSelect: "add-new-supplier-supplier-type-select",
  statusSelect: "add-new-supplier-status-select",
  registerDateField: "add-new-supplier-register-date-field",
  countrySelect: "add-new-supplier-country-select",
  stateSelect: "add-new-supplier-state-select",
  citySelect: "add-new-supplier-city-select",
  zipCodeField: "add-new-supplier-zip-code-field",
  addressOneField: "add-new-supplier-address-one-field",
  addressTwoField: "add-new-supplier-address-two-field",
  phoneNumField: "add-new-supplier-phone-num-field",
  bankAccountField: "add-new-supplier-bank-account-field",
  emailField: "add-new-supplier-email-field",
  passwordField: "add-new-supplier-password-field",

  // submit buttons
  submitButton: "add-new-supplier-submit-btn",
  cancelButton: "add-new-supplier-cancel-btn",

  // modal
  modal: "add-new-supplier-modal",
  modalSubmitBtn: "add-new-supplier-modal-submit-btn",
  modalCancelBtn: "add-new-supplier-modal-cancel-btn",
};

// --------- (Edit Supplier) ----------
const EDIT_SUPPLIER = {
  // page
  root: "edit-supplier-root",
  headerBar: "edit-supplier-header-bar",
  title: "edit-supplier-title",

  // image upload
  imageUploadButton: "edit-supplier-image-upload-btn",
  imagePreview: "edit-supplier-image-preview",

  // form fields
  supplierNameField: "edit-supplier-name-field",
  businessWebField: "edit-supplier-business-web-field",
  supplierTypeSelect: "edit-supplier-supplier-type-select",
  statusSelect: "edit-supplier-status-select",
  registerDateField: "edit-supplier-register-date-field",
  countrySelect: "edit-supplier-country-select",
  stateSelect: "edit-supplier-state-select",
  citySelect: "edit-supplier-city-select",
  zipCodeField: "edit-supplier-zip-code-field",
  addressOneField: "edit-supplier-address-one-field",
  addressTwoField: "edit-supplier-address-two-field",
  phoneNumField: "edit-supplier-phone-num-field",
  bankAccountField: "edit-supplier-bank-account-field",
  emailField: "edit-supplier-email-field",
  passwordField: "edit-supplier-password-field",

  // password visibility toggle
  passwordVisibilityToggle: "edit-supplier-password-visibility-toggle",

  // submit buttons
  submitButton: "edit-supplier-submit-btn",
  cancelButton: "edit-supplier-cancel-btn",

  // modal
  modal: "edit-supplier-modal",
  modalSubmitBtn: "edit-supplier-modal-submit-btn",
  modalCancelBtn: "edit-supplier-modal-cancel-btn",

  // toggle password change option
  passwordChangeToggle: "edit-supplier-password-change-toggle",
};

// --------- (Detail Supplier) ----------
const DETAIL_SUPPLIER = {
  // page
  root: "detail-supplier-root",
  headerBar: "detail-supplier-header-bar",
  title: "detail-supplier-title",

  // back button
  backButton: "detail-supplier-back-button",

  // supplier status
  supplierStatusBadge: "detail-supplier-status-badge",

  // supplier details section
  contactSection: "detail-supplier-contact-section",
  supplierName: "detail-supplier-name",
  supplierEmail: "detail-supplier-email",
  supplierCreatedAt: "detail-supplier-created-at",
  supplierRegisteredBy: "detail-supplier-registered-by",
  supplierPhone: "detail-supplier-phone",
  supplierBankAccount: "detail-supplier-bank-account",
  supplierType: "detail-supplier-type",

  // address section
  addressSection: "detail-supplier-address-section",
  companyAddress: "detail-supplier-company-address",
  addressLineOne: "detail-supplier-address-line-one",
  addressLineTwo: "detail-supplier-address-line-two",
  cityStateZip: "detail-supplier-city-state-zip",
  country: "detail-supplier-country",

  // actions
  editButton: "detail-supplier-edit-button",
  deleteButton: "detail-supplier-delete-button",

  // delete confirmation modal
  deleteModal: "detail-supplier-delete-modal",
  deleteModalConfirmButton: "detail-supplier-delete-modal-confirm",
  deleteModalCancelButton: "detail-supplier-delete-modal-cancel",
  deleteModalMessage: "detail-supplier-delete-modal-message",

  // loader
  loader: "detail-supplier-loader",
};

export { SUPPLIER_MANAGEMENT, ADD_NEW_SUPPLIER, EDIT_SUPPLIER, DETAIL_SUPPLIER };
