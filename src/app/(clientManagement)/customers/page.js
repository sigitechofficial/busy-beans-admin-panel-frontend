"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
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

export default function Customers() {
  const [type, setType] = useState("all");
  const [loader, setLoader] = useState("");
  const [modal, setModal] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

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
  // console.log("🚀 ~ Customers ~ dashboardCards:",dashboardCards?.data?.data)

  const { data: salesRepresentativeData } = GetAPI("api/v1/admin/sales-rep");
  console.log("🚀 ~ Customers ~ data:", data?.data);

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
        success_toaster("Sales Representative Assigned successfully");
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

  const columns = [
    { field: "sl", header: "SL", sort: true, },
    { field: "name", header: "Name", sort: true },
    { field: "email", header: "Email", sort: true },
    { field: "phoneNumber", header: "Phone Number", sort: true },
    { field: "emailToSendInvoices", header: "Invoice Email", sort: true },
    { field: "saleTaxNumber", header: "Sale Tax Number", sort: true },
    { field: "totalOrderAmount", header: "Total Orders", sort: true },
    { field: "totalOrderPlaced", header: "Total Orders Placed", sort: true },
    { field: "salesRepName", header: "salesRepName", minWidth: "14rem" },
    { field: "salesRepState", header: "salesRepState", minWidth: "14rem" },
    { field: "status", header: "status", sort: true },
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

  const customers = data?.data?.data?.slice()?.reverse();
  customers?.map((customer, i) => {
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
            <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
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
            <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
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

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Customer Management
        </h2>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
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
            Unassigned Sale Representative
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
            Assigned Sale Representative
          </button>
        </div>
        <div
          className={`${
            type === "all" || type === "assigned" ? "hidden" : "block"
          }`}
        >
          <button
            onClick={() => {
              selectedRows?.length === 0
                ? info_toaster("Select atleast one customer")
                : setModal("assign");
            }}
            className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:h-full bg-theme"
          >
            {type === "unassigned" &&
              // ?
              //  "Reassign Sale Representative"
              // :
              "Assign Sale Representative"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab
          title="Total Customer"
          desc={dashboardCards?.data?.data?.totalCustomer}
        />
        <ManagementTab
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
        />
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
            Assign Sales Representative
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
  );
}
