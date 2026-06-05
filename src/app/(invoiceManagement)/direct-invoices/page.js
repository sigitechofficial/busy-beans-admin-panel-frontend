"use client";
import { useState } from "react";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { INDIVIDUAL_INVOICES } from "../invoice.testid";

export default function IndividualInvoices() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const router = useRouter();
  const [invoiceSource, setInvoiceSource] = useState("admin");
  const [customerInvoiceOwner, setCustomerInvoiceOwner] = useState("all");

  const baseUrl =
    invoiceSource === "admin"
      ? userType === "salesRepresentative"
        ? `api/v1/admin/orders?salesRepId=${userID}&type=direct-invoice&sort=invoiceDate`
        : `api/v1/admin/orders?type=direct-invoice&sort=invoiceDate`
      : `api/v1/admin/partner-order/orders-list?type=direct-invoice&sort=invoiceDate`;

  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  if (
    userType === "admin" &&
    invoiceSource === "admin" &&
    customerInvoiceOwner === "admin"
  ) {
    params.set("salesRepId", "null");
  } else if (
    userType === "admin" &&
    invoiceSource === "admin" &&
    customerInvoiceOwner === "partner"
  ) {
    params.set("salesRepId[ne]", "null");
  }
  const apiUrl = `${urlBase}?${params.toString()}`;

  const { data, isLoading } = GetAPI(apiUrl);

  const columns = [
    { field: "invoiceNumber", header: "INV#" },
    {
      field: "companyName",
      header: invoiceSource === "partner" ? "Local Partner" : "Company",
    },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "totalBill", header: "Total" },
    { field: "paymentStatus", header: "Status" },
  ];

  const datas = [];
  const resultedOrders = data?.data?.data?.filter((detail, i) => {
    return (
      (detail?.paymentStatus === "pending" ||
        detail?.paymentStatus === "done") &&
      datas.push({
        id: detail?.id,
        invoiceNumber: detail?.invoiceNumber,
        companyName:
          invoiceSource === "partner"
            ? detail?.salesRepName
            : detail?.companyName,
        totalBill: "$" + detail?.totalBill,
        paymentStatus: detail?.paymentStatus === "done" ? "Paid" : "Unpaid",
        orderDate: dayjs(detail?.on).format("MM/DD/YYYY"),
      })
    );
  });

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div className="w-full" data-testid={INDIVIDUAL_INVOICES.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={INDIVIDUAL_INVOICES.headerBar}
      >
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2
            className="text-xl font-inter font-semibold"
            data-testid={INDIVIDUAL_INVOICES.title}
          >
            Invoices
          </h2>
        </div>

        {/* Toggle for Invoice Source */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInvoiceSource("admin")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              invoiceSource === "admin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer Invoices
          </button>
          {["admin", "salesRepresentative"].includes(userType) && (
            <button
              onClick={() => setInvoiceSource("partner")}
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
        {userType === "admin" && invoiceSource === "admin" && (
          <div className="overflow-x-auto">
            <div className="inline-flex flex-nowrap min-w-max">
              <button
                onClick={() => setCustomerInvoiceOwner("all")}
                className={`${
                  customerInvoiceOwner === "all"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } shrink-0 whitespace-nowrap font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
              >
                All
              </button>
              <button
                onClick={() => setCustomerInvoiceOwner("admin")}
                className={`${
                  customerInvoiceOwner === "admin"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } shrink-0 whitespace-nowrap -ml-px font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
              >
                Admin
              </button>
              <button
                onClick={() => setCustomerInvoiceOwner("partner")}
                className={`${
                  customerInvoiceOwner === "partner"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } shrink-0 whitespace-nowrap -ml-px font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 duration-200`}
              >
                Partner
              </button>
            </div>
          </div>
        )}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          data-testid={INDIVIDUAL_INVOICES.statsGrid}
        >
          <ManagementTab
            title="Total Orders"
            desc={resultedOrders?.length}
            data-testid={INDIVIDUAL_INVOICES.totalInvoicesCard}
          />
        </div>

        <div data-testid={INDIVIDUAL_INVOICES.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            onRowClick={(e) => {
              if (invoiceSource === "partner") {
                router.push(`/direct-invoices/partner/${e.data.id}`);
              } else {
                router.push(`/direct-invoices/${e.data.id}`);
              }
            }}
            search={true}
            data-testid={INDIVIDUAL_INVOICES.table}
            rowTestId={(row) =>
              `data-testid-${INDIVIDUAL_INVOICES.row(row.id)}`
            }
          />
        </div>
      </div>
    </div>
  );
}
