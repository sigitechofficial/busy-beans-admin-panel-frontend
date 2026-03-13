"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import api from "@/utilities/StatusErrorHandler";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
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
import { error_toaster } from "@/utilities/Toaster";
import { useRouter, useSearchParams } from "next/navigation";

function SalesByCustomerDetailsReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [customerIdFromUrl, setCustomerIdFromUrl] = useState(null);

  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  // Customer dropdown pagination state
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLimit] = useState(30); // Default 30 customers per load
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const customerSearchTimeoutRef = useRef(null);

  // Build customer list API endpoint
  const getCustomerListEndpoint = (page, limit, search = "") => {
    const base = "api/v1/admin/customer-management/customer-list/all";
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    }
    return `${base}?${params.toString()}`;
  };

  // Fetch customers with pagination and search
  const fetchCustomers = async (page, append = false, searchQuery = customerSearchQuery) => {
    if (customerLoading) return;
    
    setCustomerLoading(true);
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : "";
      const endpoint = getCustomerListEndpoint(page, customerLimit, searchQuery);
      
      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          feature: "customer",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
      });

      if (res?.data?.status === "success") {
        const customers = res?.data?.data?.data || res?.data?.data || [];
        const totalItems = res?.data?.pagination?.totalItems || res?.data?.data?.pagination?.totalItems || customers.length;
        const totalPages = res?.data?.pagination?.totalPages || res?.data?.data?.pagination?.totalPages || Math.ceil(totalItems / customerLimit);
        
        const newOptions = customers.map((customer) => ({
          value: customer.id,
          label: `${customer.companyName || customer.name}${
            customer.name && customer.companyName ? ` (${customer.name})` : ""
          }`,
          ...customer,
        }));

        if (append) {
          setCustomerOptions((prev) => [...prev, ...newOptions]);
          setAllCustomers((prev) => [...prev, ...customers]);
        } else {
          setCustomerOptions(newOptions);
          setAllCustomers(customers);
        }

        setCustomerHasMore(page < totalPages);
        setCustomerPage(page);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleCustomerSearchChange = (inputValue) => {
    // Clear previous timeout
    if (customerSearchTimeoutRef.current) {
      clearTimeout(customerSearchTimeoutRef.current);
    }

    // Reset to page 1 and fetch with new search query after debounce
    customerSearchTimeoutRef.current = setTimeout(() => {
      setCustomerSearchQuery(inputValue);
      setCustomerPage(1);
      setCustomerOptions([]);
      setAllCustomers([]);
      fetchCustomers(1, false, inputValue);
    }, 500); // 500ms debounce
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (customerSearchTimeoutRef.current) {
        clearTimeout(customerSearchTimeoutRef.current);
      }
    };
  }, []);

  // Get customerId and date range from URL query parameters on mount
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    if (customerId) {
      setCustomerIdFromUrl(customerId);
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
      const lastMonthStart = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
      const lastMonthEnd = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
      
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
  }, [searchParams]);

  // Auto-select customer when customerIdFromUrl is available and customers are loaded
  useEffect(() => {
    if (customerIdFromUrl && customerOptions.length > 0 && !selectedCustomer) {
      // Try to find customer in loaded options
      const existingCustomer = customerOptions.find(
        (opt) => String(opt.value) === String(customerIdFromUrl)
      );
      
      if (existingCustomer) {
        setSelectedCustomer(existingCustomer);
      } else {
        // If not found in loaded options, fetch the specific customer
        const fetchCustomerById = async () => {
          try {
            const token = typeof window !== "undefined"
              ? localStorage.getItem("token") || localStorage.getItem("accessToken")
              : "";
            
            // Fetch customer by ID directly
            const res = await axios.get(
              `${BASE_URL}api/v1/admin/view-customer-detail/${customerIdFromUrl}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  feature: "customer",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                withCredentials: true,
              }
            );

            if (res?.data?.status === "success" && res?.data?.data?.customer) {
              const customer = res.data.data.customer;
              const customerOption = {
                value: customer.id,
                label: `${customer.companyName || customer.name}${
                  customer.name && customer.companyName ? ` (${customer.name})` : ""
                }`,
                ...customer,
              };
              setSelectedCustomer(customerOption);
              // Add to options if not already there
              if (!customerOptions.find((opt) => String(opt.value) === String(customerOption.value))) {
                setCustomerOptions((prev) => [customerOption, ...prev]);
              }
            }
          } catch (error) {
            console.error("Error fetching customer by ID:", error);
          }
        };

        fetchCustomerById();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerIdFromUrl, customerOptions.length, selectedCustomer]);

  // Load initial customers
  useEffect(() => {
    fetchCustomers(1, false, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Load more customers on scroll
  const handleMenuScrollToBottom = () => {
    if (!customerLoading && customerHasMore) {
      fetchCustomers(customerPage + 1, true, customerSearchQuery);
    }
  };

  // Alternative scroll handler for menuListProps
  const handleMenuScroll = (event) => {
    const { target } = event;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    // Check if scrolled near bottom (within 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (!customerLoading && customerHasMore) {
        fetchCustomers(customerPage + 1, true, customerSearchQuery);
      }
    }
  };

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
      } else if (
        Array.isArray(filters?.salesRepIds) &&
        filters?.salesRepIds?.length > 0
      ) {
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
    if (!data?.data || !Array.isArray(data.data))
      return { rows: [], grandTotal: { quantity: 0, amount: 0 } };

    const transactions = data.data;
    let grandTotalQuantity = 0;
    let grandTotalAmount = 0;
    let grandTotalSalesPrice = 0; // Sum of all unit prices (sales prices)
    let runningBalance = 0;

    // Map transactions to rows
    let rows = transactions.map((transaction) => {
      const quantity = parseFloat(transaction.quantity || 0);
      const price = parseFloat(transaction.price || 0);
      // Calculate amount as unit price (sales price) × quantity
      const amount = quantity * price;

      grandTotalQuantity += quantity;
      grandTotalAmount += amount;
      grandTotalSalesPrice += price; // Sum of unit prices for the Amount column
      runningBalance += amount;

      return {
        id: transaction.id,
        type: "transaction",
        transactionDate:
          transaction.date ||
          transaction.transactionDate ||
          transaction.createdAt,
        transactionType:
          transaction.type === "product"
            ? "Invoice"
            : transaction.type || "Invoice",
        num:
          transaction.invoiceNumber ||
          transaction.invoiceId ||
          transaction.orderId ||
          transaction.num,
        productName: transaction.productName || "-",
        memo:
          transaction.description ||
          transaction.memo ||
          transaction.notes ||
          "-",
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

    // Recalculate totals based on filtered/sorted rows (sum of sales prices)
    const filteredTotalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
    const filteredTotalSalesPrice = rows.reduce((sum, row) => sum + row.salesPrice, 0);

    return {
      rows,
      grandTotal: {
        quantity: filteredTotalQuantity,
        amount: filteredTotalSalesPrice, // Sum of all sales prices (unit prices) from visible rows
      },
    };
  };

  const { rows, grandTotal } = processData();
  const { toggle, setToggle } = useDataContext();

  // Format date range for display (Month Year format)
  const formattedDateRange =
    dateRange.startDate && dateRange.endDate
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

  const escapeCsvCell = (val) => {
    const s = val == null ? "" : String(val);
    if (/["\n,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const handleDownloadCSV = () => {
    const dateRangeLabel =
      dateRange?.startDate && dateRange?.endDate
        ? `${dayjs(dateRange.startDate).format("MMM DD, YYYY")} - ${dayjs(dateRange.endDate).format("MMM DD, YYYY")}`
        : "";
    const filterLabel = filters?.userType
      ? filters.userType === "admin"
        ? "Admin"
        : "Local Partner"
      : "None";

    const lines = [];
    lines.push(["Date Range", dateRangeLabel].map(escapeCsvCell).join(","));
    lines.push(["Filter", filterLabel].map(escapeCsvCell).join(","));
    lines.push([]); // blank row before data
    const headers = [
      "Transaction date",
      "Transaction type",
      "Num",
      "Product/Service full name",
      "Memo/Category",
      "Quantity",
      "Amount",
    ];
    lines.push(headers.map(escapeCsvCell).join(","));
    rows.forEach((row) => {
      lines.push(
        [
          escapeCsvCell(
            row.transactionDate
              ? dayjs(row.transactionDate).format("MM/DD/YYYY")
              : ""
          ),
          escapeCsvCell(row.transactionType ?? ""),
          escapeCsvCell(row.num ?? ""),
          escapeCsvCell(row.productName ?? ""),
          escapeCsvCell(row.memo ?? ""),
          escapeCsvCell(row.quantity ?? ""),
          escapeCsvCell(row.amount ?? ""),
        ].join(",")
      );
    });
    // Add TOTAL row to match the table footer
    if (rows.length > 0 && grandTotal) {
      lines.push(
        [
          escapeCsvCell("TOTAL"),
          "",
          "",
          "",
          "",
          escapeCsvCell((grandTotal.quantity ?? 0).toFixed(2)),
          escapeCsvCell(formatUSD(grandTotal.amount ?? 0)),
        ].join(",")
      );
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-by-customer-details-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateToDetailPage = async (orderNumber) => {
    const orderId = orderNumber.replace(/^INV0*/, "");
    try {
      const res = await api.get(`api/v1/admin/order-details/${orderId}`, {
        headers: {
          feature: "orders",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const order = res.data?.data?.order;
      if ( order?.user) {
        // customer order
        if (order.type === "direct-invoice") {
          router.push(`/direct-invoices/${orderId}`);
        } else if (order.type === "regular-order") {
          router.push(`/orders/detail/${orderId}`);
        } else {
          // default
          router.push(`/direct-invoices/${orderId}`);
        }
      } else {
        // not customer order
        router.push(`/direct-invoices/${orderId}`);
      }
    } catch (error) {
      // handle error
      router.push(`/direct-invoices/${orderId}`);
    }
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
                    borderColor: state.isFocused
                      ? "#3b82f6"
                      : provided.borderColor,
                    boxShadow: state.isFocused
                      ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                      : provided.boxShadow,
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
                filterOption={() => true} // Disable client-side filtering, use server-side search
                onInputChange={handleCustomerSearchChange}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                menuListProps={{
                  onScroll: handleMenuScroll,
                }}
                isLoading={customerLoading}
                noOptionsMessage={() => customerLoading ? "Loading customers..." : "No customers found"}
                loadingMessage={() => "Loading customers..."}
                formatOptionLabel={({ label, ...rest }) => (
                  <div className="flex items-center gap-2 py-1">
                    <IoPersonOutline
                      className="text-gray-400 flex-shrink-0"
                      size={18}
                    />
                    <span className="font-inter">{label}</span>
                  </div>
                )}
              />
              {selectedCustomer && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-inter">
                    Customer selected:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedCustomer.label}
                    </span>
                  </span>
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
                Please select a customer from the dropdown above to view their
                sales details and transactions.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar and Filters */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="relative w-full max-w-md">
                  <LuSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search customer, product, or invoice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-300 outline-none focus:border-theme focus:ring-1 focus:ring-theme font-workSans font-medium text-labelColor"
                  />
                </div>
                <button
                  onClick={handleDownloadCSV}
                  disabled={rows.length === 0}
                  className="flex items-center gap-2 px-4 py-2 h-[42px] rounded-md border border-theme text-theme bg-white hover:bg-theme hover:text-white transition-colors font-workSans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download CSV
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
                        <td
                          colSpan={8}
                          className="text-center py-8 text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr
                          onClick={() => {
                            navigateToDetailPage(row.num);
                          }}
                          key={row.id}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-3 px-4 font-inter">
                            {row.transactionDate
                              ? dayjs(row.transactionDate).format("MM/DD/YYYY")
                              : "-"}
                          </td>
                          <td className="py-3 px-4 font-inter">
                            {row.transactionType || "-"}
                          </td>
                          <td className="py-3 px-4 font-inter">
                            {row.num ? row.num.toString() : "-"}
                          </td>
                          <td className="py-3 px-4 font-inter">
                            {row.productName && row.productName !== "-" ? (
                              <a
                                href="#"
                                className=""
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
                          {/* <td className="py-3 px-4 text-right font-inter">
                        {formatUSD(row.balance)}
                      </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td
                        colSpan={5}
                        className="py-4 px-4 font-inter font-bold text-gray-900"
                      >
                        TOTAL
                      </td>
                      <td className="py-4 px-4 text-right font-inter font-bold text-gray-900">
                        {grandTotal.quantity.toFixed(2)}
                      </td>
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
      {/* <UserTypeFilterModal
        visible={filterModalVisible}
        onHide={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      /> */}
    </div>
  );
}

export default function SalesByCustomerDetailsReportWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <SalesByCustomerDetailsReport />
    </Suspense>
  );
}
