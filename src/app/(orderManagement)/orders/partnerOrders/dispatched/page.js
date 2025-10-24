"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { NEW_ORDERS } from "../../orders.testids";

export default function DeliveredOrders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const router = useRouter();
  const { data } = GetAPI(
    userType === "salesRepresentative"
      ? `api/v1/admin/partner-order/orders-list?salesRepId=${userID}&statusId=2`
      : "api/v1/admin/partner-order/orders-list?statusId=2"
  );

  const columns = [
    { field: "id", header: "#", sort: true },
    { field: "salesRepName", header: "Partner Name" },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    { field: "totalBill", header: "Total", sort: true },
    { field: "paymentStatus", header: "Invoice", sort: true },
    { field: "orderCurrentStatus", header: "Status" },
  ];

  const datas = [];
  data?.data?.data?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      salesRepName: detail?.salesRepName,
      orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      totalBill: "$" + detail?.totalBill,
      deliveredOn: dayjs(detail?.deliveredOn).format("MM/DD/YYYY"),
      paymentStatus: detail?.paymentStatus === "pending" ? "Unpaid" : "Paid",
      orderCurrentStatus: detail?.orderCurrentStatus,
    });
  });
  const { toggle, setToggle } = useDataContext();

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div data-testid={NEW_ORDERS.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={NEW_ORDERS.headerBar}
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Dispatched Orders
          </h2>
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          data-testid={NEW_ORDERS.statsGrid}
        >
          <ManagementTab
            title="Total Orders"
            desc={data?.data?.data?.length}
            data-testid={NEW_ORDERS.totalOrdersCard}
          />
        </div>

        <div data-testid={NEW_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            onRowClick={(e) => {
              router.push(`/orders/partnerOrders/detail/${e?.data?.id}`);
            }}
            rowTestId={(row) => `data-testid-${NEW_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
