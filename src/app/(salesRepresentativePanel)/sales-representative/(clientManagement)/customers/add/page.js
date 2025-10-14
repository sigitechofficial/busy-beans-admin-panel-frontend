"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import { passwordStrength } from "@/utilities/AuthValidation";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { drawerSelectStyles } from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL, googleApiKey } from "@/utilities/URL";
import { emailValidity } from "@/utilities/Validations";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import React, { useRef, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaLongArrowAltLeft } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import { ADD_CUSTOMER } from "../../../../../(clientManagement)/customers/customer.testid";

export default function AddCustomer() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID");
    var userType = localStorage.getItem("userType");
  }
  const allCountriesData = [];
  const router = useRouter();
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
  console.log("🚀 ~ page ~ userData:", userData);

  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const { data } = GetAPI("api/v1/admin/address-management/country");

  const allCountries = [];
  data?.data?.data?.map((country) =>
    allCountries.push({
      value: country?.name,
      label: country?.name,
    })
  );

  const handleInfo = (e) => {
    const { name, value } = e.target;
    if (name === 'dispatchEmail' || name === 'emailToSendInvoices') {
      const emails = value.split(',').map((email) => email.trim());
      setUserData({
        ...userData,
        info: {
          ...userData.info,
          [name]: emails.join(', '),
        },
      });
    } else {
      setUserData({
        ...userData,
        info: {
          ...userData.info,
          [name]: value,
        },
      });
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

  const handleBillingShippingAddress = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setUserData({
        ...userData,
        billingAddress: {
          ...userData?.info,
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
          ...userData?.info,
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
    // if (!address.companyaddress?.trim())
    //   return { error: true, message: "Company address cannot be empty" };
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

    // if (!userData.isChecked && !billing.companyaddress?.trim())
    //   return { error: true, message: "Billing address cannot be empty" };
    if (!userData.isChecked && !billing.town?.trim())
      return { error: true, message: "Billing town cannot be empty" };
    if (!userData.isChecked && !billing.country?.trim())
      return { error: true, message: "Billing country cannot be empty" };
    if (!userData.isChecked && !billing.state?.trim())
      return { error: true, message: "Billing state cannot be empty" };
    if (!userData.isChecked && !billing.zipCode?.trim())
      return { error: true, message: "Billing zip code cannot be empty" };

    // --- Company Info ---
    const info = userData.info;
    if (!info.companyName?.trim())
      return { error: true, message: "Company name cannot be empty" };
    if (!info.dispatchEmail?.trim())
      return { error: true, message: "Dispatch email cannot be empty" };
    if (!info.phoneNumber?.trim())
      return { error: true, message: "Phone number cannot be empty" };

     if (!info.dispatchEmail?.trim())
    return { error: true, message: "Dispatch email cannot be empty" };
    const dispatchEmails = info.dispatchEmail.split(',');
    const dispatchEmailValidation = dispatchEmails.every((email) =>
      emailValidity.test(email.trim())
    );
    if (!dispatchEmailValidation)
      return { error: true, message: "One or more dispatch emails are invalid." };

    if (!info.emailToSendInvoices?.trim())
      return { error: true, message: "Invoice email cannot be empty" };
    const invoiceEmails = info.emailToSendInvoices.split(',');
    const invoiceEmailValidation = invoiceEmails.every((email) =>
      emailValidity.test(email.trim())
    );
    if (!invoiceEmailValidation)
      return { error: true, message: "One or more invoice emails are invalid." };

    // --- User Info ---
    if (!info.name?.trim())
      return { error: true, message: "Contact Name cannot be empty" };
    if (!info.email?.trim())
      return { error: true, message: "Login email cannot be empty" };
    if (!emailValidity.test(info.email.trim()))
      return { error: true, message: "Invalid login email" };
    if (!info.password?.trim() || info.password.trim().length < 6)
      return { error: true, message: "Password must be at least 6 characters" };

    // Password strength
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

    // ✅ Passed all checks
    return { error: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const result = validateCustomerForm(userData);

    if (result?.error) {
      info_toaster(result.message);
    } else {
      const dispatchEmails = userData.info.dispatchEmail.split(',').map(email => email.trim());
      const emails = userData.info.emailToSendInvoices.split(',').map(email => email.trim());
      try {
        setLoader(true);
        const url =
          userType === "admin"
            ? "api/v1/admin/add-customer"
            : `api/v1/admin/add-customer/sales-rep/${userID}`;
        const res = await PostAPI(url, {
          info: {
            name: userData?.info?.name,
            email: userData?.info?.email,
            password: userData?.info?.password,
            status: true,
            phoneNumber: userData?.info?.phoneNumber,
            countryCode: userData?.info?.countryCode,
            saleTaxNumber: userData?.info?.saleTaxNumber,
            dispatchEmail: dispatchEmails.join(', '),
            emailToSendInvoices: emails.join(', '),
            companyName: userData?.info?.companyName,
            // companyInfo: userData?.info?.companyInfo,
            defaultDiscount: userData?.info?.defaultDiscount,
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
          // billingAddress: {
          //   addressLineOne: userData?.billingAddress?.companyaddress,
          //   town: userData?.billingAddress?.town,
          //   country: userData?.billingAddress?.country,
          //   state: userData?.billingAddress?.state,
          //   zipCode: userData?.billingAddress?.zipCode,
          //   status: true,
          // },
        }, "customer");
        if (res?.data?.status === "success") {
          setStep(1);
          setUserData({
            info: {
              name: "",
              email: "",
              password: "",
              status: true,
              phoneNumber: "",
              saleTaxNumber: "",
              dispatchEmail: "",
              emailToSendInvoices: "",
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
              addressLineOne: "",
              addressLineTwo: "",
              town: "",
              country: "",
              state: "",
              zipCode: "",
              status: true,
            },
          });
          setSelectedCountry({ label: "", value: "" });
          router.push(userType==="admin"?"/customers": "/sales-representative/customers");
          setLoader(false);
          success_toaster(res?.data?.data?.message);
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
    //  else {
    //   info_toaster("Service not operational here");
    // }
    // }
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
          res?.data?.data?.data
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

  return (
    <div data-testid={ADD_CUSTOMER.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={ADD_CUSTOMER.headerBar}>
        <h2 className="text-xl font-inter font-semibold" data-testid={ADD_CUSTOMER.title}>
          Add New Customer
        </h2>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
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
          </button>{" "}
          {/* <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Add New Customer
          </h2> */}
        </div>

        {/* main section start */}
        <div className="lg:gap-x-12 xl:gap-16 relative px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm gap-y-4">
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="space-y-8">
              {/* <p className="font-satoshi text-theme font-black text-2xl lg:text-3xl text-center">
                Welcome to Busy Bean Coffee
              </p> */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="font-satoshi space-y-4">
                    <p className="font-black text-xl lg:text-2xl text-theme" data-testid={ADD_CUSTOMER.step1Title}>
                      1. Shipping Address
                    </p>
                    <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.addressLineOneInput}>
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
                        <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.addressLineTwoInput}>
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
                            <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.addressCountrySelect}>
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
                            <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.addressStateSelect}>
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
                          <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4" data-testid={ADD_CUSTOMER.addressTownInput}>
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
                            <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.addressZipCodeInput}>
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

                  <div className="flex items-center gap-x-2" data-testid={ADD_CUSTOMER.billingSameAsShippingCheckbox}>
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
                        <p className="font-black text-xl lg:text-2xl text-theme">Billing Address</p>
                        <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                          <div className="space-y-4">
                            <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressLineOneInput}>
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
                            <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressLineTwoInput}>
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
                                <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressCountrySelect}>
                                  <label className="text-labelColor font-medium font-satoshi">Country</label>
                                  <Select
                                    placeholder="Select Country"
                                    className="w-full"
                                    styles={drawerSelectStyles}
                                    value={
                                      userData?.billingAddress?.country
                                        ? {
                                          value: userData.billingAddress.country,
                                          label: userData.billingAddress.country,
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
                                <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressStateSelect}>
                                  <label className="text-labelColor font-medium font-satoshi">State</label>
                                  <Select
                                    placeholder="Select State"
                                    className="w-full"
                                    styles={drawerSelectStyles}
                                    value={
                                      userData?.billingAddress?.state
                                        ? {
                                          value: userData?.billingAddress?.state,
                                          label: userData?.billingAddress?.state,
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
                                <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressTownInput}>
                                  <label className="text-labelColor font-medium font-satoshi">Town / City</label>
                                  <input
                                    type="text"
                                    name="town"
                                    onChange={(e) => {
                                      setUserData({
                                        ...userData,
                                        billingAddress: { ...userData?.billingAddress, town: e.target.value },
                                      });
                                    }}
                                    value={userData?.billingAddress?.town}
                                    placeholder="Enter town"
                                    className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                  />
                                </div>
                                {/* Zip Code Input */}
                                <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.billingAddressZipCodeInput}>
                                  <label className="text-labelColor font-medium font-satoshi">Zip Code</label>
                                  <input
                                    type="text"
                                    name="zipCode"
                                    onChange={(e) => {
                                      setUserData({
                                        ...userData,
                                        billingAddress: { ...userData.billingAddress, zipCode: e.target.value },
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
              {/* {step === 2 && ( */}
              <div className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme flex items-center justify-between gap-x-2">
                  2. Company Details
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerCompanyNameInput}>
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
                    <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerDispatchEmailInput}>
                      <label className="text-labelColor font-medium font-satoshi">
                        Dispatch Email
                      </label>
                      <input
                        type="text"
                        name="dispatchEmail"
                        onChange={handleInfo}
                        value={userData?.info?.dispatchEmail}
                        placeholder="xyz@gmail.com"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerPhoneInput}>
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
                      <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerSaleTaxNumberInput}>
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
                      <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerInvoiceEmailInput}>
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
                        {/* <div className="flex flex-col gap-y-2">
                          <label className="text-labelColor font-medium font-satoshi">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            name="defaultDiscount"
                            min={0}
                            max={100}
                            step={0.1}
                            placeholder="Enter discount"
                            value={userData?.info?.defaultDiscount ?? ""}
                            onChange={(e) => {
                              let val = e.target.value;

                              if (val === "") {
                                setUserData((prev) => ({
                                  ...prev,
                                  info: { ...prev.info, defaultDiscount: null },
                                }));
                                return;
                              }

                              let num = parseFloat(val);
                              if (isNaN(num)) return;
                              if (num < 0) num = 0;
                              if (num > 100) num = 100;

                              setUserData((prev) => ({
                                ...prev,
                                info: { ...prev.info, defaultDiscount: num },
                              }));
                            }}
                            onWheel={(e) => e.target.blur()}
                            className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                        </div> */}
                    </div>
                    {/* <div>
                        <button
                          onClick={handleStep2}
                          className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                        >
                          Next
                        </button>
                      </div> */}
                  </div>
                </div>
              </div>
              {/* )} */}
              {/* {step === 3 && ( */}
              <form onSubmit={handleSubmit} className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme">
                  3. User Details
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerNameInput}>
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
                    <div className="flex flex-col gap-y-2" data-testid={ADD_CUSTOMER.customerEmailInput}>
                      <label className="text-labelColor font-medium font-satoshi">
                        Login Email / Contact Email
                      </label>
                      <input
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
                    <div className="space-y-4">
                      <div className="flex flex-col gap-y-2 relative" data-testid={ADD_CUSTOMER.customerPasswordInput}>
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
                          data-testid={ADD_CUSTOMER.passwordVisibilityToggle}
                        >
                          {visibility?.pass ? (
                            <AiOutlineEye size={24} color="#000000" />
                          ) : (
                            <AiOutlineEyeInvisible size={24} color="#000000" />
                          )}
                        </button>
                      </div>
                      <div className="flex flex-col gap-y-2 relative" data-testid={ADD_CUSTOMER.customerConfirmPasswordInput}>
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
                          data-testid={ADD_CUSTOMER.confirmPasswordVisibilityToggle}
                        >
                          {visibility?.confirmPass ? (
                            <AiOutlineEye size={24} color="#000000" />
                          ) : (
                            <AiOutlineEyeInvisible size={24} color="#000000" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[399px] pt-5">
                  <button
                    type="submit"
                    className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                    data-testid={ADD_CUSTOMER.submitButton}
                  >
                    Submit
                  </button>
                </div>
              </form>
              {/* )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
