"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Normalize allowed types to an array.
 */
function normalizeAllowedTypes(allowedTypes) {
  if (Array.isArray(allowedTypes)) return allowedTypes;
  if (allowedTypes == null || allowedTypes === "") return [];
  return [String(allowedTypes)];
}

/**
 * Read current user context from localStorage (once on mount).
 * - userType: "admin" | "salesRepresentative" | "supplier" | etc.
 * - partnerType: for sales rep, "direct-partner" | "dropship-partner" | etc.
 * - isEmployee: true if admin employee or sales rep employee
 */
function getStoredUserContext() {
  if (typeof window === "undefined") {
    return { userType: null, partnerType: null, isEmployee: false };
  }
  const userType = localStorage.getItem("userType");
  const partnerType = localStorage.getItem("partnerType");
  const isEmployee = localStorage.getItem("isEmployee") === "true";
  return { userType, partnerType, isEmployee };
}

/**
 * Hook: user-type guard + current user context. Runs once on mount.
 *
 * Use it to:
 * 1. Restrict a page to one or more user types (redirect if not allowed).
 * 2. Branch in the UI by userType, partnerType (direct vs dropship), and isEmployee.
 *
 * @param {string | string[] | null | undefined} [allowedTypes] - Allowed userType(s). If omitted or null, no guard (no redirect); only context is returned.
 *   Examples: "admin" | ["admin", "salesRepresentative", "supplier"]
 * @param {{ redirectIfNotAllowed?: boolean }} [options] - If true (default), navigates back when not in allowedTypes. Ignored when allowedTypes is empty.
 * @returns {{
 *   isAllowed: boolean;
 *   userType: string | null;
 *   partnerType: string | null;
 *   isEmployee: boolean;
 * }}
 *
 * @example
 * // 1) Admin only (redirect if not admin)
 * const { isAllowed, userType } = useUserType("admin");
 * if (!isAllowed) return <Loader />;
 *
 * @example
 * // 2) Multiple types: admin, sales rep, or supplier; then branch by type
 * const { isAllowed, userType, partnerType, isEmployee } = useUserType(["admin", "salesRepresentative", "supplier"]);
 * if (!isAllowed) return <Loader />;
 * // Admin employee vs sales rep employee vs supplier
 * if (userType === "admin" && isEmployee) { ... }
 * if (userType === "salesRepresentative") {
 *   if (partnerType === "direct-partner") { ... }  // direct partner
 *   if (partnerType === "dropship-partner") { ... } // dropship partner
 * }
 *
 * @example
 * // 3) No guard, only get context (conditional UI)
 * const { isAllowed, userType, partnerType, isEmployee } = useUserType();
 * // isAllowed is true; branch with userType, partnerType, isEmployee
 */
export function useUserType(allowedTypes, options = {}) {
  const { redirectIfNotAllowed = true } = options;
  const router = useRouter();
  const [state, setState] = useState({
    isAllowed: false,
    userType: null,
    partnerType: null,
    isEmployee: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { userType, partnerType, isEmployee } = getStoredUserContext();
    const allowed = normalizeAllowedTypes(allowedTypes);

    // No guard: just expose context, allow page
    if (allowed.length === 0) {
      setState({ isAllowed: true, userType, partnerType, isEmployee });
      return;
    }

    const allowedMatch = userType && allowed.includes(userType);

    if (!allowedMatch) {
      if (redirectIfNotAllowed) {
        router.back();
      }
      setState({ isAllowed: false, userType, partnerType, isEmployee });
      return;
    }

    setState({ isAllowed: true, userType, partnerType, isEmployee });
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return state;
}
