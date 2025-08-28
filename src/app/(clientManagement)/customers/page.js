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

export default function Customers() {
  const router = useRouter();
  const [type, setType] = useState("all");
  const [loader, setLoader] = useState("");
  const [modal, setModal] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedState, setselectedState] = useState({
    value: "all",
    label: "ALL",
  });

  const { data, reFetch } = GetAPI(
    `api/v1/admin/customer-management/customer-list${
      type === "all"
        ? "/all"
        : type === "unassigned"
        ? "/sale-rep/not-assign"
        : "/sale-rep/assign"
    } `
  );

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
    // { field: "action", header: "Action" },  // pending to be done
  ];

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

  const customers = data?.data?.data?.slice()?.reverse();

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
            <di className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Not Assigned
            </di>
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
            <di className="w-44 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Not Assigned Yet
            </di>
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

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
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

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
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

        <div className="flex justify-between">
          <div>
            <button
              onClick={() => setType("all")}
              className={`${
                type === "all" ? "bg-black text-white" : "bg-white text-black"
              } font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
            duration-200 max-sm:w-60`}
            >
              All Customers
            </button>
            <button
              onClick={() => setType("unassigned")}
              className={`${
                type === "unassigned"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
            duration-200 max-sm:w-60`}
            >
              Unassigned Local Partner
            </button>
            <button
              onClick={() => setType("assigned")}
              className={`${
                type === "assigned"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }  font-workSans font-medium border border-black px-5 sm:px-8 py-2.5 
            duration-200 max-sm:w-60`}
            >
              Assigned Local Partner
            </button>
          </div>
          <div
            className={`${
              type === "all" || type === "assigned" ? "hidden" : "block"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Customer"
            desc={data?.data?.data?.length}
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

        <div>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search ..."}
            pagination={true}
            checkbox={type === "all" || type === "assigned" ? false : true}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            search={true}
            onRowClick={(e) => {
              router.push(`/customers/${e?.data?.id}`);
            }}
          />
        </div>

        <Dialog
          visible={modal === "assign"}
          style={{ width: "80vw" }}
          // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
          className="font-nunito"
          onHide={handleCancel}
          header={
            <div className="font-nunito font-bold text-2xl text-center">
              Assign Local Partner
            </div>
          }
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
