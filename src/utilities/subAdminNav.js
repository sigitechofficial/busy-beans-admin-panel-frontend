import { hasPermission } from "@/utilities/Permission";

export const SUB_ADMIN_PROFILE_PATH = "/sub-admin-profile";

/** Features that get Admin / Local Partner scope checkboxes (sub-admin only). */
export const SUB_ADMIN_SCOPED_FEATURES = [
  "orders",
  "quickbooks-invoices",
  "invoice",
  "subscription",
  "report",
];

export const isScopedSubAdminFeature = (feature) =>
  SUB_ADMIN_SCOPED_FEATURES.includes(feature);

/**
 * Track-specific modules: Access Scope is shown as a locked visual
 * (disabled checkboxes). These keys are never persisted.
 */
export const SUB_ADMIN_LOCKED_SCOPE = {
  "customer-orders": { customer: true, partner: false },
  "partner-orders": { customer: false, partner: true },
  customer: { customer: true, partner: false },
  "selected-customer": { customer: true, partner: false },
  "local-partner": { customer: false, partner: true },
};

/**
 * How Access Scope cells render on the Sub Admin permissions table.
 * - live: editable Admin / Local Partner (the 5 scoped features)
 * - locked: disabled checkboxes matching the module's inherent track
 * - global: both scopes empty and disabled (HQ-wide modules)
 */
export function getSubAdminScopeDisplay(feature) {
  if (isScopedSubAdminFeature(feature)) return { mode: "live" };
  const locked = SUB_ADMIN_LOCKED_SCOPE[feature];
  if (locked) {
    return { mode: "locked", customer: locked.customer, partner: locked.partner };
  }
  return { mode: "global", customer: false, partner: false };
}

/** Every live admin sidebar tab a sub-admin can be granted. Labels match Leftbar. */
export const SUB_ADMIN_FEATURE_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Order Management" },
  { key: "partner-orders", label: "Partner Orders" },
  { key: "customer-orders", label: "Customer Orders" },
  { key: "quickbooks-invoices", label: "Quickbooks Invoices" },
  { key: "supplier", label: "Supplier Management" },
  { key: "customer", label: "Client Management" },
  { key: "selected-customer", label: "Selected Clients" },
  { key: "local-partner", label: "Local Partners" },
  { key: "leads-dashboard", label: "Leads Dashboard" },
  { key: "subscription", label: "Machine Subscriptions" },
  { key: "invoice", label: "Invoice Management" },
  { key: "payment-pullout", label: "Payment Pullouts" },
  { key: "product", label: "Inventory Management" },
  { key: "category", label: "Category Management" },
  { key: "employees", label: "Employee Management" },
  { key: "sub-admins", label: "Sub Admins" },
  { key: "country", label: "Zone Management" },
  { key: "charges", label: "Shipping Charges Management" },
  { key: "report", label: "Report Management" },
  { key: "free-tasting", label: "Tasting Requests" },
  { key: "quickbooks", label: "QuickBooks" },
];

export const SUB_ADMIN_FEATURES = SUB_ADMIN_FEATURE_ITEMS.map((item) => item.key);

const ALWAYS_ALLOWED_PATHS = [
  "/sign-in",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-login-otp",
  "/sub-admin-profile",
  "/profile",
];

/**
 * Longest / most-specific prefixes first.
 * A path is allowed when the sub-admin has ANY listed *_view key.
 */
