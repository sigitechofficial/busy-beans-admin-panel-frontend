"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import { useRouter } from "next/navigation";

export default function Employees() {
  const router = useRouter();
  const columns = [
    { field: "#", header: "SL", sort: true },
    { field: "employeeID", header: "Employee ID" },
    { field: "name", header: "Name" },
    { field: "email", header: "Email" },
    { field: "phoneNumber", header: "Phone Number" },
    { field: "role", header: "Role" },
    { field: "status", header: "Status" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Employee Management
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button
            // onClick={() => router.push("/")}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Employee" desc="5000" />
        <ManagementTab title="New Employee" desc="5000" />
        <ManagementTab title="Active Employee" desc="55000" />
        <ManagementTab title="Inactive Employee" desc="18,000" />
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."}    pagination={true} />
      </div>
    </div>
  );
}
