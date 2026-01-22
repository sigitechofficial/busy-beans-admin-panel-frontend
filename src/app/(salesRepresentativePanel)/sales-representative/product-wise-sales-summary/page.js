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
import { LuSearch } from "react-icons/lu";
import { MdFilterAlt } from "react-icons/md";
import UserTypeFilterModal from "@/components/ui/UserTypeFilterModal";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { error_toaster } from "@/utilities/Toaster";
import { useSearchParams } from "next/navigation";

function ProductWiseSalesSummaryReport() {
  const searchParams = useSearchParams();
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }

  // Initialize productId from URL params immediately
  const initialProductId = searchParams.get("productId");

  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    userType: null,
    salesRepIds: null,
  });
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);

  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  // Get date range and productId from URL query parameters on mount
  useEffect(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const productId = searchParams.get("productId");
    const userTypeParam = searchParams.get("userType");
    const salesRepIdsParam = searchParams.get("salesRepIds");

    // Set productId if provided in URL
    if (productId) {
      setSelectedProductId(productId);
    }

    // Parse userType and salesRepIds from URL
    if (userTypeParam) {
      let newFilters = { ...filters, userType: userTypeParam };
      
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
      const ytdStart = today.startOf("year").format("YYYY-MM-DD");
      const ytdEnd = today.format("YYYY-MM-DD");

      if (startDate === mtdStart && endDate === mtdEnd) {
        setSelectedOption({ value: "monthToDate", label: "Month to date" });
      } else if (startDate === lastMonthStart && endDate === lastMonthEnd) {
        setSelectedOption({ value: "lastMonth", label: "Last Month" });
      } else if (startDate === ytdStart && endDate === ytdEnd) {
        setSelectedOption({ value: "currentYear", label: "Current year" });
      } else {
        setSelectedOption({ value: "custom", label: "Custom" });
        setDisplayCustomFilters(true);
        setCustomDates({ startDate, endDate });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build API URL with filters
  const buildApiUrl = () => {
    let url = `api/v1/admin/admin-reports/category-wise-product-sales-report?startDate=${dateRange?.startDate}&endDate=${dateRange?.endDate}`;

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

    // Add productId if selected (check both state and URL params)
    const productId = selectedProductId || searchParams.get("productId");
    if (productId) {
      url += `&productId=${productId}`;
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
      // Validate date range
      const start = dayjs(customDates.startDate);
      const end = dayjs(customDates.endDate);
      const today = dayjs();
      const minDate = dayjs("2025-01-01");

      if (start.isAfter(end)) {
        error_toaster("Start date cannot be after end date");
        return;
      }
      if (start.isAfter(today) || end.isAfter(today)) {
        error_toaster("Dates cannot be in the future");
        return;
      }
      if (start.isBefore(minDate) || end.isBefore(minDate)) {
        error_toaster("Dates cannot be before January 1, 2025");
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

  const toggleRow = (categoryId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedRows(newExpanded);
  };

  // Process data to handle grouped products/services by category
  const processData = () => {
    if (!data?.data || !Array.isArray(data.data)) {
      return {
        rows: [],
        grandTotal: {
          quantity: 0,
          amount: 0,
          cogs: 0,
          grossMargin: 0,
          grossMarginPercent: 0,
        },
      };
    }

    const rows = [];
    let grandTotalQuantity = 0;
    let grandTotalAmount = 0;
    let grandTotalCOGS = 0;
    let grandTotalGrossMargin = 0;

    data.data.forEach((category) => {
      if (!category) return;

      const categoryId =
        category.categoryId ||
        category.id ||
        category.name ||
        `category-${Math.random()}`;
      const categoryName =
        category.categoryName || category.name || "Unnamed Category";
      const items = Array.isArray(category.items)
        ? category.items
        : Array.isArray(category.products)
          ? category.products
          : [];

      let categoryQuantity = 0;
      let categoryAmount = 0;
      let categoryCOGS = 0;
      let categoryGrossMargin = 0;

      // Calculate category totals
      items.forEach((item) => {
        if (!item) return;

        const quantity = parseFloat(item.quantity || 0) || 0;
        const amount = parseFloat(item.amount || item.totalAmount || 0) || 0;
        const cogs = parseFloat(item.cogs || item.costOfGoodsSold || 0) || 0;
        const grossMargin = amount - cogs;

        categoryQuantity += quantity;
        categoryAmount += amount;
        categoryCOGS += cogs;
        categoryGrossMargin += grossMargin;
      });

      // Category header row
      rows.push({
        id: `category-${categoryId}`,
        type: "category-header",
        categoryName: categoryName,
        categoryId,
        isExpanded: expandedRows.has(categoryId),
      });

      // Item rows (if expanded)
      if (expandedRows.has(categoryId)) {
        items.forEach((item) => {
          if (!item) return;

          const quantity = parseFloat(item.quantity || 0) || 0;
          const amount = parseFloat(item.amount || item.totalAmount || 0) || 0;
          const cogs = parseFloat(item.cogs || item.costOfGoodsSold || 0) || 0;
          const grossMargin = amount - cogs;
          const avgPrice = quantity > 0 ? amount / quantity : 0;

          rows.push({
            id: item.id || item.productId || `item-${Math.random()}`,
            type: "item",
            categoryId,
            productName: item.productName || item.name || "Unnamed Product",
            quantity,
            amount,
            avgPrice,
            cogs,
            grossMargin,
            grossMarginPercent: amount > 0 ? (grossMargin / amount) * 100 : 0,
          });
        });
      }

      // Category total row
      const categoryAvgPrice =
        categoryQuantity > 0 ? categoryAmount / categoryQuantity : 0;
      rows.push({
        id: `total-${categoryId}`,
        type: "category-total",
        categoryName: `Total ${categoryName}`,
        categoryId,
        quantity: categoryQuantity,
        amount: categoryAmount,
        avgPrice: categoryAvgPrice,
        cogs: categoryCOGS,
        grossMargin: categoryGrossMargin,
        grossMarginPercent:
          categoryAmount > 0 ? (categoryGrossMargin / categoryAmount) * 100 : 0,
      });

      grandTotalQuantity += categoryQuantity;
      grandTotalAmount += categoryAmount;
      grandTotalCOGS += categoryCOGS;
      grandTotalGrossMargin += categoryGrossMargin;
    });

    // Add any top-level items (not in categories)
    if (
      data.data &&
      (data.data.topLevelItems || data.data.uncategorizedItems)
    ) {
      const topLevelItems = Array.isArray(data.data.topLevelItems)
        ? data.data.topLevelItems
        : Array.isArray(data.data.uncategorizedItems)
          ? data.data.uncategorizedItems
          : [];

      topLevelItems.forEach((item) => {
        if (!item) return;

        const quantity = parseFloat(item.quantity || 0) || 0;
        const amount = parseFloat(item.amount || item.totalAmount || 0) || 0;
        const cogs = parseFloat(item.cogs || item.costOfGoodsSold || 0) || 0;
        const grossMargin = amount - cogs;
        const avgPrice = quantity > 0 ? amount / quantity : 0;

        rows.push({
          id: item.id || item.productId || `item-${Math.random()}`,
          type: "item",
          categoryId: null,
          productName: item.productName || item.name || "Unnamed Product",
          quantity,
          amount,
          avgPrice,
          cogs,
          grossMargin,
          grossMarginPercent: amount > 0 ? (grossMargin / amount) * 100 : 0,
        });

        grandTotalQuantity += quantity;
        grandTotalAmount += amount;
        grandTotalCOGS += cogs;
        grandTotalGrossMargin += grossMargin;
      });
    }

    // Filter by search query
    let filteredRows = rows;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredRows = rows.filter((row) => {
        if (row.type === "category-header" || row.type === "category-total") {
          return row.categoryName?.toLowerCase().includes(query);
        }
        return row.productName?.toLowerCase().includes(query);
      });
    }

    return {
      rows: filteredRows,
      grandTotal: {
        quantity: grandTotalQuantity,
        amount: grandTotalAmount,
        cogs: grandTotalCOGS,
        grossMargin: grandTotalGrossMargin,
        grossMarginPercent:
          grandTotalAmount > 0
            ? (grandTotalGrossMargin / grandTotalAmount) * 100
            : 0,
      },
    };
  };

  const { rows, grandTotal } = processData();
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

  // Calculate % of sales for each row
  const getPercentOfSales = (amount) => {
    const totalAmount = grandTotal?.amount || 0;
    if (totalAmount === 0) return 0;
    return ((amount || 0) / totalAmount) * 100;
  };

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
            Product wise sales summary
          </h2>
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* Filter Section */}
        <div className="flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-2">
            {userType === "admin" && (
              <button
                onClick={() => setFilterModalVisible(true)}
                className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-theme text-theme bg-white hover:bg-theme hover:text-white transition-colors font-workSans font-medium"
              >
                <MdFilterAlt size={18} />
                Filters
              </button>
            )}
            <div className="min-w-40">
            {displayCustomFilters ? (
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
        </div>

        {/* User Type and Sales Rep Filter Display */}
        <div className="flex items-center gap-2 flex-wrap w-max ml-auto">
          {filters.userType && (
            <div className="flex items-center gap-2 w-max px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
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
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 2xl:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl 2xl:text-3xl font-inter font-bold mb-2">
              Sales by Product/Service Summary
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
                placeholder="Search product or category..."
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
                    Product/Category Name
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    QUANTITY
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    AMOUNT
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    % OF SALES
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    AVG PRICE
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    COGS
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    GROSS MARGIN
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    GROSS MARGIN %
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    if (row.type === "category-header") {
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-gray-200 bg-gray-50 font-semibold"
                        >
                          <td colSpan={8} className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRow(row.categoryId)}
                                className="text-gray-600 hover:text-theme transition-colors"
                              >
                                {row.isExpanded ? (
                                  <FaChevronDown size={14} />
                                ) : (
                                  <FaChevronRight size={14} />
                                )}
                              </button>
                              <span className="text-gray-900">
                                {row.categoryName}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (row.type === "category-total") {
                      return (
                        <tr
                          key={row.id}
                          className="border-b-2 border-gray-300 bg-gray-100 font-semibold"
                        >
                          <td className="py-3 px-4 text-gray-900 font-semibold">
                            {row.categoryName}
                          </td>
                          <td className="py-3 px-4 text-right font-inter">
                            {(row.quantity || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-inter font-semibold">
                            {formatUSD(row.amount || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-inter font-semibold">
                            {getPercentOfSales(row.amount || 0).toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-right font-inter">
                            {formatUSD(row.avgPrice || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-inter">
                            {formatUSD(row.cogs || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-inter">
                            {formatUSD(row.grossMargin || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-inter">
                            {(row.grossMarginPercent || 0).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    }

                    // Item row
                    const isSelectedProduct =
                      selectedProductId &&
                      String(row.id) === String(selectedProductId);
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-200 ${
                          isSelectedProduct
                            ? "bg-blue-100 hover:bg-blue-150"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`py-3 px-4 font-inter pl-8 ${
                            isSelectedProduct
                              ? "text-blue-900 font-semibold"
                              : "text-gray-900"
                          }`}
                        >
                          {row.productName || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {(row.quantity || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {formatUSD(row.amount || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {getPercentOfSales(row.amount || 0).toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {formatUSD(row.avgPrice || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {formatUSD(row.cogs || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {formatUSD(row.grossMargin || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-inter">
                          {row.grossMarginPercent != null
                            ? `${(row.grossMarginPercent || 0).toFixed(2)}%`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td className="py-4 px-4 font-inter font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {(grandTotal.quantity || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {formatUSD(grandTotal.amount || 0)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    100.00%
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {(grandTotal.quantity || 0) > 0
                      ? formatUSD(
                          (grandTotal.amount || 0) / (grandTotal.quantity || 1),
                        )
                      : formatUSD(0)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {formatUSD(grandTotal.cogs || 0)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {formatUSD(grandTotal.grossMargin || 0)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {(grandTotal.grossMarginPercent || 0).toFixed(2)}%
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

export default function ProductWiseSalesSummaryReportWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <ProductWiseSalesSummaryReport />
    </Suspense>
  );
}
