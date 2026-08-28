import { hasPermission } from "@/utilities/Permission";

export const SUB_ADMIN_PROFILE_PATH = "/sub-admin-profile";

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
    permissions: ["partner-orders_view", "orders_view"],
  },
  { prefix: "/orders", permissions: ["orders_view", "customer-orders_view"] },
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
  { prefix: "/create-invoice", permissions: ["invoice_view"] },
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

export function hasDashboardView() {
  return hasPermission("dashboard_view");
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

export function canSubAdminAccessPath(pathname) {
  if (!isStoredSubAdmin()) return true;
  if (!pathname) return true;
  if (isAlwaysAllowedPath(pathname)) return true;
  if (pathname === "/") return hasPermission("dashboard_view");

  const rule = PATH_PERMISSIONS.find(({ prefix }) =>
    pathMatchesPrefix(pathname, prefix),
  );
  if (!rule) return false;
  return rule.permissions.some((key) => hasPermission(key));
}
