"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";

export default function AcknowledgedOrders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }
  const router = useRouter();
  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&statusId=3`
      : "api/v1/admin/orders?statusId=3"
  );

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "id", header: "#", sort: true },
    { field: "companyName", header: "Company Name" },
    // { field: "customerName", header: "Customer" },
    { field: "itemsPrice", header: "Items Price" },
    { field: "subTotal", header: "Sub Total" },
    { field: "totalBill", header: "Total" },
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
    // { field: "paymentStatus", header: "Payment Status" },
    // { field: "createdBy", header: "Created By" },
    // { field: "action", header: "Action" },
  ];

  const datas = [];
  data?.data?.data?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      // customerName: detail?.customerName,
      companyName: detail?.companyName,
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
            Acknowledged Orders
          </h2>
        </div>
      </div>
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
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
              Example: router.push(`/orders/detail/${e.data.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
