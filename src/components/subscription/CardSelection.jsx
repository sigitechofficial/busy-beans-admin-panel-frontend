import React, { useEffect, useState } from "react";
import GetAPI from "@/utilities/GetAPI";
import { FaCreditCard } from "react-icons/fa";

export default function CardSelection({ userId, onSelect, selectedMethodId }) {
  // Fetch payment methods for the selected user
  const { data, isLoading } = GetAPI(userId ? `api/v1/admin/customer-management/payment-cards/${userId}` : null);
  const paymentMethods = data?.data ?? []; // Adjust structure as needed

  if (isLoading) return <div>Loading saved cards...</div>;

  if (!paymentMethods.length) {
    return (
      <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
        No saved cards found for this user.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Select Payment Method</h4>
      <div className="grid gap-3">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            onClick={() => onSelect(pm.id)}
            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${selectedMethodId === pm.id ? "border-theme bg-[#fef1d8]" : "border-gray-200"
              }`}
          >
            <div className="flex items-center gap-3">
              <FaCreditCard className="text-gray-600" size={24} />
              <div>
                <p className="font-bold capitalize">{pm.card?.brand} •••• {pm.card?.last4}</p>
                <p className="text-sm text-gray-500">Expires {pm.card?.exp_month}/{pm.card?.exp_year}</p>
              </div>
            </div>
            {selectedMethodId === pm.id && (
              <div className="w-4 h-4 bg-theme rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
