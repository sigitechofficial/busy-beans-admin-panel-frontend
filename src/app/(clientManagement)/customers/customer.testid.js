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

// --------- (Add Customer) ----------
const ADD_CUSTOMER = {
  // page
  root: "add-customer-root",
  headerBar: "add-customer-header-bar",
  title: "add-customer-title",
  
  // steps
  step1Title: "add-customer-step1-title",
  step2Title: "add-customer-step2-title",
  step3Title: "add-customer-step3-title",

  // customer info fields
  customerNameInput: "add-customer-name-input",
  customerEmailInput: "add-customer-email-input",
  customerPhoneInput: "add-customer-phone-input",
  customerPasswordInput: "add-customer-password-input",
  customerConfirmPasswordInput: "add-customer-confirm-password-input",
  customerSaleTaxNumberInput: "add-customer-sale-tax-number-input",
  customerDispatchEmailInput: "add-customer-dispatch-email-input",
  customerInvoiceEmailInput: "add-customer-invoice-email-input",
  customerCompanyNameInput: "add-customer-company-name-input",

  // address fields
  addressLineOneInput: "add-customer-address-line-one-input",
  addressLineTwoInput: "add-customer-address-line-two-input",
  addressTownInput: "add-customer-address-town-input",
  addressStateSelect: "add-customer-address-state-select",
  addressCountrySelect: "add-customer-address-country-select",
  addressZipCodeInput: "add-customer-address-zip-code-input",

  // billing address fields
  billingAddressLineOneInput: "add-customer-billing-address-line-one-input",
  billingAddressLineTwoInput: "add-customer-billing-address-line-two-input",
  billingAddressTownInput: "add-customer-billing-address-town-input",
  billingAddressStateSelect: "add-customer-billing-address-state-select",
  billingAddressCountrySelect: "add-customer-billing-address-country-select",
  billingAddressZipCodeInput: "add-customer-billing-address-zip-code-input",

  // checkboxes
  billingSameAsShippingCheckbox: "add-customer-billing-same-as-shipping-checkbox",

  // visibility toggles
  passwordVisibilityToggle: "add-customer-password-visibility-toggle",
  confirmPasswordVisibilityToggle: "add-customer-confirm-password-visibility-toggle",

  // buttons
  submitButton: "add-customer-submit-btn",
  cancelButton: "add-customer-cancel-btn",
  
  // loader
  loader: "add-customer-loader",
  miniLoader: "add-customer-mini-loader",
};

// --------- (Update Customer) ----------
const UPDATE_CUSTOMER = {
  // page
  root: "update-customer-root",
  headerBar: "update-customer-header-bar",
  title: "update-customer-title",
  
  // steps
  step1Title: "update-customer-step1-title",
  step2Title: "update-customer-step2-title",
  step3Title: "update-customer-step3-title",

  // customer info fields
  customerNameInput: "update-customer-name-input",
  customerEmailInput: "update-customer-email-input",
  customerPhoneInput: "update-customer-phone-input",
  customerPasswordInput: "update-customer-password-input",
  customerConfirmPasswordInput: "update-customer-confirm-password-input",
  customerSaleTaxNumberInput: "update-customer-sale-tax-number-input",
  customerDispatchEmailInput: "update-customer-dispatch-email-input",
  customerInvoiceEmailInput: "update-customer-invoice-email-input",
  customerCompanyNameInput: "update-customer-company-name-input",

  // address fields
  addressLineOneInput: "update-customer-address-line-one-input",
  addressLineTwoInput: "update-customer-address-line-two-input",
  addressTownInput: "update-customer-address-town-input",
  addressStateSelect: "update-customer-address-state-select",
  addressCountrySelect: "update-customer-address-country-select",
  addressZipCodeInput: "update-customer-address-zip-code-input",

  // billing address fields
  billingAddressLineOneInput: "update-customer-billing-address-line-one-input",
  billingAddressLineTwoInput: "update-customer-billing-address-line-two-input",
  billingAddressTownInput: "update-customer-billing-address-town-input",
  billingAddressStateSelect: "update-customer-billing-address-state-select",
  billingAddressCountrySelect: "update-customer-billing-address-country-select",
  billingAddressZipCodeInput: "update-customer-billing-address-zip-code-input",

  // checkboxes
  billingSameAsShippingCheckbox: "update-customer-billing-same-as-shipping-checkbox",

  // visibility toggles
  passwordVisibilityToggle: "update-customer-password-visibility-toggle",
  confirmPasswordVisibilityToggle: "update-customer-confirm-password-visibility-toggle",

  // buttons
  submitButton: "update-customer-submit-btn",
  cancelButton: "update-customer-cancel-btn",
  
  // loader
  loader: "update-customer-loader",
  miniLoader: "update-customer-mini-loader",

  // discount modal
  discountDlgOpen: "update-customer-discount-dlg-open",
  categoryDiscountInput: "update-customer-category-discount-input",
  saveDiscountButton: "update-customer-save-discount-btn",
  cancelDiscountButton: "update-customer-cancel-discount-btn",
};

export { CLIENT_MANAGEMENT, ADD_CUSTOMER, UPDATE_CUSTOMER };
