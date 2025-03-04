"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";

export default function Orders() {
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
          Order Management
        </h2>
        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Complete Orders" desc="5000" />
        <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" />
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."} />
      </div>
    </div>
  );
}
