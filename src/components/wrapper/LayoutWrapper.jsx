// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Header from "@/components/ui/Header";
import Leftbar from "@/components/ui/Leftbar";
import ProtectedRoute from "@/utilities/ProtectedRoute";
import { DataProvider } from "@/utilities/DataContext";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isLayoutDisplay =
    pathname.startsWith("/sign-in") ||
    pathname.includes("/sales-representative/stripe-account-connected") ||
    pathname.includes("/forgot") ||
    pathname.includes("/verify") ||
    pathname.includes("/reset");

  return (
    <DataProvider>
      {!isLayoutDisplay && <Header />}
      {!isLayoutDisplay && <Leftbar />}

      <section
        className={
          isLayoutDisplay
            ? ""
            : `w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] float-right clear-right relative  bg-white min-h-[calc(100vh-94px)] space-y-6 ${
                pathname !== "/" ? "pb-6" : "top-[70px] 2xl:top-[94px]"
              }`
        }
      >
        <ProtectedRoute>{children}</ProtectedRoute>
      </section>

      <ToastContainer />
    </DataProvider>
  );
}
