import { useState, useMemo } from "react";
import GetAPI from "@/utilities/GetAPI";
import { BASE_URL } from "@/utilities/URL";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";
import { LuSearch } from "react-icons/lu";

export default function ProductSelection({
  selectedProducts = [],
  onToggle,
  onQuantityChange,
  onPriceChange,
  selectedPartnerId = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Admin customer → admin products; partner customer → that partner's inventory
  const productUrl =
    selectedPartnerId != null && selectedPartnerId !== ""
      ? `api/v1/admin/products/sales-rep?salesRepId=${selectedPartnerId}&page=1&limit=500`
      : "api/v1/admin/product?status=1";

  const { data, isLoading } = GetAPI(productUrl);

  const products =
    data?.data?.data != null
      ? (Array.isArray(data.data.data) ? data.data.data : [])
      : Array.isArray(data?.data)
        ? data.data
        : [];

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.trim().toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        String(p.sku || "").toLowerCase().includes(q) ||
        (p.desc || "").toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading products...</div>;
  if (!products.length) return <div className="p-4 text-center text-gray-500">No products available.</div>;

  const handleToggle = (product) => {
    onToggle(product);
  };

  const handleQuantityChange = (productId, newQuantity, e) => {
    e?.stopPropagation();
    if (onQuantityChange) {
      onQuantityChange(productId, Math.max(1, parseInt(newQuantity) || 1));
    }
  };

  const handlePriceChange = (productId, newPrice, e) => {
    e?.stopPropagation();
    if (onPriceChange) {
      onPriceChange(productId, parseFloat(newPrice) || 0);
    }
  };

  const getSelectedProduct = (productId) => {
    return selectedProducts.find(p => p.id === productId);
  };

  const displayPrice = (product) =>
    selectedPartnerId != null && (product?.customPrice != null || product?.customPrice === 0)
      ? product.customPrice
      : product?.price;

  return (
    <div className="space-y-3">
      <div className="relative flex-shrink-0">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name, SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme/30 focus:border-theme"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
      {filteredProducts.map((product) => {
        const isSelected = selectedProducts.some((p) => p.id === product.id);
        const selectedProduct = getSelectedProduct(product.id);
        const quantity = selectedProduct?.quantity || 1;
        const customPrice =
          selectedProduct?.customPrice !== undefined
            ? selectedProduct.customPrice
            : displayPrice(product);

        return (
          <div
            key={product.id}
            className={`border rounded-xl p-4 transition-all ${
              isSelected 
                ? "border-theme bg-[#fef1d8] shadow-md" 
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div 
              className="flex items-start gap-4 cursor-pointer"
              onClick={() => handleToggle(product)}
            >
              <img
                src={product.image ? (BASE_URL + product.image) : "/images/coffeemachine.png"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg bg-white border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/coffeemachine.png";
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {product.sku && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>
                    {product.desc && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.desc}</p>
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
                      handleToggle(product);
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

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-300 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(product.id, quantity - 1, e)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                        >
                          <RiSubtractFill size={16} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value, e)}
                          className="w-16 h-8 text-center border border-gray-300 rounded text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleQuantityChange(product.id, quantity + 1, e)}
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
                          onChange={(e) => handlePriceChange(product.id, e.target.value, e)}
                          className="w-24 h-8 px-2 border border-gray-300 rounded text-sm font-medium"
                        />
                        {product.unit && (
                          <span className="text-xs text-gray-500">/ {product.unit}</span>
                        )}
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

                {!isSelected && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-theme">
                      ${displayPrice(product) ?? "—"}
                    </span>
                    {product.unit && <span className="text-xs text-gray-400">/ {product.unit}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
      {filteredProducts.length === 0 && searchTerm.trim() && (
        <p className="text-center text-gray-500 py-4 text-sm">No products match &quot;{searchTerm}&quot;</p>
      )}
    </div>
  );
}
