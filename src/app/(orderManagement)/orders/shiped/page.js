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
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { SHIPPED_ORDERS } from "../orders.testids";

export default function DispatchedOrders() {
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
    ? `api/v1/admin/orders?salesRepId=${userID}&statusId=5`
    : "api/v1/admin/orders?statusId=5";
  
  // Build URL with proper query parameters
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
    { field: "paymentStatus", header: "Invoice" },
    // { field: "createdBy", header: "Created By" },
    // { field: "orderCurrentStatus", header: "Status" },
    // { field: "action", header: "Action" },
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
      customerName: detail?.customerName,
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
      orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      deliveredOn: detail?.deliveredOn ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY") : "",
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            router.push(`/orders/detail/${detail?.id}`);
          }}
          data-testid={SHIPPED_ORDERS.rowViewBtn(detail?.id)}
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
    <div data-testid={SHIPPED_ORDERS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={SHIPPED_ORDERS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Shipped Orders</h2>
        </div>
      </div>
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={SHIPPED_ORDERS.statsGrid}>
          <ManagementTab title="Total Orders" desc={data?.pagination?.totalItems || data?.data?.pagination?.totalItems || data?.data?.data?.length || 0} data-testid={SHIPPED_ORDERS.totalOrdersCard}/>
          {/* <ManagementTab title="New Orders" desc="5%" />
         <ManagementTab title="Pending Orders" desc="5000" />
         <ManagementTab title="In progress Orders" desc="5,000" />
         <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        <div data-testid={SHIPPED_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Id, company name, invoice number, po number, note, payment method, shipping company"}
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
              router.push(`/orders/detail/${e.data.id}`);
            }}
            data-testid={SHIPPED_ORDERS.table}
            rowTestId={(row) => `data-testid-${SHIPPED_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
