// utils/Permission.js
export const hasPermission = (key) => {
  if (typeof window === "undefined") return true; 

  const raw = localStorage.getItem("permissions");

  if (!raw || raw === "all") return true;

  let perms = [];
  try {
    perms = JSON.parse(raw);
  } catch {
    perms = [];
  }

  return perms.includes(key);
};
