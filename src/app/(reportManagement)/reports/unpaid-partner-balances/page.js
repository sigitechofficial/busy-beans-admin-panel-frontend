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
import { UNPAID_PARTNER_BALANCE_REPORT } from "../report.testid";

export default function UnpaidPartnerBalance() {
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });

  const [partnerType, setPartnerType] = useState(1);

  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });

  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);

  const { data, isLoading } = GetAPI(
    `api/v1/admin/admin-reports/unpaid-partner-balance${
      partnerType === 1
        ? "?partnerType=dropship-partner"
        : "?partnerType=direct-partner"
    }`
  );

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

  // --------------------------
  // TABLE COLUMNS
  // --------------------------
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "type", header: "Type" },
    { field: "srName", header: "Supplier Name" },
    { field: "outstandingBalance", header: "Outstanding Balance", sort: true },
    { field: "ordersOnCredit", header: "Orders on credit", sort: true },
  ];

  const columns1 = [
    { field: "sl", header: "SL", sort: true },
    { field: "srName", header: "Name" },
    { field: "outstandingBalance", header: "Outstanding Balance", sort: true },
    {
      field: "customerOutstandingBalance",
      header: "Orders On Credit",
      sort: true,
    },
    { field: "partnerOrderCount", header: "Partner Orders", sort: true },
    { field: "ordersOnCredit", header: "Customer Orders", sort: true },
    {
      field: "creditOnPartOrder",
      header: "Credit on Partner Orders",
      sort: true,
    },
    {
      field: "creditOnCustOrder",
      header: "Credit on Customer Orders",
      sort: true,
    },
  ];

  // --------------------------
  // TABLE DATA MAPPING
  // --------------------------
  const rawData = data?.data || [];

  // DropShip Table Data
  const datas = rawData.map((report, i) => ({
    id: report?.id,
    sl: i + 1,
    type: report?.partnerType,
    srName: report?.srName,
    outstandingBalance: `$${report?.outstandingBalance ?? 0}`,
    ordersOnCredit: `${report?.ordersOnCredit ?? 0}`,
  }));

  // Direct Partner Table Data
  const datas1 = rawData.map((report, i) => ({
    id: report?.id,
    sl: i + 1,
    srName: report?.srName,
    outstandingBalance:
      "$" +
      ((parseFloat(report?.outstandingBalance) || 0) +
        (parseFloat(report?.selfOrdersOutstandingBalance) || 0)),
    customerOutstandingBalance:
      (report?.ordersOnCredit || 0) + (report?.selfOrdersOnCredit || 0),
    ordersOnCredit: report?.ordersOnCredit || 0,
    partnerOrderCount: report?.selfOrdersOnCredit || 0,
    creditOnPartOrder: report?.selfOrdersOutstandingBalance || 0,
    creditOnCustOrder: report?.outstandingBalance || 0,
  }));

  // --------------------------
  // FILTER HANDLERS
  // --------------------------
  const handleChange = (val) => {
    if (val?.value === "custom") {
      setDisplayCustomFilters(true);
    } else {
      setSelectedOption(val);
      setDisplayCustomFilters(false);
    }
  };

  const handleCancel = () => {
    setDisplayCustomFilters(false);
    setCustomDates({ startDate: "", endDate: "" });
    setSelectedOption({ value: "allTime", label: "All Time" });
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  const { toggle, setToggle } = useDataContext();

  // --------------------------
  // RENDER
  // --------------------------
  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={UNPAID_PARTNER_BALANCE_REPORT.root}>
      {/* HEADER BAR */}
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={UNPAID_PARTNER_BALANCE_REPORT.headerBar}
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
            data-testid={UNPAID_PARTNER_BALANCE_REPORT.title}
          >
            Unpaid Partner Balance Report
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        {/* FILTER SECTION */}
        <div
          className="flex items-center justify-between"
          data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterSection}
        >
          <div className="flex items-center gap-x-2">
            <BackButton />

            {/* Partner Type Tabs */}
            <div className="flex items-center">
              <div
                onClick={() => setPartnerType(1)}
                className={`py-4 px-10 cursor-pointer ${
                  partnerType === 1
                    ? "bg-black text-white"
                    : "text-black border"
                }  font-semibold text-center border-r`}
              >
                Drop Ship
              </div>
              <div
                onClick={() => setPartnerType(2)}
                className={`py-4 px-10 cursor-pointer ${
                  partnerType === 2
                    ? "bg-black text-white"
                    : "text-black border"
                }  font-semibold text-center`}
              >
                Direct
              </div>
            </div>
          </div>

          {/* FILTER DROPDOWN / DATE PICKERS */}
          <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex gap-x-2 items-center h-[42px]">
                <div className=" space-x-2">
                  <label className="text-labelColor font-workSans font-semibold">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={customDates.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterStartDate}
                  />
                </div>

                <div className=" space-x-2">
                  <label className="text-labelColor font-workSans font-semibold">
                    End Date:
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={customDates.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium text-labelColor"
                    data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterEndDate}
                  />
                </div>

                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-theme text-theme bg-white hover:text-white hover:bg-theme duration-200 group"
                    data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterClearBtn}
                  >
                    <ImCross size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <Select
                styles={drawerSelectStyles}
                defaultValue={{ value: "allTime", label: "All Time" }}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                className="font-bold"
                data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterSelect}
              />
            )}
          </div>
        </div>

        {/* TABLE */}
        <div data-testid={UNPAID_PARTNER_BALANCE_REPORT.tableWrapper}>
          <MyDataTable
            columns={partnerType === 1 ? columns : columns1}
            data={partnerType === 1 ? datas : datas1}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            rowTestId={(row) =>
              `data-testid-${UNPAID_PARTNER_BALANCE_REPORT.row(row.id)}`
            }
          />
        </div>
      </div>
    </div>
  );
}
