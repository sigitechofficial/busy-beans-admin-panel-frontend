"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import dayjs from "dayjs";
import { formatUSD } from "@/utilities/constants";
import { HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import { LuSearch } from "react-icons/lu";
import { MdFilterAlt } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoPersonOutline } from "react-icons/io5";
import UserTypeFilterModal from "@/components/ui/UserTypeFilterModal";

export default function SalesByCustomerDetailsReport() {
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    userType: null,
    salesRepIds: null,
  });
  const [sortConfig, setSortConfig] = useState({
    field: null,
    order: null, // 'asc' or 'desc'
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD")
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  // Fetch customers list
  const { data: customersData } = GetAPI("api/v1/admin/customer-management/customer-list/all");
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    if (customersData?.data?.data) {
      const options = customersData.data.data.map((customer) => ({
        value: customer.id,
        label: `${customer.companyName || customer.name}${customer.name && customer.companyName ? ` (${customer.name})` : ""}`,
        ...customer
      }));
      setCustomerOptions(options);
    }
  }, [customersData]);

  // Build API URL with filters - only if customer is selected
  const buildApiUrl = () => {
    // Don't build URL if no customer is selected
    if (!selectedCustomer?.value) {
      return null;
    }

    // Include userId as part of the endpoint path
    let url = `api/v1/admin/admin-reports/customer-detail-report/${selectedCustomer.value}?startDate=${dateRange?.startDate}&endDate=${dateRange?.endDate}`;
    
    if (filters.userType === "admin") {
      url += "&userType=admin";
    } else if (filters.userType === "salesRep") {
      if (filters.salesRepIds === null) {
        // "All" sales reps selected
        url += "&salesRep[ne]=null";
      } else if (Array.isArray(filters?.salesRepIds) && filters?.salesRepIds?.length > 0) {
        // Multiple specific sales reps - send as array string
        const salesRepIdsArray = JSON.stringify(filters.salesRepIds);
        url += `&salesRepId=${salesRepIdsArray}`;
      }
    }
    
    return url;
  };

  // Always call GetAPI hook (React hooks must be called unconditionally)
  // Pass null when no customer is selected, which GetAPI handles gracefully
  const apiUrl = buildApiUrl();
  const { data, isLoading } = GetAPI(apiUrl);

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
        startDate = today.subtract(1, "year").startOf("year").format("YYYY-MM-DD");
        endDate = today.subtract(1, "year").endOf("year").format("YYYY-MM-DD");
        break;
      case "last90Days":
        startDate = today.subtract(90, "days").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
        break;
      case "lastMonth":
        startDate = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
        endDate = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
        break;
      case "monthToDate":
        startDate = today.startOf("month").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
        break;
      case "lastWeek":
        startDate = today.subtract(1, "week").startOf("week").format("YYYY-MM-DD");
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

  // Removed toggleRow function as we're displaying flat array of transactions

  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.order === "asc") {
          return { field, order: "desc" };
        } else if (prev.order === "desc") {
          return { field: null, order: null };
        }
      }
      return { field, order: "asc" };
    });
  };

  // Process data - handle flat array of transactions
  const processData = () => {
    if (!data?.data || !Array.isArray(data.data)) return { rows: [], grandTotal: { quantity: 0, amount: 0 } };

    const transactions = data.data;
    let grandTotalQuantity = 0;
    let grandTotalAmount = 0;
    let runningBalance = 0;

    // Map transactions to rows
    let rows = transactions.map((transaction) => {
      const quantity = parseFloat(transaction.quantity || 0);
      const price = parseFloat(transaction.price || 0);
      // Calculate amount as unit price (sales price) × quantity
      const amount = quantity * price;
      
      grandTotalQuantity += quantity;
      grandTotalAmount += amount;
      runningBalance += amount;

      return {
        id: transaction.id,
        type: "transaction",
        transactionDate: transaction.date || transaction.transactionDate || transaction.createdAt,
        transactionType: transaction.type === "product" ? "Invoice" : transaction.type || "Invoice",
        num: transaction.invoiceNumber || transaction.invoiceId || transaction.orderId || transaction.num,
        productName: transaction.productName || "-",
        memo: transaction.description || transaction.memo || transaction.notes || "-",
        quantity,
        salesPrice: price, // Unit price
        amount, // Calculated as salesPrice × quantity
        balance: runningBalance,
      };
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      rows = rows.filter((row) => {
        return (
          row.productName?.toLowerCase().includes(query) ||
          row.memo?.toLowerCase().includes(query) ||
          row.num?.toString().toLowerCase().includes(query) ||
          row.transactionType?.toLowerCase().includes(query)
        );
      });
    }

    // Sort transactions
    if (sortConfig.field && sortConfig.order) {
      rows.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];

        if (sortConfig.field === "transactionDate") {
          aVal = dayjs(aVal).valueOf();
          bVal = dayjs(bVal).valueOf();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        // Handle null/undefined values
        if (aVal == null) aVal = "";
        if (bVal == null) bVal = "";

        if (sortConfig.order === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return {
      rows,
      grandTotal: {
        quantity: grandTotalQuantity,
        amount: grandTotalAmount,
      },
    };
  };

  const { rows, grandTotal } = processData();
  const { toggle, setToggle } = useDataContext();

  // Format date range for display (Month Year format)
  const formattedDateRange = dateRange.startDate && dateRange.endDate
    ? (() => {
        const start = dayjs(dateRange.startDate);
        const end = dayjs(dateRange.endDate);
        
        // If same month and year, show "Month Year"
        if (start.month() === end.month() && start.year() === end.year()) {
          return start.format("MMMM YYYY");
        }
        // If same year but different months
        else if (start.year() === end.year()) {
          return `${start.format("MMMM")} - ${end.format("MMMM YYYY")}`;
        }
        // Different years
        else {
          return `${start.format("MMMM YYYY")} - ${end.format("MMMM YYYY")}`;
        }
      })()
    : "";

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return (
        <div className="flex flex-col">
          <HiOutlineArrowUp size={10} className="-mb-1" />
          <HiOutlineArrowDown size={10} />
        </div>
      );
    }
    if (sortConfig.order === "asc") {
      return <HiOutlineArrowUp size={18} />;
    }
    return <HiOutlineArrowDown size={18} />;
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Sales by Customer Details
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
                <span className="text-sm font-inter font-medium text-gray-600">Date Range:</span>
                <span className="text-sm font-inter font-semibold text-gray-900">
                  {dayjs(dateRange.startDate).format("MMM DD, YYYY")} - {dayjs(dateRange.endDate).format("MMM DD, YYYY")}
                </span>
              </div>
            )}
          </div>
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

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 2xl:p-12">
          {/* Customer Selection Section - Prominent */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="max-w-md">
              <label className="text-sm font-inter font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <HiOutlineUserGroup className="text-theme" size={20} />
                Select Customer
              </label>
              <Select
                styles={{
                  ...drawerSelectStyles,
                  control: (provided, state) => ({
                    ...provided,
                    minHeight: "52px",
                    borderRadius: "8px",
                    borderColor: state.isFocused ? "#3b82f6" : provided.borderColor,
                    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : provided.boxShadow,
                    "&:hover": {
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    },
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#9ca3af",
                    fontSize: "15px",
                  }),
                }}
                placeholder="Search and select a customer to view their details..."
                value={selectedCustomer}
                onChange={(val) => setSelectedCustomer(val)}
                options={customerOptions}
                isClearable
                isSearchable
                noOptionsMessage={() => "No customers found"}
                loadingMessage={() => "Loading customers..."}
                formatOptionLabel={({ label, ...rest }) => (
                  <div className="flex items-center gap-2 py-1">
                    <IoPersonOutline className="text-gray-400 flex-shrink-0" size={18} />
                    <span className="font-inter">{label}</span>
                  </div>
                )}
              />
              {selectedCustomer && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-inter">Customer selected: <span className="font-semibold text-gray-900">{selectedCustomer.label}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl 2xl:text-3xl font-inter font-bold mb-2">
              Sales by Customer Details
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

          {/* Show placeholder if no customer selected */}
          {!selectedCustomer ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4">
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-inter font-semibold text-gray-700 mb-2">
                Select Customer to View Report
              </h3>
              <p className="text-base font-inter text-gray-500 max-w-md">
                Please select a customer from the dropdown above to view their sales details and transactions.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar and Filters */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="relative w-full max-w-md">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search customer, product, or invoice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 outline-none focus:border-theme focus:ring-1 focus:ring-theme font-workSans font-medium text-labelColor"
                  />
                </div>
                <button
                  onClick={() => setFilterModalVisible(true)}
                  className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-theme text-theme bg-white hover:bg-theme hover:text-white transition-colors font-workSans font-medium"
                >
                  <MdFilterAlt size={18} />
                  Filters
                </button>
              </div>

              {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("transactionDate")}
                      className="flex items-center gap-2 hover:text-theme transition-colors"
                    >
                      Transaction date
                      {getSortIcon("transactionDate")}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("transactionType")}
                      className="flex items-center gap-2 hover:text-theme transition-colors"
                    >
                      Transaction type
                      {getSortIcon("transactionType")}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("num")}
                      className="flex items-center gap-2 hover:text-theme transition-colors"
                    >
                      Num
                      {getSortIcon("num")}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("productName")}
                      className="flex items-center gap-2 hover:text-theme transition-colors"
                    >
                      Product/Service full name
                      {getSortIcon("productName")}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-inter font-semibold text-gray-900">
                    Memo/Category
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("quantity")}
                      className="flex items-center gap-2 ml-auto hover:text-theme transition-colors"
                    >
                      Quantity
                      {getSortIcon("quantity")}
                    </button>
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort("salesPrice")}
                      className="flex items-center gap-2 ml-auto hover:text-theme transition-colors"
                    >
                      Sales price
                      {getSortIcon("salesPrice")}
                    </button>
                  </th>
                  <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    Amount
                  </th>
                  {/* <th className="text-right py-4 px-4 font-inter font-semibold text-gray-900">
                    Balance
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-inter">
                        {row.transactionDate
                          ? dayjs(row.transactionDate).format("MM/DD/YYYY")
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-inter">{row.transactionType || "-"}</td>
                      <td className="py-3 px-4 font-inter">{row.num ? row.num.toString() : "-"}</td>
                      <td className="py-3 px-4 font-inter">
                        {row.productName && row.productName !== "-" ? (
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-800 underline"
                            onClick={(e) => {
                              e.preventDefault();
                              // Handle product click
                            }}
                          >
                            {row.productName}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 font-inter text-gray-700">
                        {row.memo && row.memo !== "-" ? row.memo : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-inter">
                        {row.quantity.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-inter">
                        {formatUSD(row.salesPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-inter">
                        {formatUSD(row.amount)}
                      </td>
                      {/* <td className="py-3 px-4 text-right font-inter">
                        {formatUSD(row.balance)}
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={5} className="py-4 px-4 font-inter font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {grandTotal.quantity.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900"></td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                    {formatUSD(grandTotal.amount)}
                  </td>
                  <td className="py-4 px-4 text-right font-inter font-bold text-gray-900"></td>
                </tr>
              </tfoot>
            </table>
          </div>
            </>
          )}
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
