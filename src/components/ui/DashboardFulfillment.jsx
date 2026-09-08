"use client";

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
    hrefKey: "new",
    Icon: MdAssignment,
  },
  {
    key: "acknowledged",
    title: "Acknowledged",
    subtitle: "Ready to ship",
    countKey: "acknowledgedCount",
    hrefKey: "acknowledged",
    Icon: MdAssignmentTurnedIn,
  },
  {
    key: "shipped",
    title: "Shipped",
    subtitle: "Last 7 days",
    countKey: "shippedLast7Days",
    hrefKey: "shipped",
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

const LIST_LIMIT = 10;

function ListHeader({ title, Icon, total, seeAllHref, seeAllTestId }) {
  const router = useRouter();
  const count = Number(total) || 0;

  return (
    <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-0">
        <Icon className="text-theme shrink-0" size={20} />
        <span className="truncate">
          {title} ({count.toLocaleString()})
        </span>
      </h3>
      {seeAllHref && count > LIST_LIMIT && (
        <button
          type="button"
          onClick={() => router.push(seeAllHref)}
          className="text-xs sm:text-sm text-theme hover:underline font-medium shrink-0"
          data-testid={seeAllTestId}
        >
          See all →
        </button>
      )}
    </div>
  );
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
              <td className="py-2.5 pr-3 text-gray-700 truncate max-w-[12rem]">
                {row.companyName || "—"}
              </td>
              <td className="py-2.5 pr-3 text-gray-700">{row.itemCount ?? 0}</td>
              <td className="py-2.5 pr-3 text-gray-700">
                {formatAge(row.ageHours)}
              </td>
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

export function fulfillmentListHrefs(filters) {
  if (filters?.userType === "salesRep") {
    return {
      new: "/orders/partnerOrders/dispatched",
      acknowledged: "/orders/partnerOrders/acknowledged",
      shipped: "/orders/partnerOrders/shiped",
    };
  }

  return {
    new: "/orders/assigned",
    acknowledged: "/orders/acknowledged",
    shipped: "/orders/shiped",
  };
}

export default function DashboardFulfillment({
  fulfillment,
  listHrefs,
  invoiceSection,
}) {
  const router = useRouter();
  const payload = fulfillment || {};
  const newCount = Number(payload.newCount) || 0;
  const acknowledgedCount = Number(payload.acknowledgedCount) || 0;
  const shippedLast7Days = Number(payload.shippedLast7Days) || 0;
  const needsAttentionAll = Array.isArray(payload.needsAttention)
    ? payload.needsAttention
    : [];
  const readyToShipAll = Array.isArray(payload.readyToShip)
    ? payload.readyToShip
    : [];
  const needsAttentionCount =
    Number(payload.needsAttentionCount) || needsAttentionAll.length;
  const readyToShipCount =
    Number(payload.readyToShipCount) || readyToShipAll.length;
  const needsAttention = needsAttentionAll.slice(0, LIST_LIMIT);
  const readyToShip = readyToShipAll.slice(0, LIST_LIMIT);
  const counts = { newCount, acknowledgedCount, shippedLast7Days };
  const hrefs = listHrefs || fulfillmentListHrefs(null);

  return (
    <div
      className="space-y-5 sm:space-y-8"
      data-testid={DASHBOARD.fulfillmentRoot}
    >
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Fulfillment
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
          Assigned to supplier — acknowledge, ship, and clear what needs
          attention.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        data-testid={DASHBOARD.fulfillmentTiles}
      >
        {QUEUE_TILES.map(({ key, title, subtitle, countKey, hrefKey, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (hrefs[hrefKey]) router.push(hrefs[hrefKey]);
            }}
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

      {invoiceSection}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
          <ListHeader
            title="Needs attention"
            Icon={MdWarningAmber}
            total={needsAttentionCount}
            seeAllHref={hrefs.new}
            seeAllTestId={DASHBOARD.fulfillmentSeeAll("needs-attention")}
          />
          <OrderRows
            rows={needsAttention}
            showReason
            emptyCopy="Nothing waiting past SLA."
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 min-w-0">
          <ListHeader
            title="Ready to ship"
            Icon={MdOutbound}
            total={readyToShipCount}
            seeAllHref={hrefs.acknowledged}
            seeAllTestId={DASHBOARD.fulfillmentSeeAll("ready-to-ship")}
          />
          <OrderRows
            rows={readyToShip}
            emptyCopy="No acknowledged orders waiting to ship."
          />
        </div>
      </div>
    </div>
  );
}
