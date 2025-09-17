// --------- (Sales Representative) ----------
const SALES_REPRESENTATIVE = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",
  newLocalPartner: "add-local-partner-btn",

  // stats
  statsGrid: "stats-grid",
  totalSalesRepCard: "total-sales-rep-card",

  // table
  tableWrapper: "table-wrapper",
  table: "table",

  // dynamic per-row ids
  row: (id) => `row-${id}`,
  rowEditBtn: (id) => `row-${id}-edit-btn`,
  rowDeleteBtn: (id) => `row-${id}-delete-btn`,
  rowStatusSwitch: (id) => `row-${id}-status-switch`,
  rowDetailsBtn: (id) => `row-${id}-details-btn`,

  // modal
  modal: "modal",
  modalTitle: "modal-title",
  modalSubmitBtn: "modal-submit-btn",
};

// --------- (Add Local Partner) ----------
const ADD_LOCAL_PARTNER = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // image upload
  imageUploadButton: "image-upload-btn",
  imagePreview: "image-preview",

  // form fields - Basic Information
  partnerNameInput: "name-input",
  partnerStatusSelect: "status-select",
  partnerCreditLimitInput: "credit-limit-input",

  // form fields - Contact Information
  partnerCountrySelect: "country-select",
  partnerStateSelect: "state-select",
  partnerCitySelect: "city-select",
  partnerCityCustomInput: "city-custom-input",
  partnerZipCodeInput: "zip-code-input",
  partnerAddressInput: "address-input",
  partnerTerritoryInput: "territory-input",
  partnerPhoneNumberInput: "phone-number-input",

  // form fields - Login Details
  partnerEmailInput: "email-input",
  partnerPasswordInput: "password-input",

  // password visibility toggle
  passwordVisibilityToggle: "password-visibility-toggle",

  // buttons
  submitButton: "submit-btn",
  cancelButton: "cancel-btn",

  // loader
  loader: "loader",
  miniLoader: "mini-loader",
};

// --------- (Update Local Partner) ----------
const UPDATE_LOCAL_PARTNER = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // image upload
  imageUploadButton: "image-upload-btn",
  imagePreview: "image-preview",

  // form fields - Basic Information
  partnerNameInput: "name-input",
  partnerStatusSelect: "status-select",
  partnerCreditLimitInput: "credit-limit-input",

  // form fields - Contact Information
  partnerCountrySelect: "country-select",
  partnerStateSelect: "state-select",
  partnerCitySelect: "city-select",
  partnerCityCustomInput: "city-custom-input",
  partnerZipCodeInput: "zip-code-input",
  partnerAddressInput: "address-input",
  partnerTerritoryInput: "territory-input",
  partnerPhoneNumberInput: "phone-number-input",

  // form fields - Login Details
  partnerEmailInput: "email-input",
  partnerPasswordInput: "password-input",

  // password visibility toggle
  passwordVisibilityToggle: "password-visibility-toggle",

  // buttons
  submitButton: "submit-btn",
  cancelButton: "cancel-btn",

  // loader
  loader: "loader",
  miniLoader: "mini-loader",

  // password change
  changePasswordCheckbox: "password-checkbox",
  passwordChangeSection: "password-change-section",
};

export { SALES_REPRESENTATIVE, ADD_LOCAL_PARTNER, UPDATE_LOCAL_PARTNER };
