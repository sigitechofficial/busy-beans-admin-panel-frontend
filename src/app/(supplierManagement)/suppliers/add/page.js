"use client";
import BackButton from "@/components/ui/BackButton";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { drawerSelectStyles, selectStyles2 } from "@/utilities/SelectStyle";
import { useState } from "react";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import MiniLoader from "@/components/ui/MiniLoader";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { emailValidity } from "@/utilities/Validations";
import PhoneInput from "react-phone-input-2";
import GetAPI from "@/utilities/GetAPI";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";

export default function AddNewSupplier() {
  const [supplier, setSupplier] = useState({
    supplierName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNum: "",
    countryCode: "+1",
    addressOne: "",
    addressTwo: "",
    businessWeb: "",
    image: "",
    businessRegistrationNumber: "",
    supplierType: "",
    status: true,
    deleted: false,
    registerDate: "",
    bankAccount: "",
  });
  const [visible, setVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [loader, setLoader] = useState(false);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [customCityMode, setCustomCityMode] = useState(false);

  const { data } = GetAPI("api/v1/admin/address-management/country");

  const allCountries = [];
  data?.data?.data?.map((country) =>
    allCountries.push({
      value: country?.name,
      label: country?.name,
    })
  );

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSelectImage = () => {
    const selectImage = document.querySelector(".selectImage");
    selectImage.click();
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSupplier({ ...supplier, image: file });
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      info_toaster("File not selected");
    }
  };

  const handleSelectedCountryStates = async (countryName) => {
    const selectedCountry = data?.data?.data?.find(
      (country) => country?.name === countryName
    );
    try {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/state?countryInSystemId=${selectedCountry?.id}`
      );
      if (res?.data?.status === "success") {
        const tempAllStates = [];
        res?.data?.data?.data?.map((state) =>
          tempAllStates.push({
            value: state?.id,
            label: state?.name,
          })
        );
        setAllStates([...tempAllStates]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSelectedCountryStatesCities = async (stateID) => {
    try {
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/address-management/city?stateInSystemId=${stateID}`
      );
      if (res?.data?.status === "success") {
        console.log(
          "🚀 ~ handleSelectedCountryStates ~ res:",
          res?.data?.data?.data?.length
        );
        const tempAllCities = [];
        res?.data?.data?.data?.map((state) =>
          tempAllCities.push({
            value: state?.name,
            label: state?.name,
          })
        );
        setAllCities([...tempAllCities]);
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!supplier?.image) {
    //   info_toaster("Select your image");
    // } else
    if (!supplier?.supplierName.trim()) {
      info_toaster("Enter supplier name");
    } else if (!supplier?.country.trim()) {
      info_toaster("Enter country name");
    } else if (!supplier?.city.trim()) {
      info_toaster("Enter city name");
    } else if (!supplier?.state.trim()) {
      info_toaster("Enter state name");
    } else if (!supplier?.zipCode.trim()) {
      info_toaster("Enter zipcode");
    } else if (!supplier?.phoneNum.trim()) {
      info_toaster("Enter phone number");
    } else if (!supplier?.addressOne.trim()) {
      info_toaster("Enter address one");
    }
    // else if (!supplier?.addressTwo.trim()) {
    //   info_toaster("Enter address two");
    // }
    // else if (!supplier?.businessWeb.trim()) {
    //   info_toaster("Enter business webiste");
    // }
    //  else if (!supplier?.businessRegistrationNumber.trim()) {
    //   info_toaster("Enter business registration number");
    // }
    else if (!supplier?.supplierType.trim()) {
      info_toaster("Select supplier type ");
    } else if (supplier?.status === "") {
      info_toaster("Select supplier status");
    } else if (!supplier?.registerDate.trim()) {
      info_toaster("Select registration date");
    }
    // else if (!supplier?.bankAccount.trim()) {
    //   info_toaster("Select bank account detail");
    // }
    else if (!supplier?.email.trim()) {
      info_toaster("Enter email");
    } else if (!emailValidity.test(supplier?.email)) {
      info_toaster("Invalid Email Format");
    } else if (!supplier?.password.trim()) {
      info_toaster("Enter password");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("supplierName", supplier?.supplierName);
        formData.append("email", supplier?.email);
        formData.append("password", supplier?.password);
        formData.append("country", supplier?.country);
        formData.append("city", supplier?.city);
        formData.append("state", supplier?.state);
        formData.append("zipCode", supplier?.zipCode);
        formData.append("phoneNum", supplier?.phoneNum);
        formData.append("countryCode", supplier?.countryCode);
        formData.append("addressOne", supplier?.addressOne);
        formData.append("addressTwo", supplier?.addressTwo);
        formData.append("businessWeb", supplier?.businessWeb);
        formData.append("image", supplier?.image);
        formData.append(
          "businessRegistrationNumber",
          supplier?.businessRegistrationNumber
        );
        formData.append("supplierType", supplier?.supplierType);
        formData.append("status", supplier?.status);
        formData.append("deleted", supplier?.deleted);
        formData.append("registerDate", supplier?.registerDate);
        formData.append("bankAccount", supplier?.bankAccount);
        const res = await PostAPI("api/v1/admin/supplier", formData);
        console.log("🚀 ~ handleSubmit ~ res:", res);
        if (res?.data?.status === "success") {
          success_toaster("Supplier added successfully");
          setLoader(false);
          setSupplier({
            supplierName: "",
            email: "",
            password: "",
            country: "",
            city: "",
            state: "",
            zipCode: "",
            phoneNum: "",
            addressOne: "",
            addressTwo: "",
            businessWeb: "",
            image: "",
            businessRegistrationNumber: "",
            supplierType: "",
            status: true,
            deleted: false,
            registerDate: "",
            bankAccount: "",
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Add New Supplier
          </h2>
        </div>
      </div>

      {loader ? (
        <MiniLoader />
      ) : (
        <div className="space-y-6">
          <div className="grid xl:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-medium">1. Basic Information</h3>
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
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={supplier?.supplierName}
                  placeholder="Enter Supplier Name"
                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
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
                  value={supplier?.businessWeb}
                  placeholder="Enter Business name"
                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <label className="text-labelColor font-medium font-satoshi">
                  Supplier type
                </label>
                <Select
                  placeholder="Select Supplier type"
                  options={[{ label: "Whole Sale", value: "Wholesale" }]}
                  onChange={(e) =>
                    setSupplier({ ...supplier, supplierType: e.value })
                  }
                  className="w-full text-black"
                  styles={selectStyles2}
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
                    setSupplier({ ...supplier, status: e.value })
                  }
                  className="w-full"
                  styles={selectStyles2}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Register Date
                </label>
                <input
                  type="date"
                  name="registerDate"
                  value={supplier?.registerDate}
                  placeholder="Select registration date"
                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* === Section 2: Contact Info === */}
            <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-medium">2. Contact Information</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                  <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-labelColor font-medium font-satoshi">
                      Country
                    </label>
                    <Select
                      placeholder="Select Country"
                      className="w-full"
                      styles={drawerSelectStyles}
                      value={
                        supplier?.country
                          ? {
                              value: supplier?.country,
                              label: supplier?.country,
                            }
                          : null
                      }
                      options={allCountries ?? []}
                      onChange={(e) => {
                        setSupplier({
                          ...supplier,
                          country: e.label,
                          state: "",
                          city: "",
                        });
                        handleSelectedCountryStates(e.label);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-labelColor font-medium font-satoshi">
                      State
                    </label>
                    <Select
                      placeholder="Select State"
                      className="w-full"
                      styles={drawerSelectStyles}
                      value={
                        supplier?.state
                          ? {
                              value: supplier?.state,
                              label: supplier?.state,
                            }
                          : null
                      }
                      options={allStates ?? []}
                      onChange={(e) => {
                        setSupplier({
                          ...supplier,
                          state: e?.label,
                          city: "",
                        });
                        handleSelectedCountryStatesCities(e.value);
                      }}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                  <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-labelColor font-medium font-satoshi">
                      City
                    </label>
                    {!customCityMode ? (
                      <>
                        <Select
                          placeholder="Select City"
                          className="w-full"
                          styles={drawerSelectStyles}
                          value={
                            supplier?.city
                              ? {
                                  value: supplier?.city,
                                  label: supplier?.city,
                                }
                              : null
                          }
                          options={allCities ?? []}
                          onChange={(e) => {
                            setSupplier({
                              ...supplier,
                              city: e.label,
                            });
                          }}
                        />
                        <button
                          type="button"
                          className="text-sm bg-theme text-white hover:text-theme hover:bg-white duration-150 rounded-sm border border-theme mt-1 px-2 self-end"
                          onClick={() => {
                            setSupplier({
                              ...supplier,
                              city: "",
                            });
                            setCustomCityMode(true);
                          }}
                        >
                          Enter Custom City Name
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter custom city"
                          className="w-full px-3 py-3 border border-gray-300 rounded"
                          value={supplier?.city}
                          onChange={(e) =>
                            setSupplier({
                              ...supplier,
                              city: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="text-sm bg-theme text-white hover:text-theme hover:bg-white duration-150 rounded-sm border border-theme mt-1 px-2 self-end"
                          onClick={() => {
                            setSupplier({
                              ...supplier,
                              city: "",
                            });
                            setCustomCityMode(false);
                          }}
                        >
                          Back to Select
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={supplier?.zipCode}
                      placeholder="Enter Zip code"
                      className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Address 1
                  </label>
                  <input
                    type="text"
                    name="addressOne"
                    value={supplier?.addressOne}
                    placeholder="Enter Address 1"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Address 2
                  </label>
                  <input
                    type="text"
                    name="addressTwo"
                    value={supplier?.addressTwo}
                    placeholder="Enter Address 2"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Phone number
                  </label>
                  <div className="grid grid-cols-10 gap-x-2">
                    <PhoneInput
                      focusBorderColor="none"
                      borderWidth="none"
                      className="chakra_input col-span-2"
                      inputStyle={{
                        width: "90px",
                        height: "45px",
                        borderRadius: "4px",
                        border: "1px solid #00000033",
                        backgroundColor: "#ffffff",
                        color: "#6f4e37",
                        opacity: "20",
                      }}
                      buttonStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #86644C",
                      }}
                      containerStyle={{
                        borderRadius: "12px",
                        // backgroundColor: "#6f4e37",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#86644C",
                        borderRadius: "8px",
                      }}
                      country={"us"}
                      onChange={(phone) =>
                        setSupplier({
                          ...supplier,
                          countryCode: phone,
                        })
                      }
                    />
                    <input
                      type="number"
                      name="phoneNum"
                      value={supplier?.phoneNum}
                      placeholder="Enter Phone Number"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* === Section 3: Bank & Login Details === */}
            <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-medium">3. Bank & Login Details</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Bank Account Detail
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={supplier?.bankAccount}
                    placeholder="Enter Valid IBAN Number"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Login Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={supplier?.email}
                    placeholder="Enter Email"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                  />
                  <div
                    className={`text-red-600 space-y-1 pb-1 ${
                      supplier?.email.length > 0 &&
                      !emailValidity.test(supplier?.email)
                        ? "block"
                        : "hidden"
                    }`}
                  >
                    <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                    <p>Invalid Email Format</p>
                  </div>
                </div>
                <div className="flex flex-col gap-y-2 relative">
                  <label className="text-labelColor font-medium font-satoshi">
                    Password
                  </label>
                  <input
                    type={visible ? "text" : "password"}
                    name="password"
                    autoComplete="off"
                    value={supplier?.password}
                    placeholder="Enter password"
                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none ps-2.5 pe-12 py-3"
                    onChange={handleChange}
                  />
                  <button
                    onClick={() => setVisible(!visible)}
                    type="button"
                    className="text-labelColor absolute right-4 top-11"
                  >
                    {visible ? (
                      <AiOutlineEye size={24} color="#000000" />
                    ) : (
                      <AiOutlineEyeInvisible size={24} color="#64748b" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
            >
              Add Supplier
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-x-2">
//           <BackButton />
//           <h2 className="text-xl lg:text-2xl font-inter font-semibold">
//             Add New Supplier
//           </h2>
//         </div>
//       </div>

//       {loader ? (
//         <MiniLoader />
//       ) : (
//         <form
//           onSubmit={handleSubmit}
//           className="grid xl:grid-cols-3 gap-6 px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10"
//         >
//           {/* === Section 1: Basic Info === */}
//           <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
//             <h3 className="text-lg font-medium">Basic Information</h3>

//             <button
//               type="button"
//               onClick={handleSelectImage}
//               className="rounded-xl border border-tabBorderColor border-opacity-40 h-20 w-20 flex items-center justify-center"
//             >
//               <input
//                 type="file"
//                 className="hidden selectImage"
//                 onChange={handleImage}
//               />
//               {imagePreview ? (
//                 <img
//                   src={imagePreview}
//                   alt="supplier-image"
//                   className="object-cover object-center h-full w-full rounded"
//                 />
//               ) : (
//                 <LuImageUp size={60} color="rgba(0, 0, 0, 0.6)" />
//               )}
//             </button>

//             <div className="space-y-4">
//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Supplier Name
//                 </label>
//                 <input
//                   type="text"
//                   name="supplierName"
//                   value={supplier?.supplierName}
//                   placeholder="Enter Supplier Name"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Business Website
//                 </label>
//                 <input
//                   type="text"
//                   name="businessWeb"
//                   value={supplier?.businessWeb}
//                   placeholder="Enter Business name"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* === Section 2: Contact Info === */}
//           <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
//             <h3 className="text-lg font-medium">Contact Information</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Country
//                 </label>
//                 <input
//                   type="text"
//                   name="country"
//                   value={supplier?.country}
//                   placeholder="Enter Country Name"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//                 {/* <Select
//                   placeholder="Choose country"
//                   className="w-full"
//                   styles={selectStyles2}
//                 /> */}
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-labelColor font-medium block mb-1">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={supplier?.city}
//                     placeholder="Enter City Name"
//                     className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                     onChange={handleChange}
//                   />
//                   {/* <Select
//                     placeholder="Select City"
//                     className="w-full"
//                     styles={selectStyles2}
//                   /> */}
//                 </div>
//                 <div>
//                   <label className="text-labelColor font-medium block mb-1">
//                     State
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={supplier?.state}
//                     placeholder="Enter State Name"
//                     className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                     onChange={handleChange}
//                   />
//                   {/* <Select
//                     placeholder="Select State"
//                     className="w-full"
//                     styles={selectStyles2}
//                   /> */}
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-labelColor font-medium block mb-1">
//                     Zip Code
//                   </label>
//                   <input
//                     type="text"
//                     name="zipCode"
//                     value={supplier?.zipCode}
//                     placeholder="Enter Zip code"
//                     className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-labelColor font-medium block mb-1">
//                     Phone number
//                   </label>
//                   <div className="flex gap-2">
//                     <PhoneInput
//                       country="us"
//                       onChange={(phone) =>
//                         setSupplier({ ...supplier, countryCode: phone })
//                       }
//                       inputStyle={{
//                         width: "90px",
//                         height: "45px",
//                         borderRadius: "4px",
//                         border: "1px solid #00000033",
//                       }}
//                       buttonStyle={{
//                         backgroundColor: "#ffffff",
//                         border: "1px solid #86644C",
//                       }}
//                       dropdownStyle={{
//                         backgroundColor: "#86644C",
//                         borderRadius: "8px",
//                       }}
//                       containerStyle={{ borderRadius: "12px" }}
//                     />
//                     <input
//                       type="number"
//                       name="phoneNum"
//                       value={supplier?.phoneNum}
//                       placeholder="Enter Phone Number"
//                       className="flex-1 border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Address 1
//                 </label>
//                 <input
//                   type="text"
//                   name="addressOne"
//                   value={supplier?.addressOne}
//                   placeholder="Enter Address 1"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Address 2
//                 </label>
//                 <input
//                   type="text"
//                   name="addressTwo"
//                   value={supplier?.addressTwo}
//                   placeholder="Enter Address 2"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* === Section 3: Bank & Login Details === */}
//           <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
//             <h3 className="text-lg font-medium">Bank & Login Details</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Supplier type
//                 </label>
//                 <Select
//                   placeholder="Select Supplier type"
//                   options={[{ label: "Whole Sale", value: "Wholesale" }]}
//                   onChange={(e) =>
//                     setSupplier({ ...supplier, supplierType: e.value })
//                   }
//                   className="w-full text-black"
//                   styles={selectStyles2}
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Status
//                 </label>
//                 <Select
//                   placeholder="Active/ InActive"
//                   options={[
//                     { label: "Active", value: true },
//                     { label: "InActive", value: false },
//                   ]}
//                   onChange={(e) =>
//                     setSupplier({ ...supplier, status: e.value })
//                   }
//                   className="w-full"
//                   styles={selectStyles2}
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Register Date
//                 </label>
//                 <input
//                   type="date"
//                   name="registerDate"
//                   value={supplier?.registerDate}
//                   onChange={handleChange}
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Bank Account Detail
//                 </label>
//                 <input
//                   type="text"
//                   name="bankAccount"
//                   value={supplier?.bankAccount}
//                   placeholder="Enter Valid IBAN Number"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label className="text-labelColor font-medium block mb-1">
//                   Login Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   autoComplete="off"
//                   value={supplier?.email}
//                   onChange={handleChange}
//                   placeholder="Enter Email"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 focus:outline-none focus:border-black"
//                 />
//                 <div
//                   className={`text-red-600 mt-1 ${
//                     supplier?.email.length > 0 &&
//                     !emailValidity.test(supplier?.email)
//                       ? "block"
//                       : "hidden"
//                   }`}
//                 >
//                   <p>Invalid Email Format</p>
//                 </div>
//               </div>

//               <div className="relative">
//                 <label className="text-labelColor font-medium block mb-1">
//                   Password
//                 </label>
//                 <input
//                   type={visible ? "text" : "password"}
//                   name="password"
//                   autoComplete="off"
//                   value={supplier?.password}
//                   onChange={handleChange}
//                   placeholder="Enter password"
//                   className="w-full border border-borderColor rounded px-2.5 py-3 pr-10 focus:outline-none focus:border-black"
//                 />
//                 <button
//                   onClick={() => setVisible(!visible)}
//                   type="button"
//                   className="absolute right-3 top-9"
//                 >
//                   {visible ? (
//                     <AiOutlineEye size={24} color="#000" />
//                   ) : (
//                     <AiOutlineEyeInvisible size={24} color="#64748b" />
//                   )}
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full py-3 bg-theme text-buttonTextColor font-inter font-medium rounded"
//               >
//                 Add Supplier
//               </button>
//             </div>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }
