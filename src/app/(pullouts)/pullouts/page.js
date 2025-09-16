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
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PULLOUTS } from "./pullouts.testid";

export default function Pullouts() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loader, setLoader] = useState(false);

  const isPendingPullout = Number(statusFilter) === 0;

  const { data, reFetch } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&adminReceivableStatus=${statusFilter}`
      : `api/v1/admin/orders?adminReceivableStatus=${statusFilter}`
  );

  const columns = [
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
    columns.splice(1, 0, {
      field: "overDueInvoice",
      header: "Overdue Invoice",
      sort: true,
    });
  } else {
    columns.splice(6, 0, {
      field: "pulloutTransferId",
      header: "Pullout Transfer Id",
      sort: false,
    });
  }

  if (!isPendingPullout) {
    columns.splice(7, 0, {
      field: "pulloutDate",
      header: "Pullout Date",
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
  const resultedOrders = data?.data?.data?.filter((detail) => {
    const partnerCommission = isPendingPullout
      ? (detail?.totalSalerCommission ?? "0.00")
      : (detail?.localPartnerCommission ?? detail?.localPatnerCommission ?? "0.00");

    const adminReceivableRaw = Number(
      isPendingPullout
        ? (detail?.adminEarnings ?? 0)
        : (detail?.adminReceivableAmount ?? 0)
    ) || 0;

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
        adminReceivableAmount: formatMoney(adminReceivableRaw),
        adminReceivableRaw, 
        // ...(isPendingPullout ? { overDueInvoice: overdueFlag } : {}),
        ...(isPendingPullout ? {
          overDueInvoice: overdueFlag === "Yes"
            ? <span style={{ color: "red", fontWeight: "bold" }}>Yes</span>
            : "No"
        } : {}),
        ...(!isPendingPullout ? { pulloutTransferId: detail?.pulloutIntentId ?? "" } : {}),
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        invoiceDate: safeFormatDate(detail?.invoiceDate),
        ...(!isPendingPullout ? { pulloutDate: safeFormatDate(detail?.pulloutDate) ?? ""} : {}),
        orderCurrentStatus: detail?.orderCurrentStatus,
      })
    );
  });

  const handlePulloutPayments = async () => {
    if (!selectedRows?.length) return;

    const amount = selectedRows.reduce(
      (sum, row) => sum + (Number(row?.adminReceivableRaw) || 0),
      0
    );

    const orderList = selectedRows.map((row) => ({ id: row.id }));

    setLoader(true);
    try {
      const res = await PostAPI(
        `api/v1/admin/pull-payments-from-patners-banka-account/${userID}`,
        { amount, orderList }
      );
      if (res?.data?.status === "success") {
        success_toaster("Admin Receivable Amount pullout successfully");
        setSelectedRows([]);
        reFetch?.();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoader(false);
    }
  };

  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={PULLOUTS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={PULLOUTS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={PULLOUTS.title}>Orders</h2>
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
            data-testid={PULLOUTS.pendingPulloutsBtn}
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
            data-testid={PULLOUTS.confirmPulloutsBtn}
          >
            Confirm Pullouts
          </button>
        </div>

        {/* {(userType === "admin" && isPendingPullout) && (
          <div className="flex justify-end">
            <button
              disabled={!selectedRows.length || loader}
              onClick={handlePulloutPayments}
              className={`rounded-lg font-inter font-medium text-white bg-theme hover:text-theme hover:bg-white border border-theme duration-150 px-5 py-3 sm:h-full ${
                !selectedRows.length || loader ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loader ? "Processing..." : "Pullout Payment"}
            </button>
          </div>
        )} */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={PULLOUTS.statsGrid}>
          <ManagementTab title="Total Orders" desc={resultedOrders?.length} data-testid={PULLOUTS.totalOrdersCard}/>
        </div>

        <div data-testid={PULLOUTS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            checkbox={isPendingPullout}         
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onRowClick={(e) => router.push(`/orders/detail/${e.data.id}`)}
            search={true}
            sortField={isPendingPullout ? "overDueInvoice" : undefined}
            sortOrder={-1}
            data-testid={PULLOUTS.table}
            rowTestId={(row) => `data-testid-${PULLOUTS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
