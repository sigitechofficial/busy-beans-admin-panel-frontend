"use client";
import Loader from "@/components/ui/Loader";
import ManagementTab from "@/components/ui/ManagementTab";
import GetAPI from "@/utilities/GetAPI";
import selectStyles from "@/utilities/SelectStyle";
import Select from "react-select";

export default function page() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
  }

  const { data } = GetAPI(`api/v1/admin/sales-rep/sales/${userID}`);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Wallet Management
        </h2>
        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>

      <div className="space-y-8 pt-32 px-6 2xl:px-12">
        <p className="font-semibold text-xl text-theme">
          Overall Sales & Earnings
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Number of Sold Products"
            desc={`${
              Number(data?.data?.numberOfSoldProducts) +
              Number(data?.data?.numberOfSoldProductsOnline)
            }`}
          />
          <ManagementTab
            title="Total Sales"
            desc={`$${
              Number(data?.data?.totalSales.replace(/,/g, "")) +
              Number(data?.data?.totalSalesOnline.replace(/,/g, ""))
            }`}
          />
          <ManagementTab
            title="Total Whole Sale"
            desc={`$${
              Number(data?.data?.wholesalePrice.replace(/,/g, "")) +
              Number(data?.data?.wholesalePriceOnline?.replace(/,/g, ""))
            }`}
          />
        </div>
      </div>
      <div className="space-y-8 pt-6 px-6 2xl:px-12">
        <p className="font-semibold text-xl text-theme">
          Local Partner Panel Sales & Earnings
        </p>
        <div className="space-y-6">
          {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Wallet Management
          </h2>
          <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        </div> */}

          <p className="font-inter font-medium text-lg text-black">
            Credit Management
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Credit Limit"
              desc={`$${data?.data?.credit?.creditLimit ?? 0}`}
            />
            <ManagementTab
              title="Credit Used"
              desc={`$${data?.data?.credit?.creditUsed ?? 0}`}
            />
            <ManagementTab
              title="Total Whole Sale Price"
              desc={`$${
                data?.data?.credit?.creditLimit -
                Number(data?.data?.credit?.creditUsed?.replace(/,/g, ""))
              }`}
            />
          </div>
          <p className="font-inter font-medium text-lg text-black">
            Sales and Earnings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Total Sales"
              desc={`$${data?.data?.totalSales ?? 0}`}
            />
            <ManagementTab
              title="Partner Profits"
              desc={`$${data?.data?.salerCommission ?? 0}`}
            />
            <ManagementTab
              title="Whole Sale Price"
              desc={`$${data?.data?.wholesalePrice ?? 0}`}
            />
            <ManagementTab
              title="Number of Sold Products"
              desc={data?.data?.numberOfSoldProducts ?? 0}
            />
            <ManagementTab
              title="To be Paid to Admin"
              desc={`$${data?.data?.toBePaid ?? 0}`}
            />
            <ManagementTab
              title="Paid to Admin"
              desc={`$${data?.data?.paidToAdmin ?? 0}`}
            />
          </div>
        </div>
      </div>
      <div className="space-y-8 pt-10 px-6 2xl:px-12">
        <p className="font-semibold text-xl text-theme">
          Customer Website Sales & Earnings
        </p>
        <div className="space-y-6">
          {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Wallet Management
          </h2>
          <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        </div> */}

          {/* <p className="font-inter font-medium text-lg text-black">
            Credit Management
          </p> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Number of Sold Products"
              desc={`${data?.data?.numberOfSoldProductsOnline ?? 0}`}
            />
            <ManagementTab
              title="Total Sales"
              desc={`$${data?.data?.totalSalesOnline ?? 0}`}
            />
            <ManagementTab
              title="Whole Sale Price"
              desc={`$${data?.data?.wholesalePriceOnline ?? 0}`}
            />
            <ManagementTab
              title="Commission"
              desc={`$${data?.data?.salerCommissionOnline ?? 0}`}
            />
          </div>
          {/* <p className="font-inter font-medium text-lg text-black">
            Sales and Earnings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ManagementTab
              title="Total Sales"
              desc={`$${data?.data?.totalSales ?? 0}`}
            />
            <ManagementTab
              title="Partner Profits"
              desc={`$${data?.data?.salerCommission ?? 0}`}
            />
            <ManagementTab
              title="Whole Sale Price"
              desc={`$${data?.data?.wholesalePrice ?? 0}`}
            />
            <ManagementTab
              title="Number of Sold Products"
              desc={data?.data?.numberOfSoldProducts ?? 0}
            />
            <ManagementTab
              title="To be Paid"
              desc={`$${data?.data?.toBePaid ?? 0}`}
            />
            <ManagementTab
              title="Paid to Admin"
              desc={`$${data?.data?.paidToAdmin ?? 0}`}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
} 