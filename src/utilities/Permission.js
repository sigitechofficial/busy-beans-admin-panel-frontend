// utils/Permission.js
export const hasPermission = (key) => {
  if (typeof window === "undefined") return true;

  const raw = localStorage.getItem("permissions");

  if (raw === "all") return true;
  if (!raw) return false;

  try {
    const perms = JSON.parse(raw);
    return Array.isArray(perms) && perms.includes(key);
  } catch {
    return false;
  }
};
