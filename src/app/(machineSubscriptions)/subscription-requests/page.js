"use client";

import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";

export default function SubscriptionRequests() {
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();

  const { data } = GetAPI("api/v1/admin/subscription-requests", "subscription-requests");
  const list = data?.data?.data ?? [];

  const stats = useMemo(() => {
    const total = list.length || 0;
    const pending = list.filter((x) => (x?.status || "").toLowerCase() === "pending").length;
    const approved = list.filter((x) => (x?.status || "").toLowerCase() === "approved").length;
    const cancelled = list.filter((x) => (x?.status || "").toLowerCase() === "cancelled").length;
    const pendingPct = total ? Math.round((pending / total) * 100) : 0;
    return { total, pending, pendingPct, approved, cancelled };
  }, [list]);

  const columns = [
    { field: "sl", header: "#", sort: true },
    { field: "requestId", header: "Request ID" },
    { field: "companyName", header: "Company Name" },
    { field: "email", header: "Email" },
    { field: "phone", header: "Phone number" },
    { field: "requestDate", header: "Request Date" },
    { field: "status", header: "Status" },
    { field: "actions", header: "Actions" },
    { field: "cta", header: "Button" },
  ];

  const rows = list.map((r, i) => {
    const s = (r?.status || "pending").toLowerCase();
    const statusBadge =
      s === "approved"
        ? "bg-green-100 text-green-700"
        : s === "cancelled"
        ? "bg-red-100 text-red-600"
        : "bg-yellow-100 text-yellow-700";

    return {
      id: r?.id ?? i + 1,
      sl: String(i + 1).padStart(2, "0"),
      requestId: r?.requestId ?? r?.id ?? "-",
      companyName: r?.companyName ?? "-",
      email: r?.email ?? "-",
      phone: r?.phoneNumber ?? r?.phone ?? "-",
      requestDate: r?.requestedOn ? dayjs(r.requestedOn).format("YYYY-MM-DD") : "-",
      status: (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
      ),
      actions: (
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm">Pending</span>
          <span className="inline-block rotate-90">⌄</span>
        </div>
      ),
      cta: (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/subscriptions/buy/${r?.id ?? ""}`);
          }}
          className="px-3 py-2 rounded bg-[#8E6C53] text-white text-sm"
        >
          Buy Subscription
        </button>
      ),
    };
  });

  if (data?.length === 0) return <Loader />;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Subscription Requests</h2>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Requests" desc={stats.total} />
          <ManagementTab title="Pending Requests" desc={`${stats.pendingPct}%`} />
          <ManagementTab title="Approved Requests" desc={stats.approved} />
          <ManagementTab title="Cancelled Requests" desc={stats.cancelled} />
        </div>

        <MyDataTable
          columns={columns}
          data={rows}
          placeholder="Search ..."
          pagination
          search
          // onRowClick={(e) => router.push(`/subscriptions/requests/${e.data.id}`)}
        />
      </div>
    </div>
  );
}
