"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import { PULLED_ORDERS_RECEIVABLE_REPORT } from "../report.testid";
import dayjs from "dayjs";
import { formatUSD } from "@/utilities/constants";
import { error_toaster, success_toaster } from "@/utilities/Toaster";

export default function PulledOrdersReceivableReport() {
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });

  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);

  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  };

  const [dateRange, setDateRange] = useState(getInitialDateRange());

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedSalesRep, setSelectedSalesRep] = useState({
    value: "all",
    label: "All Local Partners",
  });

  const { data: salesRepData } = GetAPI("api/v1/admin/sales-rep");

  const salesRepOptions = [
    { value: "all", label: "All Local Partners" },
    ...(salesRepData?.data?.data
      ? salesRepData.data.data.map((rep) => ({
          value: rep.id,
          label: rep.srName || rep.name || `Sales Rep ${rep.id}`,
        }))
      : []),
  ];

  const buildApiUrl = () => {
    const baseUrl = "api/v1/admin/admin-reports/pulled-orders-receivable";
    const params = new URLSearchParams();
    params.set("startDate", dateRange?.startDate || "");
    params.set("endDate", dateRange?.endDate || "");
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (selectedSalesRep?.value && selectedSalesRep.value !== "all") {
      params.set("salesRepId", String(selectedSalesRep.value));
    }
    return `${baseUrl}?${params.toString()}`;
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

  const columns = [
    { field: "sl", header: "SL", sort: true, minWidth: "6rem" },
    { field: "invoiceNumber", header: "Invoice #", sort: true },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "companyName", header: "Customer (Company)" },
    { field: "salesRepName", header: "Local Partner" },
    { field: "totalBill", header: "Total Bill", sort: true },
    { field: "adminReceivableAmount", header: "Admin Receivable", sort: true },
    { field: "localPatnerCommission", header: "Partner Commission", sort: true },
    { field: "pulloutIntentDisplay", header: "Pullout Intent ID", minWidth: "16rem" },
    { field: "pulloutDate", header: "Pullout Date", sort: true },
    { field: "paymentStatus", header: "Payment Status" },
  ];

  const formatPulloutDate = (val) => {
    if (val === null || val === undefined || val === "") return "-";
    const asNumber = Number(val);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return dayjs(asNumber).format("MM/DD/YYYY");
    }
    const parsed = dayjs(val);
    return parsed.isValid() ? parsed.format("MM/DD/YYYY") : "-";
  };

  const handleCopyIntentId = (intentId) => {
    if (!intentId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(intentId)
        .then(() => success_toaster("Intent ID copied"))
        .catch(() => error_toaster("Failed to copy"));
    }
  };

  const rawRows = Array.isArray(data?.data) ? data.data : [];

  const datas = rawRows.map((report, i) => {
    const intentId = report?.effectivePulloutIntentId || "";
    return {
      id: report?.id ?? i,
      sl: (page - 1) * limit + i + 1,
      invoiceNumber: report?.invoiceNumber || "-",
      orderDate: report?.on ? dayjs(report.on).format("MM/DD/YYYY") : "-",
      companyName: report?.companyName || "-",
      salesRepName: report?.salesRepName || "-",
      totalBill: formatUSD(parseFloat(report?.totalBill) || 0),
      adminReceivableAmount: formatUSD(
        parseFloat(report?.adminReceivableAmount) || 0,
      ),
      localPatnerCommission: formatUSD(
        parseFloat(report?.localPatnerCommission) || 0,
      ),
      pulloutIntentDisplay: intentId ? (
        <button
          type="button"
          onClick={() => handleCopyIntentId(intentId)}
          className="font-mono text-xs text-theme hover:underline truncate max-w-[14rem]"
          title={`Click to copy: ${intentId}`}
        >
          {intentId}
        </button>
      ) : (
        "-"
      ),
      pulloutDate: formatPulloutDate(report?.pulloutDate),
      paymentStatus: report?.paymentStatus || "-",
    };
  });

  useEffect(() => {
    if (selectedOption.value !== "custom" && !displayCustomFilters) {
      const dates = calculateDateRange(selectedOption.value);
      setDateRange(dates);
      setPage(1);
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
      setPage(1);
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
      setPage(1);
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
    setPage(1);
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  const handleSalesRepChange = (val) => {
    setSelectedSalesRep(val);
    setPage(1);
  };

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.headerBar}
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2
            className="text-xl font-inter font-semibold"
            data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.title}
          >
            Pulled Orders Receivable Report
          </h2>
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div
          className="flex items-center justify-between flex-wrap gap-y-3"
          data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.filterSection}
        >
          <div className="flex items-center gap-x-4 flex-wrap gap-y-3">
            <BackButton />
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

            <div className="min-w-[220px]">
              <Select
                styles={drawerSelectStyles}
                value={selectedSalesRep}
                onChange={handleSalesRepChange}
                options={salesRepOptions}
                placeholder="Filter by Local Partner"
                data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.salesRepSelect}
              />
            </div>
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
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.filterStartDate}
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
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.filterEndDate}
                  />
                </div>
                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-theme text-theme bg-white hover:text-white hover:bg-theme duration-200 group"
                    data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.filterClearBtn}
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
                  data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.filterSelect}
                />
              </div>
            )}
          </div>
        </div>

        <div data-testid={PULLED_ORDERS_RECEIVABLE_REPORT.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by invoice, company, intent ID..."}
            pagination={true}
            search={true}
            serverPagination={{
              page: data?.pagination?.page || page,
              limit: data?.pagination?.limit || limit,
              totalRecords: data?.pagination?.total || 0,
              totalPages: data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            csvFileName={`pulled-orders-receivable-${dayjs().format("YYYY-MM-DD")}.csv`}
            rowTestId={(row) =>
              `data-testid-${PULLED_ORDERS_RECEIVABLE_REPORT.row(row.id)}`
            }
          />
        </div>
      </div>
    </div>
  );
}
