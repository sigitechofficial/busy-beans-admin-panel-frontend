"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";

export default function Customers() {
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "orderID", header: "Order ID" },
    { field: "companyName", header: "Company Name" },
    { field: "orderDate", header: "Order Date" },
    { field: "orderQuantity", header: "Order Quantiity" },
    { field: "orderAmount", header: "Order Amount" },
    { field: "country", header: "Country" },
    { field: "city", header: "City" },
    { field: "address", header: "Address Zip" },
    { field: "action", header: "Action" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Customer Management
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Customer" desc="5000" />
        <ManagementTab title="New Customer" desc="5000" />
        <ManagementTab title="Active Customer" desc="500" />
        <ManagementTab title="Inactive Customer" desc="55,000" />
        <ManagementTab title="T.Revenue Generated" desc="18,000" />
        <ManagementTab title="Total Orders" desc="5000" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="Total Orders Amount" desc="55,000" />
        <ManagementTab title="Receiving Amount" desc="18,000" />
        <ManagementTab title="Pending Payments" desc="500" />
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."} />
      </div>
    </div>
  );
}
