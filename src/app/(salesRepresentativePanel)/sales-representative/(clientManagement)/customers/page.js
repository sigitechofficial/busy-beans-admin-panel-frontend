"use client";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { useRouter } from "next/navigation";
import Switch from "react-switch";
import { success_toaster } from "@/utilities/Toaster";
import { PatchAPI } from "@/utilities/PatchAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";

export default function SalesRepresentativeCustomers() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
  }

  const router = useRouter();
  const { data, reFetch } = GetAPI(
    `api/v1/admin/customer-management/customer-list/sale-rep-id/${userID} `
  );

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/customer-update/${id}`, {
        status: !status,
      });
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name", sort: true },
    { field: "mainContact", header: "	Main Contact" },
    // { field: "email", header: "Email", sort: true },
    // { field: "phoneNumber", header: "Phone Number", sort: true },
    // { field: "emailToSendInvoices", header: "Invoice Email", sort: true },
    // { field: "saleTaxNumber", header: "Sale Tax Number", sort: true },
    // { field: "totalOrderAmount", header: "Total Orders", sort: true },
    // { field: "totalOrderPlaced", header: "Total Orders Placed", sort: true },
    {
      field: "salesRepName",
      header: "Group",
      minWidth: "14rem",
    },
    {
      field: "employee",
      header: "Employee",
      minWidth: "14rem",
    },
    // {
    //   field: "salesRepState",
    //   header: "Sales Representative State",
    //   minWidth: "14rem",
    // },
    // { field: "status", header: "Status" },
    { field: "lastOrder", header: "Last Order" },
    {
      field: "changeStatus",
      header: "Status",
    },
    // { field: "action", header: "Action" },  // pending to be done
  ];

  const datas = [];

  data?.data?.data?.map((customer, i) => {
    datas.push({
      id: customer?.id,
      sl: i + 1,
      name: customer?.companyName, //company name
      mainContact: customer?.name, //Main contact name
      email: customer?.email,
      phoneNumber: customer?.phoneNumber,
      emailToSendInvoices: customer?.emailToSendInvoices,
      saleTaxNumber: customer?.saleTaxNumber,
      totalOrderAmount: customer?.totalOrderAmount,
      totalOrderPlaced: customer?.totalOrderPlaced,
      salesRepName: customer?.salesRepName ?? (
        <di className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
          Not Assigned
        </di>
      ),
      employee: customer?.employee ?? (
        <di className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
          Not Assigned
        </di>
      ),
      lastOrder: "last order",
      status: (
        <div>
          {customer?.status ? (
            <div className="w-24 bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 text-white bg-[#EE4A4A]  font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
      lastOrder: "last order",
      changeStatus: (
        <label className="flex gap-2 items-center">
          {customer?.status ? (
            <div className="w-max text-xs bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-max text-xs text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
          <Switch
            onChange={() => {
              handleStatus(customer?.id, customer?.status);
            }}
            checked={customer?.status}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#86644c"
            onHandleColor="#fff"
            className="react-switch"
            boxShadow="none"
          />
        </label>
      ),
    });
  });
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
            Customer Management
          </h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li
            onClick={() => router.push("/sales-representative/customers/add")}
          >
            Add Customer
          </li>
        </ul>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center justify-end">
          {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Customer Management
          </h2> */}

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>

        {/* <div className="flex justify-end">
          <button
            onClick={() => router.push("/sales-representative/customers/add")}
            className="rounded-lg font-inter font-medium border border-theme text-white bg-theme hover:bg-white hover:text-theme duration-150 px-2 sm:px-3 py-2.5 sm:py-4"
          >
            + Add New Customer
          </button>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Customer"
            desc={data?.data?.data?.length}
          />
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
            search={true}
            onRowClick={(e) => {
              router.push(`/customers/${e?.data?.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
