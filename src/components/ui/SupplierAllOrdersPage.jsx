"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { mergeSupplierOrders } from "@/utilities/supplierAllOrders";

const STATUS_CONFIG = {
  all: {
    statusId: null,
    title: "All Orders",
    partnerDetailBase: null,
  },
  new: {
    statusId: 2,
    title: "New Orders",
    partnerDetailBase: "/supplier/partner/new-orders",
  },
  acknowledged: {
    statusId: 3,
    title: "Acknowledged Orders",
    partnerDetailBase: "/supplier/partner/acknowledged-orders",
  },
  shipped: {
    statusId: 5,
    title: "Shipped Orders",
    partnerDetailBase: "/supplier/partner/shipped-orders",
  },
};

export default function SupplierAllOrdersPage({ statusKey }) {
  const config = STATUS_CONFIG[statusKey];
  const supplierId =
    typeof window !== "undefined" ? localStorage.getItem("userID") : null;
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();

  const customerUrl = supplierId
    ? config.statusId
      ? `api/v1/admin/orders?statusId=${config.statusId}&supplierId=${supplierId}`
      : `api/v1/admin/orders?supplierId=${supplierId}`
    : null;
  const partnerUrl = supplierId
    ? config.statusId
      ? `api/v1/admin/partner-order/orders-list?supplierId=${supplierId}&statusId=${config.statusId}`
      : `api/v1/admin/partner-order/orders-list?supplierId=${supplierId}`
    : null;

  const { data: customerData, isLoading: customerLoading } = GetAPI(customerUrl);
  const { data: partnerData, isLoading: partnerLoading } = GetAPI(partnerUrl);

  const rows = mergeSupplierOrders(
    customerData?.data?.data,
    partnerData?.data?.data,
    config.partnerDetailBase
  );

  const columns = [
    { field: "id", header: "#", sort: true },
    { field: "companyName", header: "Company" },
    { field: "noOfItems", header: "No. of Items" },
    ...(statusKey === "new"
      ? []
      : [{ field: "orderCurrentStatus", header: "Status" }]),
  ];

  if (customerLoading || partnerLoading) {
    return <Loader />;
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
          <h2 className="text-xl font-inter font-semibold">{config.title}</h2>
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Orders" desc={rows.length} />
        </div>

        <div>
          <MyDataTable
            columns={columns}
            data={rows}
            dataKey="rowKey"
            placeholder={"Search ..."}
            pagination={true}
            search={true}
            onRowClick={(e) => {
              if (e?.data?.detailPath) {
                router.push(e.data.detailPath);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
