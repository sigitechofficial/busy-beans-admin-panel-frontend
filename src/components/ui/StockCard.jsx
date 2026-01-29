import { BASE_URL } from "@/utilities/URL";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { RiSubtractFill } from "react-icons/ri";

export default function StockCard(props) {
  const {
    id,
    itemName,
    productCode,
    sku,
    grind,
    // stock,
    unit,
    imageURL,
    handlePlus,
    handleMinus,
    price,
    weight,
    wholesalePrice,
    qty,
    ...rest
  } = props;
  const [itemQuantity, setItemQuantity] = useState(qty);

  useEffect(() => {
    setItemQuantity(qty);
  }, [qty]);

  return (
    <div {...rest} className="flex flex-col justify-between rounded-xl border border-tabBorderColor border-opacity-60 shadow-sm transition-shadow duration-300 bg-white overflow-hidden">
      <div className="border-b border-tabBorderColor border-opacity-20 py-4 bg-gray-50">
        <div className="h-32 flex items-center justify-center">
          <img
            src={
              imageURL && imageURL.trim() !== ""
                ? BASE_URL + imageURL
                : "/images/logocoffee.png"
            }
            alt="stock-images"
            className="object-contain h-full w-full px-2"
            onError={(e) => {
              // Show default brand logo if image fails to load (even if path exists but is incorrect)
              if (e.target.src !== "/images/logocoffee.png") {
                e.target.src = "/images/logocoffee.png";
              }
            }}
          />
        </div>
      </div>
      <div className="h-full px-4 py-4 font-inter space-y-2.5 flex flex-col justify-between">
        <div className="[&>p]:flex [&>p]:justify-between [&>p]:gap-x-2 [&>p]:text-sm [&>p]:py-0.5">
          <p className="mb-2">
            <span className="text-start break-words break-all font-semibold text-base text-gray-900">
              {itemName}
            </span>
          </p>

          {grind && (
            <p>
              <span className="text-gray-600">Grind</span>{" "}
              <span className="text-end break-words break-all text-gray-900 font-medium">{grind}</span>
            </p>
          )}
          <p>
            <span className="text-gray-600">Product Code</span>{" "}
            <span className="text-end break-words break-all text-gray-900 font-medium">{productCode}</span>
          </p>
          <p>
            <span className="text-gray-600">Sku</span>{" "}
            <span className="text-end break-words break-all text-gray-900 font-medium">{sku}</span>
          </p>
          <p>
            <span className="text-gray-600">Price</span>{" "}
            <span className="text-end break-words break-all text-theme font-semibold">${price}</span>
          </p>
          {wholesalePrice && (
            <p>
              <span className="text-gray-600">Whole Sale Price</span>{" "}
              <span className="text-end break-words break-all text-gray-900 font-medium">
                ${wholesalePrice}
              </span>
            </p>
          )}
          <p>
            <span className="text-gray-600">Weight</span>{" "}
            <span className="text-end break-words break-all text-gray-900 font-medium">
              {weight} {unit}
            </span>
          </p>
        </div>

        {/* Enhanced Quantity Control */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={itemQuantity <= 0}
              onClick={() => {
                setItemQuantity(itemQuantity - 1);
                handleMinus(id, itemQuantity - 1);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-400 bg-gray-100 text-gray-700 hover:bg-theme hover:text-white border border-gray-300 hover:border-theme transition-all duration-200 active:scale-95"
              title="Decrease quantity"
            >
              <RiSubtractFill size={18} />
            </button>
            <div className="min-w-[3rem] flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{itemQuantity}</span>
            </div>
            <button
              onClick={() => {
                setItemQuantity(itemQuantity + 1);
                handlePlus(id, itemQuantity + 1);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme text-white hover:bg-theme/90 border border-theme transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              title="Increase quantity"
            >
              <BiPlus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
