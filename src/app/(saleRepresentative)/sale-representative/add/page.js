"use client";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import MiniLoader from "@/components/ui/MiniLoader";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";

export default function AddSaleRepresentative() {
  const [loader, setLoader] = useState("");
  const [saleRepresentative, setSaleRepresentative] = useState({
    srName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    address: "",
    territory: "",
    businessWeb: "",
    image: "",
    phoneNumber: "",
    creditLimit: "",
    status: true,
  });

  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    setSaleRepresentative({
      ...saleRepresentative,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectImage = () => {
    const selectImage = document.querySelector(".selectImage");
    selectImage.click();
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSaleRepresentative({ ...saleRepresentative, image: file });
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      info_toaster("File not selected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!saleRepresentative?.image) {
      info_toaster("Select image");
    } else if (!saleRepresentative?.srName.trim()) {
      info_toaster("Enter Sale Representative name");
    } else if (!saleRepresentative?.country?.trim()) {
      info_toaster("Enter Country");
    } else if (!saleRepresentative?.city?.trim()) {
      info_toaster("Enter City");
    } else if (!saleRepresentative?.state?.trim()) {
      info_toaster("Enter State");
    } else if (!saleRepresentative?.zipCode?.trim()) {
      info_toaster("Enter ZipCode");
    } else if (!saleRepresentative?.phoneNumber?.trim()) {
      info_toaster("Enter Phone Number");
    } else if (!saleRepresentative?.address?.trim()) {
      info_toaster("Enter Address");
    } else if (!saleRepresentative?.businessWeb?.trim()) {
      info_toaster("Enter business webiste");
    } else if (!saleRepresentative?.territory?.trim()) {
      info_toaster("Enter Territory");
    } else if (!saleRepresentative?.creditLimit?.trim()) {
      info_toaster("Enter Credit Limit");
    } else if (saleRepresentative?.status === "") {
      info_toaster("Select Status");
    } else if (!saleRepresentative?.email?.trim()) {
      info_toaster("Enter email");
    } else if (!saleRepresentative?.password?.trim()) {
      info_toaster("Enter password");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("srName", saleRepresentative?.srName);
        formData.append("email", saleRepresentative?.email);
        formData.append("password", saleRepresentative?.password);
        formData.append("country", saleRepresentative?.country);
        formData.append("city", saleRepresentative?.city);
        formData.append("state", saleRepresentative?.state);
        formData.append("zipCode", saleRepresentative?.zipCode);
        formData.append("address", saleRepresentative?.address);
        formData.append("territory", saleRepresentative?.territory);
        formData.append("businessWeb", saleRepresentative?.businessWeb);
        formData.append("image", saleRepresentative?.image);
        formData.append("phoneNumber", saleRepresentative?.phoneNumber);
        formData.append("status", saleRepresentative?.status);

        const res = await PostAPI("api/v1/admin/sales-rep", formData);
        if (res?.data?.status === "success") {
          success_toaster("Sales Representative added successfully");
          setLoader(false);
          setSaleRepresentative({
            srName: "",
            email: "",
            password: "",
            country: "",
            city: "",
            state: "",
            zipCode: "",
            address: "",
            territory: "",
            businessWeb: "",
            image: "",
            phoneNumber: "",
            status: true,
          });
          setImagePreview("");
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
        setLoader(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Add New Sales Representative
          </h2>
        </div>
      </div>

      {loader ? (
        <MiniLoader />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm space-y-6"
        >
          <button
            type="button"
            onClick={handleSelectImage}
            className="rounded-xl border border-tabBorderColor border-opacity-40 size-20 flex items-center justify-center"
          >
            <input
              type="file"
              className="hidden selectImage"
              onChange={handleImage}
            />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="supplier-image"
                className="object-cover object-center"
              />
            ) : (
              <LuImageUp size={"60"} color="rgba(0, 0, 0, 0.6)" />
            )}
          </button>
          <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
            {/* Left Side */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Name
                  </label>
                  <input
                    type="text"
                    name="srName"
                    value={saleRepresentative?.srName}
                    placeholder="Enter Name"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={saleRepresentative?.country}
                    placeholder="Enter Country Name"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                  {/* <Select
                    placeholder="Choose country"
                    className="w-full"
                    styles={selectStyles2}
                  /> */}
                </div>
              </div>
              <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={saleRepresentative?.city}
                    placeholder="Enter City Name"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                  {/* <Select
                    placeholder="Select City"
                    className="w-full"
                    styles={selectStyles2}
                  /> */}
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={saleRepresentative?.state}
                    placeholder="Enter State Name"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                  {/* <Select
                    placeholder="Select State"
                    className="w-full"
                    styles={selectStyles2}
                  /> */}
                </div>
              </div>
              <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={saleRepresentative?.zipCode}
                    placeholder="Enter Zip code"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Phone number
                  </label>
                  <input
                    type="number"
                    name="phoneNumber"
                    value={saleRepresentative?.phoneNumber}
                    placeholder="Enter Phone Number"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Address{" "}
                </label>
                <input
                  type="text"
                  name="address"
                  value={saleRepresentative?.address}
                  placeholder="Enter Address"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Business website
                </label>
                <input
                  type="text"
                  name="businessWeb"
                  value={saleRepresentative?.businessWeb}
                  placeholder="Enter Business name"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* right side */}
            <div className="space-y-4">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Territory{" "}
                </label>
                <input
                  type="text"
                  name="territory"
                  value={saleRepresentative?.territory}
                  placeholder="Enter Territory name"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Status
                </label>
                <Select
                  placeholder="Active/ InActive"
                  options={[
                    { label: "Active", value: true },
                    { label: "InActive", value: false },
                  ]}
                  onChange={(e) =>
                    setSaleRepresentative({
                      ...saleRepresentative,
                      status: e.value,
                    })
                  }
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Credit Limit
                </label>
                <input
                  type="number"
                  name="creditLimit"
                  value={saleRepresentative?.creditLimit}
                  placeholder="Enter Credit Limit"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  value={saleRepresentative?.email}
                  placeholder="Enter Email"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="off"
                  value={saleRepresentative?.password}
                  placeholder="Enter password"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                >
                  Add Sales Representative
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
