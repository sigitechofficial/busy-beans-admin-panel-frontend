"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect, Suspense } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import dayjs from "dayjs";
import { formatUSD } from "@/utilities/constants";
import { HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { MdFilterAlt } from "react-icons/md";
import UserTypeFilterModal from "@/components/ui/UserTypeFilterModal";
import { error_toaster } from "@/utilities/Toaster";
import { useRouter, useSearchParams } from "next/navigation";

function SalesByCustomerSummaryReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    userType: null,
    salesRepIds: null,
  });

  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  // Get date range and sales rep ID from URL query parameters on mount
  useEffect(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const salesRepId = searchParams.get("salesRepId");
    const userTypeParam = searchParams.get("userType");
    const salesRepIdsParam = searchParams.get("salesRepIds");

    // Auto-fill date range if provided in URL
    if (startDate && endDate) {
      setDateRange({
        startDate: startDate,
        endDate: endDate,
      });

      // Also set the selected option based on the date range
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

      if (startDate === mtdStart && endDate === mtdEnd) {
        setSelectedOption({ value: "monthToDate", label: "Month to date" });
      } else if (startDate === lastMonthStart && endDate === lastMonthEnd) {
        setSelectedOption({ value: "lastMonth", label: "Last Month" });
      } else {
        setSelectedOption({ value: "custom", label: "Custom" });
        setDisplayCustomFilters(true);
        setCustomDates({ startDate, endDate });
      }
    }

    // Parse userType and salesRepIds from URL (passed from dashboard)
    if (userTypeParam) {
      let newFilters = { userType: userTypeParam, salesRepIds: null };
      
      if (userTypeParam === "salesRep" && salesRepIdsParam) {
        try {
          const parsedIds = JSON.parse(salesRepIdsParam);
          newFilters.salesRepIds = Array.isArray(parsedIds) ? parsedIds : [parsedIds];
        } catch (e) {
          newFilters.salesRepIds = null;
        }
      }
      
      setFilters(newFilters);
    } 
    // Auto-set sales rep filter if salesRepId is provided in URL (legacy single salesRepId parameter)
    else if (salesRepId) {
      // Handle both single ID and comma-separated IDs - convert to numbers
      const salesRepIds = salesRepId.includes(",")
        ? salesRepId.split(",").map((id) => Number(id.trim()))
        : [Number(salesRepId)];

      setFilters({
        userType: "salesRep",
        salesRepIds: salesRepIds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build API URL with filters
  const buildApiUrl = () => {
    let url = `api/v1/admin/admin-reports/customer-sales-report?startDate=${dateRange?.startDate}&endDate=${dateRange?.endDate}`;

    if (filters.userType === "admin") {
      url += "&userType=admin";
    } else if (filters.userType === "salesRep") {
      if (filters.salesRepIds === null) {
        // "All" sales reps selected
        url += "&salesRep[ne]=null";
      } else if (
        Array.isArray(filters?.salesRepIds) &&
        filters?.salesRepIds?.length > 0
      ) {
        // Multiple specific sales reps - send as JSON array [2] or [3,2,4]
        url += `&salesRepId=${JSON.stringify(filters.salesRepIds)}`;
      }
    }

    return url;
  };

  const { data, isLoading } = GetAPI(buildApiUrl());

  const options = [
    { value: "allTime", label: "All Time" },
    { value: "currentYear", label: "Current year" },
    { value: "currentMonth", label: "Current Month" },
    { value: "currentWeek", label: "Current Week" },
    { value: "lastYear", label: "Last Year" },
    { value: "last90Days", label: "Last 90 days" },
    { value: "lastMonth", label: "Last Month" },
    { value: "monthToDate", label: "Month to date" },
    { value: "lastWeek", label: "Last Week" },
    { value: "custom", label: "Custom" },
  ];

  const calculateDateRange = (filterValue) => {
    const today = dayjs();
    let startDate = "";
    let endDate = "";

    switch (filterValue) {
      case "allTime":
        startDate = "2025-01-01";
        endDate = today.format("YYYY-MM-DD");
        break;
      case "currentYear":
        startDate = today.startOf("year").format("YYYY-MM-DD");
        endDate = today.endOf("year").format("YYYY-MM-DD");
        break;
      case "currentMonth":
        startDate = today.startOf("month").format("YYYY-MM-DD");
        endDate = today.endOf("month").format("YYYY-MM-DD");
        break;
      case "currentWeek":
        startDate = today.startOf("week").format("YYYY-MM-DD");
        endDate = today.endOf("week").format("YYYY-MM-DD");
        break;
      case "lastYear":
        startDate = today
          .subtract(1, "year")
          .startOf("year")
          .format("YYYY-MM-DD");
        endDate = today.subtract(1, "year").endOf("year").format("YYYY-MM-DD");
        break;
      case "last90Days":
        startDate = today.subtract(90, "days").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
        break;
      case "lastMonth":
        startDate = today
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD");
        endDate = today
          .subtract(1, "month")
          .endOf("month")
          .format("YYYY-MM-DD");
        break;
      case "monthToDate":
        startDate = today.startOf("month").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
        break;
      case "lastWeek":
        startDate = today
          .subtract(1, "week")
          .startOf("week")
          .format("YYYY-MM-DD");
        endDate = today.subtract(1, "week").endOf("week").format("YYYY-MM-DD");
        break;
      case "custom":
        break;
      default:
        startDate = "";
        endDate = "";
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    if (selectedOption.value !== "custom" && !displayCustomFilters) {
      const dates = calculateDateRange(selectedOption.value);
      setDateRange(dates);
    }
  }, [selectedOption, displayCustomFilters]);

  useEffect(() => {
    if (displayCustomFilters && customDates.startDate && customDates.endDate) {
      const start = dayjs(customDates.startDate);
      const end = dayjs(customDates.endDate);
      const today = dayjs();

      if (start.isAfter(end)) {
        error_toaster("Start date cannot be after end date.");
        return;
      }
      if (start.isAfter(today) || end.isAfter(today)) {
        error_toaster("Dates cannot be in the future.");
        return;
      }
      if (start.isBefore(dayjs("2025-01-01"))) {
        error_toaster("Start date cannot be before January 1, 2025.");
        return;
      }
      setDateRange({
        startDate: customDates.startDate,
        endDate: customDates.endDate,
      });
    }
  }, [customDates.startDate, customDates.endDate, displayCustomFilters]);

  const handleChange = (val) => {
    if (val?.value === "custom") {
      setDisplayCustomFilters(true);
    } else {
      setSelectedOption(val);
      setDisplayCustomFilters(false);
      const dates = calculateDateRange(val?.value);
      setDateRange(dates);
      setCustomDates({ startDate: "", endDate: "" });
    }
  };

  const handleCancel = () => {
    setDisplayCustomFilters(false);
    setCustomDates({ startDate: "", endDate: "" });
    setSelectedOption({
      value: "allTime",
      label: "All Time",
    });
    setDateRange(getInitialDateRange());
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleRow = (customerId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortOrder("asc");
    } else {
      setSortOrder(null);
    }
  };

  const navigateToDetailPage = (customerId) => {
    router.push(`/reports/sales-by-customer-details?customerId=${customerId}`);
  };

  // Process data to handle grouped customers
  const processData = () => {
    if (!data?.data) return { rows: [], total: 0 };

    const rows = [];
    let grandTotal = 0;

    data?.data?.forEach((item) => {
      const total = parseFloat(item?.totatSpent || 0);
      grandTotal += total;

      // Check if this customer has children (sub-customers)
      if (item.children && item.children.length > 0) {
        // Parent row
        rows.push({
          id: item.id || item.customerId,
          customer: item.customerName || item.name,
          total: total,
          isGroup: true,
          children: item.children,
        });

        // Add children if expanded
        if (expandedRows.has(item.id || item.customerId)) {
          item.children.forEach((child) => {
            const childTotal = parseFloat(child?.totatSpent || 0);
            rows.push({
              id: child.id || child.customerId,
              customer: child.customerName || child.name,
              total: childTotal,
              isGroup: false,
              isChild: true,
            });
          });
        }
      } else {
        // Regular row
        rows.push({
          id: item.id || item.customerId,
          customer: item.companyName || item.customerName,
          total: total,
          isGroup: false,
        });
      }
    });

    // Filter by search query
    let filteredRows = rows;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredRows = rows.filter((row) =>
        row.customer.toLowerCase().includes(query),
      );
    }

    // Sort if needed
    if (sortOrder) {
      filteredRows.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.total - b.total;
        } else {
          return b.total - a.total;
        }
      });
    }

    // Recalculate total based on filtered rows
    const filteredTotal = filteredRows.reduce((sum, row) => sum + row.total, 0);

    return { rows: filteredRows, total: filteredTotal };
  };

  const { rows, total } = processData();
  const { toggle, setToggle } = useDataContext();

  // Format date range for display
  const formattedDateRange =
    dateRange.startDate && dateRange.endDate
      ? (() => {
          const start = dayjs(dateRange.startDate);
          const end = dayjs(dateRange.endDate);

          // If same month and year
          if (start.month() === end.month() && start.year() === end.year()) {
            return `${start.format("MMMM D")} - ${end.format("D, YYYY")}`;
          }
          // If same year but different months
          else if (start.year() === end.year()) {
            return `${start.format("MMMM D")} - ${end.format("MMMM D, YYYY")}`;
          }
          // Different years
          else {
            return `${start.format("MMMM D, YYYY")} - ${end.format(
              "MMMM D, YYYY",
            )}`;
          }
        })()
      : "";

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Sales by Customer Summary Report
          </h2>
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <BackButton />
            {/* Date Range Display */}
            {dateRange.startDate && dateRange.endDate && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm font-inter font-medium text-gray-600">
                  Date Range:
                </span>
                <span className="text-sm font-inter font-semibold text-gray-900">
                  {dayjs(dateRange.startDate).format("MMM DD, YYYY")} -{" "}
                  {dayjs(dateRange.endDate).format("MMM DD, YYYY")}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-40">
            {displayCustomFilters ? (
              <>
                <div className="flex gap-x-2 items-center h-[42px]">
                  <div className="space-x-2">
                    <label
                      htmlFor="startDate"
                      className="text-labelColor font-workSans font-semibold"
                    >
                      Start Date:
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={customDates?.startDate}
                      onChange={handleCustomDates}
                      className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    />
                  </div>
                  <div className="space-x-2">
                    <label
                      htmlFor="endDate"
                      className="text-labelColor font-workSans font-semibold"
                    >
                      End Date:
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={customDates?.endDate}
                      onChange={handleCustomDates}
                      className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    />
                  </div>
                  <div className="h-full flex items-center gap-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-2 h-full rounded-lg border border-theme text-theme bg-white hover:text-white hover:bg-theme duration-200 group"
                    >
                      <ImCross size={24} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="font-bold">
                <Select
                  styles={drawerSelectStyles}
                  defaultValue={{ value: "allTime", label: "All Time" }}
                  placeholder="Select Year, Month, Week ..."
                  value={selectedOption ? selectedOption : null}
                  onChange={(val) => handleChange(val)}
                  options={options ? options : null}
                />
              </div>
            )}
          </div>
        </div>

        {/* User Type and Sales Rep Filter Display */}
        {filters.userType && (
          <div className="flex items-center gap-2 w-max ml-auto px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-sm font-inter font-medium text-gray-600">
              Filter:
            </span>
            <span className="text-sm font-inter font-semibold text-gray-900">
              {filters.userType === "admin" ? "Admin" : "Local Partner"}
              {filters.userType === "salesRep" &&
                filters.salesRepIds === null && <> - All</>}
              {filters.userType === "salesRep" &&
                filters.salesRepIds &&
                Array.isArray(filters.salesRepIds) &&
                filters.salesRepIds.length > 0 && (
                  <>{filters.salesRepIds.length > 1 ? "s" : ""}</>
                )}
            </span>
          </div>
        )}

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 2xl:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl 2xl:text-3xl font-inter font-bold mb-2">
              Sales by Customer Summary
            </h1>
            <p className="text-lg 2xl:text-xl font-inter font-medium text-gray-700 mb-1">
              BUSY BEAN COFFEE, INC
            </p>
            {formattedDateRange && (
              <p className="text-base 2xl:text-lg font-inter text-gray-600">
                {formattedDateRange}
              </p>
            )}
          </div>

          {/* Search Bar and Filters */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative w-full max-w-md">
              <LuSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 outline-none focus:border-theme focus:ring-1 focus:ring-theme font-workSans font-medium text-labelColor"
              />
            </div>
            {userType === "admin" && (
              <button
                onClick={() => setFilterModalVisible(true)}
                className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-theme text-theme bg-white hover:bg-theme hover:text-white transition-colors font-workSans font-medium"
              >
                <MdFilterAlt size={18} />
                Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    Company Name
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-2 ml-auto hover:text-theme transition-colors"
                    >
                      Total
                      {sortOrder === "asc" && <HiOutlineArrowUp size={18} />}
                      {sortOrder === "desc" && <HiOutlineArrowDown size={18} />}
                      {sortOrder === null && (
                        <div className="flex flex-col">
                          <HiOutlineArrowUp size={10} className="-mb-1" />
                          <HiOutlineArrowDown size={10} />
                        </div>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        navigateToDetailPage(row.id);
                      }}
                      className={`border-b border-gray-200 ${
                        row.isChild ? "bg-gray-50" : ""
                      } ${row.isGroup ? "font-semibold" : ""}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {row.isGroup && (
                            <button
                              onClick={() => toggleRow(row.id)}
                              className="text-gray-600 hover:text-theme transition-colors"
                            >
                              {expandedRows.has(row.id) ? (
                                <FaChevronDown size={14} />
                              ) : (
                                <FaChevronRight size={14} />
                              )}
                            </button>
                          )}
                          {!row.isGroup && row.isChild && (
                            <span className="w-5" /> // Spacer for alignment
                          )}
                          <span
                            className={`${
                              row.isChild
                                ? "pl-6 text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {row.customer}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-inter">
                        {formatUSD(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-4 px-4 font-inter font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {formatUSD(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <UserTypeFilterModal
        visible={filterModalVisible}
        onHide={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      />
    </div>
  );
}

export default function SalesByCustomerSummaryReportWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <SalesByCustomerSummaryReport />
    </Suspense>
  );
}
