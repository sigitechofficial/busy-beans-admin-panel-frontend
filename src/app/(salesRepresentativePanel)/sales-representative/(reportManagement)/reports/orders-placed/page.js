"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import dayjs from "dayjs";
import { error_toaster } from "@/utilities/Toaster";

export default function UnpaidPartnerBalance() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD")
    };
  };
  
  const [dateRange, setDateRange] = useState(getInitialDateRange());

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

  // Build API URL with pagination, search, and date filters
  const buildApiUrl = () => {
    const baseUrl = `api/v1/admin/sales-rep-reports/orders-placed-report/${userID}`;
    const params = new URLSearchParams();
    params.set("startDate", dateRange?.startDate || "");
    params.set("endDate", dateRange?.endDate || "");
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    return `${baseUrl}?${params.toString()}`;
  };

  const apiUrl = buildApiUrl();

  const { data, isLoading } = GetAPI(apiUrl);

  const options = [
    { value: "allTime", label: "All Time" },
    { value: "currentYear", label: "Current Year" },
    { value: "currentMonth", label: "Current Month" },
    { value: "currentWeek", label: "Current Week" },
    { value: "lastYear", label: "Last Year" },
    { value: "last90Days", label: "Last 90 days" },
    { value: "lastMonth", label: "Last Month" },
    { value: "lastWeek", label: "Last Week" },
    { value: "custom", label: "Custom" },
  ];

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "invoiceNumber", header: "Invoice #", sort: true },
    { field: "customerName", header: "Customer Name" },
    { field: "productNames", header: "Product" },
    { field: "productsSellingPrice", header: "Selling Price" },
    { field: "productsWholesalePrice", header: "Wholesale Price" },
    { field: "commission", header: "Partner Profits" },
    { field: "orderDate", header: "Order Date" },
    { field: "orderCurrentStatus", header: "Order Status" },
    { field: "shippingCharges", header: "Shipping Charges" },
    { field: "totalBill", header: "Total bill" },
  ];

  const datas = [];
  data?.data?.data?.map((report, i) =>
    datas.push({
      sl: i + 1,
      invoiceNumber: report?.invoiceNumber,
      customerName: report?.customerName,
      productNames: report?.productNames,
      productsSellingPrice: `$${report?.productsSellingPrice ?? 0}`,
      productsWholesalePrice: `$${report?.productsWholesalePrice}`,
      commission: `$${
        report?.productsSellingPrice - report?.productsWholesalePrice
      }`,
      orderDate: report?.orderDate,
      orderCurrentStatus: report?.orderCurrentStatus,
      shippingCharges: `$${report?.shippingCharges}`,
      totalBill: `$${report?.totalBill}`,
    })
  );

  useEffect(() => {
    if (selectedOption.value !== "custom" && !displayCustomFilters) {
      const dates = calculateDateRange(selectedOption.value);
      setDateRange(dates);
      setPage(1); // Reset to first page when date filter changes
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
      setPage(1); // Reset to first page when custom date range changes
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
    setPage(1); // Reset to first page when canceling filters
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl font-inter font-semibold">
          Orders Placed Report
        </h2>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <BackButton />
            {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Orders Placed Report
            </h2> */}
          </div>
          <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex gap-x-2 items-center h-[42px]">
                <div className=" space-x-2">
                  <label
                    htmlFor="startDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    Start Date:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDates?.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="space-x-2">
                  <label
                    htmlFor="endDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    End Date:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDates?.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
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

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by invoice number, company name..."}
            pagination={true}
            serverPagination={{
              page: data?.pagination?.page || data?.data?.pagination?.page || page,
              limit: data?.pagination?.limit || data?.data?.pagination?.limit || limit,
              totalRecords: data?.pagination?.totalItems || data?.data?.pagination?.totalItems || 0,
              totalPages: data?.pagination?.totalPages || data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1); // Reset to first page when search changes
            }}
            search={true}
          />
        </div>
      </div>
    </div>
  );
}