const PATH_PERMISSIONS = [
  { prefix: "/orders/quickbooks", permissions: ["quickbooks-invoices_view"] },
  { prefix: "/Quickbooks/invoices", permissions: ["quickbooks-invoices_view"] },
  { prefix: "/Quickbooks", permissions: ["quickbooks_view"] },
  {
    prefix: "/orders/partnerOrders",
    permissions: ["partner-orders_view"],
  },
  { prefix: "/orders/create", permissions: ["orders_view"] },
  { prefix: "/orders/emails", permissions: ["orders_view"] },
  { prefix: "/orders/email-logs", permissions: ["orders_view"] },
  { prefix: "/orders/delete-invoice", permissions: ["orders_view"] },
  { prefix: "/orders", permissions: ["customer-orders_view"] },
  { prefix: "/suppliers", permissions: ["supplier_view"] },
  { prefix: "/active-supplier", permissions: ["supplier_view"] },
  { prefix: "/inactive-supplier", permissions: ["supplier_view"] },
  { prefix: "/add-new-supplier", permissions: ["supplier_view"] },
  {
    prefix: "/customers",
    permissions: ["customer_view", "selected-customer_view"],
  },
  {
    prefix: "/active-clients",
    permissions: ["customer_view", "selected-customer_view"],
  },
  {
    prefix: "/inactive-clients",
    permissions: ["customer_view", "selected-customer_view"],
  },
  { prefix: "/sale-representative", permissions: ["local-partner_view"] },
  { prefix: "/leads", permissions: ["leads-dashboard_view"] },
  { prefix: "/subscription-requests", permissions: ["subscription_view"] },
  { prefix: "/subscription", permissions: ["subscription_view"] },
  { prefix: "/purchased", permissions: ["subscription_view"] },
  { prefix: "/addons", permissions: ["subscription_view"] },
  { prefix: "/add-ons", permissions: ["subscription_view"] },
  { prefix: "/all-invoices", permissions: ["invoice_view"] },
  { prefix: "/individual-invoices", permissions: ["invoice_view"] },
  { prefix: "/direct-invoices", permissions: ["invoice_view"] },
  { prefix: "/create-invoice", permissions: ["invoice_create"] },
  { prefix: "/invoices", permissions: ["invoice_view"] },
  { prefix: "/pullouts", permissions: ["payment-pullout_view"] },
  { prefix: "/inventory", permissions: ["product_view"] },
  { prefix: "/category", permissions: ["category_view"] },
  { prefix: "/sub-category", permissions: ["category_view"] },
  { prefix: "/employee", permissions: ["employees_view"] },
  { prefix: "/payouts", permissions: ["employees_view"] },
  { prefix: "/sub-admins", permissions: ["sub-admins_view"] },
  { prefix: "/countries", permissions: ["country_view"] },
  { prefix: "/cities", permissions: ["country_view"] },
  { prefix: "/zones", permissions: ["country_view"] },
  { prefix: "/shipping-charges", permissions: ["charges_view"] },
  { prefix: "/reports", permissions: ["report_view"] },
  { prefix: "/free-tasting", permissions: ["free-tasting_view"] },
  { prefix: "/dashboard-2", permissions: ["dashboard_view"] },
];

export function isStoredSubAdmin() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isSubAdmin") === "true";
}

/** True when the logged-in user has a permission list (sub-admin / employee), not "all". */
export function hasRestrictedPermissions() {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem("permissions");
  if (!raw || raw === "all") return false;
  try {
    return Array.isArray(JSON.parse(raw));
  } catch {
    return false;
  }
}

/** Nav/page check: unrestricted users see every module; restricted users need the view key. */
export function canSeeModule(viewKey) {
  if (!hasRestrictedPermissions() && !isStoredSubAdmin()) return true;
  return hasPermission(viewKey);
}

/**
 * Partner Orders is its own module for sub-admins.
 * Employees still inherit it from Order Management (they cannot be granted partner-orders).
 */
export function canSeePartnerOrdersModule() {
  if (isStoredSubAdmin()) return hasPermission("partner-orders_view");
  return canSeeModule("partner-orders_view") || canSeeModule("orders_view");
}

/**
 * Customer Orders is its own module for sub-admins.
 * Employees still inherit it from Order Management (they cannot be granted customer-orders).
 */
export function canSeeCustomerOrdersModule() {
  if (isStoredSubAdmin()) return hasPermission("customer-orders_view");
  return canSeeModule("customer-orders_view") || canSeeModule("orders_view");
}

export function hasDashboardView() {
  return hasPermission("dashboard_view");
}

const FEATURE_ACTIONS = ["view", "create", "update", "delete"];

function permissionKeysList() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("permissions");
  if (!raw || raw === "all") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Admin vs Local Partner scope for one of the 5 scoped features.
 * Sub-admins only. HQ admin / employees keep both sides (current behavior).
 * Legacy: `{feature}_view` (or any CRUD key) with no scope keys → both scopes.
 */
