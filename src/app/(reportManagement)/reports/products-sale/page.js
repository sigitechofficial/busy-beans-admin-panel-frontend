"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import { useState, useEffect } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import { PRODUCT_SALE_REPORT } from "../report.testid";
import dayjs from "dayjs";
import { formatUSD } from "@/utilities/constants";

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
  
  // Initialize dateRange with All Time default (January 1, 2025 to today)
  const getInitialDateRange = () => {
    const today = dayjs();
    return {
      startDate: "2025-01-01",
      endDate: today.format("YYYY-MM-DD")
    };
  };
  
  const [dateRange, setDateRange] = useState(getInitialDateRange());

  const { data, isLoading } = GetAPI(
    `api/v1/admin/admin-reports/product-sales?startDate=${dateRange?.startDate}&endDate=${dateRange?.endDate}`
  );

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
        // Custom dates will be set by user
        break;
      default:
        startDate = "";
        endDate = "";
    }

    return { startDate, endDate };
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Product Name" },
    {
      field: "revenue",
      header: "Revenue",
      sort: true,
    },
    {
      field: "revenueFromCustomers",
      header: "Revenue From Customer Orders",
      sort: true,
    },
    { field: "unitsSold", header: "Units Sold", sort: true },

    {
      field: "revenueFromLocalPartners",
      header: "Revenue From Local Partner Self Orders",
      sort: true,
    },
    {
      field: "wholesalePriceTotal",
      header: "Admin Receivable From Local Partner",
      sort: true,
    },
    { field: "unitsSoldToP", header: "Units Sold To Customers", sort: true },
    { field: "unitsSoldToC", header: "Units Sold To Partners", sort: true },
    // {
    //   field: "customerPriceTotal",
    //   header: "Total Price Customers",
    //   sort: true,
    // },
  ];

  const datas = [];
  data?.data?.map((report, i) =>
    datas.push({
      id: report?.id,
      sl: i + 1,
      name: report?.name,
      wholesalePriceTotal: formatUSD(parseFloat(report?.wholesalePriceTotal) || 0),
      customerPriceTotal: formatUSD(parseFloat(report?.customerPriceTotal) || 0),
      revenueFromCustomers: formatUSD(parseFloat(report?.revenueFromCustomers) || 0),
      revenueFromLocalPartners: formatUSD(parseFloat(report?.revenueFromLocalPartners) || 0),
      unitsSold: (
        (parseFloat(report?.unitsSoldToCustomer) || 0) + (parseFloat(report?.unitsSoldToPartners) || 0)
      ),
      unitsSoldToC: (parseFloat(report?.unitsSoldToCustomer) || 0),
      unitsSoldToP: (parseFloat(report?.unitsSoldToPartners) || 0),
      revenue: formatUSD(
        (parseFloat(report?.revenueFromCustomers) || 0) + (parseFloat(report?.revenueFromLocalPartners) || 0)
      ),
    })
  );

  useEffect(() => {
    if (selectedOption.value !== "custom" && !displayCustomFilters) {
      const dates = calculateDateRange(selectedOption.value);
      setDateRange(dates);
    }
  }, [selectedOption, displayCustomFilters]);

  useEffect(() => {
    if (displayCustomFilters && customDates.startDate && customDates.endDate) {
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
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={PRODUCT_SALE_REPORT.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={PRODUCT_SALE_REPORT.headerBar}
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
            data-testid={PRODUCT_SALE_REPORT.title}
          >
            Products Sales Report
          </h2>
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div
          className="flex items-center justify-between"
          data-testid={PRODUCT_SALE_REPORT.filterSection}
        >
          <div className="flex items-center gap-x-4">
            <BackButton />
            {/* Date Range Display */}
            {dateRange.startDate && dateRange.endDate && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm font-inter font-medium text-gray-600">Date Range:</span>
                <span className="text-sm font-inter font-semibold text-gray-900">
                  {dayjs(dateRange.startDate).format("MMM DD, YYYY")} - {dayjs(dateRange.endDate).format("MMM DD, YYYY")}
                </span>
              </div>
            )}
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
                    data-testid={PRODUCT_SALE_REPORT.filterStartDate}
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
                    data-testid={PRODUCT_SALE_REPORT.filterEndDate}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-theme text-theme bg-white hover:text-white hover:bg-theme duration-200 group"
                    data-testid={PRODUCT_SALE_REPORT.filterClearBtn}
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
                  data-testid={PRODUCT_SALE_REPORT.filterSelect}
                />
              </div>
            )}
          </div>
        </div>

        <div data-testid={PRODUCT_SALE_REPORT.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            rowTestId={(row) =>
              `data-testid-${PRODUCT_SALE_REPORT.row(row.id)}`
            }
          />
        </div>
      </div>
    </div>
  );
}
