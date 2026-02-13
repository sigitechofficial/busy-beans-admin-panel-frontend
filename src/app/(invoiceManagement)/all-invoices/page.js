"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";

export default function AllInvoices() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;

  const router = useRouter();
  const [type, setType] = useState("all");
  const [invoiceSource, setInvoiceSource] = useState("customer");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Build API URL with pagination and search (same pattern as /orders)
  const baseUrl =
    invoiceSource === "customer"
      ? userType === "admin"
        ? "api/v1/admin/orders?statusId[ne]=6&type=all&invoiceDate[ne]=null"
        : `api/v1/admin/orders?salesRepId=${userID}&statusId[ne]=6&type=all&invoiceDate[ne]=null`
      : "api/v1/admin/partner-order/orders-list?statusId[ne]=6&type=all&invoiceDate[ne]=null";

  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  const apiUrl = `${urlBase}?${params.toString()}`;

  const { data, isLoading } = GetAPI(apiUrl, "orders");

  const columns = [
    { field: "id", header: "#", sort: true },
    {
      field: "companyName",
      header: invoiceSource === "partner" ? "Local Partner" : "Company Name",
    },
    { field: "type", header: "Type",sort: true },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    { field: "totalBill", header: "Total", sort: true },
    { field: "paymentStatus", header: "Invoice", sort: true },
    { field: "orderCurrentStatus", header: "Status" },
    { field: "action", header: "Action" },
  ];

  const datas = [];
  const ordersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
      ? data?.data
      : [];
  const resultedOrders = ordersArray.filter((detail, i) => {
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
        type: detail?.type?.split("-").join(" "),
        companyName:
          invoiceSource === "partner"
            ? detail?.salesRepName
            : detail?.companyName,
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
        deliveredOn: detail?.deliveredOn ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY") : "-",
        action: (
          <button
            className="border border-theme rounded-md p-2 text-theme hover:bg-theme hover:text-white transition-colors"
            onClick={() => {
              if (invoiceSource === "partner") {
                // Partner invoices: check if direct-invoice or regular order
                if (detail?.type === "direct-invoice") {
                  router.push(`/all-invoices/partner/${detail?.id}`);
                } else {
                  router.push(`/orders/partnerOrders/detail/${detail?.id}`);
                }
              } else if (detail?.type === "direct-invoice") {
                router.push(`/direct-invoices/${detail?.id}`);
              } else {
                router.push(`/orders/detail/${detail?.id}`);
              }
            }}
            title="View Details"
          >
            <FaEye size={18} />
          </button>
        ),
      })
    );
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">All Invoices</h2>
        </div>

        {/* Toggle for Invoice Source */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setInvoiceSource("customer");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              invoiceSource === "customer"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer Invoices
          </button>
          {["admin", "salesRepresentative"].includes(userType) && (
            <button
              onClick={() => {
                setInvoiceSource("partner");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                invoiceSource === "partner"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {userType === "admin" ? "Partner Invoices" : "Self Invoices"}
            </button>
          )}
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div>
          <button
            onClick={() => {
              setType("all");
              setPage(1);
            }}
            className={`${
              type === "all" ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            All Invoices
          </button>
          <button
            onClick={() => {
              setType("paid");
              setPage(1);
            }}
            className={`${
              type === "paid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            Paid Invoices
          </button>
          <button
            onClick={() => {
              setType("unpaid");
              setPage(1);
            }}
            className={`${
              type === "unpaid" ? "bg-black text-white" : "bg-white text-black"
            }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
          >
            Unpaid Invoices
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Invoices"
            desc={
              data?.pagination?.totalItems ??
              data?.data?.pagination?.totalItems ??
              resultedOrders?.length ??
              0
            }
          />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Id, invoice number, company name..."}
            pagination={true}
            serverPagination={{
              page:
                data?.pagination?.page ??
                data?.data?.pagination?.page ??
                page,
              limit:
                data?.pagination?.limit ??
                data?.data?.pagination?.limit ??
                limit,
              totalRecords:
                data?.pagination?.totalItems ??
                data?.data?.pagination?.totalItems ??
                0,
              totalPages:
                data?.pagination?.totalPages ??
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
            onRowClick={(e) => {
              if (invoiceSource === "partner") {
                // Partner invoices: check if direct-invoice or regular order
                if (e.data.type === "direct invoice") {
                  router.push(`/all-invoices/partner/${e.data.id}`);
                } else {
                  router.push(`/orders/partnerOrders/detail/${e.data.id}`);
                }
              } else if (e.data.type === "direct invoice") {
                router.push(`/direct-invoices/${e.data.id}`);
              } else {
                router.push(`/orders/detail/${e.data.id}`);
              }
            }}
            search={true}
          />
        </div>
      </div>
    </div>
  );
}
