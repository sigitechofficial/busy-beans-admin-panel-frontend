"use client";

import GetAPI from "@/utilities/GetAPI";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import {
  MdAssignment,
  MdAssignmentTurnedIn,
  MdLocalShipping,
  MdWarningAmber,
  MdOutbound,
} from "react-icons/md";
import DASHBOARD from "@/app/dashboard.testids";

const QUEUE_TILES = [
  {
    key: "new",
    title: "New",
    subtitle: "Assigned, not acknowledged",
    countKey: "newCount",
    href: "/supplier/assigned-orders",
    Icon: MdAssignment,
  },
  {
    key: "acknowledged",
    title: "Acknowledged",
    subtitle: "Ready to ship",
    countKey: "acknowledgedCount",
    href: "/supplier/acknowledge-orders",
    Icon: MdAssignmentTurnedIn,
  },
  {
    key: "shipped",
    title: "Shipped",
    subtitle: "Last 7 days",
    countKey: "shippedLast7Days",
    href: "/supplier/shiped-orders",
    Icon: MdLocalShipping,
  },
];

function formatAge(hours) {
  const h = Number(hours) || 0;
  if (h < 1) return "< 1h";
  if (h < 24) return `${Math.floor(h)}h`;
  const days = Math.floor(h / 24);
  const rem = Math.floor(h % 24);
  return rem ? `${days}d ${rem}h` : `${days}d`;
}

function OrderRows({ rows, emptyCopy, showReason }) {
  const router = useRouter();

  if (!rows.length) {
    return <p className="text-gray-500 text-sm py-4">{emptyCopy}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="py-2 pr-3 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Company</th>
            <th className="py-2 pr-3 font-medium">Items</th>
            <th className="py-2 pr-3 font-medium">Age</th>
            {showReason && (
              <th className="py-2 pr-3 font-medium">Reason</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.ownerType || row.type}-${row.id}`}
              onClick={() => {
                if (row.detailPath) router.push(row.detailPath);
              }}
              className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                row.detailPath ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <td className="py-2.5 pr-3 text-gray-800 font-medium">{row.id}</td>
              <td className="py-2.5 pr-3 text-gray-800 truncate max-w-[180px]">
                {row.companyName || "—"}
              </td>
              <td className="py-2.5 pr-3 text-gray-700">{row.itemCount ?? 0}</td>
              <td className="py-2.5 pr-3 text-gray-700">{formatAge(row.ageHours)}</td>
              {showReason && (
                <td className="py-2.5 pr-3 text-gray-700">{row.reason || "—"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SupplierDashboard() {
  const router = useRouter();
  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userID") : null;
  const userName =
    typeof window !== "undefined" ? localStorage.getItem("userName") : "";

  const { data, isLoading } = GetAPI(
    userID ? `api/v1/admin/supplier-dashboard/${userID}` : "",
    userID ? `supplier-dashboard-${userID}` : "supplier-dashboard-skip"
  );

  if (isLoading || !userID) {
    return <Loader />;
  }

  const payload = data?.data || {};
  const newCount = Number(payload.newCount) || 0;
  const acknowledgedCount = Number(payload.acknowledgedCount) || 0;
  const shippedLast7Days = Number(payload.shippedLast7Days) || 0;
  const needsAttention = Array.isArray(payload.needsAttention)
    ? payload.needsAttention
    : [];
  const readyToShip = Array.isArray(payload.readyToShip)
    ? payload.readyToShip
    : [];
  const counts = { newCount, acknowledgedCount, shippedLast7Days };
  const isEmpty = newCount + acknowledgedCount + shippedLast7Days === 0
    && needsAttention.length === 0
    && readyToShip.length === 0;

  return (
    <div
      className="w-full min-w-0 overflow-x-hidden"
      data-testid={DASHBOARD.supplierRoot}
    >
      <div className="space-y-5 sm:space-y-8 pb-4 sm:pb-6">
        <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
          <div className="relative z-30 py-5 px-6 2xl:px-12">
            <div>
              <h1
                className="text-white text-xl lg:text-3xl font-inter font-semibold"
                data-testid={DASHBOARD.header}
              >
                Welcome, {userName || "Supplier"}.
              </h1>
              <p className="text-white font-inter">
                Your fulfillment queue — acknowledge, ship, and clear what needs attention.
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-6 2xl:px-12 space-y-5 sm:space-y-8 max-w-full min-w-0">
          {isEmpty && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
              <p className="text-gray-700 text-sm sm:text-base">
                No orders assigned to you yet. When HQ assigns an order, it will appear under New.
              </p>
            </div>
          )}

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
            data-testid={DASHBOARD.statsCardsGrid}
          >
            {QUEUE_TILES.map(({ key, title, subtitle, countKey, href, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => router.push(href)}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 text-left hover:border-theme/40 hover:shadow-xl transition-shadow min-w-0"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
                    <Icon className="text-theme shrink-0" size={20} />
                    <span className="truncate">{title}</span>
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {counts[countKey].toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
                <MdWarningAmber className="text-theme shrink-0" size={20} />
                Needs attention
              </h3>
              <OrderRows
                rows={needsAttention}
                showReason
                emptyCopy="Nothing waiting past SLA."
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
                <MdOutbound className="text-theme shrink-0" size={20} />
                Ready to ship
              </h3>
              <OrderRows
                rows={readyToShip}
                emptyCopy="No acknowledged orders waiting to ship."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
