import { useState, useEffect } from "react";
import GetAPI from "@/utilities/GetAPI";
import { BASE_URL } from "@/utilities/URL";

export default function ProductSelection({ selectedProducts = [], onToggle }) {
  const { data, isLoading } = GetAPI("api/v1/admin/product");
  // Response structure: { status: "success", data: { data: [...] } }
  const products = data?.data?.data || [];

  if (isLoading) return <div>Loading products...</div>;
  if (!products.length) return <div className="text-gray-500">No products available.</div>;

  return (
    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
      {products.map((product) => {
        const isSelected = selectedProducts.some((p) => p.id === product.id);

        return (
          <div
            key={product.id}
            className={`border rounded-lg p-3 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? "border-theme bg-[#fef1d8]" : "border-gray-200"
              }`}
            onClick={() => onToggle(product)}
          >
            <img
              src={product.image ? (BASE_URL + product.image) : "/images/coffeemachine.png"}
              alt={product.name}
              className="w-16 h-16 object-cover rounded bg-white"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = "/images/coffeemachine.png";
              }}
            />

            <div className="flex-1">
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">{product.desc}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-theme">${product.price}</span>
                {product.unit && <span className="text-xs text-gray-400">/ {product.unit}</span>}
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-theme border-theme" : "border-gray-300"
                }`}
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
        );
      })}
    </div>
  );
}
