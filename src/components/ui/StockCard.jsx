import { BASE_URL } from "@/utilities/URL";

export default function StockCard(props) {
  const { itemName, quantity, unit, imageURL } = props;
  return (
    <div className="rounded-xl border border-tabBorderColor border-opacity-60 shadow-tabShadow bg-white">
      <div className="border-b border-tabBorderColor border-opacity-20 py-4">
        <div className="h-28">
          <img
            src={BASE_URL+imageURL}
            alt="stock-images"
            className="object-contain h-full w-full"
          />
        </div>
      </div>

      <div className="px-4 py-3 font-inter space-y-2">
        <div className="[&>p]:flex [&>p]:justify-between">
          <p>
            <span>Item Name</span> <span>{itemName}</span>
          </p>
          <p>
            <span>Quantity</span> <span>{quantity} {unit}</span>
          </p>
        </div>
        <div className="flex justify-end">
          <button className="rounded-lg bg-[#83F5B4] py-3 px-2">
            Update Stock
          </button>
        </div>
      </div>
    </div>
  );
}
