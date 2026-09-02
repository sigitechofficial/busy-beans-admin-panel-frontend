"use client";
import { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { useDataContext } from "@/utilities/DataContext";
import GetAPI from "@/utilities/GetAPI";
import selectStyles from "@/utilities/SelectStyle";
import { useRouter } from "next/navigation";
import { CiMenuBurger } from "react-icons/ci";
import Select from "react-select";
import { INVOICES } from "../invoice.testid";
import { defaultFeatureScopeMode, getFeatureScope, showFeatureScopeToggle } from "@/utilities/subAdminNav";

export default function Invoices() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  const invoiceScope = getFeatureScope("invoice");
  const showInvoiceSourceToggle = showFeatureScopeToggle("invoice");
  const isCustomerOnlyScope = invoiceScope.customer && !invoiceScope.partner;
  const isPartnerOnlyScope = invoiceScope.partner && !invoiceScope.customer;
  const [invoiceSource, setInvoiceSource] = useState(() =>
    defaultFeatureScopeMode("invoice", { customerValue: "customer", partnerValue: "partner" })
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);

  useEffect(() => {
    const allowed = defaultFeatureScopeMode("invoice", {
      customerValue: "customer",
      partnerValue: "partner",
    });
    if (!showInvoiceSourceToggle && invoiceSource !== allowed) {
      setInvoiceSource(allowed);
    }
  }, [showInvoiceSourceToggle, invoiceSource]);

  const { data: salesRepData } = GetAPI(
    userType === "admin" && invoiceScope.partner ? "api/v1/admin/sales-rep" : "",
    "sales-rep"
  );
  const partnersList = salesRepData?.data?.data || [];
  const partnerOptions = [
    { value: "all", label: "All Partners" },
    ...partnersList.map((partner) => ({
      value: partner.id,
      label: `${partner?.srName || partner?.name || "—"}${
        partner?.territoryName ? ` (${partner.territoryName})` : ""
      }`,
    })),
  ];
  const selectedPartnerOption =
    partnerOptions.find((option) => option.value === (selectedPartnerId ?? "all")) ||
    partnerOptions[0];

  let apiUrl = "";
  if (userType === "salesRepresentative") {
    apiUrl = `api/v1/admin/customer-management/invoice-customers-balance/sales-rep/${userID}`;
  } else if (invoiceSource === "partner") {
    apiUrl = selectedPartnerId
      ? `api/v1/admin/customer-management/invoice-customers-balance/sales-rep/${selectedPartnerId}`
      : "api/v1/admin/customer-management/invoice-customers-balance?owner=partner";
  } else {
    apiUrl = "api/v1/admin/customer-management/invoice-customers-balance?owner=admin";
  }

  const { data, isLoading } = GetAPI(apiUrl);

  const columns = [
    { field: "companyName", header: "Customer" },
    { field: "emailToSendInvoices", header: "Invoice Email" },
    { field: "totalBalance", header: "Total Balance", sort: true },
    { field: "overdueOrders", header: "Overdue Orders" },
  ];

  const datas = [];
  data?.data?.data?.map((invoice, i) => {
    return datas.push({
      sl: i + 1,
      id: invoice?.id,
      companyName: invoice?.companyName,
      email: invoice?.email,
      image: invoice?.image,
      phoneNumber: invoice?.phoneNumber,
      saleTaxNumber: invoice?.saleTaxNumber,
      emailToSendInvoices: invoice?.emailToSendInvoices,
      overdueOrders:
        invoice?.overDueOrders == 0 ? "No overdue" : invoice?.overDueOrders,
      totalBalance: invoice?.totalBalance
        ? `$${invoice?.totalBalance}`
        : `$${0}`,
    });
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={INVOICES.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={INVOICES.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={INVOICES.title}>
            Invoices Management
          </h2>
        </div>
        {showInvoiceSourceToggle && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {invoiceScope.customer && (
              <button
                onClick={() => {
                  setInvoiceSource("customer");
                  setSelectedPartnerId(null);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  invoiceSource === "customer"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Admin
              </button>
            )}
            {invoiceScope.partner && (
              <button
                onClick={() => setInvoiceSource("partner")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  invoiceSource === "partner"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Local Partner
              </button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-8 pt-32 px-6 2xl:px-12 ">
        {isPartnerOnlyScope && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              You only have <strong>Local Partner</strong> invoice access. Admin customers are not listed here.
            </p>
          </div>
        )}
        {isCustomerOnlyScope && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800">
              You only have <strong>Admin</strong> invoice access. Local Partner customers are not listed here.
            </p>
          </div>
        )}
        {userType === "admin" && invoiceSource === "partner" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-sm font-medium text-gray-700 sm:w-28 shrink-0">
              Local Partner
            </label>
            <div className="w-full sm:w-[260px]">
              <Select
                options={partnerOptions}
                value={selectedPartnerOption}
                onChange={(option) =>
                  setSelectedPartnerId(
                    option?.value === "all" ? null : option?.value ?? null
                  )
                }
                styles={selectStyles}
                placeholder="Select Partner"
                isClearable={false}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={INVOICES.statsGrid}>
          <ManagementTab
            title="Total Invoices"
            desc={data?.data?.data?.length}
            data-testid={INVOICES.totalInvoicesCard}
          />
        </div>

        <div data-testid={INVOICES.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            sortField="totalBalance"
            sortOrder={-1}
            onRowClick={(e) => router.push(`/invoices/${e.data.id}`)}
            data-testid={INVOICES.table}
            rowTestId={(row) => `data-testid-${INVOICES.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
