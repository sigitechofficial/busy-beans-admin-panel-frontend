"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Suppliers() {
  const router = useRouter();





  const columns = [
    { field: "#", header: "SL", sort: true },
    { field: "country", header: "Country" },
    { field: "tSupplier", header: "T. Suppliers" },
    { field: "activeSupplier", header: "Active Suppliers" },
    { field: "inactiveSupplier", header: "Inactive Suppliers" },
    { field: "pendingApprovals", header: "Pending Approvals" },
    { field: "fulfilledOrders", header: "Fulfilled Orders" },
    { field: "pendingOrders", header: "Pending Orders" },
    { field: "deliveryTime", header: "Avg Delivery Time" },
    { field: "action", header: "Action" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Supplier Management
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/add-new-supplier")}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            + Add New Supplier
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid  grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Supplier" desc="5000" />
          <ManagementTab title="New Supplier" desc="5000" />
          <ManagementTab title="Pending Request" desc="500" />
          <ManagementTab title="Active Supplier" desc="55,000" />
          <ManagementTab title="Inactive supplier" desc="18,000" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
          <HomeMiniCards
            title="Total Earning"
            // description="The bookings that are booked and an employee has been assigned to them."
            total={"$2000"}
            // Icon={FiBox}
          />
          <HomeMiniCards
            title="Payable Balance"
            total={"$2000"}
            // Icon={LuPackageCheck}
          />
          <HomeMiniCards
            title="Total Withdrawn"
            total={"$2000"}
            // Icon={LuPackageX}
          />
          <HomeMiniCards
            title="Pending"
            // description="The bookings in which minimum 1 service is not assigned to any employee"
            total={"$2000"}
            // Icon={FiBox}
          />
        </div>
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."} />
      </div>
    </div>
  );
}
