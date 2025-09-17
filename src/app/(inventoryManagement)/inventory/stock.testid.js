// --------- (Inventory Management - Stock) ----------
const INVENTORY_MANAGEMENT = {
  // page
  root: "root",
  headerBar: "header-bar",
  title: "title",

  // filter
  categoryFilter: "category-filter",
  
  // stats
  statsGrid: "stats-grid",
  totalStocksCard: "total-stocks-card",

  // main table
  row: (id) => `row-${id}`,

  // actions
  addProductBtn: "add-product-btn",
  importProductBtn: "import-product-btn",
  exportProductBtn: "export-product-btn",

  // product card actions
  productCardEditBtn: (id) => `product-card-${id}-edit-btn`,
  productCardDeleteBtn: (id) => `product-card-${id}-delete-btn`,
  productCardStatusToggle: (id) => `product-card-${id}-status-toggle`,

  // table actions
  tableWrapper: "table-wrapper",
  table: "table",
  tableRow: (id) => `table-row-${id}`,
  tableRowEditBtn: (id) => `table-row-${id}-edit-btn`,
  tableRowDeleteBtn: (id) => `table-row-${id}-delete-btn`,
  tableRowStatusToggle: (id) => `table-row-${id}-status-toggle`,

  // modal actions
  stockModal: "stock-modal",
  stockModalTitle: "stock-modal-title",
  stockModalCancelBtn: "stock-modal-cancel-btn",
  stockModalSubmitBtn: "stock-modal-submit-btn",
  stockImageInput: "stock-image-input",
  stockNameInput: "stock-name-input",
  stockDescInput: "stock-desc-input",
  stockCategorySelect: "stock-category-select",
  stockQuantityInput: "stock-quantity-input",
  stockPriceInput: "stock-price-input",
  stockWeightInput: "stock-weight-input",
  stockWholesalePriceInput: "stock-wholesale-price-input",
  stockProductCodeInput: "stock-product-code-input",
  stockSkuInput: "stock-sku-input",
  stockGrindInput: "stock-grind-input",

  // supplier SKUs
  supplierSkuInput: (id) => `supplier-sku-input-${id}`,
  supplierSkuLabel: (id) => `supplier-sku-label-${id}`,

  // loader
  loader: "loader",
  miniLoader: "mini-loader",
};

export { INVENTORY_MANAGEMENT };
