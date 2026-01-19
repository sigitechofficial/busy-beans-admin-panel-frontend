"use client";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { useState, useMemo } from "react";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { MdCheck, MdClose } from "react-icons/md";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PostAPI } from "@/utilities/PostAPI";

export default function EmployeePayouts() {
  if (typeof window !== "undefined") {
    var employeeId = localStorage.getItem("employeeId");
    var userType = localStorage.getItem("userType");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
  }

  const [status, setStatus] = useState("not-transferred"); // "transferred" or "not-transferred"
  const [selectedEmployee, setSelectedEmployee] = useState(null); // For admin filter
  const [selectedRows, setSelectedRows] = useState([]); // For checkbox selection

  const isAdmin = userType === "admin" && !isEmployee; // Admin but not an employee
  const showAdminFeatures = isAdmin && status === "not-transferred";

  const apiUrl = `api/v1/admin/employee-commission-orders/${status}`;

  const { data, isLoading, reFetch } = GetAPI(apiUrl);

  // Build employee options from API response (not-transferred status)
  const employeeOptions = useMemo(() => {
    const responseData = data?.data?.data;
    if (!responseData || status !== "not-transferred") return [];
    
    // Get unique employees from the response
    const employeeMap = new Map();
    responseData.forEach((order) => {
      if (order?.employeeId && order?.employeeName) {
        if (!employeeMap.has(order.employeeId)) {
          employeeMap.set(order.employeeId, {
            id: order?.id,
            employeeId: order.employeeId,
            employeeName: order.employeeName,
          });
        }
      }
    });
    
    return Array.from(employeeMap.values()).map((emp) => ({
      value: emp.employeeId,
      label: emp.employeeName,
      id: emp.id,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
    }));
  }, [data, status]);

  const columns = [
    { field: "sl", header: "SL", sort: true,minWidth: 50 },
    ...(isAdmin ? [{ field: "employeeName", header: "Employee Name" }] : []),
    { field: "companyName", header: "Company Name" },
    { field: "stripeConnected", header: "Stripe Connected" },
    { field: "employeeCommisionAmount", header: "Employee Commission Amount",minWidth: 200 },
    { field: "appliedEmployeeCommisionPercentage", header: "Applied Commission %" },
    { field: "paymentStatus", header: "Payment Status" },
    { field: "totalBill", header: "Total Bill" },
  ];

  // Filter data by selected employee (for admin)
  const filteredData = useMemo(() => {
    if (!data?.data?.data) return [];
    if (!showAdminFeatures || !selectedEmployee) {
      return data.data.data;
    }
    return data.data.data.filter((order) => order?.employeeId === selectedEmployee.employeeId);
  }, [data, selectedEmployee, showAdminFeatures]);

  const datas = [];
  filteredData?.map((order, i) =>
    datas.push({
      id: order?.id || i, // Add id for checkbox selection
      employeeId: order?.employeeId, // Store employeeId for validation
      sl: i + 1,
      ...(isAdmin ? { employeeName: order?.employeeName || "-" } : {}),
      companyName: order?.companyName || "-",
      stripeConnected: (
        <div className="flex justify-center">
          {order?.stripeConnectAccountId ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <MdCheck size={20} className="text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <MdClose size={20} className="text-white" />
            </div>
          )}
        </div>
      ),
      employeeCommisionAmount: `$${order?.employeeCommisionAmount || 0}`,
      appliedEmployeeCommisionPercentage: `${order?.AppliedEmployeeCommisionPercentage || 0}%`,
      paymentStatus: (
        <div>
          {order?.paymentStatus === "done" ? (
            <div className="w-24 bg-green-500 text-white font-semibold p-2 rounded-md flex justify-center">
              Paid
            </div>
          ) : (
            <div className="w-24 bg-yellow-500 text-white font-semibold p-2 rounded-md flex justify-center">
              Pending
            </div>
          )}
        </div>
      ),
      totalBill: `$${order?.totalBill || 0}`,
    })
  );

  // Custom handler to validate selected rows (only for admin)
  const handleRowSelection = (newSelectedRows) => {
    if (!isAdmin || !showAdminFeatures) {
      setSelectedRows(newSelectedRows);
      return;
    }

    // If no rows selected, allow it
    if (newSelectedRows.length === 0) {
      setSelectedRows([]);
      return;
    }

    // Check if all selected rows belong to the same employee
    const employeeIds = newSelectedRows
      .map((row) => row?.employeeId)
      .filter((id) => id !== undefined && id !== null);
    
    const uniqueEmployeeIds = [...new Set(employeeIds)];

    // If more than one unique employeeId, show error and don't update selection
    if (uniqueEmployeeIds.length > 1) {
      error_toaster("You can only select orders from the same employee. Please select orders from a single employee.");
      return;
    }

    // All good, update selection
    setSelectedRows(newSelectedRows);
  };

  // Handle Transfer button
  const handleTransfer = async () => {
    if (selectedRows.length === 0) {
      return error_toaster("Please select at least one record to transfer");
    }

    // Validate that all selected orders belong to the same employee (for admin)
    if (isAdmin && showAdminFeatures) {
      const employeeIds = selectedRows
        .map((row) => row?.employeeId)
        .filter((id) => id !== undefined && id !== null);
      
      const uniqueEmployeeIds = [...new Set(employeeIds)];
      
      if (uniqueEmployeeIds.length > 1) {
        return error_toaster("You can only select orders from the same employee. Please select orders from a single employee.");
      }
    }

    try {
      const orderIds = selectedRows.map((row) => row.id);
      const res = await PostAPI(
        "api/v1/admin/bulk-transfer-commission-to-employee",
        { orderIds },
        "employees"
      );

      if (res?.data?.status === "success") {
        success_toaster(res?.data?.message || `${selectedRows.length} record(s) transferred successfully`);
        // Reset states on success
        setSelectedRows([]);
        setSelectedEmployee(null);
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Payouts</h2>
        </div>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 pb-6">
        {/* Status Tabs with Transfer Button */}
        <div className="flex items-center justify-between">
          <div className="flex">
            <button
              onClick={() => {
                setStatus("not-transferred");
                setSelectedRows([]); // Clear selection when switching tabs
                setSelectedEmployee(null); // Clear employee filter
              }}
              className={`px-6 py-3 font-inter font-medium transition-colors ${
                status === "not-transferred"
                  ? "bg-theme text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Not Transferred
            </button>
            <button
              onClick={() => {
                setStatus("transferred");
                setSelectedRows([]); // Clear selection when switching tabs
                setSelectedEmployee(null); // Clear employee filter
              }}
              className={`px-6 py-3 font-inter font-medium transition-colors ${
                status === "transferred"
                  ? "bg-theme text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Transferred
            </button>
          </div>
          {/* Transfer Button - Only for admin when not-transferred */}
          {showAdminFeatures && (
            <button
              onClick={handleTransfer}
              disabled={selectedRows.length === 0}
              className={`px-6 py-3 font-inter font-medium rounded-lg transition-colors ${
                selectedRows.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-theme text-white"
              }`}
            >
              Transfer
            </button>
          )}
        </div>

        {/* Employee Select Dropdown - Only for admin when not-transferred */}
        {showAdminFeatures && (
          <div className="max-w-xs">
            <Select
              placeholder="Select Employee"
              styles={selectStyles}
              value={selectedEmployee}
              onChange={(option) => {
                setSelectedEmployee(option);
                setSelectedRows([]); // Clear selection when filter changes
              }}
              options={employeeOptions}
              isClearable
            />
          </div>
        )}

        {/* Table */}
        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by company name..."}
            pagination={true}
            search={true}
            checkbox={showAdminFeatures}
            selectedRows={selectedRows}
            setSelectedRows={handleRowSelection}
          />
        </div>
      </div>
    </div>
  );
}
