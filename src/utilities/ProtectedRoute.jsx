"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthCheck } from "./AuthCheck";
import {
  canSubAdminAccessPath,
  getDefaultLandingPath,
  isStoredSubAdmin,
} from "./subAdminNav";

export default function ProtectedRoute({ children }) {
  AuthCheck();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isStoredSubAdmin()) return;
    if (canSubAdminAccessPath(pathname)) return;
    router.replace(getDefaultLandingPath());
  }, [pathname, router]);

  return children;
}
 