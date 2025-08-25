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

  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&adminReceivableStatus=${statusFilter}`
      : `api/v1/admin/orders?adminReceivableStatus=${statusFilter}`
  );

  const columns = [
    { field: "id", header: "#", sort: true },
    { field: "companyName", header: "Company Name" },
    { field: "invoiceNumber", header: "Invoice Number" },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    { field: "totalBill", header: "Total", sort: true },
    { field: "paymentStatus", header: "Invoice", sort: true },
    { field: "orderCurrentStatus", header: "Status" },
  ];

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail, i) => {
    return (
      (detail?.paymentStatus === "pending" || detail?.paymentStatus === "done") &&
      datas.push({
        sl: slCounter++,
        id: detail?.id,
        companyName: detail?.companyName,
        invoiceNumber: detail?.invoiceNumber,
        totalBill: "$" + detail?.totalBill,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
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
          />
        </div>
      </div>
    </div>
  );
}
