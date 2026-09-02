"use client";
import { useEffect, useState } from "react";
import Dashboard2 from "./dashboard-2/page";
import SupplierDashboard from "@/components/ui/SupplierDashboard";
import Loader from "@/components/ui/Loader";

export default function Home() {
  const [userType, setUserType] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
    setReady(true);
  }, []);

  if (!ready) {
    return <Loader />;
  }

  if (userType === "supplier") {
    return <SupplierDashboard />;
  }

  return <Dashboard2 />;
}
