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
import { NEW_ORDERS } from "../../orders.testids";

export default function AcknowledgedOrders() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const router = useRouter();
  
  // Build API URL with pagination and search query parameters
  const baseUrl = userType === "salesRepresentative"
    ? `api/v1/admin/partner-order/orders-list?salesRepId=${userID}&statusId=3`
    : "api/v1/admin/partner-order/orders-list?statusId=3";
  
  // Build URL with proper query parameters
  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  const apiUrl = `${urlBase}?${params.toString()}`;
  
  const { data } = GetAPI(apiUrl);

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
  
  // Handle both possible API response structures for pagination
  const ordersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
    ? data?.data
    : [];
  
  ordersArray?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      salesRepName: detail?.salesRepName,
      orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      totalBill: "$" + detail?.totalBill,
      deliveredOn: detail?.deliveredOn ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY") : "",
      paymentStatus: detail?.paymentStatus === "pending" ? "Unpaid" : "Paid",
      orderCurrentStatus: detail?.orderCurrentStatus,
    });
  });
  const { toggle, setToggle } = useDataContext();

  return !data ? (
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
            Acknowledged Orders
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
            desc={data?.pagination?.totalItems || data?.data?.pagination?.totalItems || data?.data?.data?.length || 0}
            data-testid={NEW_ORDERS.totalOrdersCard}
          />
        </div>

        <div data-testid={NEW_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Id, partner name, invoice number, po number, note, payment method, shipping company"}
            pagination={true}
            serverPagination={{
              page: data?.pagination?.page || data?.data?.pagination?.page || page,
              limit: data?.pagination?.limit || data?.data?.pagination?.limit || limit,
              totalRecords: data?.pagination?.totalItems || data?.data?.pagination?.totalItems || 0,
              totalPages: data?.pagination?.totalPages || data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1); // Reset to first page when search changes
            }}
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
