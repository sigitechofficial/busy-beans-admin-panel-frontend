// --------- (Inventory Management - Stock) ----------
const INVENTORY_MANAGEMENT = {
  // page
  root: "inventory-management-root",
  headerBar: "inventory-management-header-bar",
  title: "inventory-management-title",

  // filter
  categoryFilter: "inventory-management-category-filter",

  // actions
  addProductBtn: "inventory-management-add-product-btn",
  importProductBtn: "inventory-management-import-product-btn",
  exportProductBtn: "inventory-management-export-product-btn",

  // product card actions
  productCardEditBtn: (id) => `inventory-management-product-card-${id}-edit-btn`,
  productCardDeleteBtn: (id) => `inventory-management-product-card-${id}-delete-btn`,
  productCardStatusToggle: (id) => `inventory-management-product-card-${id}-status-toggle`,

  // table actions
  tableWrapper: "inventory-management-table-wrapper",
  table: "inventory-management-table",
  tableRow: (id) => `inventory-management-table-row-${id}`,
  tableRowEditBtn: (id) => `inventory-management-table-row-${id}-edit-btn`,
  tableRowDeleteBtn: (id) => `inventory-management-table-row-${id}-delete-btn`,
  tableRowStatusToggle: (id) => `inventory-management-table-row-${id}-status-toggle`,

  // modal actions
  stockModal: "inventory-management-stock-modal",
  stockModalTitle: "inventory-management-stock-modal-title",
  stockModalCancelBtn: "inventory-management-stock-modal-cancel-btn",
  stockModalSubmitBtn: "inventory-management-stock-modal-submit-btn",
  stockImageInput: "inventory-management-stock-image-input",
  stockNameInput: "inventory-management-stock-name-input",
  stockDescInput: "inventory-management-stock-desc-input",
  stockCategorySelect: "inventory-management-stock-category-select",
  stockQuantityInput: "inventory-management-stock-quantity-input",
  stockPriceInput: "inventory-management-stock-price-input",
  stockWeightInput: "inventory-management-stock-weight-input",
  stockWholesalePriceInput: "inventory-management-stock-wholesale-price-input",
  stockProductCodeInput: "inventory-management-stock-product-code-input",
  stockSkuInput: "inventory-management-stock-sku-input",
  stockGrindInput: "inventory-management-stock-grind-input",

  // supplier SKUs
  supplierSkuInput: (id) => `inventory-management-supplier-sku-input-${id}`,
  supplierSkuLabel: (id) => `inventory-management-supplier-sku-label-${id}`,

  // loader
  loader: "inventory-management-loader",
  miniLoader: "inventory-management-mini-loader",
};

export {INVENTORY_MANAGEMENT};