export function getFeatureScope(feature) {
  const both = { customer: true, partner: true };
  if (!isScopedSubAdminFeature(feature)) return both;
  if (!isStoredSubAdmin()) return both;

  const keys = permissionKeysList();
  const hasCustomer = keys.includes(`${feature}_scope_customer`);
  const hasPartner = keys.includes(`${feature}_scope_partner`);
  if (!hasCustomer && !hasPartner) {
    const hasAction = FEATURE_ACTIONS.some((action) =>
      keys.includes(`${feature}_${action}`),
    );
    return hasAction ? both : { customer: false, partner: false };
  }
  return { customer: hasCustomer, partner: hasPartner };
}

export function canAccessFeatureScope(feature, scope) {
  const scopes = getFeatureScope(feature);
  return scope === "partner" ? scopes.partner : scopes.customer;
}

export function showFeatureScopeToggle(feature) {
  const scopes = getFeatureScope(feature);
  return scopes.customer && scopes.partner;
}

/** Default UI mode when a page has Admin/customer vs Local Partner sides. */
export function defaultFeatureScopeMode(feature, { partnerValue = "partner", customerValue = "customer" } = {}) {
  const scopes = getFeatureScope(feature);
  if (scopes.customer) return customerValue;
  if (scopes.partner) return partnerValue;
  return customerValue;
}

/** Clamp report UserTypeFilter values so a denied side is never requested. */
export function constrainToFeatureScope(feature, filters = {}) {
  const scopes = getFeatureScope(feature);
  if (scopes.customer && scopes.partner) return filters;

  const next = { ...filters };
  if (scopes.customer && !scopes.partner) {
    if (next.userType === "salesRep") {
      next.userType = "admin";
      next.salesRepIds = null;
    } else if (!next.userType) {
      next.userType = "admin";
    }
    return next;
  }
  if (scopes.partner && !scopes.customer) {
    if (next.userType === "admin" || !next.userType) {
      next.userType = "salesRep";
      if (next.salesRepIds === undefined) next.salesRepIds = null;
    }
    return next;
  }
  return next;
}

export function getDefaultLandingPath() {
  if (isStoredSubAdmin() && !hasDashboardView()) {
    return SUB_ADMIN_PROFILE_PATH;
  }
  return "/";
}

function pathMatchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isAlwaysAllowedPath(pathname) {
  return ALWAYS_ALLOWED_PATHS.some((path) => pathMatchesPrefix(pathname, path));
}

/** Direct URLs to the denied Admin/customer or Local Partner side. */
const PATH_SCOPE_RULES = [
  { prefix: "/orders/quickbooks/partner", feature: "quickbooks-invoices", scope: "partner" },
  { prefix: "/orders/quickbooks/customer", feature: "quickbooks-invoices", scope: "customer" },
  { prefix: "/Quickbooks/invoices", feature: "quickbooks-invoices", scope: "customer" },
  { prefix: "/all-invoices/partner", feature: "invoice", scope: "partner" },
  { prefix: "/direct-invoices/partner", feature: "invoice", scope: "partner" },
  { prefix: "/reports/partner-commission", feature: "report", scope: "partner" },
  { prefix: "/reports/partner-credit-limit", feature: "report", scope: "partner" },
  { prefix: "/reports/unpaid-partner-balances", feature: "report", scope: "partner" },
  { prefix: "/reports/direct-partner", feature: "report", scope: "partner" },
  { prefix: "/reports/pulled-orders-receivable", feature: "report", scope: "partner" },
  { prefix: "/reports/customers", feature: "report", scope: "customer" },
];

export function canSubAdminAccessPath(pathname) {
  if (!isStoredSubAdmin()) return true;
  if (!pathname) return true;
  if (isAlwaysAllowedPath(pathname)) return true;
  if (pathname === "/") return hasPermission("dashboard_view");

  const rule = PATH_PERMISSIONS.find(({ prefix }) =>
    pathMatchesPrefix(pathname, prefix),
  );
  if (!rule) return false;
  if (!rule.permissions.some((key) => hasPermission(key))) return false;

  const scopeRule = PATH_SCOPE_RULES.find(({ prefix }) =>
    pathMatchesPrefix(pathname, prefix),
  );
  if (scopeRule && !canAccessFeatureScope(scopeRule.feature, scopeRule.scope)) {
    return false;
  }
  return true;
}
