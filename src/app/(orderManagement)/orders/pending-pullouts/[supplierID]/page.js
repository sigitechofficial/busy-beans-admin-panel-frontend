"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { FaEye } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PostAPI } from "@/utilities/PostAPI";
import MiniLoader from "@/components/ui/MiniLoader";
import { success_toaster } from "@/utilities/Toaster";

export default function PendingPulloutsOrders() {
  const { supplierID } = useParams();
  const [selectedRows, setSelectedRows] = useState([]);
  const [loader, setLoader] = useState(false);

  const { data, reFetch } = GetAPI(
    `api/v1/admin/orders-pending-pullouts/${supplierID}`
  );

  const totalAdminReceivableAmount = data?.data?.order?.reduce(
    (total, order) => {
      return total + (Number(order?.adminReceivableAmount) || 0);
    },
    0
  );

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "id", header: "Order ID", sort: true },
    { field: "customerName", header: "Customer Name" },
    { field: "adminReceivableAmount", header: "Admin Receivable Amount" },
    { field: "totalBill", header: "Total Bill" },
    { field: "localPatnerCommission", header: "Local Partner Commission" },
    { field: "vat", header: "Discount Price" },
    { field: "itemsPrice", header: "Items Price" },
    { field: "wholesalePrice", header: "Whole Sale Price" },
  ];

  const datas = [];
  data?.data?.order?.map((detail, i) => {
    return datas.push({
      sl: i + 1,
      id: detail?.id,
      customerName: detail?.customerName,
      adminReceivableAmount: `$${detail?.adminReceivableAmount ?? 0}`,
      totalBill: `$${detail?.totalBill ?? 0}`,
      localPatnerCommission: `$${detail?.localPatnerCommission ?? 0}`,
      vat: `$${detail?.vat ?? 0}`,
      itemsPrice: `$${detail?.itemsPrice ?? 0}`,
      wholesalePrice: `$${detail?.wholesalePrice ?? 0}`,
    });
  });

  const handlePulloutPayments = async () => {
    const orderList = [];
    selectedRows?.map((order) =>
      orderList.push({
        id: order?.id,
        localPatnerCommission: order?.localPatnerCommission?.replace("$", ""),
        adminReceivableAmount: order?.adminReceivableAmount?.replace("$", ""),
      })
    );
    console.log("🚀 ~ handlePulloutPayments ~ orderList:", orderList);
    const receivableAmount = selectedRows?.reduce((total, order) => {
      const amount = parseFloat(
        order?.adminReceivableAmount?.replace("$", "") || 0
      );
      return total + amount;
    }, 0);
    console.log("🚀 ~ receivableAmount ~ receivableAmount:", receivableAmount);
    setLoader(true);
    try {
      const res = await PostAPI(
        `api/v1/admin/pull-payments-from-patners-banka-account/${supplierID}`,
        {
          amount: receivableAmount,
          orderList: orderList,
        }
      );
      if (res?.data?.status === "success") {
        success_toaster("Admin Receivable Amount pullout successfully");
        reFetch();
        setSelectedRows([]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoader(false);
    }
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Pending Pullout Orders
          </h2>
        </div>
      </div>
      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <BackButton />
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Pending Pullout Orders
            </h2>
          </div>
        </div> */}

        <div className="flex justify-end">
          <button
            onClick={handlePulloutPayments}
            className="rounded-lg font-inter font-medium text-white bg-theme hover:text-theme hover:bg-white border border-theme duration-150 px-5 py-3 sm:h-full"
          >
            Pullout Payment
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab
            title="Total Orders"
            desc={data?.data?.order?.length}
          />
          <ManagementTab
            title="Total Admin Receivable Amount"
            desc={`$${totalAdminReceivableAmount ?? 0}`}
          />
          {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        {loader ? (
          <MiniLoader />
        ) : (
          <div>
            <MyDataTable
              columns={columns}
              data={datas}
              placeholder={"Search ..."}
              pagination={true}
              checkbox={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              search={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
