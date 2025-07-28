"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import { passwordStrength } from "@/utilities/AuthValidation";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL, googleApiKey } from "@/utilities/URL";
import { emailValidity } from "@/utilities/Validations";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaLongArrowAltLeft } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";

export default function UpdateCustomer() {
  const router = useRouter();
  const { userId } = useParams();
  let userType = "";
  if (typeof window !== "undefined") {
    userType = localStorage.getItem("userType");
  }
  const [step, setStep] = useState(1);
  const [loader, setLoader] = useState(false);
  const [visibility, setVisibility] = useState({
    pass: false,
    confirmPass: false,
  });
  const [selectedCountry, setSelectedCountry] = useState({
    value: "",
    label: "",
  });
  const [userData, setUserData] = useState({
    info: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      status: true,
      phoneNumber: "",
      countryCode: "+1",
      saleTaxNumber: "",
      emailToSendInvoices: "",
      companyName: "",
      companyInfo: "",
      registerBy: "email",
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
      town: "",
      country: "",
      state: "",
      zipCode: "",
      status: true,
    },
    isChecked: true,
  });
  console.log("🚀 ~ page ~ userData:", userData);

  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [isPassword, setIsPassword] = useState(false);

  // Fetch countries
  const { data: countriesData } = GetAPI(
    "api/v1/admin/address-management/country"
  );
  const allCountries = [];
  countriesData?.data?.data?.map((country) =>
    allCountries.push({
      value: country?.name,
      label: country?.name,
    })
  );

  // Fetch customer details and prefill
  const { data: customerData } = GetAPI(
    `api/v1/admin/view-customer-detail/${userId}`
  );

  useEffect(() => {
    if (customerData?.data?.customer) {
      const c = customerData.data.customer;
      setUserData({
        info: {
          name: c.name || "",
          email: c.email || "",
          password: "",
          confirmPassword: "",
          status: c.status ?? true,
          phoneNumber: c.phoneNumber || "",
          countryCode: c.countryCode || "+1",
          saleTaxNumber: c.saleTaxNumber || "",
          emailToSendInvoices: c.emailToSendInvoices || "",
          companyName: c.companyName || "",
          companyInfo: c.companyInfo || "",
          registerBy: c.registerBy || "email",
        },
        address: {
          companyaddress: c.addresses?.[0]?.companyaddress || "",
          addressLineOne: c.addresses?.[0]?.addressLineOne || "",
          addressLineTwo: c.addresses?.[0]?.addressLineTwo || "",
          town: c.addresses?.[0]?.town || "",
          country: c.addresses?.[0]?.country || "",
          state: c.addresses?.[0]?.state || "",
          zipCode: c.addresses?.[0]?.zipCode || "",
          status: c.addresses?.[0]?.status ?? true,
        },
        billingAddress: {
          companyaddress: c.billingAddresses?.[0]?.companyaddress || "",
          town: c.billingAddresses?.[0]?.town || "",
          country: c.billingAddresses?.[0]?.country || "",
          state: c.billingAddresses?.[0]?.state || "",
          zipCode: c.billingAddresses?.[0]?.zipCode || "",
          status: c.billingAddresses?.[0]?.status ?? true,
        },
        isChecked: true,
      });
    }
  }, [customerData]);

  const handleAddress = (e) => {
    setUserData({
      ...userData,
      address: {
        ...userData?.address,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleInfo = (e) => {
    setUserData({
      ...userData,
      info: {
        ...userData?.info,
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

  const handleBillingShippingAddress = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setUserData({
        ...userData,
        billingAddress: {
          ...userData?.billingAddress,
          companyaddress: userData?.address?.companyaddress,
          country: userData?.address?.country,
          state: userData?.address?.state,
          town: userData?.address?.town,
          zipCode: userData?.address?.zipCode,
        },
      });
    } else {
      setUserData({
        ...userData,
        billingAddress: {
          ...userData?.billingAddress,
          companyaddress: "",
          country: "",
          state: "",
          town: "",
          zipCode: "",
        },
      });
    }
  };

  const validateCustomerForm = (userData) => {
    // --- Shipping Address ---
    const address = userData.address;
    if (!address.companyaddress?.trim())
      return { error: true, message: "Company address cannot be empty" };

    if (!address.country?.trim())
      return { error: true, message: "Country cannot be empty" };
    if (!address.state?.trim())
      return { error: true, message: "State cannot be empty" };
    if (!address.town?.trim())
      return { error: true, message: "Town cannot be empty" };
    if (!address.zipCode?.trim())
      return { error: true, message: "Zip code cannot be empty" };

    // --- Billing Address ---
    const billing = userData.isChecked
      ? {
          companyaddress: address.companyaddress,
          town: address.town,
          country: address.country,
          state: address.state,
          zipCode: address.zipCode,
        }
      : userData.billingAddress;

    if (!billing.companyaddress?.trim())
      return { error: true, message: "Billing address cannot be empty" };
    if (!billing.town?.trim())
      return { error: true, message: "Billing town cannot be empty" };
    if (!billing.country?.trim())
      return { error: true, message: "Billing country cannot be empty" };
    if (!billing.state?.trim())
      return { error: true, message: "Billing state cannot be empty" };
    if (!billing.zipCode?.trim())
      return { error: true, message: "Billing zip code cannot be empty" };

    // --- Company Info ---
    const info = userData.info;
    if (!info.companyName?.trim())
      return { error: true, message: "Company name cannot be empty" };
    if (!info.companyInfo?.trim())
      return { error: true, message: "Dispatch email cannot be empty" };
    if (!info.phoneNumber?.trim())
      return { error: true, message: "Phone number cannot be empty" };
    if (!info.emailToSendInvoices?.trim())
      return { error: true, message: "Invoice email cannot be empty" };
    if (!emailValidity.test(info.emailToSendInvoices.trim()))
      return { error: true, message: "Invalid invoice email format" };

    // --- User Info ---
    if (!info.name?.trim())
      return { error: true, message: "Contact Name cannot be empty" };
    if (!info.email?.trim())
      return { error: true, message: "Login email cannot be empty" };
    if (!emailValidity.test(info.email.trim()))
      return { error: true, message: "Invalid login email" };

    // Only validate password if user entered something
    if (info.password?.trim()) {
      if (info.password.trim().length < 6)
        return {
          error: true,
          message: "Password must be at least 6 characters",
        };
      if (
        !passwordStrength.weak.test(info.password.trim()) ||
        !passwordStrength.medium.test(info.password.trim()) ||
        !passwordStrength.strong.test(info.password.trim())
      ) {
        return {
          error: true,
          message: "Password must be strong and meet all requirements",
        };
      }
      if (!info.confirmPassword?.trim())
        return { error: true, message: "Confirm password cannot be empty" };
      if (info.password.trim() !== info.confirmPassword.trim())
        return { error: true, message: "Passwords do not match" };
    }

    // ✅ Passed all checks
    return { error: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBillingAddress = userData.isChecked
      ? {
          companyaddress: userData.address.companyaddress,
          town: userData.address.town,
          country: userData.address.country,
          state: userData.address.state,
          zipCode: userData.address.zipCode,
          status: true,
        }
      : {
          companyaddress: userData?.billingAddress?.companyaddress,
          town: userData?.billingAddress?.town,
          country: userData?.billingAddress?.country,
          state: userData?.billingAddress?.state,
          zipCode: userData?.billingAddress?.zipCode,
          status: true,
        };

    const result = validateCustomerForm(userData);

    if (result?.error) {
      info_toaster(result.message);
    } else {
      try {
        setLoader(true);
        const res = await PatchAPI(`api/v1/admin/customer-update/${userId}`, {
          info: {
            name: userData?.info?.name,
            // email: userData?.info?.email,
             ...(isPassword && { password: userData?.info?.password }),
            status: userData?.info?.status,
            phoneNumber: userData?.info?.phoneNumber,
            countryCode: userData?.info?.countryCode,
            saleTaxNumber: userData?.info?.saleTaxNumber,
            emailToSendInvoices: userData?.info?.emailToSendInvoices,
            companyName: userData?.info?.companyName,
            dispatchEmail: userData?.info?.companyInfo,
            registerBy: userData?.info?.registerBy,
          },
          address: {
            companyaddress: userData?.address?.companyaddress,
            addressLineOne: userData?.address?.addressLineOne,
            addressLineTwo: userData?.address?.addressLineTwo,
            town: userData?.address?.town,
            country: userData?.address?.country,
            state: userData?.address?.state,
            zipCode: userData?.address?.zipCode,
            status: true,
          },
          billingAddress: {
            ...finalBillingAddress,
          },
        });
        if (res?.data?.status === "success") {
          setLoader(false);
          success_toaster("Customer updated successfully");
          router.push("/sales-representative/customers");
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

  return (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Update Customer
        </h2>
      </div>
      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        <div className="flex items-center gap-x-2">
          <button
            onClick={() =>
              router.push(
                userType === "admin"
                  ? "/customers"
                  : "/sales-representative/customers"
              )
            }
            className="size-8 text-theme rounded-full hover:bg-theme hover:text-white duration-200"
          >
            <FaLongArrowAltLeft size={30} />
          </button>
        </div>
        <div className="lg:gap-x-12 xl:gap-16 relative px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm gap-y-4">
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="font-satoshi space-y-4">
                    <p className="font-black text-xl lg:text-2xl text-theme">
                      1. Shipping Address
                    </p>
                    <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-y-2">
                          <label className="text-labelColor font-medium font-satoshi">
                            Company Address{" "}
                          </label>
                          <input
                            type="text"
                            name="companyaddress"
                            value={userData?.address?.companyaddress}
                            placeholder="XYZ company address"
                            className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                            onChange={handleAddress}
                          />
                        </div>
                        <div className="flex flex-col gap-y-2">
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
                        <div className="flex flex-col gap-y-2">
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
                            <div className="flex flex-col gap-y-2">
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
                            <div className="flex flex-col gap-y-2">
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
                          <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
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
                            <div className="flex flex-col gap-y-2">
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
                  <div className="flex items-center gap-x-2">
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
                        // handleBillingShippingAddress(e);
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
                          <div className="flex flex-col gap-y-2">
                            <label className="text-labelColor font-medium font-satoshi">
                              Billing Address{" "}
                            </label>
                            <input
                              type="text"
                              name="companyaddress"
                              value={userData?.billingAddress?.companyaddress}
                              placeholder="Enter Address"
                              className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                              onChange={handleBillingAddress}
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
                              <div className="flex flex-col gap-y-2">
                                <label className="text-labelColor font-medium font-satoshi">
                                  Country
                                </label>
                                <Select
                                  placeholder="Select Country"
                                  className="w-full"
                                  styles={drawerSelectStyles}
                                  options={allCountries ?? []}
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
                              <div className="flex flex-col gap-y-2">
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
                            <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
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
                                      billingAddress: {
                                        ...userData?.billingAddress,
                                        town: e.target.value,
                                      },
                                    });
                                  }}
                                  placeholder="Enter town"
                                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                  value={userData?.billingAddress?.town}
                                />
                              </div>
                              <div className="flex flex-col gap-y-2">
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
              <div className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme flex items-center justify-between gap-x-2">
                  2. Company Details
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        onChange={handleInfo}
                        value={userData?.info?.companyName}
                        placeholder="Sigi Technologies"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Dispatch Email
                      </label>
                      <input
                        type="text"
                        name="companyInfo"
                        onChange={handleInfo}
                        value={userData?.info?.companyInfo}
                        placeholder="xyz@gmail.com"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
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
                          }}
                          dropdownStyle={{
                            backgroundColor: "#86644C",
                            borderRadius: "8px",
                          }}
                          country={"us"}
                          value={userData?.info?.countryCode}
                          onChange={(phone) =>
                            setUserData({
                              ...userData,
                              info: {
                                ...userData?.info,
                                countryCode: phone,
                              },
                            })
                          }
                        />
                        <input
                          type="number"
                          name="phoneNumber"
                          value={userData?.info?.phoneNumber}
                          placeholder="Enter Phone Number"
                          className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5  w-full col-span-8"
                          onChange={handleInfo}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-y-4">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Sale Tax Number <span>(if applicable)</span>
                        </label>
                        <input
                          type="text"
                          name="saleTaxNumber"
                          onChange={handleInfo}
                          value={userData?.info?.saleTaxNumber}
                          placeholder="Enter sale tax number"
                          className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <label className="text-labelColor font-medium font-satoshi">
                          Invoice Email
                        </label>
                        <input
                          type="email"
                          name="emailToSendInvoices"
                          onChange={handleInfo}
                          value={userData?.info?.emailToSendInvoices}
                          placeholder="abc@gmail.com"
                          className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme">
                  3. User Details
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Full Name / Contact Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        onChange={handleInfo}
                        value={userData?.info?.name}
                        placeholder="Enter Name"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Login Email / Contact Email
                      </label>
                      <input
                        disabled
                        type="email"
                        name="email"
                        onChange={handleInfo}
                        value={userData?.info?.email}
                        placeholder="Enter email"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-y-4">
                    <div className="flex items-center gap-x-2">
                      <input
                        type="checkbox"
                        checked={isPassword}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsPassword(checked);
                        }}
                        className="size-4 border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none"
                      />
                      <label className="text-labelColor font-medium font-satoshi">
                        Password Change
                      </label>
                    </div>
                    {isPassword && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-y-2 relative">
                          <label className="text-labelColor font-medium font-satoshi">
                            Password
                          </label>
                          <input
                            type={visibility?.pass ? "text" : "password"}
                            name="password"
                            onChange={handleInfo}
                            value={userData?.info?.password}
                            placeholder="Enter Password"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                          {userData?.info?.password.length > 0 && (
                            <p className="text-red-700 text font-semibold text-sm">
                              {!passwordStrength?.weak?.test(
                                userData?.info?.password.trim()
                              )
                                ? "Password is too weak, contain atleat 6 characters consider adding more complexity"
                                : !passwordStrength?.medium?.test(
                                    userData?.info?.password.trim()
                                  )
                                ? "Password should include both uppercase and lowercase letters"
                                : !passwordStrength?.strong.test(
                                    userData?.info?.password.trim()
                                  )
                                ? "Password is strong! It should include at least one uppercase letter, one lowercase letter, one number, and one special character"
                                : ""}
                            </p>
                          )}
                          <button
                            onClick={() =>
                              setVisibility({
                                ...visibility,
                                pass: !visibility?.pass,
                              })
                            }
                            type="button"
                            className="text-black absolute right-4 top-11"
                          >
                            {visibility?.pass ? (
                              <AiOutlineEye size={24} color="#000000" />
                            ) : (
                              <AiOutlineEyeInvisible
                                size={24}
                                color="#000000"
                              />
                            )}
                          </button>
                        </div>
                        <div className="flex flex-col gap-y-2 relative">
                          <label className="text-labelColor font-medium font-satoshi">
                            Confirm Password
                          </label>
                          <input
                            type={visibility?.confirmPass ? "text" : "password"}
                            name="confirmPassword"
                            onChange={handleInfo}
                            value={userData?.info?.confirmPassword}
                            placeholder="Enter password again"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                          <button
                            onClick={() =>
                              setVisibility({
                                ...visibility,
                                confirmPass: !visibility?.confirmPass,
                              })
                            }
                            type="button"
                            className="text-black absolute right-4 top-11"
                          >
                            {visibility?.confirmPass ? (
                              <AiOutlineEye size={24} color="#000000" />
                            ) : (
                              <AiOutlineEyeInvisible
                                size={24}
                                color="#000000"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-[399px] pt-5">
                  <button
                    type="submit"
                    className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
