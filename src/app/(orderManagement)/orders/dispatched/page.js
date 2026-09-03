"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { DISPATCHED_ORDERS } from "../orders.testids";

export default function DeliveredOrders() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();

  const baseUrl =
    userType === "salesRepresentative"
      ? `api/v1/admin/orders?salesRepId=${userID}&statusId=5`
      : "api/v1/admin/orders?statusId=5";

  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  const apiUrl = `${urlBase}?${params.toString()}`;

  const { data, isLoading } = GetAPI(apiUrl);

  const columns = [
    { field: "id", header: "#", sort: true },
    { field: "companyName", header: "Company Name" },
    { field: "orderDate", header: "Order Date" },
    { field: "deliveredOn", header: "Deliver On" },
    { field: "totalBill", header: "Total" },
    { field: "paymentStatus", header: "Invoice" },
    { field: "orderCurrentStatus", header: "Status" },
  ];

  const datas = [];
  const ordersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];

  ordersArray?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      companyName: detail?.companyName,
      totalBill: "$" + detail?.totalBill,
      orderCurrentStatus: detail?.orderCurrentStatus,
      paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
      orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      deliveredOn: detail?.deliveredOn
        ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY")
        : "",
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            router.push(`/orders/detail/${detail?.id}`);
          }}
          data-testid={DISPATCHED_ORDERS.rowViewBtn(detail?.id)}
        >
          <FaEye size={24} />
        </button>
      ),
    });
  });

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={DISPATCHED_ORDERS.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={DISPATCHED_ORDERS.headerBar}
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
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          data-testid={DISPATCHED_ORDERS.statsGrid}
        >
          <ManagementTab
            title="Total Orders"
            desc={
              data?.pagination?.totalItems ||
              data?.data?.pagination?.totalItems ||
              data?.data?.data?.length ||
              0
            }
            data-testid={DISPATCHED_ORDERS.totalOrdersCard}
          />
        </div>

        <div data-testid={DISPATCHED_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={
              "Search by Id, company name, invoice number, po number, note, payment method, shipping company"
            }
            pagination={true}
            serverPagination={{
              page:
                data?.pagination?.page || data?.data?.pagination?.page || page,
              limit:
                data?.pagination?.limit ||
                data?.data?.pagination?.limit ||
                limit,
              totalRecords:
                data?.pagination?.totalItems ||
                data?.data?.pagination?.totalItems ||
                0,
              totalPages:
                data?.pagination?.totalPages ||
                data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1);
            }}
            search={true}
            onRowClick={(e) => {
              router.push(`/orders/detail/${e.data.id}`);
            }}
            data-testid={DISPATCHED_ORDERS.table}
            rowTestId={(row) => `data-testid-${DISPATCHED_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
