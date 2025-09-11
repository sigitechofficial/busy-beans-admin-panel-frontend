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
    <div {...rest} className="flex flex-col justify-between rounded-xl border border-tabBorderColor border-opacity-60 shadow-tabShadow bg-white ">
      <div className="border-b border-tabBorderColor border-opacity-20 py-4">
        <div className="h-28">
          <img
            src={BASE_URL + imageURL}
            alt="stock-images"
            className="object-contain h-full w-full"
          />
        </div>
      </div>
      <div className="h-full px-4 py-3 font-inter space-y-2 flex flex-col justify-between">
        <div className="[&>p]:flex [&>p]:justify-between [&>p]:gap-x-1 [&>p]:text-black">
          <p>
            <span className="text-start break-words break-all font-semibold">
              {itemName}
            </span>
          </p>

          <p>
            <span>Grind</span>{" "}
            <span className="text-end break-words break-all">{grind}</span>
          </p>
          <p>
            <span>Product Code</span>{" "}
            <span className="text-end break-words break-all">{productCode}</span>
          </p>
          <p>
            <span>Sku</span>{" "}
            <span className="text-end break-words break-all">{sku}</span>
          </p>
          <p>
            <span>Price</span>{" "}
            <span className="text-end break-words break-all">${price}</span>
          </p>
          <p>
            <span>Whole Sale Price</span>{" "}
            <span className="text-end break-words break-all">
              ${wholesalePrice}
            </span>
          </p>
          <p>
            <span>Weight</span>{" "}
            <span className="text-end break-words break-all">
              {weight} {unit}
            </span>
          </p>
          {/* <p>
            <span>Quantity</span>{" "}
            <span>
              {stock} {unit}
            </span>
          </p> */}
        </div>
        {/* <div className="flex justify-end">
          <button className="rounded-lg bg-[#83F5B4] py-3 px-2">
            Update Stock
          </button>
        </div> */}

        <div className="border border-tabBorderColor/50 bg-themeSilver shadow-smButtonShadow w-36 h-14 rounded-full flex items-center justify-around text-[#707175]">
          <button
            disabled={itemQuantity <= 0}
            onClick={() => {
              setItemQuantity(itemQuantity - 1);
              handleMinus(id, itemQuantity - 1);
            }}
            // className={`
            //   ${
            //   (orderStatus?.qty === 0 &&
            //     existingCartItems?.find(
            //       (ele) => ele?.productId === productId
            //     )) ||
            //   (orderStatus?.qty === 1 &&
            //     !existingCartItems?.find((ele) => ele?.productId === productId))
            //     ? "cursor-not-allowed bg-theme text-white text-opacity-20 border border-theme"
            //     : "hover:bg-white hover:text-theme border border-theme bg-theme text-white duration-300"
            // }
            // w-10 h-10 flex justify-center items-center rounded-full outline-none`}
            className="w-10 h-10 flex justify-center items-center rounded-full disabled:cursor-not-allowed bg-black text-white hover:bg-white hover:text-theme border border-theme duration-300"
          >
            <RiSubtractFill />
          </button>
          <span className="text-2xl font-sf text-black">{itemQuantity}</span>
          <button
            onClick={() => {
              setItemQuantity(itemQuantity + 1);
              handlePlus(id, itemQuantity + 1);
            }}
            className="w-10 h-10 flex justify-center items-center rounded-full bg-black text-white hover:bg-white hover:text-theme border border-theme duration-300"
          >
            <BiPlus />
          </button>
        </div>
      </div>
    </div>
  );
}
