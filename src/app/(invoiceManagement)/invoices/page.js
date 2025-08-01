"use client";
import Loader from "@/components/ui/Loader";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import selectStyles from "@/utilities/SelectStyle";
import { useRouter } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import Select from "react-select";

export default function Invoices() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/customer-management/invoice-customers-balance/sales-rep/${userID}`
      : "api/v1/admin/customer-management/invoice-customers-balance"
  );

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    // { field: "name", header: "Name" },
    { field: "companyName", header: "Customer" },
    // { field: "email", header: "Email" },
    // { field: "phoneNumber", header: "Phone Number" },
    // { field: "saleTaxNumber", header: "Sale Tax Number" },
    { field: "emailToSendInvoices", header: "Invoice Email" },
    { field: "totalBalance", header: "Total Balance", sort: true },
    { field: "overdueOrders", header: "Overdue Orders" },
  ];

  const datas = [];
  data?.data?.data?.map((invoice, i) => {
    return datas.push({
      sl: i + 1,
      id: invoice?.id,
      companyName: invoice?.companyName,
      email: invoice?.email,
      image: invoice?.image,
      phoneNumber: invoice?.phoneNumber,
      saleTaxNumber: invoice?.saleTaxNumber,
      emailToSendInvoices: invoice?.emailToSendInvoices,
      overdueOrders:
        invoice?.overDueOrders == 0 ? "No overdue" : invoice?.overDueOrders,
      totalBalance: invoice?.totalBalance
        ? `$${invoice?.totalBalance}`
        : `$${0}`,
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
            Invoices Management
          </h2>
        </div>
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Invoices Management
          </h2>
          <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Invoices"
            desc={data?.data?.data?.length}
          />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            sortField="totalBalance"
            sortOrder={-1}
            onRowClick={(e) => router.push(`/invoices/${e.data.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
