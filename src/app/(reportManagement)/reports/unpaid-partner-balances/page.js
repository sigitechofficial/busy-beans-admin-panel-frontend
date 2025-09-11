"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import { UNPAID_PARTNER_BALANCE_REPORT } from "../report.testid";

export default function UnpaidPartnerBalance() {
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);

  const { data } = GetAPI("api/v1/admin/admin-reports/unpaid-partner-balance");
  console.log("🚀 ~ PartnerCommissionReport ~ data:", data?.data);

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
    { field: "srName", header: "Supplier Name" },
    { field: "outstandingBalance", header: "Outstanding Balance", sort: true },
    { field: "ordersOnCredit", header: "Orders on credit", sort: true },
  ];

  const datas = [];
  data?.data?.map((report, i) =>
    datas.push({
      id: report?.id,
      sl: i + 1,
      srName: report?.srName,
      outstandingBalance: `$${report?.outstandingBalance ?? 0}`,
      ordersOnCredit: `${report?.ordersOnCredit ?? 0}`,
    })
  );

  const handleChange = (val) => {
    if (val?.value === "custom") {
      setDisplayCustomFilters(true);
    } else {
      setSelectedOption(val);
      setDisplayCustomFilters(false);
      //   const filteredDates = handleDatesForFilter(val?.value);
      //   setCustomDates(filteredDates);
    }
  };

  const handleCancel = () => {
    setDisplayCustomFilters(false);
    setCustomDates({ startDate: "", endDate: "" });
    setSelectedOption({
      value: "allTime",
      label: "All Time",
    });
  };

  const handleCustomDates = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div data-testid={UNPAID_PARTNER_BALANCE_REPORT.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={UNPAID_PARTNER_BALANCE_REPORT.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={UNPAID_PARTNER_BALANCE_REPORT.title}>
            Unpiad Partner Balance Report
          </h2>
        </div>
      </div>
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="flex items-center justify-between" data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterSection}>
          <div className="flex items-center gap-x-2">
            <BackButton />
            {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Unpiad Partner Balance Report
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
                    data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterStartDate}
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
                    data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterEndDate}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
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
              <div className="font-bold">
                <Select
                  styles={drawerSelectStyles}
                  defaultValue={{ value: "allTime", label: "All Time" }}
                  placeholder="Select Year, Month, Week ..."
                  value={selectedOption ? selectedOption : null}
                  onChange={(val) => handleChange(val)}
                  options={options ? options : null}
                  data-testid={UNPAID_PARTNER_BALANCE_REPORT.filterSelect}
                />
              </div>
            )}
          </div>
        </div>

        <div data-testid={UNPAID_PARTNER_BALANCE_REPORT.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            rowTestId={(row) => `data-testid-${UNPAID_PARTNER_BALANCE_REPORT.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
