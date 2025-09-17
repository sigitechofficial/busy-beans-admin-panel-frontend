// --------- (Shipping Charges Management) ----------
const SHIPPING_CHARGES = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // loaders
  pageLoader: "page-loader",
  miniLoader: "mini-loader",

  // rows
  rowsContainer: "rows-container",
  row: (index) => `row-${index}`,
  minInput: (index) => `row-${index}-min-input`,
  maxInput: (index) => `row-${index}-max-input`,
  chargeInput: (index) => `row-${index}-charge-input`,
  deleteBtn: (index) => `row-${index}-delete-btn`,

  // actions
  addRowBtn: "add-row-btn",
  saveBtn: "save-btn",
};

export { SHIPPING_CHARGES };
