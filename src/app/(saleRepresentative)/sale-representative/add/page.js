"use client";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import MiniLoader from "@/components/ui/MiniLoader";
import { LuImageUp } from "react-icons/lu";
import Select from "react-select";
import { drawerSelectStyles, selectStyles2 } from "@/utilities/SelectStyle";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import PhoneInput from "react-phone-input-2";
import GetAPI from "@/utilities/GetAPI";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import { useRouter } from "next/navigation";
import { ADD_LOCAL_PARTNER } from "../localPartner.testid";

export default function AddSaleRepresentative() {
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
    partnerType: "",
  });

  const [userData, setUserData] = useState({
    info: {
      name: "",
      email: "",
      password: "",
      status: true,
      phoneNumber: "",
      countryCode: "+1",
      saleTaxNumber: "",
      dispatchEmail: "",
      emailToSendInvoices: "",
      registerBy: "email",
      defaultDiscount: null,
    },
    address: {
      companyaddress: "",
      addressLineOne: "",
      addressLineTwo: "",
      town: "",
      country: "",
      state: "",
      zipCode: "",
      status: true,
    },
    billingAddress: {
      companyaddress: "",
      addressLineOne: "",
      addressLineTwo: "",
      town: "",
      country: "",
      state: "",
      zipCode: "",
      status: true,
    },
    isChecked: true,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [visible, setVisible] = useState(false);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [customCityMode, setCustomCityMode] = useState(false);
  // const [customCity, setCustomCity] = useState("");

  const { data } = GetAPI("api/v1/admin/address-management/country");

  const allCountries = [];
  data?.data?.data?.map((country) =>
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
    } else if (!saleRepresentative?.countryCode?.trim()) {
      info_toaster("Select Country Code");
    } else if (!saleRepresentative?.phoneNumber?.trim()) {
      info_toaster("Enter Phone Number");
    } else if (!/^\d*\.?\d*$/?.test(saleRepresentative?.phoneNumber)) {
      info_toaster("Invalid Phone Number");
    } else if (!saleRepresentative?.address?.trim()) {
      info_toaster("Enter Address");
    } else if (!saleRepresentative?.territory?.trim()) {
      info_toaster("Enter Territory");
    } else if (
      saleRepresentative?.partnerType !== "direct-partner" &&
      !saleRepresentative?.creditLimit?.trim()
    ) {
      info_toaster("Enter Credit Limit");
    } else if (!saleRepresentative?.partnerType?.trim()) {
      info_toaster("Select Partner Type");
    } else if (saleRepresentative?.status === "") {
      info_toaster("Select Status");
    } else if (!saleRepresentative?.email?.trim()) {
      info_toaster("Enter email");
    } else if (!saleRepresentative?.password?.trim()) {
      info_toaster("Enter password");
    } else {
      // setLoader(true);
      try {
        const finalBillingAddress = userData.isChecked
          ? {
              addressLineOne: userData.address.addressLineOne,
              addressLineTwo: userData.address.addressLineTwo,
              town: userData.address.town,
              country: userData.address.country,
              state: userData.address.state,
              zipCode: userData.address.zipCode,
              status: true,
            }
          : {
              addressLineOne: userData.billingAddress.addressLineOne,
              addressLineTwo: userData.billingAddress.addressLineTwo,
              town: userData?.billingAddress?.town,
              country: userData?.billingAddress?.country,
              state: userData?.billingAddress?.state,
              zipCode: userData?.billingAddress?.zipCode,
              status: true,
            };

        const shippingAddress = {
          companyaddress: userData?.address?.companyaddress,
          addressLineOne: userData?.address?.addressLineOne,
          addressLineTwo: userData?.address?.addressLineTwo,
          town: userData?.address?.town,
          country: userData?.address?.country,
          state: userData?.address?.state,
          zipCode: userData?.address?.zipCode,
          status: true,
        };

        const isDirect = saleRepresentative?.partnerType == "direct-partner";

        const formData = new FormData();
        formData.append("srName", saleRepresentative?.srName);
        formData.append("email", saleRepresentative?.email);
        formData.append(
          "creditLimit",
          isDirect ? null : saleRepresentative?.creditLimit || null
        );
        formData.append("partnerType", saleRepresentative?.partnerType);
        formData.append("password", saleRepresentative?.password);
        formData.append("country", saleRepresentative?.country);
        formData.append("city", saleRepresentative?.city);
        formData.append("state", saleRepresentative?.state);
        formData.append("zipCode", saleRepresentative?.zipCode);
        formData.append("address", saleRepresentative?.address);
        formData.append("territoryName", saleRepresentative?.territory);
        formData.append("businessWeb", saleRepresentative?.businessWeb);
        formData.append("image", saleRepresentative?.image);
        formData.append("phoneNumber", saleRepresentative?.phoneNumber);
        formData.append("countryCode", saleRepresentative?.countryCode);
        formData.append("status", saleRepresentative?.status);
        formData.append("billingAddress", JSON.stringify(finalBillingAddress));
        formData.append("shippingAddress", JSON.stringify(shippingAddress));

        const res = await PostAPI(
          "api/v1/admin/sales-rep",
          formData,
          "sales-rep"
        );
        if (res?.data?.status === "success") {
          success_toaster("Local Partner added successfully");
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
            partnerType: "",
          });
          setImagePreview("");
          router.push("/sale-representative");
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

  const handleAddress = (e) => {
    setUserData({
      ...userData,
      address: {
        ...userData?.address,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleBillingAddress = (e) => {
    setUserData({
      ...userData,
      billingAddress: {
        ...userData?.billingAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  return (
    <div data-testid={ADD_LOCAL_PARTNER.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={ADD_LOCAL_PARTNER.headerBar}
      >
        <h2
          className="text-xl font-inter font-semibold"
          data-testid={ADD_LOCAL_PARTNER.title}
        >
          Add Local Partner
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 pb-6 pt-32 px-6 2xl:px-12"
        data-testid={ADD_LOCAL_PARTNER.submitButton}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <BackButton />
            {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Add New Local Partner
            </h2> */}
          </div>
        </div>

        {loader ? (
          <MiniLoader data-testid={ADD_LOCAL_PARTNER.miniLoader} />
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
                  data-testid={ADD_LOCAL_PARTNER.imageUploadButton}
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
                      data-testid={ADD_LOCAL_PARTNER.imagePreview}
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
                    data-testid={ADD_LOCAL_PARTNER.partnerNameInput}
                  />
                </div>
                <div className="flex flex-col gap-y-2 w-full">
                  <label className="text-labelColor font-medium font-satoshi">
                    Partner Type
                  </label>
                  <Select
                    placeholder="Select Partner Type"
                    options={[
                      { label: "Dropship Partner", value: "dropship-partner" },
                      { label: "Direct Partner", value: "direct-partner" },
                    ]}
                    onChange={(e) =>
                      setSaleRepresentative({
                        ...saleRepresentative,
                        partnerType: e.value,
                      })
                    }
                    className="w-full"
                    styles={selectStyles2}
                    data-testid={ADD_LOCAL_PARTNER.partnerTypeSelect}
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
                    data-testid={ADD_LOCAL_PARTNER.partnerStatusSelect}
                  />
                </div>
                {saleRepresentative?.partnerType !== "direct-partner" && (
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
                      data-testid={ADD_LOCAL_PARTNER.partnerCreditLimitInput}
                    />
                  </div>
                )}
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
                        data-testid={ADD_LOCAL_PARTNER.partnerCountrySelect}
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
                        data-testid={ADD_LOCAL_PARTNER.partnerStateSelect}
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
                            data-testid={ADD_LOCAL_PARTNER.partnerCitySelect}
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
                        data-testid={ADD_LOCAL_PARTNER.partnerZipCodeInput}
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
                      data-testid={ADD_LOCAL_PARTNER.partnerAddressInput}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Title{" "}
                    </label>
                    <input
                      type="text"
                      name="territory"
                      value={saleRepresentative?.territory}
                      placeholder="Enter Title"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                      data-testid={ADD_LOCAL_PARTNER.partnerTerritoryInput}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label
                      htmlFor="phone"
                      className="text-labelColor font-medium font-satoshi"
                    >
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
                        min="0"
                        value={saleRepresentative?.phoneNumber}
                        placeholder="Enter Phone Number"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                        onChange={handleChange}
                        data-testid={ADD_LOCAL_PARTNER.partnerPhoneNumberInput}
                      />
                    </div>
                    <div
                      className={`text-red-600 space-y-1 pb-1 ${
                        !/^\d*\.?\d*$/?.test(saleRepresentative?.phoneNumber)
                          ? "block"
                          : "hidden"
                      }`}
                    >
                      <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                      <p>Invalid Phone Number</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* === Section 3: Bank & Login Details === */}
              <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
                <h3 className="text-lg font-medium">3. Login Details</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-y-2 relative">
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
                      data-testid={ADD_LOCAL_PARTNER.partnerEmailInput}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2 relative">
                    <label className="text-labelColor font-medium font-satoshi">
                      Password
                    </label>
                    <input
                      type={visible ? "text" : "password"}
                      name="password"
                      autoComplete="off"
                      value={saleRepresentative?.password}
                      placeholder="Enter password"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      onChange={handleChange}
                      data-testid={ADD_LOCAL_PARTNER.partnerPasswordInput}
                    />
                  </div>
                </div>
              </div>

              {/* === Section 4: Shipping Address and Billing address === */}
              {saleRepresentative?.partnerType === "direct-partner" && (
                <div className="bg-white border border-borderColor rounded p-6 space-y-6 shadow-sm">
                  <div className="font-satoshi space-y-4">
                    <p
                      className="font-black text-xl lg:text-2xl text-theme"
                      // data-testid={ADD_CUSTOMER.step1Title}
                    >
                      4. Shipping Address
                    </p>
                    <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                      <div className="space-y-4">
                        <div
                          className="flex flex-col gap-y-2"
                          // data-testid={ADD_CUSTOMER.addressLineOneInput}
                        >
                          <label className="text-labelColor font-medium font-satoshi">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            name="addressLineOne"
                            onChange={handleAddress}
                            value={userData?.address?.addressLineOne}
                            placeholder="Enter address line 1"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                        </div>
                        <div
                          className="flex flex-col gap-y-2"
                          // data-testid={ADD_CUSTOMER.addressLineTwoInput}
                        >
                          <label className="text-labelColor font-medium font-satoshi">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            name="addressLineTwo"
                            onChange={handleAddress}
                            value={userData?.address?.addressLineTwo}
                            placeholder="Enter address line 2"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-y-4">
                        <div className="space-y-4">
                          <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
                            <div
                              className="flex flex-col gap-y-2"
                              // data-testid={ADD_CUSTOMER.addressCountrySelect}
                            >
                              <label className="text-labelColor font-medium font-satoshi">
                                Country
                              </label>
                              <Select
                                placeholder="Select Country"
                                className="w-full"
                                styles={drawerSelectStyles}
                                value={
                                  userData?.address?.country
                                    ? {
                                        value: userData.address.country,
                                        label: userData.address.country,
                                      }
                                    : null
                                }
                                options={allCountries ?? []}
                                onChange={(e) => {
                                  setUserData({
                                    ...userData,
                                    address: {
                                      ...userData?.address,
                                      country: e.label,
                                      state: "",
                                      town: "",
                                    },
                                  });
                                  handleSelectedCountryStates(e.label);
                                }}
                              />
                            </div>
                            <div
                              className="flex flex-col gap-y-2"
                              // data-testid={ADD_CUSTOMER.addressStateSelect}
                            >
                              <label className="text-labelColor font-medium font-satoshi">
                                State
                              </label>
                              <Select
                                placeholder="Select State"
                                className="w-full"
                                styles={drawerSelectStyles}
                                value={
                                  userData?.address?.state
                                    ? {
                                        value: userData.address.state,
                                        label: userData.address.state,
                                      }
                                    : null
                                }
                                options={allStates ?? []}
                                onChange={(e) => {
                                  setUserData({
                                    ...userData,
                                    address: {
                                      ...userData?.address,
                                      state: e.label,
                                      town: "",
                                    },
                                  });
                                  handleSelectedCountryStatesCities(e.value);
                                }}
                              />
                            </div>
                          </div>
                          <div
                            className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4"
                            // data-testid={ADD_CUSTOMER.addressTownInput}
                          >
                            <div className="flex flex-col gap-y-2">
                              <label className="text-labelColor font-medium font-satoshi">
                                Town / City
                              </label>

                              <input
                                type="text"
                                name="town"
                                onChange={(e) => {
                                  setUserData({
                                    ...userData,
                                    address: {
                                      ...userData?.address,
                                      town: e.target.value,
                                    },
                                  });
                                }}
                                value={userData?.address?.town}
                                placeholder="Enter town"
                                className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                              />
                            </div>
                            <div
                              className="flex flex-col gap-y-2"
                              // data-testid={ADD_CUSTOMER.addressZipCodeInput}
                            >
                              <label className="text-labelColor font-medium font-satoshi">
                                Zip Code
                              </label>
                              <input
                                type="text"
                                name="zipCode"
                                onChange={handleAddress}
                                value={userData?.address?.zipCode}
                                placeholder="Enter Zip Code"
                                className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-x-2"
                    // data-testid={ADD_CUSTOMER.billingSameAsShippingCheckbox}
                  >
                    <input
                      type="checkbox"
                      name="billingStatus"
                      checked={userData?.isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setUserData({
                          ...userData,
                          isChecked: checked,
                        });
                      }}
                      className="size-4 border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none"
                    />
                    <label className="text-labelColor font-medium font-satoshi">
                      Billing Address same as Shipping Address
                    </label>
                  </div>

                  {!userData?.isChecked && (
                    <div className="font-satoshi space-y-4">
                      <p className="font-black text-xl lg:text-2xl text-theme">
                        Billing Address
                      </p>
                      <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                        <div className="space-y-4">
                          <div
                            className="flex flex-col gap-y-2"
                            // data-testid={ADD_CUSTOMER.billingAddressLineOneInput}
                          >
                            <label className="text-labelColor font-medium font-satoshi">
                              Address Line 1
                            </label>
                            <input
                              type="text"
                              name="addressLineOne"
                              onChange={handleBillingAddress}
                              value={userData?.billingAddress?.addressLineOne}
                              placeholder="Enter address line 1"
                              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                            />
                          </div>
                          {/* Address Line 2 */}
                          <div
                            className="flex flex-col gap-y-2"
                            // data-testid={ADD_CUSTOMER.billingAddressLineTwoInput}
                          >
                            <label className="text-labelColor font-medium font-satoshi">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              name="addressLineTwo"
                              onChange={handleBillingAddress}
                              value={userData?.billingAddress?.addressLineTwo}
                              placeholder="Enter address line 2"
                              className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-y-4">
                          <div className="space-y-4">
                            {/* Country Select */}
                            <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
                              <div
                                className="flex flex-col gap-y-2"
                                //  data-testid={
                                //     ADD_CUSTOMER.billingAddressCountrySelect
                                //   }
                              >
                                <label className="text-labelColor font-medium font-satoshi">
                                  Country
                                </label>
                                <Select
                                  placeholder="Select Country"
                                  className="w-full"
                                  styles={drawerSelectStyles}
                                  value={
                                    userData?.billingAddress?.country
                                      ? {
                                          value:
                                            userData.billingAddress.country,
                                          label:
                                            userData.billingAddress.country,
                                        }
                                      : null
                                  }
                                  options={allCountries ?? []}
                                  onChange={(e) => {
                                    setUserData({
                                      ...userData,
                                      billingAddress: {
                                        ...userData?.billingAddress,
                                        country: e.label,
                                        state: "",
                                        town: "",
                                      },
                                    });
                                    handleSelectedCountryStates(e.label);
                                  }}
                                />
                              </div>
                              <div
                                className="flex flex-col gap-y-2"
                                // data-testid={
                                //   ADD_CUSTOMER.billingAddressStateSelect
                                // }
                              >
                                <label className="text-labelColor font-medium font-satoshi">
                                  State
                                </label>
                                <Select
                                  placeholder="Select State"
                                  className="w-full"
                                  styles={drawerSelectStyles}
                                  value={
                                    userData?.billingAddress?.state
                                      ? {
                                          value:
                                            userData?.billingAddress?.state,
                                          label:
                                            userData?.billingAddress?.state,
                                        }
                                      : null
                                  }
                                  options={allStates ?? []}
                                  onChange={(e) => {
                                    setUserData({
                                      ...userData,
                                      billingAddress: {
                                        ...userData?.billingAddress,
                                        state: e.label,
                                        town: "",
                                      },
                                    });
                                    handleSelectedCountryStatesCities(e.value);
                                  }}
                                />
                              </div>
                            </div>

                            {/* Town / City Input */}
                            <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
                              <div
                                className="flex flex-col gap-y-2"
                                // data-testid={ADD_CUSTOMER.billingAddressTownInput}
                              >
                                <label className="text-labelColor font-medium font-satoshi">
                                  Town / City
                                </label>
                                <input
                                  type="text"
                                  name="town"
                                  onChange={(e) => {
                                    setUserData({
                                      ...userData,
                                      billingAddress: {
                                        ...userData?.billingAddress,
                                        town: e.target.value,
                                      },
                                    });
                                  }}
                                  value={userData?.billingAddress?.town}
                                  placeholder="Enter town"
                                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                />
                              </div>
                              {/* Zip Code Input */}
                              <div
                                className="flex flex-col gap-y-2"
                                // data-testid={
                                //   ADD_CUSTOMER.billingAddressZipCodeInput
                                // }
                              >
                                <label className="text-labelColor font-medium font-satoshi">
                                  Zip Code
                                </label>
                                <input
                                  type="text"
                                  name="zipCode"
                                  onChange={(e) => {
                                    setUserData({
                                      ...userData,
                                      billingAddress: {
                                        ...userData.billingAddress,
                                        zipCode: e.target.value,
                                      },
                                    });
                                  }}
                                  value={userData?.billingAddress?.zipCode}
                                  placeholder="Enter Zip Code"
                                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme hover:bg-white hover:text-theme border border-theme duration-150 w-full py-3"
                data-testid={ADD_LOCAL_PARTNER.submitButton}
              >
                Add Local Partner
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
