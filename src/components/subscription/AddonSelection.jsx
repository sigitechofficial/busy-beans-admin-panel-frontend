import { useState, useEffect } from "react";

export default function AddonSelection({ addons = [], selectedAddons = [], onToggle }) {
  if (!addons || addons.length === 0) {
    return <div className="text-gray-500">No add-ons available.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {addons.map((addon) => {
        const isSelected = selectedAddons.some((a) => a.id === addon.id);
        return (
          <div
            key={addon.id}
            className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? "border-theme bg-[#fef1d8]" : "border-gray-200"
              }`}
            onClick={() => onToggle(addon)}
          >
            <div>
              <h4 className="font-semibold">{addon.name}</h4>
              <p className="text-sm text-gray-500">{addon.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">${addon.price}/mo</span>
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? "bg-theme border-theme" : "border-gray-300"
                  }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
