import { useState, useEffect } from "react";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";

export default function AddonSelection({ addons = [], selectedAddons = [], onToggle, onQuantityChange, onPriceChange }) {
  if (!addons || addons.length === 0) {
    return <div className="p-4 text-center text-gray-500">No add-ons available.</div>;
  }

  const handleQuantityChange = (addonId, newQuantity, e) => {
    e?.stopPropagation();
    if (onQuantityChange) {
      onQuantityChange(addonId, Math.max(1, parseInt(newQuantity) || 1));
    }
  };

  const handlePriceChange = (addonId, newPrice, e) => {
    e?.stopPropagation();
    if (onPriceChange) {
      onPriceChange(addonId, parseFloat(newPrice) || 0);
    }
  };

  const getSelectedAddon = (addonId) => {
    return selectedAddons.find(a => a.id === addonId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
      {addons.map((addon) => {
        const isSelected = selectedAddons.some((a) => a.id === addon.id);
        const selectedAddon = getSelectedAddon(addon.id);
        const quantity = selectedAddon?.quantity || 1;
        const customPrice = selectedAddon?.customPrice !== undefined ? selectedAddon.customPrice : addon.price;

        return (
          <div
            key={addon.id}
            className={`border rounded-xl p-4 transition-all ${
              isSelected 
                ? "border-theme bg-[#fef1d8] shadow-md" 
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => onToggle(addon)}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{addon.name || addon.addonName}</h4>
                    {addon.description && (
                      <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                    )}
                  </div>

                  <div
                    role="checkbox"
                    aria-checked={isSelected}
                    className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                      isSelected ? "bg-theme border-theme" : "border-gray-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(addon);
                    }}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
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

                {!isSelected && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-theme">${addon.price}</span>
                    <span className="text-xs text-gray-500">/mo</span>
                  </div>
                )}

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-300 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(addon.id, quantity - 1, e)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                        >
                          <RiSubtractFill size={16} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(addon.id, e.target.value, e)}
                          className="w-16 h-8 text-center border border-gray-300 rounded text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(addon.id, quantity + 1, e)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                        >
                          <BiPlus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-gray-700">Unit Price:</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPrice}
                          onChange={(e) => handlePriceChange(addon.id, e.target.value, e)}
                          className="w-24 h-8 px-2 border border-gray-300 rounded text-sm font-medium"
                        />
                        <span className="text-xs text-gray-500">/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="font-bold text-theme">
                        ${(customPrice * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
