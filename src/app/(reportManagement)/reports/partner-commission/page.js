"use client";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import selectStyles from "@/utilities/SelectStyle";
import Select from "react-select";

export default function PartnerCommissionReport() {
  const { data } = GetAPI("api/v1/admin/admin-reports/partner-commission");
  console.log("🚀 ~ PartnerCommissionReport ~ data:", data?.data);

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "srName", header: "Supplier Name" },
    { field: "ordersPlaced", header: "Orders Placed" },
    { field: "totalSales", header: "Total Sales" },
    { field: "wholesalePriceCost", header: "Whole Sale Price Cost" },
    { field: "totalCommission", header: "Total Commission" },
  ];

  const datas = [];
  data?.data?.map((report, i) =>
    datas.push({
      sl: i + 1,
      srName: report?.srName,
      ordersPlaced: `$${report?.ordersPlaced ?? 0}`,
      totalSales: `$${report?.totalSales ?? 0}`,
      wholesalePriceCost: `$${report?.wholesalePriceCost ?? 0}`,
      totalCommission: `$${report?.totalCommission ?? 0}`,
    })
  );

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Partner Commission Report
          </h2>
        </div>
        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div>
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
        />
      </div>
    </div>
  );
}
