"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { useState } from "react";
import DrawerBeansGenerateInvoice from "@/components/ui/DrawerBeansGenerateInvoice"; 

export default function CreateInvoice() {
  let userID, userType;
  if (typeof window !== "undefined") {
    userID = localStorage.getItem("userID");
    userType = localStorage.getItem("userType");
  }

  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}`
      : `api/v1/admin/orders`
  );

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail) => {
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
  const [visibleRight, setVisibleRight] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]); 

  if (!data) return <Loader />;

  return (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Create Invoice</h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={resultedOrders?.length || 0} />
        </div>

        {/* Floating action button */}
        <div className="fixed right-10 bottom-10">
          <button
            onClick={() => setVisibleRight(true)}
            className="relative text-xl rounded-lg font-inter font-medium text-white px-2 sm:px-4 py-2.5 sm:py-4 bg-theme"
          >
            Create Invoice
            <div className="absolute -right-3 -top-3 bg-black size-7 rounded-full text-lg flex items-center justify-center">
              {invoiceData?.length || 0}
            </div>
          </button>
        </div>

        <DrawerBeansGenerateInvoice
          drawerOpen={visibleRight}
          setDrawerOpen={setVisibleRight}
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
        />
      </div>
    </div>
  );
}
