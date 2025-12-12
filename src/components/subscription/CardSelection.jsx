import React from "react";
import GetAPI from "@/utilities/GetAPI";
import { FaCheck } from "react-icons/fa";

// Card brand icons/logos helper
const getBrandIcon = (brand) => {
  const brandLower = brand?.toLowerCase() || "";
  if (brandLower.includes("visa")) {
    return (
      <div className="w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: "#1434CB" }}>
        VISA
      </div>
    );
  } else if (brandLower.includes("mastercard") || brandLower.includes("master")) {
    return (
      <div className="w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(to right, #EB001B, #F79E1B)" }}>
        MC
      </div>
    );
  } else if (brandLower.includes("amex") || brandLower.includes("american")) {
    return (
      <div className="w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(to right, #006FCF, #012169)" }}>
        AMEX
      </div>
    );
  }
  return (
    <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center text-white font-bold text-xs">
      {brand?.toUpperCase().slice(0, 4) || "CARD"}
    </div>
  );
};

const formatExpiryDate = (month, year) => {
  const formattedMonth = String(month).padStart(2, "0");
  const shortYear = String(year).slice(-2);
  return `${formattedMonth}/${shortYear}`;
};

export default function CardSelection({ userId, onSelect, selectedMethodId }) {
  // Fetch payment methods for the selected user
  const { data, isLoading } = GetAPI(
    userId ? `api/v1/admin/customer-management/payment-cards/${userId}` : null
  );
  
  // Extract cards array from API response
  const cards = data?.data?.cards || data?.cards || [];

  if (isLoading) {
    return (
      <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
        Loading saved cards...
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
        No saved cards found for this user.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg mb-4">Select Payment Method</h4>
      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => {
          const isSelected = selectedMethodId === card.id;
          
          return (
            <div
              key={card.id}
              onClick={() => onSelect(card.id)}
              className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-theme bg-[#fef1d8] shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {/* Credit Card Style UI */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {getBrandIcon(card.brand)}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {card.funding || "Credit"}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{card.brand}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Cardholder Name</p>
                    <p className="font-semibold text-gray-800">{card.name || "N/A"}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Card Number</p>
                      <p className="font-mono text-lg font-semibold text-gray-800">
                        •••• •••• •••• {card.last4}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expires</p>
                      <p className="font-semibold text-gray-800">
                        {formatExpiryDate(card.expMonth, card.expYear)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Selection Indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                    isSelected
                      ? "bg-theme border-theme"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <FaCheck className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
