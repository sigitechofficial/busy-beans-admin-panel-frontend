"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { INDIVIDUAL_INVOICES } from "../invoice.testid"

export default function IndividualInvoices() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const router = useRouter();
  const { data, isLoading } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}`
      : `api/v1/admin/orders`
  );

  const columns = [
    { field: "invoiceNumber", header: "INV#" },
    { field: "companyName", header: "Company" },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "totalBill", header: "Total" },
    { field: "paymentStatus", header: "Status" },
  ];

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail, i) => {
    return (
      (detail?.paymentStatus === "pending" || detail?.paymentStatus === "done") &&
      datas.push({
        id: detail?.id,
        invoiceNumber: detail?.invoiceNumber,
        companyName: detail?.companyName,
        totalBill: "$" + detail?.totalBill,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      })
    );
  });

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={INDIVIDUAL_INVOICES.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={INDIVIDUAL_INVOICES.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={INDIVIDUAL_INVOICES.title}>Invoices</h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={INDIVIDUAL_INVOICES.statsGrid}>
          <ManagementTab title="Total Orders" desc={resultedOrders?.length} data-testid={INDIVIDUAL_INVOICES.totalInvoicesCard}/>
        </div>

        <div data-testid={INDIVIDUAL_INVOICES.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            onRowClick={(e) => {
              router.push(`/orders/detail/${e.data.id}`);
            }}
            search={true}
            data-testid={INDIVIDUAL_INVOICES.table}
            rowTestId={(row) => `data-testid-${INDIVIDUAL_INVOICES.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
