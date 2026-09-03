"use client";

import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { error_toaster, success_toaster, warning_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";

export default function UnpaidPartnerBalance() {
  // ---------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [partnerType, setPartnerType] = useState(1);
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const { toggle, setToggle } = useDataContext();

  // ---------------------------------------------------------------------
  // API URL BASED ON partnerType
  // ---------------------------------------------------------------------
  const partnerURLs = {
    1: "/synced",
    2: "/not-synced",
    3: "/synced-paid",
    4: "/unsynced-paid",
  };

  const { data, isLoading, reFetch } = GetAPI(
    `api/v1/admin/quickbooks-partner-order-management${partnerURLs[partnerType] ?? ""
    }`
  );

  const rawData = data?.data?.data || [];

  // ---------------------------------------------------------------------
  // SELECT OPTIONS
  // ---------------------------------------------------------------------
  const dateOptions = [
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

  // ---------------------------------------------------------------------
  // FILTER HANDLERS
  // ---------------------------------------------------------------------
  const handleDateFilterChange = (val) => {
    if (val?.value === "custom") {
      setDisplayCustomFilters(true);
    } else {
      setSelectedOption(val);
      setDisplayCustomFilters(false);
    }
  };

  const handleCustomDates = (e) =>
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });

  const resetCustomFilters = () => {
    setDisplayCustomFilters(false);
    setCustomDates({ startDate: "", endDate: "" });
    setSelectedOption({ value: "allTime", label: "All Time" });
  };

  // ---------------------------------------------------------------------
  // TABLE COLUMNS (ONLY ONE FORMAT)
  // ---------------------------------------------------------------------
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "orderId", header: "Order ID" },
    { field: "Invoice", header: "Invoice #" },
    { field: "orderStatus", header: "Order Status" },
    { field: "paymentStatus", header: "Payment Status" },
    { field: "salesRep", header: "Sales Rep" },
    { field: "totalQty", header: "Total Qty" },
    { field: "subtotal", header: "Subtotal ($)" },
    { field: "shipping", header: "Shipping ($)" },
    { field: "totalBill", header: "Total Bill ($)" },
    { field: "deliveredOn", header: "Delivered On" },
    { field: "createdAt", header: "Created At" },
    { field: "overdue", header: "Overdue" },
  ];

  // ---------------------------------------------------------------------
  // TABLE ROW MAPPING
  // ---------------------------------------------------------------------
  const finalData = rawData?.map((r, i) => ({
    sl: i + 1,
    orderId: r?.id,
    Invoice: r?.invoiceNumber,
    orderStatus: r?.orderCurrentStatus,
    paymentStatus: r?.paymentStatus,
    salesRep: r?.salesRepName,
    totalQty: r?.totalQuantity,
    subtotal: r?.subTotal,
    shipping: r?.shippingCharges,
    totalBill: r?.totalBill,
    deliveredOn: r?.deliveredOn,
    createdAt: r?.createdAt,
    overdue: r?.overdueInvoice ? "Yes" : null,
  }));



  const handleSyncInvoice = async () => {
    if (!selectedRows.length) return;
    const orderIds = selectedRows.map((r) => Number(r?.orderId)).filter(Boolean);
    let response = await PostAPI("qbo/order-invoice/create-multiple", { orderType: "local-partner", orderIds })
    console.log(response)
    if (response?.data?.status === "success") {
      setSelectedRows([]);
      reFetch()
    } else {
      error_toaster(response?.data?.message)
    }
  }


  const handleSyncPayment = async () => {
    if (!selectedRows.length) return;
    const orderIds = selectedRows.map((r) => Number(r?.orderId)).filter(Boolean);
    try {
      const response = await PostAPI(
        "qbo/order-payment/sync-multiple",
        { orderType: "local-partner", orderIds },
        "",
        { suppressSuccessToast: true },
      );
      const payload = response?.data?.data || {};
      const status = response?.data?.status;
      const successCount = payload.successCount ?? 0;
      const failureCount = payload.failureCount ?? 0;
      const partialCount = payload.partialCount ?? 0;
      const message =
        response?.data?.message ||
        payload.message ||
        "Payment sync finished";

      const allFailed =
        status === "failed" ||
        (successCount === 0 && partialCount === 0 && failureCount > 0);
      const mixed =
        status === "partial-success" ||
        partialCount > 0 ||
        (failureCount > 0 && successCount > 0);

      if (allFailed) {
        error_toaster(message);
      } else if (mixed) {
        warning_toaster(message);
        setSelectedRows([]);
        reFetch();
      } else if (status === "success" || response?.data?.success) {
        success_toaster(message);
        setSelectedRows([]);
        reFetch();
      } else {
        error_toaster(message || "Failed to sync payments");
      }
    } catch {
      // HTTP errors are already toasted by the API interceptor
    }
  }

  // ---------------------------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------------------------

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      {/* HEADER */}
      <header className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white h-[70px] 2xl:h-[94px] fixed flex items-center justify-between border-b px-6 2xl:px-12 z-10">
        <div className="flex items-center gap-2">
          <p
            className="cursor-pointer md:hidden"
            onClick={() => setToggle(!toggle)}
          >
            <CiMenuBurger size={22} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Quickbook Partner Invoices
          </h2>
        </div>
      </header>

      {/* CONTENT */}
      <div className="pt-28 2xl:pt-32 px-6 2xl:px-12 space-y-8">
        {/* FILTER + PARTNER TYPE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton />

            {/* Partner Tabs */}
            <div className="flex items-center">
              {[
                { id: 1, label: "Synced Invoices" },
                { id: 2, label: "Unsynced Invoices" },
                { id: 3, label: "Synced Payments" },
                { id: 4, label: "Unsynced Payments" },
              ].map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => { setSelectedRows([]); setPartnerType(tab.id) }}
                  className={`py-3 px-4 cursor-pointer font-semibold text-sm text-center border ${partnerType === tab.id
                    ? "bg-black text-white"
                    : "text-black"
                    }`}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {partnerType === 2 && <button
            onClick={handleSyncInvoice}
            className="bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium"
          >
            Sync Invoice
          </button>}

          {partnerType === 4 && <button
            onClick={handleSyncPayment}
            className="bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors duration-200 font-medium"
          >
            Sync Payment
          </button>}

          {/* DATE FILTERS */}
          {/* <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex items-center gap-2 h-[42px]">
                <div className="space-x-2">
                  <label className="font-semibold text-labelColor">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={customDates.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 border outline-none"
                  />
                </div>

                <div className="space-x-2">
                  <label className="font-semibold text-labelColor">
                    End Date:
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={customDates.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 border outline-none"
                  />
                </div>

                <button
                  onClick={resetCustomFilters}
                  className="h-full px-2 border rounded-lg border-theme text-theme hover:bg-theme hover:text-white duration-200"
                >
                  <ImCross size={20} />
                </button>
              </div>
            ) : (
              <Select
                value={selectedOption}
                onChange={handleDateFilterChange}
                options={dateOptions}
                styles={drawerSelectStyles}
                className="font-bold"
              />
            )}
          </div> */}
        </div>

        {/* TABLE */}
        <MyDataTable
          columns={columns}
          data={finalData}
          search
          pagination
          placeholder="Search ..."
          checkbox={partnerType === 2 || partnerType === 4}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          dataKey="orderId"
        />
      </div>
    </div>
  );
}
