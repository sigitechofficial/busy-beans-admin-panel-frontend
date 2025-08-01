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

export default function AssignedOrders() {
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

  const { data } = GetAPI(
    `api/v1/admin/supplier-reports/top-products-ordered-report/${userID}`
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

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Customer Name" },
    { field: "dispatchedItems", header: "Total Dispatched Items" },
  ];

  const datas = [];
  data?.data?.map((report, i) =>
    datas.push({
      sl: i + 1,
      name: report?.name,
      productNames: report?.productNames,
      dispatchedItems: report?.dispatchedItems ?? 0,
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
            Top Products Ordered Report
          </h2>
        </div>

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
              Top Products Ordered Report
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
            placeholder={"Search ..."}
            pagination={true}
            search={true}
          />
        </div>
      </div>
    </div>
  );
}
