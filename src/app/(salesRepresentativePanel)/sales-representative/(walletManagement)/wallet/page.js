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
  console.log("🚀 ~ page ~ data:", data?.data);

  //   creditLimit
  // :
  // 2000
  // creditUsed
  // :
  // null

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Wallet Management
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <p className="font-inter font-medium text-lg text-black">
        Credit Management
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab
          title="Credit Limit"
          desc={`$${data?.data?.credit?.creditLimit}` ?? 0}
        />
        <ManagementTab
          title="Credit Used"
          desc={`$${data?.data?.credit?.creditUsed}` ?? 0}
        />
        <ManagementTab
          title="Credit remaining"
          desc={`$${
            Number(data?.data?.credit?.creditLimit ?? 0) -
            Number(data?.data?.credit?.creditUsed ?? 0)
          }`}
        />
      </div>
      <p className="font-inter font-medium text-lg text-black">
        Sales and Earnings
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab
          title="Total Sales"
          desc={`$${data?.data?.totalSales}` ?? 0}
        />
        <ManagementTab
          title="Partner Commission"
          desc={`$${data?.data?.salerCommission}` ?? 0}
        />
        <ManagementTab
          title="Whole Sale Price"
          desc={`$${data?.data?.wholesalePrice}` ?? 0}
        />
        <ManagementTab
          title="Number of Sold Products"
          desc={data?.data?.numberOfSoldProducts ?? 0}
        />
        <ManagementTab
          title="To be Paid"
          desc={`$${data?.data?.toBePaid}` ?? 0}
        />
        <ManagementTab
          title="Paid to Admin"
          desc={`$${data?.data?.paidToAdmin}` ?? 0}
        />
      </div>
    </div>
  );
}
