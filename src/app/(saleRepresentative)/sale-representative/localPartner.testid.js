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

// --------- (Add Local Partner) ----------
const ADD_LOCAL_PARTNER = {
  // page
  root: "add-local-partner-root",
  headerBar: "add-local-partner-header-bar",
  title: "add-local-partner-title",

  // image upload
  imageUploadButton: "add-local-partner-image-upload-btn",
  imagePreview: "add-local-partner-image-preview",

  // form fields - Basic Information
  partnerNameInput: "add-local-partner-name-input",
  partnerStatusSelect: "add-local-partner-status-select",
  partnerCreditLimitInput: "add-local-partner-credit-limit-input",

  // form fields - Contact Information
  partnerCountrySelect: "add-local-partner-country-select",
  partnerStateSelect: "add-local-partner-state-select",
  partnerCitySelect: "add-local-partner-city-select",
  partnerCityCustomInput: "add-local-partner-city-custom-input",
  partnerZipCodeInput: "add-local-partner-zip-code-input",
  partnerAddressInput: "add-local-partner-address-input",
  partnerTerritoryInput: "add-local-partner-territory-input",
  partnerPhoneNumberInput: "add-local-partner-phone-number-input",

  // form fields - Login Details
  partnerEmailInput: "add-local-partner-email-input",
  partnerPasswordInput: "add-local-partner-password-input",

  // password visibility toggle
  passwordVisibilityToggle: "add-local-partner-password-visibility-toggle",

  // buttons
  submitButton: "add-local-partner-submit-btn",
  cancelButton: "add-local-partner-cancel-btn",

  // loader
  loader: "add-local-partner-loader",
  miniLoader: "add-local-partner-mini-loader",
};

// --------- (Update Local Partner) ----------
const UPDATE_LOCAL_PARTNER = {
  // page
  root: "update-local-partner-root",
  headerBar: "update-local-partner-header-bar",
  title: "update-local-partner-title",

  // image upload
  imageUploadButton: "update-local-partner-image-upload-btn",
  imagePreview: "update-local-partner-image-preview",

  // form fields - Basic Information
  partnerNameInput: "update-local-partner-name-input",
  partnerStatusSelect: "update-local-partner-status-select",
  partnerCreditLimitInput: "update-local-partner-credit-limit-input",

  // form fields - Contact Information
  partnerCountrySelect: "update-local-partner-country-select",
  partnerStateSelect: "update-local-partner-state-select",
  partnerCitySelect: "update-local-partner-city-select",
  partnerCityCustomInput: "update-local-partner-city-custom-input",
  partnerZipCodeInput: "update-local-partner-zip-code-input",
  partnerAddressInput: "update-local-partner-address-input",
  partnerTerritoryInput: "update-local-partner-territory-input",
  partnerPhoneNumberInput: "update-local-partner-phone-number-input",

  // form fields - Login Details
  partnerEmailInput: "update-local-partner-email-input",
  partnerPasswordInput: "update-local-partner-password-input",

  // password visibility toggle
  passwordVisibilityToggle: "update-local-partner-password-visibility-toggle",

  // buttons
  submitButton: "update-local-partner-submit-btn",
  cancelButton: "update-local-partner-cancel-btn",

  // loader
  loader: "update-local-partner-loader",
  miniLoader: "update-local-partner-mini-loader",

  // password change
  changePasswordCheckbox: "update-local-partner-password-checkbox",
  passwordChangeSection: "update-local-partner-password-change-section",
};

export { SALES_REPRESENTATIVE, ADD_LOCAL_PARTNER, UPDATE_LOCAL_PARTNER };
