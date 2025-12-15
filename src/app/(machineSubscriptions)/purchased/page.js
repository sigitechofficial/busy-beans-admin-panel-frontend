"use client";

import { useState } from "react";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { Dialog } from "primereact/dialog";
import { FaEye } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

export default function PurchasedSubscriptions() {
  const { toggle, setToggle } = useDataContext();
  const router = useRouter();
  const { data, reFetch } = GetAPI("api/v1/subscription/list");
  const list = data?.subscriptions ?? [];

  const [cancelLoading, setCancelLoading] = useState(null);
  const [cancelModal, setCancelModal] = useState({ visible: false, subscriptionId: null });

  const handleCancelClick = (id) => {
    setCancelModal({ visible: true, subscriptionId: id });
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal.subscriptionId) return;

    setCancelLoading(cancelModal.subscriptionId);
    try {
      const res = await PostAPI(`api/v1/subscription/${cancelModal.subscriptionId}/cancel`);
      if (res?.data?.success) {
        success_toaster("Subscription cancelled successfully");
        reFetch();
        setCancelModal({ visible: false, subscriptionId: null });
      } else {
        error_toaster(res?.data?.error || "Failed to cancel");
      }
    } catch (err) {
      error_toaster("An error occurred");
    } finally {
      setCancelLoading(null);
    }
  };

  const columns = [
    { field: "sl", header: "#", sort: true },
    { field: "customer", header: "Customer" },
    { field: "customerName", header: "Customer Name" },
    { field: "machine", header: "Machine" },
    { field: "machinePrice", header: "Machine Price" },
    { field: "productsTotal", header: "Products Total" },
    { field: "addonsTotal", header: "Add-ons Total" },
    { field: "price", header: "Total Price/Mo" },
    { field: "subscriptionDays", header: "Days" },
    { field: "status", header: "Status" },
    { field: "periodStart", header: "Period Start" },
    { field: "period", header: "Period End" },
    { field: "createdAt", header: "Created At" },
    { field: "action", header: "Action" },
  ];

  const rows = list.map((sub, i) => {
    return {
      sl: i + 1,
      customer: sub.customerEmail || "-",
      customerName: sub.userName || "-",
      machine: sub.machine?.name || "-",
      machinePrice: sub.machinePrice ? `$${parseFloat(sub.machinePrice).toFixed(2)}` : "-",
      productsTotal: sub.productsTotal ? `$${parseFloat(sub.productsTotal).toFixed(2)}` : "$0.00",
      addonsTotal: sub.addonsTotal ? `$${parseFloat(sub.addonsTotal).toFixed(2)}` : "$0.00",
      price: `$${parseFloat(sub.totalPrice || 0).toFixed(2)}`,
      subscriptionDays: sub.subscriptionDays ? `${sub.subscriptionDays} days` : "-",
      status: (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.status === "active"
              ? "bg-green-100 text-green-700"
              : sub.status === "canceled"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {sub.status?.toUpperCase() || "UNKNOWN"}
        </span>
      ),
      periodStart: sub.currentPeriodStart ? dayjs(sub.currentPeriodStart).format("MMM DD, YYYY") : "-",
      period: sub.currentPeriodEnd ? dayjs(sub.currentPeriodEnd).format("MMM DD, YYYY") : "-",
      createdAt: sub.createdAt ? dayjs(sub.createdAt).format("MMM DD, YYYY") : "-",
      action: (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/purchased/${sub.id}`)}
            className="border border-theme rounded-md p-2 text-theme hover:bg-theme hover:text-white transition-colors"
            title="View Details"
          >
            <FaEye size={18} />
          </button>
          {sub.status === 'active' && (
            <button
              disabled={cancelLoading === sub.id}
              onClick={() => handleCancelClick(sub.id)}
              className="border border-red-400 rounded-md p-2 text-red-400 hover:bg-red-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel Subscription"
            >
              {cancelLoading === sub.id ? (
                <span className="text-xs">...</span>
              ) : (
                <MdCancel size={18} />
              )}
            </button>
          )}
        </div>
      )
    };
  });

  if (!data && !list.length) return <Loader />;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-semibold">Purchased Subscriptions</h2>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Subscriptions" desc={list.length} />
        </div>

        <MyDataTable
          columns={columns}
          data={rows}
          placeholder="Search ..."
          pagination
          search
        />
      </div>

      {/* Cancel Subscription Modal */}
      <Dialog
        header="Cancel Subscription"
        visible={cancelModal.visible}
        className="w-[90%] max-w-[500px] font-nunito"
        onHide={() => setCancelModal({ visible: false, subscriptionId: null })}
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setCancelModal({ visible: false, subscriptionId: null })}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              No, Keep Subscription
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={cancelLoading !== null}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel Subscription"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
