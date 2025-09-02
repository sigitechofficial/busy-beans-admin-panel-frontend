"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";

export default function Pullouts() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;

  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(0); 
  const isPendingPullout = Number(statusFilter) === 0;

  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&adminReceivableStatus=${statusFilter}`
      : `api/v1/admin/orders?adminReceivableStatus=${statusFilter}`
  );

  const columns = [
    // { field: "id", header: "#", sort: true },
    { field: "invoiceNumber", header: "INV#" },
    { field: "companyName", header: "Company" },
    { field: "invoiceDate", header: "Invoice Date", sort: true },
    { field: "totalBill", header: "Total", sort: true },
    { field: "localPartnerCommission", header: "Partner Profit", sort: true },
    { field: "adminReceivableAmount", header: "Admin Receivable", sort: true },          
    { field: "paymentStatus", header: "Invoice", sort: true },
    { field: "orderCurrentStatus", header: "Status" },
  ];

  if (isPendingPullout) {
    columns.splice(6, 0, {
      field: "overDueInvoice",
      header: "Overdue Invoice",
      sort: true,
    });
  }
  
  const safeFormatDate = (v) => {
    if (!v || v === "null" || v === "undefined" || v === "0000-00-00") return "";
    const d = dayjs(v);
    return d.isValid() ? d.format("MM/DD/YYYY") : "";
  };
  const formatMoney = (v) => {
    const n = Number(v);
    return "$" + (Number.isFinite(n) ? n.toFixed(2) : "0.00");
  };

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail, i) => {
    const partnerCommission = isPendingPullout
      ? (detail?.totalSalerCommission ?? "0.00")
      : (detail?.localPartnerCommission ?? detail?.localPatnerCommission ?? "0.00");

    const adminReceivable = isPendingPullout
      ? (detail?.adminEarnings ?? "0.00")
      : (detail?.adminReceivableAmount ?? "0.00");

    const overdueFlag = Number(detail?.overdueInvoice) === 1 ? "Yes" : "No";
    return (
      (detail?.paymentStatus === "pending" || detail?.paymentStatus === "done") &&
      datas.push({
        sl: slCounter++,
        id: detail?.id,
        companyName: detail?.companyName,
        invoiceNumber: detail?.invoiceNumber,
        totalBill: formatMoney(detail?.totalBill),
        localPartnerCommission: formatMoney(partnerCommission),
        adminReceivableAmount: formatMoney(adminReceivable),
        ...(isPendingPullout ? { overDueInvoice: overdueFlag } : {}),
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        invoiceDate: safeFormatDate(detail?.invoiceDate),
        orderCurrentStatus: detail?.orderCurrentStatus,
      })
    );
  });

  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Orders</h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div>
          <button
            onClick={() => {
              setStatusFilter(0); 
            }}
            className={`${
              statusFilter === 0 ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60`}
          >
            Pending Pullouts
          </button>
          <button
            onClick={() => {
              setStatusFilter(1); 
            }}
            className={`${
              statusFilter === 1 ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200 max-sm:w-60`}
          >
            Confirm Pullouts
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={resultedOrders?.length} />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            onRowClick={(e) => {
              router.push(`/orders/detail/${e.data.id}`);
            }}
            search={true}
            sortField="overDueInvoice"
          />
        </div>
      </div>
    </div>
  );
}
