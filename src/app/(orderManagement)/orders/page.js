"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Orders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }
  const router = useRouter();
  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}`
      : "api/v1/admin/orders"
  );

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "customerName", header: "Customer Name" },
    { field: "totalBill", header: "Total Bill" },
    { field: "subTotal", header: "Sub Total" },
    { field: "discountPrice", header: "Discount Price" },
    { field: "discountPercentage", header: "Discount Percentage" },
    { field: "itemsPrice", header: "Items Price" },
    { field: "vat", header: "Vat" },
    { field: "totalWeight", header: "Total Weight" },
    { field: "note", header: "Note" },
    { field: "paymentMethod", header: "Payment Method" },
    { field: "poNumber", header: "Po Number" },
    { field: "orderFrequency", header: "Order Frequency" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      customerName: detail?.customerName,
      totalBill: "$" + detail?.totalBill,
      subTotal: "$" + detail?.subTotal,
      discountPrice: "$" + detail?.discountPrice,
      discountPercentage: detail?.discountPercentage + "%",
      itemsPrice: "$" + detail?.itemsPrice,
      vat: detail?.vat,
      totalWeight: detail?.totalWeight + "kg",
      note: detail?.note,
      paymentMethod: detail?.paymentMethod,
      poNumber: detail?.poNumber,
      orderFrequency: detail?.frequency,
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            router.push(`/orders/detail/${detail?.id}`);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Order Management
        </h2>
        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

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
        />
      </div>
    </div>
  );
}
