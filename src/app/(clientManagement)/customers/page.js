"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import GetAPI from "@/utilities/GetAPI";

export default function Customers() {

  const { data } = GetAPI('api/v1/admin/customer-management/customer-list/all')
  console.log("🚀 ~ Customers ~ data:", data?.data?.data)
  const { data: dashboardCards } = GetAPI('api/v1/admin/customer-management/dahboard-cards')
  // console.log("🚀 ~ Customers ~ data:", data?.data?.data)
  
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name", sort: true },
    { field: "email", header: "Email", sort: true },
    { field: "phoneNumber", header: "Phone Number", sort: true },
    { field: "emailToSendInvoices", header: "Invoice Email", sort: true },
    { field: "saleTaxNumber", header: "SL", sort: true },
    { field: "totalOrderAmount", header: "SL", sort: true },
    { field: "totalOrderPlaced", header: "SL", sort: true },
    { field: "status", header: "SL", sort: true },
    
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
        <ManagementTab title="Total Customer" desc={dashboardCards?.data?.data?.totalCustomer} />
        <ManagementTab title="New Customer" desc={dashboardCards?.data?.data?.newCustomer} />
        <ManagementTab title="Active Customer" desc={dashboardCards?.data?.data?.activeCustomer} />
        <ManagementTab title="Inactive Customer" desc={dashboardCards?.data?.data?.inactiveCustomer} />
        {/* <ManagementTab title="T.Revenue Generated" desc="18,000" />
        <ManagementTab title="Total Orders" desc="5000" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="Total Orders Amount" desc="55,000" />
        <ManagementTab title="Receiving Amount" desc="18,000" />
        <ManagementTab title="Pending Payments" desc="500" /> */}
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."} />
      </div>
    </div>
  );
}
