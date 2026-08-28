import { hasPermission } from "@/utilities/Permission";

export const SUB_ADMIN_PROFILE_PATH = "/sub-admin-profile";

export function isStoredSubAdmin() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isSubAdmin") === "true";
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
