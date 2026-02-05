"use client";

import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import {
  MdBarChart,
  MdPerson,
  MdCalendarToday,
  MdGroups,
  MdBusiness,
} from "react-icons/md";
import { MdFilterAlt } from "react-icons/md";
import { formatUSD } from "@/utilities/constants";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";
import UserTypeFilterModal from "@/components/ui/UserTypeFilterModal";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { BASE_URL, STRIPE_PUBLIC_KEY } from "@/utilities/URL";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { loadStripe } from "@stripe/stripe-js";
import api from "@/utilities/StatusErrorHandler";

export default function Dashboard2() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    userType: null,
    salesRepIds: null,
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showBankRetry, setShowBankRetry] = useState(false);
  const [linking, setLinking] = useState(false);
  const [bankConnected, setBankConnected] = useState(null);
  const partnerChecksDoneRef = useRef(false);

  let userType,
    userName,
    userID,
    connectAccountId,
    isAccountConnected,
    isEmployee,
    url;
  if (typeof window !== "undefined") {
    userType = localStorage.getItem("userType");
    userName = localStorage.getItem("userName");
    userID = localStorage.getItem("userID");
    connectAccountId = localStorage.getItem("connectAccountId");
    isAccountConnected = localStorage.getItem("isAccountConnected");
    isEmployee = localStorage.getItem("isEmployee") === "true";
    url = window.location.href;
  }

  // Calculate date ranges for API query parameters
  const today = dayjs();
  const mtdStart = today.startOf("month").format("YYYY-MM-DD");
  const mtdEnd = today.format("YYYY-MM-DD");
  const lastMonthStart = today
    .subtract(1, "month")
    .startOf("month")
    .format("YYYY-MM-DD");
  const lastMonthEnd = today
    .subtract(1, "month")
    .endOf("month")
    .format("YYYY-MM-DD");
  const ytdStart = today.startOf("year").format("YYYY-MM-DD");
  const ytdEnd = today.format("YYYY-MM-DD");

  // Determine the base API endpoint based on user type
  // const baseEndpoint = userType === "salesRepresentative" && userID
  //   ? `api/v1/admin/dashboard/local-partner-sales/${userID}`
  //   : "api/v1/admin/dashboard/sales";

  const baseEndpoint = "api/v1/admin/dashboard/sales";

  // Construct the endpoint with query parameters including filters
  let dashboardEndpoint = `${baseEndpoint}?mtdStart=${mtdStart}&mtdEnd=${mtdEnd}&lastMonthStart=${lastMonthStart}&lastMonthEnd=${lastMonthEnd}`;

  // Add filter parameters if set
  if (filters.userType === "admin") {
    dashboardEndpoint += "&userType=admin";
  } else if (filters.userType === "salesRep") {
    if (filters.salesRepIds === null) {
      // "All" sales reps selected
      dashboardEndpoint += "&salesRep[ne]=null";
    } else if (
      Array.isArray(filters?.salesRepIds) &&
      filters?.salesRepIds?.length > 0
    ) {
      // For dashboard: pass single value instead of array
      const salesRepId = filters.salesRepIds[0];
      dashboardEndpoint += `&salesRepId=${salesRepId}`;
    }
  }

  // Fetch sales dashboard data from the appropriate API endpoint
  const { data: salesData, isLoading: salesLoading } = GetAPI(
    dashboardEndpoint,
    `dashboard-sales-${userType || "admin"}`
  );

  // Fetch sales reps list to get partner names
  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");

  // Partner profile (for bank account status) – only when partner
  const partnerProfileUrl =
    userType === "salesRepresentative" && userID
      ? `api/v1/admin/sales-rep/${userID}`
      : "";
  const { data: partnerProfile } = GetAPI(
    partnerProfileUrl,
    partnerProfileUrl ? `partner-profile-${userID}` : "partner-profile-skip"
  );
  const isBankConnected =
    bankConnected !== null
      ? bankConnected
      : !!partnerProfile?.data?.defaultBankAccount;

  // Partner-only: Stripe account status + bank check on first load
  useEffect(() => {
    if (userType !== "salesRepresentative" || isEmployee || !userID) return;
    if (partnerChecksDoneRef.current) return;
    partnerChecksDoneRef.current = true;

    const stripeAccountStatus = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : "";
        const res = await api.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-retrieve/${userID}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (res?.data?.status === "success") {
          localStorage.setItem("isAccountConnected", "true");
        } else {
          throw new Error(res?.data?.message || "Failed to retrieve account.");
        }
      } catch (error) {
        try {
          const path = url.split("/");
          const fallback = await PostAPI(
            `api/v1/admin/stripe-connect-account-url/${userID}`,
            { returnUrl: "https://" + path[2].trim() }
          );
          if (
            fallback?.data?.status === "success" &&
            fallback?.data?.data?.data?.connectAccount
          ) {
            const link = document.createElement("a");
            link.href = fallback?.data?.data?.data?.connectAccount;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          }
        } catch (fallbackErr) {
          ErrorHandler(fallbackErr);
        }
      }
    };

    const checkBankStatus = async () => {
      try {
        const res = await api.get(
          BASE_URL + `api/v1/admin/sales-rep/${userID}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setBankConnected(!!res?.data?.data?.defaultBankAccount);
      } catch {
        setBankConnected(false);
      }
    };

    stripeAccountStatus();
    checkBankStatus();
  }, [userType, userID, isEmployee, url]);

  const handleConnectAccount = async () => {
    if (typeof window === "undefined") return;
    const path = url.split("/");
    if (isAccountConnected === "false" && connectAccountId !== "null") {
      try {
        const res = await PostAPI(
          `api/v1/admin/stripe-connect-account-url/${userID}`,
          { returnUrl: "https://" + path[2].trim() }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          if (res?.data?.data?.data?.connectAccount) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.connectAccount;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (
      (connectAccountId === "null" || !connectAccountId) &&
      isAccountConnected === "false"
    ) {
      try {
        const res = await PostAPI(
          `api/v1/admin/create-stripe-connect-account/${userID}`,
          { returnUrl: "https://" + path[2].trim() }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          localStorage.setItem(
            "connectAccountId",
            res?.data?.data?.data?.accountId
          );
          if (res?.data?.data?.data?.accountLink?.url) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.accountLink?.url;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (
      (connectAccountId !== "null" || connectAccountId) &&
      isAccountConnected === "true"
    ) {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : "";
        const res = await api.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-dashboard/${userID}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          if (res?.data?.data?.data?.connectAccount) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.connectAccount;
            link.target = "_blank";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }
  };

  const handleFinancialConnection = async () => {
    if (linking) return;
    setLinking(true);
    try {
      const res = await api.post(
        BASE_URL + `api/v1/admin/create-bank-setup-intent/sales-rep/${userID}`
      );
      const clientSecret = res?.data?.data?.clientSecret;

      if (!clientSecret) {
        success_toaster("Your bank account is already connected");
        setBankConnected(true);
        return;
      }

      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!stripe) {
        error_toaster("Stripe failed to load");
        return;
      }

      const result = await stripe.collectBankAccountForSetup({
        clientSecret,
        params: {
          payment_method_type: "us_bank_account",
          payment_method_data: {
            billing_details: {
              name: `${userName}`,
            },
          },
        },
      });

      if (result.setupIntent.status === "requires_confirmation") {
        const confirmedIntent = await stripe.confirmSetup({
          clientSecret,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        });
        if (confirmedIntent.error) {
          throw new Error(confirmedIntent.error.message);
        }
        if (confirmedIntent.setupIntent.status !== "succeeded") {
          throw new Error("SetupIntent not confirmed successfully.");
        }
      }

      if (
        !result ||
        result?.error ||
        !result?.setupIntent?.id ||
        !result?.setupIntent?.payment_method
      ) {
        error_toaster("User cancelled or did not complete linking.");
        setShowBankRetry(true);
        return;
      }

      const attachRes = await PostAPI(
        `api/v1/admin/attach-bank-account-setup/sales-rep/${userID}`,
        {
          setupIntentId: result?.setupIntent?.id,
          paymentMethodId: result?.setupIntent?.payment_method,
        }
      );

      if (attachRes?.data?.status === "success") {
        setShowBankRetry(false);
        setBankConnected(true);
        success_toaster("Bank account linked successfully!");
        window.location.reload();
      } else {
        error_toaster("Failed to attach bank account. Please try again.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setLinking(false);
    }
  };

  // Extract data from API response
  const salesResponse = salesData?.data || {};

  // Month-to-Date Sales
  const mtdSales = {
    totalSales: parseFloat(salesResponse?.monthToDateSales?.totalSales || 0),
    orders: salesResponse?.monthToDateSales?.orders || 0,
    avgOrderValue: parseFloat(
      salesResponse?.monthToDateSales?.avgOrderValue || 0
    ),
    comparison:
      salesResponse?.monthToDateSales?.vsLastMonthPercent !== undefined
        ? `${
            salesResponse.monthToDateSales.vsLastMonthPercent >= 0 ? "+" : ""
          }${salesResponse.monthToDateSales.vsLastMonthPercent}%`
        : "+0%",
  };

  // MTD Sales by Customer
  const mtdSalesByCustomer = salesResponse?.mtdSalesByCustomer || [];

  // Process customer data to ensure proper format
  const processedMtdCustomers = Array.isArray(mtdSalesByCustomer)
    ? mtdSalesByCustomer.slice(0, 5).map((customer) => ({
        id: customer.customerId || customer.id || null,
        name: customer.customerName || "N/A",
        sales: parseFloat(customer.totalSales || 0),
      }))
    : [];

  // Last Month Sales
  const lastMonthSales = {
    totalSales: parseFloat(salesResponse?.lastMonthSales?.totalSales || 0),
    orders: salesResponse?.lastMonthSales?.orders || 0,
    avgOrderValue: parseFloat(
      salesResponse?.lastMonthSales?.avgOrderValue || 0
    ),
    status:
      salesResponse?.lastMonthSales?.monthClosed || "Month Closed: Completed",
  };

  // Last Month Sales by Customer
  const lastMonthSalesByCustomer =
    salesResponse?.lastMonthSalesByCustomer || [];

  // Process last month customer data
  const processedLastMonthCustomers = Array.isArray(lastMonthSalesByCustomer)
    ? lastMonthSalesByCustomer.slice(0, 5).map((customer) => ({
        id: customer.customerId || customer.id || null,
        name: customer.customerName || "N/A",
        sales: parseFloat(customer.totalSales || 0),
      }))
    : [];

  // MTD Sales by Franchisee
  const mtdSalesByFranchisee = salesResponse?.mtdSalesByFranchisee || [];

  // Process franchisee data
  const processedMtdFranchisees = Array.isArray(mtdSalesByFranchisee)
    ? mtdSalesByFranchisee.map((franchisee) => ({
        id:
          franchisee.franchiseeId ||
          franchisee.salesRepId ||
          franchisee.id ||
          null,
        salesRepId: franchisee.salesRepId || null,
        name:
          franchisee.franchiseeName ||
          franchisee.territoryName ||
          franchisee.name ||
          "N/A",
        sales: parseFloat(franchisee.totalSales || 0),
      }))
    : [];

  // YTD Sales by Franchisee
  const ytdSalesByFranchisee = salesResponse?.ytdSalesByFranchisee || [];

  // Process YTD franchisee data
  const processedYtdFranchisees = Array.isArray(ytdSalesByFranchisee)
    ? ytdSalesByFranchisee.map((franchisee) => ({
        id:
          franchisee.franchiseeId ||
          franchisee.salesRepId ||
          franchisee.id ||
          null,
        salesRepId: franchisee.salesRepId || null,
        name:
          franchisee.franchiseeName ||
          franchisee.territoryName ||
          franchisee.name ||
          "N/A",
        sales: parseFloat(franchisee.totalSales || 0),
      }))
    : [];

  // MTD Sales by Product
  const mtdSalesByProduct = salesResponse?.mtdSalesByProduct || [];

  // Process MTD product data
  const processedMtdProducts = Array.isArray(mtdSalesByProduct)
    ? mtdSalesByProduct.slice(0, 5).map((product) => ({
        id: product.productId || product.id || null,
        name: product.productName || "N/A",
        quantity: product.totalQuantity || 0,
        sales: parseFloat(product.totalSales || 0),
      }))
    : [];

  // YTD Sales by Product
  const ytdSalesByProduct = salesResponse?.ytdSalesByProduct || [];

  // Process YTD product data
  const processedYtdProducts = Array.isArray(ytdSalesByProduct)
    ? ytdSalesByProduct.slice(0, 5).map((product) => ({
        id: product.productId || product.id || null,
        name: product.productName || "N/A",
        quantity: product.totalQuantity || 0,
        sales: parseFloat(product.totalSales || 0),
      }))
    : [];

  // MTD Sales by Employee
  const mtdSalesByEmployee = salesResponse?.mtdSalesByEmployee || [];

  // Process MTD employee data
  const processedMtdEmployees = Array.isArray(mtdSalesByEmployee)
    ? mtdSalesByEmployee.slice(0, 5).map((employee) => ({
        id: employee.employeeId || employee.id || null,
        name: employee.employeeName || "N/A",
        email: employee.employeeEmail || "N/A",
        orders: employee.totalOrders || 0,
        sales: parseFloat(employee.totalSales || 0),
      }))
    : [];

  // YTD Sales by Employee
  const ytdSalesByEmployee = salesResponse?.ytdSalesByEmployee || [];

  // Process YTD employee data
  const processedYtdEmployees = Array.isArray(ytdSalesByEmployee)
    ? ytdSalesByEmployee.slice(0, 5).map((employee) => ({
        id: employee.employeeId || employee.id || null,
        name: employee.employeeName || "N/A",
        email: employee.employeeEmail || "N/A",
        orders: employee.totalOrders || 0,
        sales: parseFloat(employee.totalSales || 0),
      }))
    : [];

  // Navigation handlers
  const handleCustomerClick = (customerId, isLastMonth = false) => {
    if (customerId) {
      // Both MTD and Last Month navigate to the same page, but with different date ranges
      const startDate = isLastMonth ? lastMonthStart : mtdStart;
      const endDate = isLastMonth ? lastMonthEnd : mtdEnd;
      const basePath =
        userType === "salesRepresentative"
          ? "/sales-representative/sales-by-customer-details"
          : "/reports/sales-by-customer-details";
      let url = `${basePath}?customerId=${customerId}&startDate=${startDate}&endDate=${endDate}`;

      // Add userType and salesRepIds filters if applied (for admin)
      if (filters.userType) {
        url += `&userType=${filters.userType}`;
      }
      if (
        filters.userType === "salesRep" &&
        Array.isArray(filters.salesRepIds) &&
        filters.salesRepIds.length > 0
      ) {
        url += `&salesRepIds=${JSON.stringify(filters.salesRepIds)}`;
      }

      router.push(url);
    }
  };

  const handleFranchiseeClick = (
    franchiseeId,
    salesRepId,
    startDate,
    endDate
  ) => {
    // Navigate to sales-by-customer-summary with sales rep filter
    const repId = salesRepId || franchiseeId;
    if (repId) {
      let url = `/reports/sales-by-customer-summary?startDate=${startDate}&endDate=${endDate}&salesRepId=${repId}`;

      // Add userType and salesRepIds filters if applied
      if (filters.userType) {
        url += `&userType=${filters.userType}`;
      }
      if (
        filters.userType === "salesRep" &&
        Array.isArray(filters.salesRepIds) &&
        filters.salesRepIds.length > 0
      ) {
        url += `&salesRepIds=${JSON.stringify(filters.salesRepIds)}`;
      }

      router.push(url);
    }
  };

  const handleProductClick = (productId, startDate, endDate) => {
    if (productId) {
      const basePath =
        userType === "salesRepresentative"
          ? "/sales-representative/product-wise-sales-summary"
          : "/reports/product-wise-sales-summary";
      let url = `${basePath}?startDate=${startDate}&endDate=${endDate}&productId=${productId}`;

      // Add userType and salesRepIds filters if applied
      if (filters.userType) {
        url += `&userType=${filters.userType}`;
      }
      if (
        filters.userType === "salesRep" &&
        Array.isArray(filters.salesRepIds) &&
        filters.salesRepIds.length > 0
      ) {
        url += `&salesRepIds=${JSON.stringify(filters.salesRepIds)}`;
      }

      router.push(url);
    }
  };

  const handleViewAll = (reportType, startDate, endDate) => {
    let url = "";

    if (reportType === "customers") {
      const basePath =
        userType === "salesRepresentative"
          ? "/sales-representative/sales-by-customer-summary"
          : "/reports/sales-by-customer-summary";
      url = `${basePath}?startDate=${startDate}&endDate=${endDate}`;
    } else if (reportType === "products") {
      const basePath =
        userType === "salesRepresentative"
          ? "/sales-representative/product-wise-sales-summary"
          : "/reports/product-wise-sales-summary";
      url = `${basePath}?startDate=${startDate}&endDate=${endDate}`;
    }

    // Add userType and salesRepIds filters if applied
    if (filters.userType) {
      url += `&userType=${filters.userType}`;
    }
    if (
      filters.userType === "salesRep" &&
      Array.isArray(filters.salesRepIds) &&
      filters.salesRepIds.length > 0
    ) {
      url += `&salesRepIds=${JSON.stringify(filters.salesRepIds)}`;
    }

    router.push(url);
  };

  const handleFilterApply = (newFilters) => {
    // Validate: if salesRep is selected, at least one salesRepId must be selected
    if (
      newFilters.userType === "salesRep" &&
      (!Array.isArray(newFilters.salesRepIds) ||
        newFilters.salesRepIds.length === 0)
    ) {
      // Don't apply the filter - require partner selection
      return;
    }

    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  // Get partner name by ID
  const getPartnerName = (partnerId) => {
    if (!salesRepData?.data?.data || !partnerId) return partnerId;
    const partner = salesRepData.data.data.find((rep) => rep.id === partnerId);
    return partner ? partner.srName || partner.name : partnerId;
  };

  const isLoading = salesLoading;

  if (isLoading) {
    return <Loader />;
  }

  const isPartner = userType === "salesRepresentative" && !isEmployee;
  const showStripeBanner =
    isPartner &&
    (isAccountConnected === "false" || connectAccountId === "null");
  const showBankBanner = isPartner && isBankConnected === false;

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="space-y-5 sm:space-y-8 pb-4 sm:pb-6">
        <div className="-mb-8">
          {/* Partner: Stripe account not connected */}
          {showStripeBanner && (
            <div className="bg-red-500 z-10 text-center text-white py-2 px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>Your Stripe account is not connected.</span>
              <button
                onClick={handleConnectAccount}
                className="px-2 py-1 rounded-lg font-inter font-medium bg-theme text-white hover:opacity-90"
              >
                {connectAccountId !== "null" &&
                connectAccountId &&
                isAccountConnected === "true"
                  ? "Stripe Dashboard"
                  : connectAccountId === "null" || !connectAccountId
                  ? "Connect Account"
                  : "Complete Account Registration"}
              </button>
            </div>
          )}
          {/* Partner: Bank account not connected */}
          {showBankBanner && (
            <div className="bg-amber-600 z-10 text-center text-white py-2 px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>Your bank account is not linked for payouts.</span>
              <button
                onClick={handleFinancialConnection}
                disabled={linking}
                className="px-2 py-1 rounded-lg font-inter font-medium bg-white text-amber-700 hover:opacity-90 disabled:opacity-50"
              >
                {linking ? "Linking…" : "Link Bank Account"}
              </button>
            </div>
          )}

          {/* Bank retry modal (partner closed popup without completing) */}
          {isPartner && showBankRetry && (
            <div className="bg-amber-100 border border-amber-400 text-amber-800 py-2 px-4 rounded flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>Bank linking was not completed.</span>
              <button
                onClick={() => {
                  setShowBankRetry(false);
                  handleFinancialConnection();
                }}
                className="px-2 py-1 rounded-lg font-inter font-medium bg-amber-600 text-white hover:opacity-90"
              >
                Try again
              </button>
            </div>
          )}
        </div>
        {/* Welcome Header - below md (768px): button wraps below, left-aligned */}
        <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
          <div className="relative z-30 py-5 px-6 2xl:px-12">
            <div className="flex flex-col gap-3 items-start md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                  Welcome, {userName || "Administrator"}.
                </h1>
                <p className="text-white font-inter">
                  Monitor your business analytics and statistics
                </p>
              </div>

              {/* Filter Section - Only visible for admin; below md: wraps below, left-aligned */}
              {userType === "admin" && (
                <button
                  onClick={() => setFilterModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-white text-white font-workSans font-medium hover:bg-white/10 transition-colors shrink-0"
                >
                  <MdFilterAlt size={18} />
                  {!filters.userType
                    ? "All"
                    : filters.userType === "admin"
                    ? "Admin"
                    : `${getPartnerName(filters.salesRepIds?.[0])}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content section with side margins - responsive padding */}
        <div className="px-3 sm:px-6 2xl:px-12 space-y-5 sm:space-y-8 max-w-full min-w-0">
          {/* Top Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Month-to-Date Sales Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdBarChart
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">Month-to-Date Sales</span>
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-all">
                    {formatUSD(mtdSales.totalSales)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Sales
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-3 border-t">
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800">
                      {mtdSales.orders.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800 break-all">
                      {formatUSD(mtdSales.avgOrderValue)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Avg Order Value
                    </p>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t">
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      parseFloat(mtdSales.comparison.replace(/[+%]/g, "")) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    vs Last Month (MTD){" "}
                    {parseFloat(mtdSales.comparison.replace(/[+%]/g, "")) >= 0
                      ? "▲"
                      : "▼"}{" "}
                    {mtdSales.comparison}
                  </p>
                </div>
                <div className="pt-1.5 sm:pt-2">
                  <button
                    onClick={() => {
                      const basePath =
                        userType === "salesRepresentative"
                          ? "/sales-representative/sales-by-customer-summary"
                          : "/reports/sales-by-customer-summary";
                      let url = `${basePath}?startDate=${mtdStart}&endDate=${mtdEnd}`;

                      // Add userType and salesRepIds filters if applied (for admin)
                      if (filters.userType) {
                        url += `&userType=${filters.userType}`;
                      }
                      if (
                        filters.userType === "salesRep" &&
                        Array.isArray(filters.salesRepIds) &&
                        filters.salesRepIds.length > 0
                      ) {
                        url += `&salesRepIds=${JSON.stringify(
                          filters.salesRepIds
                        )}`;
                      }

                      router.push(url);
                    }}
                    className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                  >
                    View Report →
                  </button>
                </div>
              </div>
            </div>

            {/* MTD Sales by Customer Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdPerson
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">MTD Sales by Customer</span>
                </h3>
              </div>
              <div className="min-w-0">
                {processedMtdCustomers.length > 0 ? (
                  processedMtdCustomers.map((customer, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCustomerClick(customer.id, false)}
                      className={`flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0 ${
                        customer.id ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <span className="text-gray-700 font-medium text-sm sm:text-base truncate min-w-0">
                        {customer.name}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <span className="text-gray-900 font-semibold text-sm sm:text-base whitespace-nowrap">
                          {formatUSD(customer.sales)}
                        </span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-4">
                    No customer data available
                  </p>
                )}
              </div>
              <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                <button
                  onClick={() => {
                    const basePath =
                      userType === "salesRepresentative"
                        ? "/sales-representative/sales-by-customer-summary"
                        : "/reports/sales-by-customer-summary";
                    let url = `${basePath}?startDate=${mtdStart}&endDate=${mtdEnd}`;

                    // Add userType and salesRepIds filters if applied (for admin)
                    if (filters.userType) {
                      url += `&userType=${filters.userType}`;
                    }
                    if (
                      filters.userType === "salesRep" &&
                      Array.isArray(filters.salesRepIds) &&
                      filters.salesRepIds.length > 0
                    ) {
                      url += `&salesRepIds=${JSON.stringify(
                        filters.salesRepIds
                      )}`;
                    }

                    router.push(url);
                  }}
                  className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View Report →
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Last Month Sales Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdCalendarToday
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">Last Month Sales</span>
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-all">
                    {formatUSD(lastMonthSales.totalSales)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Sales
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-3 border-t">
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800">
                      {lastMonthSales.orders.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800 break-all">
                      {formatUSD(lastMonthSales.avgOrderValue)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Avg Order Value
                    </p>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    {lastMonthSales.status}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const basePath =
                        userType === "salesRepresentative"
                          ? "/sales-representative/sales-by-customer-summary"
                          : "/reports/sales-by-customer-summary";
                      let url = `${basePath}?startDate=${lastMonthStart}&endDate=${lastMonthEnd}`;

                      // Add userType and salesRepIds filters if applied (for admin)
                      if (filters.userType) {
                        url += `&userType=${filters.userType}`;
                      }
                      if (
                        filters.userType === "salesRep" &&
                        Array.isArray(filters.salesRepIds) &&
                        filters.salesRepIds.length > 0
                      ) {
                        url += `&salesRepIds=${JSON.stringify(
                          filters.salesRepIds
                        )}`;
                      }

                      router.push(url);
                    }}
                    className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                  >
                    View Report →
                  </button>
                </div>
              </div>
            </div>

            {/* Last Month Sales by Customer Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdGroups
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">Last Month Sales by Customer</span>
                </h3>
              </div>
              <div className="min-w-0">
                {processedLastMonthCustomers.length > 0 ? (
                  processedLastMonthCustomers.map((customer, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        customer.id && handleCustomerClick(customer.id, true)
                      }
                      className={`flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0 ${
                        customer.id ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <span className="text-gray-700 font-medium text-sm sm:text-base truncate min-w-0">
                        {customer.name}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <span className="text-gray-900 font-semibold text-sm sm:text-base whitespace-nowrap">
                          {formatUSD(customer.sales)}
                        </span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                    No customer data available
                  </p>
                )}
              </div>
              <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                <button
                  onClick={() => {
                    const basePath =
                      userType === "salesRepresentative"
                        ? "/sales-representative/sales-by-customer-summary"
                        : "/reports/sales-by-customer-summary";
                    let url = `${basePath}?startDate=${lastMonthStart}&endDate=${lastMonthEnd}`;

                    // Add userType and salesRepIds filters if applied (for admin)
                    if (filters.userType) {
                      url += `&userType=${filters.userType}`;
                    }
                    if (
                      filters.userType === "salesRep" &&
                      Array.isArray(filters.salesRepIds) &&
                      filters.salesRepIds.length > 0
                    ) {
                      url += `&salesRepIds=${JSON.stringify(
                        filters.salesRepIds
                      )}`;
                    }

                    router.push(url);
                  }}
                  className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View Report →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row Cards - Only show for admin */}
          {userType === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* MTD Sales by Franchisee Card */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                    <MdBusiness
                      className="text-theme shrink-0"
                      size={20}
                      style={{ minWidth: 20 }}
                    />
                    <span className="truncate">MTD Sales by Franchisee</span>
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  {processedMtdFranchisees.length > 0 ? (
                    processedMtdFranchisees.map((franchisee, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          handleFranchiseeClick(
                            franchisee.id,
                            franchisee.salesRepId,
                            mtdStart,
                            mtdEnd
                          )
                        }
                        className={`flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0 ${
                          franchisee.id ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <span className="text-gray-700 font-medium text-sm sm:text-base truncate min-w-0">
                          {franchisee.name}
                        </span>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                          {formatUSD(franchisee.sales)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                      No franchisee data available
                    </p>
                  )}
                </div>
                <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                  <button
                    onClick={() => handleViewAll("customers", mtdStart, mtdEnd)}
                    className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>

              {/* YTD Sales by Franchisee Card */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                    <MdBarChart
                      className="text-theme shrink-0"
                      size={20}
                      style={{ minWidth: 20 }}
                    />
                    <span className="truncate">YTD Sales by Franchisee</span>
                  </h3>
                </div>
                <div className="mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Fiscal Year to Date →
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  {processedYtdFranchisees.length > 0 ? (
                    processedYtdFranchisees.map((franchisee, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          handleFranchiseeClick(
                            franchisee.id,
                            franchisee.salesRepId,
                            ytdStart,
                            ytdEnd
                          )
                        }
                        className={`flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0 ${
                          franchisee.id ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <span className="text-gray-700 font-medium text-sm sm:text-base truncate min-w-0">
                          {franchisee.name}
                        </span>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                          {formatUSD(franchisee.sales)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                      No franchisee data available
                    </p>
                  )}
                </div>
                <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                  <button
                    onClick={() => handleViewAll("customers", ytdStart, ytdEnd)}
                    className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Row Cards - Sales by Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* MTD Sales by Product Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdBarChart
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">MTD Sales by Product</span>
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3 min-w-0">
                {processedMtdProducts.length > 0 ? (
                  processedMtdProducts.map((product, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleProductClick(product.id, mtdStart, mtdEnd)
                      }
                      className="flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors cursor-pointer min-w-0"
                    >
                      <div className="min-w-0">
                        <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {product.quantity}
                        </p>
                      </div>
                      <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                        {formatUSD(product.sales)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                    No product data available
                  </p>
                )}
              </div>
              <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                <button
                  onClick={() => handleViewAll("products", mtdStart, mtdEnd)}
                  className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* YTD Sales by Product Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                  <MdBarChart
                    className="text-theme shrink-0"
                    size={20}
                    style={{ minWidth: 20 }}
                  />
                  <span className="truncate">YTD Sales by Product</span>
                </h3>
              </div>
              <div className="mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Fiscal Year to Date →
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3 min-w-0">
                {processedYtdProducts.length > 0 ? (
                  processedYtdProducts.map((product, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleProductClick(product.id, ytdStart, ytdEnd)
                      }
                      className="flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors cursor-pointer min-w-0"
                    >
                      <div className="min-w-0">
                        <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {product.quantity}
                        </p>
                      </div>
                      <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                        {formatUSD(product.sales)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                    No product data available
                  </p>
                )}
              </div>
              <div className="pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
                <button
                  onClick={() => handleViewAll("products", ytdStart, ytdEnd)}
                  className="text-xs sm:text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>
          </div>

          {/* Sales by Employee Row - Only show for admin */}
          {userType === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* MTD Sales by Employee Card */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                    <MdPerson
                      className="text-theme shrink-0"
                      size={20}
                      style={{ minWidth: 20 }}
                    />
                    <span className="truncate">MTD Sales by Employee</span>
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  {processedMtdEmployees.length > 0 ? (
                    processedMtdEmployees.map((employee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0"
                      >
                        <div className="min-w-0">
                          <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
                            {employee.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {employee.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Orders: {employee.orders}
                          </p>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                          {formatUSD(employee.sales)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                      No employee data available
                    </p>
                  )}
                </div>
              </div>

              {/* YTD Sales by Employee Card */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                    <MdPerson
                      className="text-theme shrink-0"
                      size={20}
                      style={{ minWidth: 20 }}
                    />
                    <span className="truncate">YTD Sales by Employee</span>
                  </h3>
                </div>
                <div className="mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Fiscal Year to Date →
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  {processedYtdEmployees.length > 0 ? (
                    processedYtdEmployees.map((employee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 py-2 sm:py-3 border-b last:border-b-0 hover:bg-gray-50 px-1 sm:px-2 rounded transition-colors min-w-0"
                      >
                        <div className="min-w-0">
                          <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
                            {employee.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {employee.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Orders: {employee.orders}
                          </p>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base shrink-0 whitespace-nowrap">
                          {formatUSD(employee.sales)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm py-3 sm:py-4">
                      No employee data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <UserTypeFilterModal
        visible={filterModalVisible}
        onHide={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
        allowMultiSelect={false}
      />
    </div>
  );
}
