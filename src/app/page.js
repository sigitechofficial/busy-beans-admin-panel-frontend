"use client";
// Import new dashboard
import Dashboard2 from "./dashboard-2/page";

// Commented out old dashboard imports - keeping for reference
// import HomeCards from "@/components/ui/HomeCards";
// import HomeMiniCards from "@/components/ui/HomeMiniCards";
// import ErrorHandler from "@/utilities/ErrorHandler";
// import GetAPI from "@/utilities/GetAPI";
// import { PostAPI } from "@/utilities/PostAPI";
// import { error_toaster, success_toaster } from "@/utilities/Toaster";
// import { BASE_URL } from "@/utilities/URL";
// import axios from "axios";
// import { useEffect, useState, useRef, useMemo } from "react";
// import {
//   MdCancel,
//   MdPublic,
//   MdMap,
//   MdLocationCity,
//   MdCheckCircle,
//   MdGroups,
//   MdLocalShipping,
//   MdPeopleAlt,
//   MdAttachMoney,
//   MdTrendingUp,
//   MdListAlt,
//   MdAssignment,
//   MdAssignmentTurnedIn,
//   MdPendingActions,
// } from "react-icons/md";
// import { FaChartLine } from "react-icons/fa";
// import { loadStripe } from "@stripe/stripe-js";
// import Loader from "@/components/ui/Loader";
// import api from "@/utilities/StatusErrorHandler";
// import { hasPermission } from "@/utilities/Permission";
// import DASHBOARD from "./dashboard.testids";
// import { useTranslations } from "next-intl";
// import { formatUSD } from "@/utilities/constants";

export default function Home() {
  // Show new dashboard
  return <Dashboard2 />;

  /* COMMENTED OUT OLD DASHBOARD - KEEPING FOR REFERENCE
  const t = useTranslations("HomePage");
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var userName = localStorage.getItem("userName");
    var userID = localStorage.getItem("userID");
    var connectAccountId = localStorage.getItem("connectAccountId");
    var isAccountConnected = localStorage.getItem("isAccountConnected");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
    var url = window.location.href;
    var windowClose = window;
  }

  const [showBankRetry, setShowBankRetry] = useState(false);
  const didInitRef = useRef(false);
  ... rest of old dashboard code ...
  END OF COMMENTED OLD DASHBOARD */
}
