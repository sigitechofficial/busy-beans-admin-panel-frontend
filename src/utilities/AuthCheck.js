"use client";
// utilities/AuthCheck.js
import { info_toaster } from "@/utilities/Toaster";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function isPublicAuthPath(pathname) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/sign-in") ||
    pathname.includes("/forgot") ||
    pathname.includes("/verify") ||
    pathname.includes("/reset") ||
    pathname.includes("/sales-representative/stripe-account-connected")
  );
}

const logout = (router, msg = "Please login first !") => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("email");
    localStorage.removeItem("userType");
    localStorage.removeItem("userID");
    localStorage.removeItem("userName");
    localStorage.removeItem("permissions");
    localStorage.removeItem("isEmployee");
    localStorage.removeItem("isSubAdmin");
    localStorage.removeItem("employeeOf");
  } catch {}
  router.push("/sign-in");
  info_toaster(msg);
};

export const AuthCheck = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPublicAuthPath(pathname)) return;

    const token = localStorage.getItem("accessToken");
    const loggedIn = localStorage.getItem("loginStatus");
    const userType = localStorage.getItem("userType");
    const permissions = localStorage.getItem("permissions");
    const isEmployee = localStorage.getItem("isEmployee") === "true";
    const isSubAdmin = localStorage.getItem("isSubAdmin") === "true";
    const employeeOf = localStorage.getItem("employeeOf");

    if (!token || !loggedIn || !userType || !permissions) {
      return logout(router);
    }
    if (isEmployee && !employeeOf) {
      return logout(router);
    }
    if (isSubAdmin && isEmployee) {
      return logout(router);
    }
  }, [pathname, router]);
};
