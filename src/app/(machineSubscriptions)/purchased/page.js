"use client";

import { useState } from "react";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import dayjs from "dayjs";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";

export default function PurchasedSubscriptions() {
  const { toggle, setToggle } = useDataContext();
  const { data, reFetch } = GetAPI("api/v1/subscription/list");
  const list = data?.subscriptions ?? [];

  const [cancelLoading, setCancelLoading] = useState(null);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    setCancelLoading(id);
    try {
      const res = await PostAPI(`api/v1/subscription/${id}/cancel`);
      if (res?.data?.success) {
        success_toaster("Subscription cancelled successfully");
        reFetch();
      } else {
        error_toaster(res?.data?.error || "Failed to cancel");
      }
    } catch (err) {
      error_toaster("An error occurred");
    } finally {
      setCancelLoading(null);
    }
  }

  const columns = [
    { field: "sl", header: "#", sort: true },
    { field: "customer", header: "Customer" },
    { field: "machine", header: "Machine" },
    { field: "price", header: "Price/Mo" },
    { field: "status", header: "Status" },
    { field: "period", header: "Period End" },
    { field: "action", header: "Action" },
  ];

  const rows = list.map((sub, i) => {
    return {
      sl: i + 1,
      customer: sub.customerEmail,
      machine: sub.machine?.name || "-",
      price: `$${sub.totalPrice}`,
      status: (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.status === "active"
              ? "bg-green-100 text-green-700"
              : sub.status === "canceled"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {sub.status.toUpperCase()}
        </span>
      ),
      period: sub.currentPeriodEnd ? dayjs(sub.currentPeriodEnd).format("MMM DD, YYYY") : "-",
      action: sub.status === 'active' ? (
        <button
          disabled={cancelLoading === sub.id}
          onClick={() => handleCancel(sub.id)}
          className="text-red-500 hover:underline text-sm disabled:opacity-50"
        >
          {cancelLoading === sub.id ? "Cancelling..." : "Cancel"}
        </button>
      ) : "-"
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
    </div>
  );
}
