"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles, { drawerSelectStyles } from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import GetAPI from "@/utilities/GetAPI";
import { useState } from "react";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { Dialog } from "primereact/dialog";
import SalesRepresentativeInventory from "@/app/(salesRepresentativePanel)/sales-representative/(inventoryManagement)/quotation/page";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import Switch from "react-switch";
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";
import { CLIENT_MANAGEMENT } from "./customer.testid";

export default function Customers() {
  const router = useRouter();
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
  }
  const isAdminEmployee = userType === "admin" && isEmployee;
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [modal, setModal] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedState, setselectedState] = useState({
    value: "all",
    label: "ALL",
  });

  const customerFilterTabs = [
    { value: "all", label: "All Customers" },
    { value: "unassigned", label: "Unassigned Local Partner" },
    { value: "assigned", label: "Assigned Local Partner" },
    { value: "approval-required", label: "Approval Required" },
  ];

  const selectedFilterTab =
    customerFilterTabs.find((tab) => tab.value === type) ??
    customerFilterTabs[0];

  const handleFilterChange = (nextType) => {
    setType(nextType);
    setPage(1);
  };

  // Build API URL with pagination and search query parameters
  const baseUrl = isAdminEmployee
    ? "api/v1/admin/customer-management/customer-list/not-assigned"
    : `api/v1/admin/customer-management/customer-list${
        type === "all" || type === "approval-required"
          ? "/all"
          : type === "unassigned"
          ? "/sale-rep/not-assign"
          : "/sale-rep/assign"
      }`;
  
  // Build URL with proper query parameters
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  if (type === "approval-required") {
    params.set("approvedByAdmin", "null");
  }
  if (isAdminEmployee && hasPermission("customer_create")) {
    params.set("cus", "all");
  }
  const apiUrl = `${baseUrl}?${params.toString()}`;

  const { data, reFetch, isLoading } = GetAPI(apiUrl);

  const { data: dashboardCards } = GetAPI(
    "api/v1/admin/customer-management/dahboard-cards"
  );

  const { data: salesRepresentativeData } = GetAPI("api/v1/admin/sales-rep");

  const handleCancel = () => {
    setModal("");
    setLoader("");
  };

  const handleAssignSalesRepresentative = async (id) => {
    let CustomersIds = [];
    selectedRows.map((row) => CustomersIds.push(row?.id));
    setLoader("unassigned");
    try {
      const res = await PatchAPI(
        `api/v1/admin/customer-management/assign-sale-rep/${id}`,
        {
          id: CustomersIds,
        }
      );
      if (res?.data?.status === "success") {
        success_toaster("Local Partner Assigned successfully");
        setModal(false);
        CustomersIds = [];
        setSelectedRows([]);
        reFetch();
        setLoader("");
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      setLoader("");
      ErrorHandler(error);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await PatchAPI(`api/v1/admin/customer-update/${id}`, {
        info: { status: !status },
      }, "customer");
      if (res?.data?.status === "success") {
        success_toaster("Status updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleApproveCustomer = async (id) => {
    setApprovingId(id);
    try {
      const res = await PatchAPI(
        `api/v1/admin/customer-approve/${id}`,
        {},
        "customer"
      );
      if (res?.data?.status === "success") {
        success_toaster("Customer approved successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setApprovingId(null);
    }
  };

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Name", sort: true },
    { field: "mainContact", header: "	Main Contact" },
    // { field: "email", header: "Email", sort: true },
    // { field: "phoneNumber", header: "Phone Number", sort: true },
    // { field: "emailToSendInvoices", header: "Invoice Email", sort: true },
    // { field: "saleTaxNumber", header: "Sale Tax Number", sort: true },
    // { field: "totalOrderAmount", header: "Total Orders", sort: true },
    // { field: "totalOrderPlaced", header: "Total Orders Placed", sort: true },
    {
      field: "salesRepName",
      header: "Group",
      minWidth: "14rem",
    },
    // {
    //   field: "salesRepState",
    //   header: "Sales Representative State",
    //   minWidth: "14rem",
    // },
    // { field: "status", header: "Status" },
    { field: "lastOrder", header: "Last Order" },
    {
      field: "changeStatus",
      header: "Status",
    },
    ...(type === "approval-required"
      ? [{ field: "approve", header: "Approve" }]
      : []),
    // { field: "action", header: "Action" },  // pending to be done
  ];

  const renderApproveToggle = (customerId) => (
    <label
      className="flex gap-2 items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-max text-xs text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
        Pending
      </div>
      <Switch
        onChange={() => handleApproveCustomer(customerId)}
        checked={false}
        disabled={approvingId === customerId}
        uncheckedIcon={false}
        checkedIcon={false}
        onColor="#86644c"
        onHandleColor="#fff"
        className="react-switch"
        boxShadow="none"
      />
    </label>
  );

  const salesRepresentativeColumns = [
    { field: "sl", header: "SL", sort: true },
    { field: "srName", header: "Name" },
    { field: "email", header: "email" },
    {
      field: "currentStatus",
      header: "Current Status",
    },
    {
      field: "action",
      header: "Action",
    },
  ];

  const datas = [];
  const salesRepresentativeDatas = [];
  const StatesOptions = [{ value: "all", label: "All" }];

  // Handle both possible API response structures for pagination
  const customersArray = Array.isArray(data?.data?.data)
    ? data?.data?.data
    : Array.isArray(data?.data)
    ? data?.data
    : [];
  const customers = customersArray?.slice()?.reverse();

  customers?.map((customer, i) => {
    selectedState?.value === "all"
      ? datas.push({
          id: customer?.id,
          sl: i + 1,
          name: customer?.companyName, //company name
          mainContact: customer?.name, //Main contact name
          email: customer?.email,
          phoneNumber: `${customer?.countryCode ?? ""} ${
            customer?.phoneNumber
          }`,
          emailToSendInvoices: customer?.emailToSendInvoices,
          saleTaxNumber: customer?.saleTaxNumber,
          totalOrderAmount: customer?.totalOrderAmount,
          totalOrderPlaced: customer?.totalOrderPlaced,
          salesRepName: customer?.salesRepName ?? (
            <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Not Assigned
            </div>
          ),
          salesRepState: customer?.salesRepState ?? "-",
          status: (
            <div>
              {customer?.status ? (
                <div className="w-24 bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
                  Active
                </div>
              ) : (
                <div className="w-24 bg-themeGreen text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                  Inactive
                </div>
              )}
            </div>
          ),
          lastOrder: "last order",
          // changeStatus: (
          //   <label className="flex gap-2 items-center">
          //     {customer?.status ? (
          //       <div className="w-max text-xs bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
          //         Active
          //       </div>
          //     ) : (
          //       <div className="w-max text-xs text-white bg-[#EE4A4A]  font-semibold p-2 rounded-md flex justify-center">
          //         Inactive
          //       </div>
          //     )}
          //     <Switch
          //       onChange={() => {
          //         handleStatus(customer?.id, customer?.status);
          //       }}
          //       checked={customer?.status}
          //       uncheckedIcon={false}
          //       checkedIcon={false}
          //       onColor="#86644c"
          //       onHandleColor="#fff"
          //       className="react-switch"
          //       boxShadow="none"
          //     />
          //   </label>
          // ),
        changeStatus: hasPermission("customer_update") ? (
          <label className="flex gap-2 items-center">
            {customer?.status ? (
              <div className="w-max text-xs bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs text-white bg-[#EE4A4A]  font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
            <Switch
              onChange={() => {
                handleStatus(customer?.id, customer?.status);
              }}
              checked={customer?.status}
              uncheckedIcon={false}
              checkedIcon={false}
              onColor="#86644c"
              onHandleColor="#fff"
              className="react-switch"
              boxShadow="none"
            />
          </label>
        ) : (
          <div>
            {customer?.status ? (
              <div className="w-max text-xs bg-themeGreen text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
          </div>
        ),
          ...(type === "approval-required" && {
            approve: hasPermission("customer_update")
              ? renderApproveToggle(customer?.id)
              : (
                <div className="w-max text-xs text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                  Pending
                </div>
              ),
          }),
          // action: (
          //   <button
          //     className="border border-theme rounded-md p-2 text-theme"
          //     onClick={() => router.push(`/customers/edit/${customer?.id}`)}
          //   >
          //     <FaEdit size={24} />
          //   </button>
          // ),
        })
      : selectedState?.value === customer?.salesRepState &&
        datas.push({
          id: customer?.id,
          sl: i + 1,
          name: customer?.name,
          email: customer?.email,
          phoneNumber: customer?.phoneNumber,
          emailToSendInvoices: customer?.emailToSendInvoices,
          saleTaxNumber: customer?.saleTaxNumber,
          totalOrderAmount: customer?.totalOrderAmount,
          totalOrderPlaced: customer?.totalOrderPlaced,
          salesRepName: customer?.salesRepName ?? (
            <div className="w-44 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Not Assigned Yet
            </div>
          ),
          salesRepState: customer?.salesRepState ?? "-",
          status: (
            <div>
              {customer?.status ? (
                <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
                  Active
                </div>
              ) : (
                <div className="w-24 text-white bg-[#EE4A4A]  font-semibold p-2 rounded-md flex justify-center">
                  Inactive
                </div>
              )}
            </div>
          ),
          changeStatus: (
            <label>
              <Switch
                onChange={() => {
                  handleStatus(customer?.id, customer?.status);
                }}
                checked={customer?.status}
                uncheckedIcon={false}
                checkedIcon={false}
                onColor="#86644c"
                onHandleColor="#fff"
                className="react-switch"
                boxShadow="none"
              />
            </label>
          ),
          action: (
            <button
              className="border border-theme rounded-md p-2 text-theme"
              onClick={() => router.push(`/customers/edit/${customer?.id}`)}
            >
              <FaEdit size={24} />
            </button>
          ),
          ...(type === "approval-required" && {
            approve: hasPermission("customer_update")
              ? renderApproveToggle(customer?.id)
              : (
                <div className="w-max text-xs text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                  Pending
                </div>
              ),
          }),
        });
  });

  salesRepresentativeData?.data?.data?.map((sR, i) => {
    salesRepresentativeDatas.push({
      sl: i + 1,
      srName: sR?.srName,
      email: sR?.email,
      currentStatus: (
        <div>
          {sR?.status ? (
            <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 text-white bg-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
      action: (
        <button
          className="w-24 bg-theme text-white hover:bg-white hover:text-theme border border-theme duration-150 font-semibold p-2 rounded-md flex justify-center "
          onClick={() => handleAssignSalesRepresentative(sR?.id)}
        >
          Assign
        </button>
      ),
    });
  });

  customers?.map((customer, i) => {
    const stateValue = customer?.salesRepState;
    if (!stateValue) return;

    const checkState = StatesOptions?.find(
      (stateName) => stateName?.value === stateValue
    );

    if (!checkState) {
      StatesOptions.push({
        value: stateValue,
        label: stateValue,
      });
    }
  });
  const { toggle, setToggle } = useDataContext();

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={CLIENT_MANAGEMENT.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={CLIENT_MANAGEMENT.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">
            Customer Management
          </h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative" data-testid={CLIENT_MANAGEMENT.title}>
          {hasPermission("customer_create") && (
          <li onClick={() => router.push("/customers/add")}>Add Customer</li> )}
          {/* <li>Groups</li>
          <li>Nearby</li>
          <li>Export</li> */}
        </ul>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center justify-end">
          <Select
            // defaultInputValue={StatesOptions[0]}
            options={StatesOptions}
            value={selectedState?.value ? selectedState : null}
            placeholder="Select State"
            className="w-40"
            styles={drawerSelectStyles}
            onChange={(e) => setselectedState(e)}
          />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full xl:min-w-0 xl:flex-1">
            <div className="md:hidden w-full max-w-md">
              <Select
                options={customerFilterTabs}
                value={selectedFilterTab}
                onChange={(option) => handleFilterChange(option.value)}
                styles={drawerSelectStyles}
                className="w-full"
              />
            </div>

            <div className="hidden md:block w-full overflow-x-auto">
              <div className="inline-flex flex-nowrap min-w-max">
                {customerFilterTabs.map((tab, index) => (
                  <button
                    key={tab.value}
                    onClick={() => handleFilterChange(tab.value)}
                    className={`${
                      type === tab.value
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    } shrink-0 whitespace-nowrap font-workSans font-medium border border-black px-4 lg:px-6 xl:px-8 py-2.5 text-sm lg:text-base duration-200 ${
                      index > 0 ? "-ml-px" : ""
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`shrink-0 ${
              type === "all" || type === "assigned" || type === "approval-required"
                ? "hidden"
                : "block"
            }`}
          >
            {/* <button
              onClick={() => {
                selectedRows?.length === 0
                  ? info_toaster("Select atleast one customer")
                  : setModal("assign");
              }}
              className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:h-full border border-theme bg-theme hover:bg-white hover:text-theme duration-150"
            >
              {type === "unassigned" &&
                // ?
                //  "Reassign Sale Representative"
                // :
                "Assign Local Partner"}
            </button> */}
              {(type === "unassigned" && hasPermission("customer_update")) && (
                <button
                  onClick={() => {
                    selectedRows?.length === 0
                      ? info_toaster("Select atleast one customer")
                      : setModal("assign");
                  }}
                  className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:h-full border border-theme bg-theme hover:bg-white hover:text-theme duration-150"
                >
                  Assign Local Partner
                </button>
              )}

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={CLIENT_MANAGEMENT.statsGrid}>
          <ManagementTab
            title="Total Customer"
            desc={data?.pagination?.totalItems || data?.data?.pagination?.totalItems || data?.data?.data?.length || 0}
            data-testid={CLIENT_MANAGEMENT.totalCustomerCard}
          />
          {/* <ManagementTab
          title="New Customer"
          desc={dashboardCards?.data?.data?.newCustomer}
        />
        <ManagementTab
          title="Active Customer"
          desc={dashboardCards?.data?.data?.activeCustomer}
        />
        <ManagementTab
          title="Inactive Customer"
          desc={dashboardCards?.data?.data?.inactiveCustomer}
        /> */}
          {/* <ManagementTab title="T.Revenue Generated" desc="18,000" />
        <ManagementTab title="Total Orders" desc="5000" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="Total Orders Amount" desc="55,000" />
        <ManagementTab title="Receiving Amount" desc="18,000" />
        <ManagementTab title="Pending Payments" desc="500" /> */}
        </div>

        <div data-testid={CLIENT_MANAGEMENT.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by ID, Name, Email, Phone ,Company Name"}
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
            checkbox={
              type === "all" ||
              type === "assigned" ||
              type === "approval-required"
                ? false
                : true
            }
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            search={true}
            onRowClick={(e) => {
              router.push(`/customers/${e?.data?.id}`);
            }}
            data-testid={CLIENT_MANAGEMENT.table}
            rowTestId={(row) => `data-testid-${CLIENT_MANAGEMENT.row(row.id)}`}
          />
        </div>

        <Dialog
          visible={modal === "assign"}
          style={{ width: "80vw" }}
          // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
          className="font-nunito"
          onHide={handleCancel}
          dismissableMask={true}
          header={
            <div className="font-nunito font-bold text-2xl text-center">
              Assign Local Partner
            </div>
          }
          data-testid={CLIENT_MANAGEMENT.modal}
        >
          {loader === "unassigned" ? (
            <MiniLoader />
          ) : (
            <div className="space-y-4">
              <MyDataTable
                columns={salesRepresentativeColumns}
                data={salesRepresentativeDatas}
                placeholder={"Search ..."}
                pagination={true}
                hide={true}
                search={true}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                 shadow-buttonShadow px-6 font-nunito py-3 font-medium"
                 data-testid={CLIENT_MANAGEMENT.modalCancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}
