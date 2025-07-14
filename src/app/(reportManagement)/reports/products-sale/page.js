"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState } from "react";
import { ImCross } from "react-icons/im";
import Select from "react-select";

export default function ProductSale() {
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedOption, setSelectedOption] = useState({
    value: "allTime",
    label: "All Time",
  });
  const [displayCustomFilters, setDisplayCustomFilters] = useState(false);

  const { data } = GetAPI("api/v1/admin/admin-reports/product-sales");
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
    { field: "name", header: "Product Name" },
    { field: "unitsSold", header: "Units Sold", sort: true },
    { field: "wholesalePriceTotal", header: "Total Whole Sale Price", sort: true },
    { field: "customerPriceTotal", header: "Total Price Customers", sort: true },
    { field: "revenue", header: "Revenue", sort: true },
  ];

  const datas = [];
  data?.data?.map((report, i) =>
    datas.push({
      sl: i + 1,
      name: report?.name,
      unitsSold: report?.unitsSold ?? 0,
      wholesalePriceTotal: `$${report?.wholesalePriceTotal ?? 0}`,
      customerPriceTotal: `$${report?.customerPriceTotal ?? 0}`,
      revenue: `$${report?.revenue ?? 0}`,
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

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Products Sales Report
          </h2>
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
  );
}
