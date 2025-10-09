"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState } from "react";
import { ImCross } from "react-icons/im";
import Select from "react-select";

export default function CreditLimitStatusReport() {
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

  const { data, isLoading } = GetAPI(
    `api/v1/admin/sales-rep-reports/partner-creadit-limit/${userID}`
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

  //   const columns = [
  //     { field: "sl", header: "SL", sort: true },
  //     { field: "srName", header: "Customer Name" },
  //     { field: "creditLimit", header: "No. of Orders" },
  //     { field: "creditUsed", header: "Total Spent" },
  //   ];

  //   const datas = [];
  //   data?.data?.data?.map((report, i) =>
  //     datas.push({
  //       sl: i + 1,
  //       srName: report?.srName,
  //       creditLimit: `$${report?.creditLimit ?? 0}`,
  //       creditUsed: `$${report?.creditUsed ?? 0}`,
  //     })
  //   );

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
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Credit Limit Status Report
        </h2>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <BackButton />
            {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Credit Limit Status Report
            </h2> */}
          </div>
          {/* <div className="min-w-40">
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
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Local Partner Name" desc={data?.data?.srName} />

          <ManagementTab
            title="Credit Limit"
            desc={`$${data?.data?.creditLimit ?? 0}`}
          />

          <ManagementTab
            title="Credit Used"
            desc={`$${data?.data?.creditUsed ?? 0}`}
          />

          <ManagementTab
            title="Remaining Credit"
            desc={`$${
              Number(data?.data?.creditLimit) -
                Number(data?.data?.creditUsed) ?? 0
            }`}
          />

          {/* <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
        /> */}
        </div>
      </div>
    </div>
  );
}
