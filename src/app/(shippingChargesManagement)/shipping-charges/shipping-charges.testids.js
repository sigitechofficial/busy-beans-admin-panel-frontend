
// --------- (Shipping Charges Management) ----------
const SHIPPING_CHARGES = {
  // page
  root: "shipping-charges-root",
  headerBar: "shipping-charges-header-bar",
  title: "shipping-charges-title",

  // loaders
  pageLoader: "shipping-charges-page-loader",
  miniLoader: "shipping-charges-mini-loader",

  // rows
  rowsContainer: "shipping-charges-rows-container",
  row: (index) => `shipping-charges-row-${index}`,
  minInput: (index) => `shipping-charges-row-${index}-min-input`,
  maxInput: (index) => `shipping-charges-row-${index}-max-input`,
  chargeInput: (index) => `shipping-charges-row-${index}-charge-input`,
  deleteBtn: (index) => `shipping-charges-row-${index}-delete-btn`,

  // actions
  addRowBtn: "shipping-charges-add-row-btn",
  saveBtn: "shipping-charges-save-btn",
};

export { SHIPPING_CHARGES };
