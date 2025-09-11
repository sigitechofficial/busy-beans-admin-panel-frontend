"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { ALL_ORDERS } from "./orders.testids"

export default function Orders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;

  const router = useRouter();
  const [type, setType] = useState("all");

  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}`
      : "api/v1/admin/orders",
    "orders"
  );
  console.log("🚀 ~ Orders ~ data:", data?.data?.data);

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "id", header: "#", sort: true },
    // { field: "customerName", header: "Customer" },
    { field: "companyName", header: "Company Name" },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    // { field: "salesRepName", header: "Local Partner Name" },
    // { field: "subTotal", header: "Sub Total" },
    // { field: "discountPrice", header: "Discount Price" },
    // { field: "discountPercentage", header: "Discount Percentage" },
    // { field: "itemsPrice", header: "Items Price" },
    // { field: "vat", header: "Vat" },
    // { field: "totalWeight", header: "Total Weight" },
    // { field: "shippingCharges", header: "Shipping Charges" },
    // { field: "note", header: "Note" },
    // { field: "paymentMethod", header: "Payment Method" },
    // { field: "poNumber", header: "Po Number" },
    // { field: "orderFrequency", header: "Order Frequency" },

    { field: "totalBill", header: "Total", sort: true },
    { field: "paymentStatus", header: "Invoice", sort: true },
    // { field: "createdBy", header: "Created By" },
    { field: "orderCurrentStatus", header: "Status" },
    // { field: "action", header: "Action" },
  ];

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail, i) => {
    return (
      (type === "paid"
        ? detail?.paymentStatus === "done"
        : type === "unpaid"
        ? detail?.paymentStatus === "pending"
        : detail?.paymentStatus === "pending" ||
          detail?.paymentStatus === "done") &&
      datas.push({
        sl: slCounter++,
        id: detail?.id,
        // customerName: detail?.customerName,
        companyName: detail?.companyName,
        salesRepName: detail?.salesRepName,
        totalBill: "$" + detail?.totalBill,
        subTotal: "$" + detail?.subTotal,
        discountPrice: "$" + detail?.discountPrice,
        discountPercentage: detail?.discountPercentage + "%",
        itemsPrice: "$" + detail?.itemsPrice,
        vat: detail?.vat,
        totalWeight: detail?.totalWeight + "kg",
        shippingCharges: "$" + detail?.shippingCharges,
        note: detail?.note,
        paymentMethod: detail?.paymentMethod,
        poNumber: detail?.poNumber,
        orderFrequency: detail?.frequency,
        orderCurrentStatus: detail?.orderCurrentStatus,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        createdBy: detail?.createdBy,
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
        deliveredOn: dayjs(detail?.deliveredOn).format("MM/DD/YYYY"),
        // action: (
        //   <button
        //     className="border border-yellow-400 rounded-md p-2 text-yellow-400"
        //     onClick={() => {
        //       router.push(`/orders/detail/${detail?.id}`);
        //     }}
        //   >
        //     <FaEye size={24} />
        //   </button>
        // ),
      })
    );
  });
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={ALL_ORDERS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={ALL_ORDERS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Orders</h2>
        </div>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div data-testid={ALL_ORDERS.filtersBar}>
          <button
            onClick={() => setType("all")}
            className={`${
              type === "all" ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
            data-testid={ALL_ORDERS.filterAllBtn}
          >
            All Orders
          </button>
          <button
            onClick={() => setType("paid")}
            className={`${
              type === "paid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
            data-testid={ALL_ORDERS.filterPaidBtn}
          >
            Paid Orders
          </button>
          <button
            onClick={() => setType("unpaid")}
            className={`${
              type === "unpaid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
            data-testid={ALL_ORDERS.filterUnpaidBtn}
          >
            Unpaid Orders
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={resultedOrders?.length} 
          data-testid={ALL_ORDERS.totalOrdersCard}/>
          {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            onRowClick={(e) => {
              Example: router.push(`/orders/detail/${e.data.id}`);
            }}
            search={true}
            data-testid={ALL_ORDERS.table}
            rowTestId={(row) => `data-testid-${ALL_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
