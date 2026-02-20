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
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { Dialog } from "primereact/dialog";
import { FaEdit, FaFilter } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { ALL_ORDERS } from "./orders.testids"

export default function Orders() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }

  let slCounter = 1;

  const router = useRouter();
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [employeeFilterType, setEmployeeFilterType] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [tempSelectedEmployee, setTempSelectedEmployee] = useState(null);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [tempInvoiceFilter, setTempInvoiceFilter] = useState("all");
  const [tempEmployeeFilterType, setTempEmployeeFilterType] = useState("all");
  const [tempSelectedEmployeeInModal, setTempSelectedEmployeeInModal] = useState(null);

  const { data: employeesData } = GetAPI("api/v1/admin/employees", "orders-employees");

  const invoiceFilterOptions = [
    { value: "all", label: "Select" },
    { value: "sent", label: "Sent" },
    { value: "not-sent", label: "Not Sent" },
  ];
  const employeeFilterTypeOptions = [
    { value: "all", label: "Select" },
    { value: "assigned", label: "Assigned" },
    { value: "not-assigned", label: "Not Assigned" },
    { value: "select", label: "Select Employee" },
  ];
  const employeesList = employeesData?.data?.data || [];
  const selectedInvoiceOption = invoiceFilterOptions.find((o) => o.value === invoiceFilter) || invoiceFilterOptions[0];
  const selectedEmployeeTypeOption =
    employeeFilterTypeOptions.find((o) => o.value === employeeFilterType) || employeeFilterTypeOptions[0];

  const handleEmployeeTypeChange = (opt) => {
    const value = opt?.value ?? "all";
    setEmployeeFilterType(value);
    setSelectedEmployeeId("");
    setSelectedEmployeeName("");
    if (value === "select") {
      setEmployeeModalOpen(true);
      setTempSelectedEmployee(null);
    }
    setPage(1);
  };
  const handleEmployeeModalOk = () => {
    if (tempSelectedEmployee) {
      setSelectedEmployeeId(String(tempSelectedEmployee.id));
      setSelectedEmployeeName(tempSelectedEmployee.name || tempSelectedEmployee.email || "");
      setPage(1);
    }
    setEmployeeModalOpen(false);
    setTempSelectedEmployee(null);
  };
  const handleClearEmployeeFilter = () => {
    setSelectedEmployeeId("");
    setSelectedEmployeeName("");
    setEmployeeFilterType("all");
    setPage(1);
  };

  const openFiltersModal = () => {
    setTempInvoiceFilter(invoiceFilter);
    setTempEmployeeFilterType(employeeFilterType);
    setTempSelectedEmployeeInModal(
      employeeFilterType === "select" && selectedEmployeeId
        ? employeesList.find((e) => String(e.id) === selectedEmployeeId) || null
        : null
    );
    setFiltersModalOpen(true);
  };
  const applyFiltersAndClose = () => {
    setInvoiceFilter(tempInvoiceFilter);
    setEmployeeFilterType(tempEmployeeFilterType);
    if (tempEmployeeFilterType === "select" && tempSelectedEmployeeInModal) {
      setSelectedEmployeeId(String(tempSelectedEmployeeInModal.id));
      setSelectedEmployeeName(tempSelectedEmployeeInModal.name || tempSelectedEmployeeInModal.email || "");
    } else {
      setSelectedEmployeeId("");
      setSelectedEmployeeName("");
    }
    setPage(1);
    setFiltersModalOpen(false);
  };
  const tempSelectedEmployeeTypeOption =
    employeeFilterTypeOptions.find((o) => o.value === tempEmployeeFilterType) || employeeFilterTypeOptions[0];
  const tempSelectedInvoiceOption = invoiceFilterOptions.find((o) => o.value === tempInvoiceFilter) || invoiceFilterOptions[0];

  const hasActiveFilters = invoiceFilter !== "all" || employeeFilterType !== "all";
  const appliedInvoiceLabel = invoiceFilter !== "all" ? (invoiceFilterOptions.find((o) => o.value === invoiceFilter)?.label ?? invoiceFilter) : null;
  const appliedEmployeeLabel =
    employeeFilterType === "select" && selectedEmployeeName
      ? selectedEmployeeName
      : employeeFilterType !== "all"
        ? (employeeFilterTypeOptions.find((o) => o.value === employeeFilterType)?.label ?? employeeFilterType)
        : null;

  const clearAllFilters = () => {
    setInvoiceFilter("all");
    setEmployeeFilterType("all");
    setSelectedEmployeeId("");
    setSelectedEmployeeName("");
    setPage(1);
  };

  const filterSelectStyles = {
    ...selectStyles,
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      backgroundColor: "#fff",
      borderColor: state.isFocused ? "#000" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(0,0,0,0.1)" : "none",
    }),
  };

  // Build API URL with pagination and search query parameters
  const baseUrl = userType === "salesRepresentative"
    ? `api/v1/admin/orders?salesRepId=${userID}`
    : "api/v1/admin/orders";
  
  const [urlBase, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery || "");
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  if (invoiceFilter === "sent") {
    params.set("invoiceDate[ne]", "null");
  } else if (invoiceFilter === "not-sent") {
    params.set("invoiceDate[eq]", "null");
  }
  if (employeeFilterType === "assigned") {
    params.set("employee", "assigned");
  } else if (employeeFilterType === "not-assigned") {
    params.set("employee", "not-assigned");
  } else if (employeeFilterType === "select" && selectedEmployeeId) {
    params.set("employee", selectedEmployeeId);
  }
  const apiUrl = `${urlBase}?${params.toString()}`;

  const { data, isLoading, reFetch } = GetAPI(apiUrl, "orders");

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "id", header: "#", sort: true },
    // { field: "customerName", header: "Customer" },
    { field: "companyName", header: "Company Name" },
    { field: "orderSource", header: "Order Type" },
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
    { field: "paymentStatus", header: "Invoice", sort: true },
    // { field: "createdBy", header: "Created By" },
    { field: "orderCurrentStatus", header: "Status" },
    // { field: "action", header: "Action" },
  ];

  const datas = [];
  // Handle both possible API response structures: { data: [...], pagination: {...} } or { data: { data: [...], pagination: {...} } }
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
        // customerName: detail?.customerName,
        companyName: detail?.companyName,
        orderSource: detail?.salesRepName ? "Partner" : "Admin",
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
        deliveredOn: detail?.deliveredOn ? dayjs(detail?.deliveredOn).format("MM/DD/YYYY") : "",
        // action: (
        //   <button
        //     className="border border-yellow-400 rounded-md p-2 text-yellow-400"
        //     onClick={() => {
        //       router.push(`/orders/detail/${detail?.id}`);
        //     }}
        //   >
        //     <FaEye size={24} />
        //   </button>
        // ),
      })
    );
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
      <Loader />
    ) : (
    <div className="w-full" data-testid={ALL_ORDERS.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={ALL_ORDERS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Orders</h2>
        </div>
        <button
          type="button"
          onClick={openFiltersModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-theme transition-colors shadow-sm"
          title="Filters"
        >
          <FaFilter size={16} />
          Filters
        </button>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div data-testid={ALL_ORDERS.filtersBar}>
          <button
            onClick={() => {
              setType("all");
              setPage(1);
            }}
            className={`${
              type === "all" ? "bg-black text-white" : "bg-white text-black"
            } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
                  duration-200 max-sm:w-60`}
            data-testid={ALL_ORDERS.filterAllBtn}
          >
            All Orders
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
            data-testid={ALL_ORDERS.filterPaidBtn}
          >
            Paid Orders
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
            data-testid={ALL_ORDERS.filterUnpaidBtn}
          >
            Unpaid Orders
          </button>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-sm text-gray-500 font-medium">Applied filters:</span>
            {appliedInvoiceLabel && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium">
                Invoice: {appliedInvoiceLabel}
              </span>
            )}
            {appliedEmployeeLabel && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium">
                Employee: {appliedEmployeeLabel}
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        <Dialog
          header="Filters"
          visible={filtersModalOpen}
          onHide={() => setFiltersModalOpen(false)}
          className="w-full max-w-lg orders-filters-dialog"
          dismissableMask
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Invoice</label>
              <div className="w-full">
                <Select
                  options={invoiceFilterOptions}
                  value={tempSelectedInvoiceOption}
                  onChange={(opt) => setTempInvoiceFilter(opt?.value ?? "all")}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  styles={{
                    ...filterSelectStyles,
                    control: (base) => ({
                      ...base,
                      minHeight: "42px",
                      borderRadius: "10px",
                      borderColor: "#e5e7eb",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  placeholder="Select"
                  isClearable={false}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Employee</label>
              <div className="w-full">
                <Select
                  options={employeeFilterTypeOptions}
                  value={tempSelectedEmployeeTypeOption}
                  onChange={(opt) => {
                    const v = opt?.value ?? "all";
                    setTempEmployeeFilterType(v);
                    if (v !== "select") setTempSelectedEmployeeInModal(null);
                  }}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  styles={{
                    ...filterSelectStyles,
                    control: (base) => ({
                      ...base,
                      minHeight: "42px",
                      borderRadius: "10px",
                      borderColor: "#e5e7eb",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  placeholder="Select"
                  isClearable={false}
                />
              </div>
              {tempEmployeeFilterType === "select" && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Choose an employee</p>
                  {employeesList.length === 0 ? (
                    <p className="text-gray-500 text-sm py-2">No employees available.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {employeesList.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setTempSelectedEmployeeInModal(emp)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                            tempSelectedEmployeeInModal?.id === emp.id
                              ? "border-theme bg-theme/10 text-gray-900 font-medium"
                              : "border-transparent bg-white hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span>{emp.name || "—"}</span>
                          {emp.email && (
                            <span className="text-gray-400 ml-1.5">({emp.email})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setFiltersModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyFiltersAndClose}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors bg-theme hover:bg-themeDark border border-theme"
            >
              Done
            </button>
          </div>
        </Dialog>

        <Dialog
          header="Select Employee"
          visible={employeeModalOpen}
          onHide={() => {
            setEmployeeModalOpen(false);
            setTempSelectedEmployee(null);
          }}
          className="w-full max-w-md"
          dismissableMask
        >
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {employeesList.length === 0 ? (
              <p className="text-gray-500 text-sm">No employees available.</p>
            ) : (
              employeesList.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setTempSelectedEmployee(emp)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    tempSelectedEmployee?.id === emp.id
                      ? "border-black bg-gray-100 font-medium"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-gray-900">{emp.name || "—"}</span>
                  {emp.email && (
                    <span className="text-gray-500 text-sm ml-2">({emp.email})</span>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setEmployeeModalOpen(false);
                setTempSelectedEmployee(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEmployeeModalOk}
              disabled={!tempSelectedEmployee}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              OK
            </button>
          </div>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={data?.pagination?.totalItems || resultedOrders?.length ||0} 
          data-testid={ALL_ORDERS.totalOrdersCard}/>
          {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Id, invoice number, po number, note, payment method, shipping company"}
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
            onRowClick={(e) => {
              router.push(`/orders/detail/${e.data.id}`);
            }}
            search={true}
            data-testid={ALL_ORDERS.table}
            rowTestId={(row) => `data-testid-${ALL_ORDERS.row(row.id)}`}
          />
        </div>
      </div>
    </div>
  );
}
