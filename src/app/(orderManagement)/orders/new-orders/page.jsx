"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { useState } from "react";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { NEW_ORDERS } from "../orders.testids"

export default function NewOrders() {
  const [type, setType] = useState("dropship");
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  console.log("🚀 ~ NewOrders ~ userType:", userType, userID);

  const router = useRouter();
  const ordersEndpoint =
    type === "direct-partner"
      ? `api/v1/admin/partner-order/orders-list`
      : (userType === "salesRepresentative"
          ? `api/v1/admin/orders?salesRepId=${userID}&statusId=1`
          : `api/v1/admin/orders?statusId=1`);

  const { data, isLoading } = GetAPI(ordersEndpoint);

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "id", header: "#", sort: true },
    // { field: "customerName", header: "Customer" },
    { field: type === "direct-partner" ? "salesRepName" : "companyName", header: type === "direct-partner" ? "Partner Name" : "Company Name" },
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
  data?.data?.data?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      companyName: detail?.companyName,
      salesRepName: detail?.salesRepName,
      orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      totalBill: "$" + detail?.totalBill,
      deliveredOn: dayjs(detail?.deliveredOn).format("MM/DD/YYYY"),
      paymentStatus: detail?.paymentStatus === "pending" ? "Unpaid" : "Paid",
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
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            router.push(`/supplier/order-detail/${detail?.id}`);
          }}
          data-testid={NEW_ORDERS.rowViewBtn(detail?.id)}
        >
          <FaEye size={24} />
        </button>
      ),
    });
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
      <Loader />
    ) : (
    <div data-testid={NEW_ORDERS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={NEW_ORDERS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">New Orders</h2>
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
        {/* <div className="flex justify-between items-center mt-6">
          <div>
            <button
              onClick={() => setType("dropship")}
              className={`${type === "dropship" ? "bg-black text-white" : "bg-white text-black"
                } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Dropship Orders
            </button>

            <button
              onClick={() => setType("direct-partner")}
              className={`${type === "direct-partner"
                ? "bg-black text-white"
                : "bg-white text-black"
                } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
            >
              Partner Orders
            </button>
          </div>
        </div> */}
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Dispatched Orders
          </h2>
          <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          data-testid={NEW_ORDERS.statsGrid} >
          <ManagementTab title="Total Orders" desc={data?.data?.data?.length} 
            data-testid={NEW_ORDERS.totalOrdersCard}
          />
          {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        <div data-testid={NEW_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            onRowClick={(e) => {
              router.push(`/orders/detail/${e?.data?.id}`);
            }}
            rowTestId={(row) => `data-testid-${NEW_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
