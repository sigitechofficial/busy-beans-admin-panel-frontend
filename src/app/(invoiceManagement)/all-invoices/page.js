"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { Dialog } from "primereact/dialog";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { error_toaster } from "@/utilities/Toaster";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";

export default function AllInvoices() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;

  const router = useRouter();
  const [type, setType] = useState("all");
  const [invoiceSource, setInvoiceSource] = useState("customer");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Date filter (same options as reports/sales-by-customer-summary)
  const dateFilterOptions = [
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
  const [selectedDateOption, setSelectedDateOption] = useState({ value: "allTime", label: "All Time" });
  const [displayCustomDateFilters, setDisplayCustomDateFilters] = useState(false);
  const [customDates, setCustomDates] = useState({ startDate: "", endDate: "" });
  const [dateRange, setDateRange] = useState(() => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD"),
    };
  });

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
    if (selectedDateOption.value !== "custom" && !displayCustomDateFilters) {
      const dates = calculateDateRange(selectedDateOption.value);
      setDateRange(dates);
    }
  }, [selectedDateOption, displayCustomDateFilters]);

  useEffect(() => {
    if (displayCustomDateFilters && customDates.startDate && customDates.endDate) {
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
      setDateRange({ startDate: customDates.startDate, endDate: customDates.endDate });
    }
  }, [customDates.startDate, customDates.endDate, displayCustomDateFilters]);

  const handleDateOptionChange = (val) => {
    setSelectedDateOption(val || { value: "allTime", label: "All Time" });
    if (val?.value === "custom") {
      setDisplayCustomDateFilters(true);
    } else {
      setDisplayCustomDateFilters(false);
      const dates = calculateDateRange(val?.value);
      setDateRange(dates);
      setCustomDates({ startDate: "", endDate: "" });
    }
    setPage(1);
  };

  // Build API URL with pagination, search and date range (gte/lte)
  const baseUrl =
    invoiceSource === "customer"
      ? userType === "admin"
        ? "api/v1/admin/orders?statusId[ne]=6&type=all&invoiceDate[ne]=null"
        : `api/v1/admin/orders?salesRepId=${userID}&statusId[ne]=6&type=all&invoiceDate[ne]=null`
      : "api/v1/admin/partner-order/orders-list?statusId[ne]=6&type=all&invoiceDate[ne]=null";

  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  // Backend default: oldest unpaid invoices first
  params.set("sort", "invoiceDate");
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  if (dateRange.startDate && dateRange.endDate) {
    params.set("on[gte]", dateRange.startDate);
    params.set("on[lte]", dateRange.endDate);
  }
  const apiUrl = `${urlBase}?${params.toString()}`;

  const { data, isLoading, reFetch } = GetAPI(apiUrl, "orders");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const orderTypeForDelete = invoiceSource === "partner" ? "local-partner" : "customer";

  const handleDeleteInvoice = async () => {
    if (deleteTargetId == null) return;
    setDeleteLoader(true);
    try {
      const res = await PostAPI("api/v1/admin/order-management/delete-invoice", {
        orderType: orderTypeForDelete,
        id: deleteTargetId,
      });
      if (res?.data?.status === "success") {
        setDeleteModalOpen(false);
        setDeleteTargetId(null);
        reFetch();
      } else {
        throw new Error(res?.data?.message || "Failed to delete invoice");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setDeleteLoader(false);
    }
  };

  const columns = [
    { field: "id", header: "#", sort: true },
    {
      field: "companyName",
      header: invoiceSource === "partner" ? "Local Partner" : "Company Name",
    },
    { field: "type", header: "Type",sort: true },
    { field: "orderDate", header: "Invoice date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    { field: "totalBill", header: "Total", sort: true },
    { field: "paymentStatus", header: "Invoice", sort: true },
    { field: "orderCurrentStatus", header: "Status" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  const ordersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];
  const resultedOrders = ordersArray.filter((detail, i) => {
    return (
      (type === "paid"
        ? detail?.paymentStatus === "done"
        : type === "unpaid"
        ? detail?.paymentStatus === "pending"
        : detail?.paymentStatus === "pending" ||
          detail?.paymentStatus === "done") &&
      datas.push({
        sl: slCounter++,
        id: detail?.id,
        type: detail?.type?.split("-").join(" "),
        companyName:
          invoiceSource === "partner"
            ? detail?.salesRepName
            : detail?.companyName,
        salesRepName: detail?.salesRepName,
        totalBill: "$" + detail?.totalBill,
        subTotal: "$" + detail?.subTotal,
        discountPrice: "$" + detail?.discountPrice,
        discountPercentage: detail?.discountPercentage + "%",
        itemsPrice: "$" + detail?.itemsPrice,
        vat: detail?.vat,
        totalWeight: detail?.totalWeight + "kg",
        shippingCharges: "$" + detail?.shippingCharges,
        note: detail?.note,
        paymentMethod: detail?.paymentMethod,
        poNumber: detail?.poNumber,
        orderFrequency: detail?.frequency,
        orderCurrentStatus: detail?.orderCurrentStatus,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        createdBy: detail?.createdBy,
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
        deliveredOn: detail?.deliveredOn ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY") : "-",
        action: (
          <div className="flex items-center gap-2">
            <button
              className="border border-theme rounded-md p-2 text-theme hover:bg-theme hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (invoiceSource === "partner") {
                  if (detail?.type === "direct-invoice") {
                    router.push(`/all-invoices/partner/${detail?.id}`);
                  } else {
                    router.push(`/orders/partnerOrders/detail/${detail?.id}`);
                  }
                } else if (detail?.type === "direct-invoice") {
                  router.push(`/direct-invoices/${detail?.id}`);
                } else {
                  router.push(`/orders/detail/${detail?.id}`);
                }
              }}
              title="View Details"
            >
              <FaEye size={18} />
            </button>
            <button
              className="border border-red-400 rounded-md p-2 text-red-500 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTargetId(detail?.id);
                setDeleteModalOpen(true);
              }}
              title="Delete Invoice"
            >
              <MdDelete size={18} />
            </button>
          </div>
        ),
      })
    );
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">All Invoices</h2>
        </div>

        {/* Toggle for Invoice Source */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setInvoiceSource("customer");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              invoiceSource === "customer"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer Invoices
          </button>
          {["admin", "salesRepresentative"].includes(userType) && (
            <button
              onClick={() => {
                setInvoiceSource("partner");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                invoiceSource === "partner"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {userType === "admin" ? "Partner Invoices" : "Self Invoices"}
            </button>
          )}
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div>
          <button
            onClick={() => {
              setType("all");
              setPage(1);
            }}
            className={`${
              type === "all" ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            All Invoices
          </button>
          <button
            onClick={() => {
              setType("paid");
              setPage(1);
            }}
            className={`${
              type === "paid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            Paid Invoices
          </button>
          <button
            onClick={() => {
              setType("unpaid");
              setPage(1);
            }}
            className={`${
              type === "unpaid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            Unpaid Invoices
          </button>
        </div>

        {/* Date filter - same options as reports/sales-by-customer-summary */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date range:</label>
            <div className="w-[200px]">
              <Select
                options={dateFilterOptions}
                value={selectedDateOption}
                onChange={handleDateOptionChange}
                styles={selectStyles}
                placeholder="Select"
                isClearable={false}
              />
            </div>
          </div>
          {displayCustomDateFilters && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="all-invoices-startDate" className="text-sm font-medium text-gray-700">Start</label>
                <input
                  type="date"
                  id="all-invoices-startDate"
                  value={customDates.startDate}
                  onChange={(e) => setCustomDates((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="all-invoices-endDate" className="text-sm font-medium text-gray-700">End</label>
                <input
                  type="date"
                  id="all-invoices-endDate"
                  value={customDates.endDate}
                  onChange={(e) => setCustomDates((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Invoices"
            desc={
              data?.pagination?.totalItems ??
              data?.data?.pagination?.totalItems ??
              resultedOrders?.length ??
              0
            }
          />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Id, invoice number, company name..."}
            pagination={true}
            serverPagination={{
              page:
                data?.pagination?.page ??
                data?.data?.pagination?.page ??
                page,
              limit:
                data?.pagination?.limit ??
                data?.data?.pagination?.limit ??
                limit,
              totalRecords:
                data?.pagination?.totalItems ??
                data?.data?.pagination?.totalItems ??
                0,
              totalPages:
                data?.pagination?.totalPages ??
                data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1);
            }}
            onRowClick={(e) => {
              if (invoiceSource === "partner") {
                // Partner invoices: check if direct-invoice or regular order
                if (e.data.type === "direct invoice") {
                  router.push(`/all-invoices/partner/${e.data.id}`);
                } else {
                  router.push(`/orders/partnerOrders/detail/${e.data.id}`);
                }
              } else if (e.data.type === "direct invoice") {
                router.push(`/direct-invoices/${e.data.id}`);
              } else {
                router.push(`/orders/detail/${e.data.id}`);
              }
            }}
            search={true}
          />
        </div>
      </div>

      <Dialog
        visible={deleteModalOpen}
        onHide={() => {
          if (!deleteLoader) {
            setDeleteModalOpen(false);
            setDeleteTargetId(null);
          }
        }}
        header="Delete Invoice"
        className="font-nunito w-[90vw] max-w-md"
        dismissableMask={!deleteLoader}
        closable={!deleteLoader}
      >
        {deleteLoader ? (
          <MiniLoader />
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteInvoice}
                className="px-4 py-2 rounded-lg bg-theme text-white hover:bg-theme/90"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
