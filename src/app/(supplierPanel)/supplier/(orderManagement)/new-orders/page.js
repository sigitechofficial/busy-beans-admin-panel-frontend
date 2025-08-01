"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function NewOrders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }
  
  console.log("🚀 ~ NewOrders ~ userType:", userType,userID)
  
  const router = useRouter();
  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&statusId=1`
      : "api/v1/admin/orders?statusId=1"
  );


  const columns = [
    // { field: "sl", header: "#", sort: true },
    { field: "id", header: "#", sort: true },
    { field: "customerName", header: "Customer" },
    { field: "noOfItems", header: "No. of Items" },
    // { field: "itemsPrice", header: "Items Price" },
    // { field: "subTotal", header: "Sub Total" },
    // { field: "totalBill", header: "Total" },
    // { field: "discountPrice", header: "Discount Price" },
    // { field: "discountPercentage", header: "Discount Percentage" },
    // { field: "vat", header: "Vat" },
    // { field: "totalWeight", header: "Total Weight" },
    // { field: "shippingCharges", header: "Shipping Charges" },
    // { field: "note", header: "Note" },
    // { field: "paymentMethod", header: "Payment Method" },
    // { field: "poNumber", header: "Po Number" },
    // { field: "orderFrequency", header: "Order Frequency" },
    { field: "orderCurrentStatus", header: "Status" },
    // { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      customerName: detail?.customerName,
      noOfItems: detail?.items?.length,
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
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            router.push(`/supplier/order-detail/${detail?.id}`);
          }}
        >
          <FaEye size={24} />
        </button>
      ),
    });
  });

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          New Orders
        </h2>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Dispatched Orders
          </h2>
          <Select placeholder="Filters" className="w-40" styles={selectStyles} />
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={data?.data?.data?.length} />
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
            search={true}
            onRowClick={(e) => {
              router.push(`/supplier/order-detail/${e?.data?.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
