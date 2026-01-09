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
import { formatUSD } from "@/utilities/constants";
import dayjs from "dayjs";

export default function Dashboard2() {
  const router = useRouter();
  
  let userType, userName, userID;
  if (typeof window !== "undefined") {
    userType = localStorage.getItem("userType");
    userName = localStorage.getItem("userName");
    userID = localStorage.getItem("userID");
  }

  // Calculate date ranges for API query parameters
  const today = dayjs();
  const mtdStart = today.startOf("month").format("YYYY-MM-DD");
  const mtdEnd = today.format("YYYY-MM-DD");
  const lastMonthStart = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
  const lastMonthEnd = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");

  // Determine the base API endpoint based on user type
  // const baseEndpoint = userType === "salesRepresentative" && userID
  //   ? `api/v1/admin/dashboard/local-partner-sales/${userID}`
  //   : "api/v1/admin/dashboard/sales";

  const baseEndpoint = "api/v1/admin/dashboard/sales";

  // Construct the endpoint with query parameters
  const dashboardEndpoint = `${baseEndpoint}?mtdStart=${mtdStart}&mtdEnd=${mtdEnd}&lastMonthStart=${lastMonthStart}&lastMonthEnd=${lastMonthEnd}`;

  // Fetch sales dashboard data from the appropriate API endpoint
  const { data: salesData, isLoading: salesLoading } = GetAPI(
    dashboardEndpoint,
    `dashboard-sales-${userType || "admin"}`
  );

  // Extract data from API response
  const salesResponse = salesData?.data || {};

  // Month-to-Date Sales
  const mtdSales = {
    totalSales: parseFloat(salesResponse?.monthToDateSales?.totalSales || 0),
    orders: salesResponse?.monthToDateSales?.orders || 0,
    avgOrderValue: parseFloat(salesResponse?.monthToDateSales?.avgOrderValue || 0),
    comparison: salesResponse?.monthToDateSales?.vsLastMonthPercent !== undefined
      ? `${salesResponse.monthToDateSales.vsLastMonthPercent >= 0 ? '+' : ''}${salesResponse.monthToDateSales.vsLastMonthPercent}%`
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
    avgOrderValue: parseFloat(salesResponse?.lastMonthSales?.avgOrderValue || 0),
    status: salesResponse?.lastMonthSales?.monthClosed || "Month Closed: Completed",
  };

  // Last Month Sales by Customer
  const lastMonthSalesByCustomer = salesResponse?.lastMonthSalesByCustomer || [];

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
        id: franchisee.franchiseeId || franchisee.salesRepId || franchisee.id || null,
        salesRepId: franchisee.salesRepId || null,
        name: franchisee.franchiseeName || franchisee.territoryName || franchisee.name || "N/A",
        sales: parseFloat(franchisee.totalSales || 0),
      }))
    : [];

  // YTD Sales by Franchisee
  const ytdSalesByFranchisee = salesResponse?.ytdSalesByFranchisee || [];

  // Process YTD franchisee data
  const processedYtdFranchisees = Array.isArray(ytdSalesByFranchisee)
    ? ytdSalesByFranchisee.map((franchisee) => ({
        id: franchisee.franchiseeId || franchisee.salesRepId || franchisee.id || null,
        salesRepId: franchisee.salesRepId || null,
        name: franchisee.franchiseeName || franchisee.territoryName || franchisee.name || "N/A",
        sales: parseFloat(franchisee.totalSales || 0),
      }))
    : [];

  // Navigation handlers
  const handleCustomerClick = (customerId, isLastMonth = false) => {
    if (customerId) {
      // Both MTD and Last Month navigate to the same page, but with different date ranges
      const startDate = isLastMonth ? lastMonthStart : mtdStart;
      const endDate = isLastMonth ? lastMonthEnd : mtdEnd;
      router.push(
        `/reports/sales-by-customer-details?customerId=${customerId}&startDate=${startDate}&endDate=${endDate}`
      );
    }
  };

  const handleFranchiseeClick = (franchiseeId, salesRepId) => {
    // Navigate to sales rep detail page if salesRepId exists, otherwise use franchiseeId
    const id = salesRepId || franchiseeId;
    if (id) {
      router.push(`/sale-representative/details/${id}`);
    }
  };

  const isLoading = salesLoading;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <div className="space-y-8 pb-6">
        {/* Welcome Header - Full width, no side margins */}
        <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
          <div className="relative z-30 py-5 px-6 2xl:px-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                  Welcome, {userName || "Administrator"}.
                </h1>
                <p className="text-white font-inter">
                  Monitor your business analytics and statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content section with side margins */}
        <div className="px-6 2xl:px-12 space-y-8">
          {/* Top Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Month-to-Date Sales Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdBarChart className="text-theme" size={24} />
                Month-to-Date Sales
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatUSD(mtdSales.totalSales)}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {mtdSales.orders.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatUSD(mtdSales.avgOrderValue)}
                  </p>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className={`text-sm font-medium ${
                  parseFloat(mtdSales.comparison.replace(/[+%]/g, '')) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  vs Last Month (MTD) {parseFloat(mtdSales.comparison.replace(/[+%]/g, '')) >= 0 ? '▲' : '▼'} {mtdSales.comparison}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => router.push(`/reports/sales-by-customer-summary?startDate=${mtdStart}&endDate=${mtdEnd}`)}
                  className="text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View Report →
                </button>
              </div>
            </div>
          </div>

          {/* MTD Sales by Customer Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdPerson className="text-theme" size={24} />
                MTD Sales by Customer
              </h3>
            </div>
            <div>
              {processedMtdCustomers.length > 0 ? (
                processedMtdCustomers.map((customer, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCustomerClick(customer.id, false)}
                    className={`flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors ${
                      customer.id ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="text-gray-700 font-medium">
                      {customer.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-semibold">
                        {formatUSD(customer.sales)}
                      </span>
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No customer data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Last Month Sales Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdCalendarToday className="text-theme" size={24} />
                Last Month Sales
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatUSD(lastMonthSales.totalSales)}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {lastMonthSales.orders.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatUSD(lastMonthSales.avgOrderValue)}
                  </p>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-700 font-medium">
                  {lastMonthSales.status}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => router.push(`/reports/sales-by-customer-summary?startDate=${lastMonthStart}&endDate=${lastMonthEnd}`)}
                  className="text-sm text-theme hover:underline font-medium cursor-pointer"
                >
                  View Report →
                </button>
              </div>
            </div>
          </div>

          {/* Last Month Sales by Customer Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdGroups className="text-theme" size={24} />
                Last Month Sales by Customer
              </h3>
            </div>
            <div>
              {processedLastMonthCustomers.length > 0 ? (
                processedLastMonthCustomers.map((customer, idx) => (
                  <div
                    key={idx}
                    onClick={() => customer.id && handleCustomerClick(customer.id, true)}
                    className={`flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors ${
                      customer.id ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="text-gray-700 font-medium">
                      {customer.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-semibold">
                        {formatUSD(customer.sales)}
                      </span>
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No customer data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row Cards - Only show for admin */}
        {userType === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MTD Sales by Franchisee Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdBusiness className="text-theme" size={24} />
                MTD Sales by Franchisee
              </h3>
            </div>
            <div className="space-y-3">
              {processedMtdFranchisees.length > 0 ? (
                processedMtdFranchisees.map((franchisee, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFranchiseeClick(franchisee.id, franchisee.salesRepId)}
                    className={`flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors ${
                      franchisee.id ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="text-gray-700 font-medium">
                      {franchisee.name}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {formatUSD(franchisee.sales)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No franchisee data available</p>
              )}
            </div>
          </div>

          {/* YTD Sales by Franchisee Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MdBarChart className="text-theme" size={24} />
                YTD Sales by Franchisee
              </h3>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-600 font-medium">
                Fiscal Year to Date →
              </p>
            </div>
            <div className="space-y-3">
              {processedYtdFranchisees.length > 0 ? (
                processedYtdFranchisees.map((franchisee, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFranchiseeClick(franchisee.id, franchisee.salesRepId)}
                    className={`flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors ${
                      franchisee.id ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="text-gray-700 font-medium">
                      {franchisee.name}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {formatUSD(franchisee.sales)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No franchisee data available</p>
              )}
            </div>
          </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

