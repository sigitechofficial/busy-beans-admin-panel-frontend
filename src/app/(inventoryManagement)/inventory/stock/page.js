"use client";
import StockCard from "@/components/ui/StockCard";
import { Dialog } from "primereact/dialog";
import { LuImageUp } from "react-icons/lu";
import { RiFileDownloadLine } from "react-icons/ri";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";
import { PostAPI } from "@/utilities/PostAPI";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import GetAPI from "@/utilities/GetAPI";

export default function Stock() {
  const { data } = GetAPI("api/v1/admin/product");
  console.log("🚀 ~ Stock ~ data:", data?.data?.data);

  const [productDetail, setProductDetail] = useState({
    name: "",
    quantity: "",
    unit: "",
    image: "",
    price: "",
    desc: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [modal, setModal] = useState({
    type: "",
    status: false,
  });

  const handleChange = (e) => {
    setProductDetail({ ...productDetail, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    const image = document.querySelector(".image");
    image.click();
    // const file = e.target.files[0]
    // console.log("🚀 ~ handleImage ~ file:", file)
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductDetail({ ...productDetail, image: file });
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
    }
  };

  const handleAddStock = async () => {
    const formData = new FormData();
    formData.append("name", productDetail?.name);
    formData.append("quantity", productDetail?.quantity);
    formData.append("unit", productDetail?.unit);
    formData.append("price", productDetail?.price);
    formData.append("desc", productDetail?.desc);
    formData.append("image", productDetail?.image);

    const res = await PostAPI("api/v1/admin/product", formData);
    if (res?.data?.status === "success") {
      success_toaster("Product Added Successfully");
      setProductDetail({
        name: "",
        quantity: "",
        unit: "",
        image: "",
      });
      setModal({ type: "", status: false });
      setImagePreview("");
    } else if (res?.data?.status === "error") {
      error_toaster(res?.data?.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Available Stock
          </h2>

          <div className="flex items-center gap-x-4">
            <div>
              <button className="flex items-center gap-x-2 px-2 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-lg shadow-buttonShadow border border-buttonBorderColor bg-white ">
                <RiFileDownloadLine size={24} />
                <span className="font-nunito text-black">Download CSV</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setModal({ type: "addStock", status: true })}
            className="rounded-lg font-inter font-medium text-white px-10 py-2.5 sm:py-4 bg-theme"
          >
            + Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {data?.data?.data?.map((item, i) => (
          <StockCard
            key={i}
            itemName={item?.name}
            quantity={item?.quantity}
            unit={item?.unit}
            imageURL={item?.image}
          />
        ))}
        {/* <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" />
        <StockCard itemName="Coffee" quantity="100kg" /> */}
      </div>

      {/* Modal */}
      <Dialog
        visible={modal?.type === "addStock" && modal?.status}
        // style={{ width: "40vw" }}
        breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
        className="font-nunito"
        onHide={() => setModal({ type: "", status: false })}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Add Stock/ Inventory
          </div>
        }
      >
        <div className="space-y-4 flex flex-col items-center">
          {/* header */}
          <button
            onClick={handleImageClick}
            className="overflow-hidden rounded-xl border border-tabBorderColor border-opacity-40 size-28 flex items-center justify-center"
          >
            <input
              type="file"
              name="name"
              className="image hidden"
              onChange={handleImage}
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="product image"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <LuImageUp size={"100"} color="rgba(0, 0, 0, 0.6)" />
            )}
          </button>

          {/* body */}
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-y-2 w-full">
              <label className="text-labelColor font-medium font-satoshi">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                placeholder="Enter Item Name"
                className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              />
              {/* <Select
                placeholder="Coffee"
                className="w-full"
                styles={selectStyles2}
              /> */}
            </div>
            <div className="grid sm:grid-cols-3 gap-y-4 gap-x-6">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  onChange={handleChange}
                  placeholder="Enter Quantity"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Units
                </label>
                <input
                  type="text"
                  name="unit"
                  onChange={handleChange}
                  placeholder="Enter unit"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
                {/* <Select
                  placeholder="Kg"
                  className="w-full"
                  styles={selectStyles2}
                /> */}
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Price($)
                </label>
                <input
                  type="text"
                  name="price"
                  onChange={handleChange}
                  placeholder="Enter price"
                  className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                />
                {/* <Select
                  placeholder="Kg"
                  className="w-full"
                  styles={selectStyles2}
                /> */}
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-labelColor font-medium font-satoshi">
                Description
              </label>
              <input
                type="text"
                name="desc"
                onChange={handleChange}
                placeholder="Enter Description"
                className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
              />
            </div>
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
              <button
                onClick={() => setModal({ type: "", status: false })}
                className="rounded-lg border border-black shadow-buttonShadow  px-6"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStock}
                className="rounded-lg border border-theme text-white px-10  bg-theme"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
