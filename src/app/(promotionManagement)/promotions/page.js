"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import { useRouter } from "next/navigation";

export default function Promotions() {
  const router = useRouter();
  const columns = [
    { field: "#", header: "SL", sort: true },
    { field: "promotionID", header: "Promotion ID" },
    { field: "name", header: "Name" },
    { field: "type", header: "Type" },
    { field: "discount", header: "Discount" },
    { field: "eligibility", header: "Eligibility" },
    { field: "time", header: "Times availed by Customers" },
    { field: "startDate", header: "Start date" },
    { field: "endDate", header: "End date" },
    { field: "action", header: "Action" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Promotions
          </h2>

          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={() => router.push("/add-new-promotion")}
            className="rounded-lg font-inter font-medium text-white px-2 sm:px-3 py-2.5 sm:py-4 bg-theme"
          >
            + Add New Promotion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Promotions" desc="5000" />
        <ManagementTab title="Active Promotions" desc="5000" />
        <ManagementTab title="New Promotions" desc="500" />
        <ManagementTab title="Expired Promotions" desc="55,000" />
      </div>

      <div>
        <MyDataTable columns={columns} data={[]} placeholder={"Search ..."}   pagination={true} />
      </div>
    </div>
  );
}
