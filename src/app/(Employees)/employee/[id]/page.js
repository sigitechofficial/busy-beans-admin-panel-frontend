"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import MyDataTable from "@/components/ui/MyDataTable";
import ManagementTab from "@/components/ui/ManagementTab";
import BackButton from "@/components/ui/BackButton";
import { PatchAPI } from "@/utilities/PatchAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";
import { FaEye } from "react-icons/fa";
import { LuUnlink } from "react-icons/lu";
import { Dialog } from "primereact/dialog";
import MiniLoader from "@/components/ui/MiniLoader";

export default function EmployeeDetailPage() {
  const { id: employeeId } = useParams();
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [unlinkModal, setUnlinkModal] = useState({
    open: false,
    customerId: null,
    customerName: "",
  });
  const [unlinkLoader, setUnlinkLoader] = useState(false);

  const employeeUrl = employeeId ? `api/v1/admin/employee/${employeeId}` : "";
  const { data: employeeData, isLoading: employeeLoading } = GetAPI(
    employeeUrl,
    "employees",
  );

  const customerListParams = new URLSearchParams();
  customerListParams.set("page", page.toString());
  customerListParams.set("limit", limit.toString());
  if (searchQuery.trim()) customerListParams.set("search", searchQuery.trim());
  const customerListUrl = employeeId
    ? `api/v1/admin/customer-management/customer-list/employee-id/${employeeId}?${customerListParams.toString()}`
    : "";
  const {
    data: customersData,
    isLoading: customersLoading,
    reFetch: reFetchCustomers,
  } = GetAPI(customerListUrl, "customers");

  const employee = employeeData?.data || employeeData;
  const customersArray = Array.isArray(customersData?.data?.data)
    ? customersData.data.data
    : Array.isArray(customersData?.data)
      ? customersData.data
      : [];
  const pagination =
    customersData?.data?.pagination || customersData?.pagination || {};
  const totalItems = pagination.totalItems ?? pagination.total ?? 0;
  const totalPages = pagination.totalPages ?? 1;

  const columns = [
    { field: "sl", header: "#", minWidth: "3rem" },
    { field: "companyName", header: "Company Name", minWidth: "10rem" },
    { field: "mainContact", header: "Main Contact", minWidth: "10rem" },
    { field: "email", header: "Email", minWidth: "10rem" },
    { field: "status", header: "Status", minWidth: "6rem" },
    { field: "action", header: "Action", minWidth: "10rem" },
  ];

  const handleUnlinkClick = (customerId, companyName) => {
    setUnlinkModal({
      open: true,
      customerId,
      customerName: companyName || "this customer",
    });
  };

  const handleUnlinkConfirm = async () => {
    if (!unlinkModal.customerId) return;
    setUnlinkLoader(true);
    try {
      const res = await PatchAPI(
        `api/v1/admin/customer-update/${unlinkModal.customerId}`,
        {
          info: { employeeId: null },
        },
      );
      if (res?.data?.status === "success") {
        success_toaster("Customer unlinked from employee successfully");
        setUnlinkModal({ open: false, customerId: null, customerName: "" });
        reFetchCustomers();
      } else {
        throw new Error(res?.data?.message || "Failed to unlink customer.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setUnlinkLoader(false);
    }
  };

  const datas = customersArray.map((customer, i) => ({
    id: customer?.id,
    sl: (page - 1) * limit + i + 1,
    companyName: customer?.companyName ?? "—",
    mainContact: customer?.name ?? "—",
    email: customer?.email ?? "—",
    status: customer?.status ? (
      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-themeGreen text-white">
        Active
      </span>
    ) : (
      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
        Inactive
      </span>
    ),
    action: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/customers/${customer?.id}`);
          }}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-theme text-theme hover:bg-theme hover:text-white text-sm font-medium"
        >
          <FaEye className="w-4 h-4" />
          View
        </button>
        {hasPermission("selected-customer_update") && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlinkClick(customer?.id, customer?.companyName);
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-red-400 text-red-600 hover:bg-red-50 text-sm font-medium"
          >
            <LuUnlink className="w-4 h-4" />
            Unlink
          </button>
        )}
      </div>
    ),
  }));

  if (employeeLoading || !employeeId) {
    return <Loader />;
  }

  if (!employee?.id && !employeeLoading) {
    return (
      <div className="pt-28 px-6 2xl:px-12">
        <p className="text-gray-600">Employee not found.</p>
        <button
          type="button"
          onClick={() => router.push("/employee")}
          className="mt-4 text-theme font-medium hover:underline"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <BackButton />
          <h2 className="text-xl font-inter font-semibold">Employee Details</h2>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* Employee info card */}
        <div className="rounded-lg border border-borderColor shadow-tableShadow p-6 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Name</p>
              <p className="text-gray-900">{employee?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Email</p>
              <p className="text-gray-900">{employee?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Phone</p>
              <p className="text-gray-900">
                {employee?.countryCode && `+${employee.countryCode} `}
                {employee?.phoneNumber ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Commission %</p>
              <p className="text-gray-900">
                {employee?.commissionPercentage != null
                  ? `${employee.commissionPercentage}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <p>
                {employee?.status ? (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-theme text-white">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                    Inactive
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Customers section */}
        <div>
          {/* <div className="flex items-center justify-between mb-8">
            <ManagementTab title="Total Customers" desc={totalItems} />
          </div> */}
          {customersLoading ? (
            <Loader />
          ) : (
            <MyDataTable
              columns={columns}
              data={datas}
              placeholder="Search by company name, contact, email..."
              pagination={true}
              serverPagination={{
                page: page,
                limit: limit,
                totalRecords: totalItems,
                totalPages: totalPages,
                onPageChange: (newPage) => setPage(newPage),
                onLimitChange: (newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                },
              }}
              searchValue={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val ?? "");
                setPage(1);
              }}
              search={true}
              onRowClick={(e) => router.push(`/customers/${e?.data?.id}`)}
            />
          )}
        </div>
      </div>

      {/* Unlink confirmation modal */}
      <Dialog
        visible={unlinkModal.open}
        onHide={() =>
          setUnlinkModal({ open: false, customerId: null, customerName: "" })
        }
        header="Unlink Customer"
        className="font-nunito w-[90vw] max-w-md"
        dismissableMask
      >
        {unlinkLoader ? (
          <MiniLoader />
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to unlink{" "}
              <strong>{unlinkModal.customerName}</strong> from this employee?
              The customer will no longer be assigned to this employee.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setUnlinkModal({
                    open: false,
                    customerId: null,
                    customerName: "",
                  })
                }
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnlinkConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Unlink
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
