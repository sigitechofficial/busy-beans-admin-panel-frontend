"use client";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { useRouter } from "next/navigation";

export default function SalesRepresentativeCustomers() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
  }


  const router  = useRouter()
  const { data } = GetAPI(
    `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID} `
  );
  console.log("🚀 ~ SalesRepresentativeCustomers ~ data:", data?.data?.data)

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name", sort: true },
    { field: "email", header: "Email", sort: true },
    { field: "phoneNumber", header: "Phone Number", sort: true },
    { field: "emailToSendInvoices", header: "Invoice Email", sort: true },
    { field: "saleTaxNumber", header: "Sale Tax Number", sort: true },
    { field: "totalOrderAmount", header: "Total Orders", sort: true },
    { field: "totalOrderPlaced", header: "Total Orders Placed", sort: true },
    { field: "status", header: "status", sort: true },
  ];

  const datas = [];

  data?.data?.data?.map((customer, i) => {
    datas.push({
      id: customer?.id,
      sl: i + 1,
      name: customer?.name,
      email: customer?.email,
      phoneNumber: customer?.phoneNumber,
      emailToSendInvoices: customer?.emailToSendInvoices,
      saleTaxNumber: customer?.saleTaxNumber,
      totalOrderAmount: customer?.totalOrderAmount,
      totalOrderPlaced: customer?.totalOrderPlaced,
      status: (
        <div>
          {customer?.status ? (
            <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
    });
  });

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Customer Management
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => router.push("/sales-representative/customers/add")}
          className="rounded-lg font-inter font-medium border border-theme text-white bg-theme hover:bg-white hover:text-theme duration-150 px-2 sm:px-3 py-2.5 sm:py-4"
        >
          + Add New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Customer" desc={data?.data?.data?.length} />
        {/* <ManagementTab
          title="New Customer"
          desc={dashboardCards?.data?.data?.newCustomer}
        />
        <ManagementTab
          title="Active Customer"
          desc={dashboardCards?.data?.data?.activeCustomer}
        />
        <ManagementTab
          title="Inactive Customer"
          desc={dashboardCards?.data?.data?.inactiveCustomer}
        /> */}
      </div>

      <div>
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
        />
      </div>
    </div>
  );
}
