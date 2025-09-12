"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import MiniLoader from "@/components/ui/MiniLoader";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { drawerSelectStyles, selectStyles2 } from "@/utilities/SelectStyle";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";
import { useParams, useRouter } from "next/navigation";
import GetAPI from "@/utilities/GetAPI";
import { BASE_URL } from "@/utilities/URL";
import { string } from "yup";
import { PatchAPI } from "@/utilities/PatchAPI";
import PhoneInput from "react-phone-input-2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import { UPDATE_LOCAL_PARTNER } from "../../localPartner.testid";

export default function EditsSalesRepresentative() {
  const { salesRepresentativeID } = useParams();
  const router = useRouter();
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
    countryCode: "+1",
    creditLimit: "",
    status: true,
  });
  console.log(
    "🚀 ~ EditsSalesRepresentative ~ saleRepresentative:",
    saleRepresentative
  );
  const [imagePreview, setImagePreview] = useState("");
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [visible, setVisible] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);

  const { data: countriesData } = GetAPI(
    "api/v1/admin/address-management/country"
  );

  const { data } = GetAPI(`api/v1/admin/sales-rep/${salesRepresentativeID}`, "sales-rep");

  const allCountries = [];
  countriesData?.data?.data?.map((country) =>
    allCountries.push({
      value: country?.name,
      label: country?.name,
    })
  );

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

  const handleSelectedCountryStates = async (countryName) => {
    const selectedCountry = countriesData?.data?.data?.find(
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
    // if (!saleRepresentative?.image) {
    //   info_toaster("Select image");
    // } else
    if (!saleRepresentative?.srName.trim()) {
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
    }
    // else if (!saleRepresentative?.territory?.trim()) {
    //   info_toaster("Enter Territory");
    // }
    else if (saleRepresentative?.status === "") {
      info_toaster("Select Status");
    } else if (!saleRepresentative?.email?.trim()) {
      info_toaster("Enter email");
    } else if (changePasswordStatus && !saleRepresentative?.password) {
      info_toaster("Enter New password");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("srName", saleRepresentative?.srName);
        formData.append("email", saleRepresentative?.email);
        if (changePasswordStatus) {
          formData.append("password", saleRepresentative?.password);
        }
        formData.append("country", saleRepresentative?.country);
        formData.append("city", saleRepresentative?.city);
        formData.append("state", saleRepresentative?.state);
        formData.append("zipCode", saleRepresentative?.zipCode);
        formData.append("address", saleRepresentative?.address);
        formData.append("territoryName", saleRepresentative?.territory);
        formData.append("image", saleRepresentative?.image);
        formData.append("phoneNumber", saleRepresentative?.phoneNumber);
        formData.append("creditLimit", saleRepresentative?.creditLimit);
        formData.append(
          "countryCode",
          saleRepresentative?.countryCode?.startsWith("+")
            ? saleRepresentative?.countryCode
            : `+${saleRepresentative?.countryCode || ""}`
        );
        formData.append("status", saleRepresentative?.status);

        const res = await PatchAPI(
          `api/v1/admin/sales-rep/${salesRepresentativeID}`,
          formData,
          "sales-rep"
        );
        if (res?.data?.status === "success") {
          success_toaster("Local Partner Updated successfully");
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
          // router.push("/sale-representative");
          window.history.back()
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

  useEffect(() => {
    setSaleRepresentative({
      srName: data?.data?.data?.srName ?? "",
      email: data?.data?.data?.email ?? "",
      // password: data?.data?.data?.password ?? "",
      country: data?.data?.data?.country ?? "",
      city: data?.data?.data?.city ?? "",
      state: data?.data?.data?.state ?? "",
      zipCode: data?.data?.data?.zipCode ?? "",
      address: data?.data?.data?.address ?? "",
      territory: data?.data?.data?.territoryName ?? "",
      businessWeb: data?.data?.data?.businessWeb ?? "",
      image: data?.data?.data?.image ?? "",
      phoneNumber: data?.data?.data?.phoneNumber ?? "",
      countryCode: data?.data?.data?.countryCode ?? "",
      creditLimit: data?.data?.data?.creditLimit ?? "",
      status: data?.data?.data?.status ?? "",
    });
    setImagePreview(data?.data?.data?.image);
  }, [data]);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <form onSubmit={handleSubmit} className="">
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Update Local Partner
          </h2>
        </div>
      </div> */}

      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={UPDATE_LOCAL_PARTNER.headerBar}>
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl font-inter font-semibold" data-testid={UPDATE_LOCAL_PARTNER.title}>
            Update Local Partner
          </h2>
        </div>
      </div>

      {loader ? (
        <MiniLoader data-testid={UPDATE_LOCAL_PARTNER.miniLoader}/>
      ) : (
        <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
          <div className="grid xl:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-medium">1. Basic Information</h3>
              <button
                type="button"
                onClick={handleSelectImage}
                className="rounded-xl border border-tabBorderColor border-opacity-40 size-20 flex items-center justify-center"
                data-testid={UPDATE_LOCAL_PARTNER.imageUploadButton}
              >
                <input
                  type="file"
                  className="hidden selectImage"
                  onChange={handleImage}
                />
                {imagePreview ? (
                  <img
                    src={
                      !saleRepresentative?.image?.name
                        ? BASE_URL + imagePreview
                        : imagePreview
                    }
                    alt="supplier-image"
                    className="object-cover object-center"
                    data-testid={UPDATE_LOCAL_PARTNER.imagePreview}
                  />
                ) : (
                  <LuImageUp size={"60"} color="rgba(0, 0, 0, 0.6)" />
                )}
              </button>
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
                  data-testid={UPDATE_LOCAL_PARTNER.partnerNameInput}
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
                  value={
                    saleRepresentative?.status
                      ? { label: "Active", value: true }
                      : { label: "InActive", value: false }
                  }
                  onChange={(e) =>
                    setSaleRepresentative({
                      ...saleRepresentative,
                      status: e.value,
                    })
                  }
                  className="w-full"
                  styles={selectStyles2}
                  data-testid={UPDATE_LOCAL_PARTNER.partnerStatusSelect}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Credit Limit
                </label>
                <input
                  type="number"
                  name="creditLimit"
                  onWheel={(e) => e.target.blur()}
                  value={saleRepresentative?.creditLimit}
                  placeholder="Enter Credit Limit"
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  onChange={handleChange}
                  data-testid={UPDATE_LOCAL_PARTNER.partnerCreditLimitInput}
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
                    {/* <input
                      type="text"
                      name="country"
                      value={saleRepresentative?.country}
                      placeholder="Enter Country Name"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                    /> */}
                    <Select
                      placeholder="Select Country"
                      className="w-full"
                      styles={drawerSelectStyles}
                      value={
                        saleRepresentative?.country
                          ? {
                              value: saleRepresentative.country,
                              label: saleRepresentative.country,
                            }
                          : null
                      }
                      options={allCountries ?? []}
                      onChange={(e) => {
                        setSaleRepresentative({
                          ...saleRepresentative,
                          country: e.label,
                          state: "",
                          city: "",
                        });
                        handleSelectedCountryStates(e.label);
                      }}
                      data-testid={UPDATE_LOCAL_PARTNER.partnerCountrySelect}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-labelColor font-medium font-satoshi">
                      State
                    </label>
                    {/* <input
                      type="text"
                      name="state"
                      value={saleRepresentative?.state}
                      placeholder="Enter State Name"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                    /> */}
                    <Select
                      placeholder="Select State"
                      className="w-full"
                      styles={drawerSelectStyles}
                      value={
                        saleRepresentative?.state
                          ? {
                              value: saleRepresentative.state,
                              label: saleRepresentative.state,
                            }
                          : null
                      }
                      options={allStates ?? []}
                      onChange={(e) => {
                        setSaleRepresentative({
                          ...saleRepresentative,
                          state: e?.label,
                          city: "",
                        });
                        handleSelectedCountryStatesCities(e.value);
                      }}
                      data-testid={UPDATE_LOCAL_PARTNER.partnerStateSelect}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 max-md:gap-y-4 gap-x-6">
                  <div className="flex flex-col gap-y-2 w-full">
                    <label className="text-labelColor font-medium font-satoshi">
                      City
                    </label>
                    {/* <input
                      type="text"
                      name="city"
                      value={saleRepresentative?.city}
                      placeholder="Enter City Name"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                    /> */}
                    {!customCityMode ? (
                      <>
                        <Select
                          placeholder="Select City"
                          className="w-full"
                          styles={drawerSelectStyles}
                          value={
                            saleRepresentative?.city
                              ? {
                                  value: saleRepresentative.city,
                                  label: saleRepresentative.city,
                                }
                              : null
                          }
                          options={allCities ?? []}
                          onChange={(e) => {
                            setSaleRepresentative({
                              ...saleRepresentative,
                              city: e.label,
                            });
                          }}
                          data-testid={UPDATE_LOCAL_PARTNER.partnerCitySelect}
                        />
                        <button
                          type="button"
                          className="text-sm bg-theme text-white hover:text-theme hover:bg-white duration-150 rounded-sm border border-theme mt-1 px-2 self-end"
                          onClick={() => setCustomCityMode(true)}
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
                          value={saleRepresentative?.city}
                          onChange={(e) =>
                            setSaleRepresentative({
                              ...saleRepresentative,
                              city: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="text-sm bg-theme text-white hover:text-theme hover:bg-white duration-150 rounded-sm border border-theme mt-1 px-2 self-end"
                          onClick={() => setCustomCityMode(false)}
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
                      value={saleRepresentative?.zipCode}
                      placeholder="Enter Zip code"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                      data-testid={UPDATE_LOCAL_PARTNER.partnerZipCodeInput}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Title/Territory Name{" "}
                  </label>
                  <input
                    type="text"
                    name="territory"
                    value={saleRepresentative?.territory}
                    placeholder="Enter Title"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                    data-testid={UPDATE_LOCAL_PARTNER.partnerTerritoryInput}
                  />
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
                    data-testid={UPDATE_LOCAL_PARTNER.partnerAddressInput}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Phone Number
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
                      value={saleRepresentative?.countryCode}
                      onChange={(phone) =>
                        setSaleRepresentative({
                          ...saleRepresentative,
                          countryCode: phone,
                        })
                      }
                    />
                    <input
                      type="number"
                      name="phoneNumber"
                      value={saleRepresentative?.phoneNumber}
                      placeholder="Enter Phone Number"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                      onChange={handleChange}
                      data-testid={UPDATE_LOCAL_PARTNER.partnerPhoneNumberInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* === Section 3: Bank & Login Details === */}
            <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-medium">3. Login Details</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={saleRepresentative?.email}
                    placeholder="Enter Email"
                    className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    onChange={handleChange}
                    data-testid={UPDATE_LOCAL_PARTNER.partnerEmailInput}
                  />
                </div>

                <div className="space-y-2">
                  {changePasswordStatus && (
                    <div className="flex flex-col gap-y-2 relative">
                      <label className="text-labelColor font-medium font-satoshi">
                        Update Password
                      </label>
                      <input
                        type={visible ? "text" : "password"}
                        name="password"
                        autoComplete="off"
                        value={saleRepresentative?.password}
                        placeholder="Enter New Password"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none ps-2.5 pe-12 py-3"
                        onChange={handleChange}
                        data-testid={UPDATE_LOCAL_PARTNER.passwordChangeSection}
                      />
                      <button
                        onClick={() => setVisible(!visible)}
                        type="button"
                        className="text-labelColor absolute right-4 top-11"
                        data-testid={UPDATE_LOCAL_PARTNER.passwordVisibilityToggle}
                      >
                        {visible ? (
                          <AiOutlineEye size={24} color="#000000" />
                        ) : (
                          <AiOutlineEyeInvisible size={24} color="#64748b" />
                        )}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-x-2 pb-4">
                    <label className="text-black font-medium font-satoshi">
                      Update Password
                    </label>
                    <input
                      checked={changePasswordStatus}
                      type="checkbox"
                      name="passwordStatus"
                      onChange={() =>
                        setChangePasswordStatus(!changePasswordStatus)
                      }
                      className="size-4 border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none"
                      data-testid={UPDATE_LOCAL_PARTNER.changePasswordCheckbox}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
              data-testid={UPDATE_LOCAL_PARTNER.submitButton}
            >
              Update Local Partner
            </button>
          </div>

          {/* <div
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
                  src={
                    !saleRepresentative?.image?.name
                      ? BASE_URL + imagePreview
                      : imagePreview
                  }
                  alt="supplier-image"
                  className="object-cover object-center"
                />
              ) : (
                <LuImageUp size={"60"} color="rgba(0, 0, 0, 0.6)" />
              )}
            </button>
            <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
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
                        backgroundColor: "#6f4e37",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#86644C",
                        borderRadius: "8px",
                      }}
                      country={"us"}
                      onChange={(phone) =>
                        setSaleRepresentative({
                          ...saleRepresentative,
                          countryCode: phone,
                        })
                      }
                    />
                    <input
                      type="number"
                      name="phoneNumber"
                      value={saleRepresentative?.phoneNumber}
                      placeholder="Enter Phone Number"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
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
                    value={
                      saleRepresentative?.status
                        ? { label: "Active", value: true }
                        : { label: "InActive", value: false }
                    }
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
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
                    Update Local Partner
                  </button>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </form>
  );
}
