"use client";
import Loader from "@/components/ui/Loader";
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
import { Dialog } from "primereact/dialog";

export default function UpdateCustomer() {
  const router = useRouter();
  const { userId } = useParams();
  let userType = "";
  if (typeof window !== "undefined") {
    userType = localStorage.getItem("userType");
  }

  // ⬇️ Categories for the discount dialog
  const { data: categoriesRes, isLoading: catsLoading, error: catsError } = GetAPI("api/v1/admin/category");
  const [discountSaving, setDiscountSaving] = useState(false);
  // Normalize server shapes safely
  const categories =
    categoriesRes?.data?.data?.data ||
    categoriesRes?.data?.data ||
    categoriesRes?.data ||
    [];

  // Dialog state
  const [discountDlgOpen, setDiscountDlgOpen] = useState(false);
  /** Map categoryId -> number (percentage) */
  const [categoryDiscounts, setCategoryDiscounts] = useState({});

  // Keep % between 0–100 and one decimal
  const clampPct = (raw) => {
    if (raw === "" || raw === null || raw === undefined) return "";
    let n = Number(raw);
    if (Number.isNaN(n)) return "";
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return Math.round(n * 10) / 10;
  };

  const handleDiscountChange = (id, raw) => {
    const v = clampPct(raw);
    setCategoryDiscounts((prev) => ({
      ...prev,
      [id]: v === "" ? undefined : v,
    }));
  };

  // Build payload array for API
  const buildUserDiscountPayload = () =>
    Object.entries(categoryDiscounts)
      .filter(([, v]) => typeof v === "number" && v >= 0 && v <= 100)
      .map(([k, v]) => ({ categoryId: Number(k), percentage: Number(v) }));

  const handleSaveUserDiscounts = async () => {
    const userDiscount = buildUserDiscountPayload();
    if (userDiscount.length === 0) {
      info_toaster("Please enter at least one discount.");
      return;
    }
    try {
      setDiscountSaving(true);
      const res = await PatchAPI(
        `api/v1/admin/customer-update/${userId}`,
        { userDiscount },
        "customer"
      );

      if (res?.data?.status === "success") {
        success_toaster("User discount(s) updated.");
        setDiscountDlgOpen(false);
        // (Optional) refresh or keep values as-is
        // setCategoryDiscounts({});
      } else {
        throw new Error(res?.data?.message || "Failed to update discounts.");
      }
    } catch (err) {
      ErrorHandler(err);
    } finally {
      setDiscountSaving(false);
    }
  };

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
      dispatchEmail: "",
      emailToSendInvoices: "",
      companyName: "",
      // companyInfo: "",
      defaultDiscount: null,
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
    isChecked: false, 
  });
  console.log("🚀 ~ page ~ userData:", userData);

  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

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
    `api/v1/admin/view-customer-detail/${userId}`, "customer"
  );

  useEffect(() => {
    if (customerData?.data?.customer) {
      const c = customerData.data.customer;
      const areAddressesSame =
      c.addresses?.[0]?.companyaddress === c.billingAddresses?.[0]?.companyaddress &&
      c.addresses?.[0]?.addressLineOne === c.billingAddresses?.[0]?.addressLineOne &&
      c.addresses?.[0]?.addressLineTwo === c.billingAddresses?.[0]?.addressLineTwo &&
      c.addresses?.[0]?.town === c.billingAddresses?.[0]?.town &&
      c.addresses?.[0]?.state === c.billingAddresses?.[0]?.state &&
      c.addresses?.[0]?.zipCode === c.billingAddresses?.[0]?.zipCode &&
      c.addresses?.[0]?.country === c.billingAddresses?.[0]?.country;
      
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
          dispatchEmail: c.dispatchEmail || "",
          emailToSendInvoices: c.emailToSendInvoices || "",
          companyName: c.companyName || "",
          // companyInfo: c.dispatchEmail || "",
          registerBy: c.registerBy || "email",
          defaultDiscount: c.defaultDiscount != null ? Number(c.defaultDiscount) : null,
        },
        address: {
          // companyaddress: c.addresses?.[0]?.companyaddress || "",
          companyaddress: "",
          // addressLineOne:
          //   (c.addresses?.[0]?.companyaddress || "")?.trim() +
          //   (c.addresses?.[0]?.addressLineOne || "")?.trim(),
          // addressLineTwo: c.addresses?.[0]?.addressLineTwo || "",
          addressLineOne: (c.addresses?.[0]?.addressLineOne || ""),
          addressLineTwo: c.addresses?.[0]?.addressLineTwo || "",
          town: c.addresses?.[0]?.town || "",
          country: c.addresses?.[0]?.country || "",
          state: c.addresses?.[0]?.state || "",
          zipCode: c.addresses?.[0]?.zipCode || "",
          status: c.addresses?.[0]?.status ?? true,
        },
        billingAddress: {
          companyaddress: c.billingAddresses?.[0]?.companyaddress || "",
          addressLineOne: c.billingAddresses?.[0]?.addressLineOne || "",
          addressLineTwo: c.billingAddresses?.[0]?.addressLineTwo || "",
          town: c.billingAddresses?.[0]?.town || "",
          country: c.billingAddresses?.[0]?.country || "",
          state: c.billingAddresses?.[0]?.state || "",
          zipCode: c.billingAddresses?.[0]?.zipCode || "",
          status: c.billingAddresses?.[0]?.status ?? true,
        },
        isChecked: areAddressesSame,
      });

      const existingDiscountsArr =
        c.userDiscount ||
        c.userDiscounts ||
        c.categoryDiscounts ||
        c.discounts ||
        [];

      const map = {};
      existingDiscountsArr.forEach((d) => {
        const cid = Number(d?.categoryId ?? d?.category_id ?? d?.id);
        const pct = Number(d?.percentage ?? d?.percent ?? d?.discount);
        if (!Number.isNaN(cid) && !Number.isNaN(pct)) {
          map[cid] = clampPct(pct);
        }
      });
      setCategoryDiscounts(map);
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

  const handleBillingAddress = (e) => {
    setUserData({
      ...userData,
      billingAddress: {
        ...userData?.billingAddress,
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

  const handleBillingShippingAddress = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setUserData({
        ...userData,
        billingAddress: {
          ...userData?.billingAddress,
          companyaddress: userData?.address?.companyaddress,
          addressLineOne: userData?.address?.addressLineOne,
          addressLineTwo: userData?.address?.addressLineTwo,
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
          addressLineOne: "",
          addressLineTwo: "",
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

    // if (!billing.companyaddress?.trim())
    //   return { error: true, message: "Billing address cannot be empty" };
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
    // if (!info.companyInfo?.trim())
    //   return { error: true, message: "Dispatch email cannot be empty" };
    if (!info.phoneNumber?.trim())
      return { error: true, message: "Phone number cannot be empty" };

    if (!info.dispatchEmail?.trim())
      return { error: true, message: "Dispatch email cannot be empty" };
    const dispatchemails = info.dispatchEmail.split(",").map((email) => email.trim());
    const dispatchEmailValidation = dispatchemails.every((email) => emailValidity.test(email));
    if (!dispatchEmailValidation)
      return { error: true, message: "One or more dispatch emails are invalid." };

    if (!info.emailToSendInvoices?.trim())
      return { error: true, message: "Invoice email cannot be empty" };
    const emails = info.emailToSendInvoices.split(",").map((email) => email.trim());
    const emailValidation = emails.every((email) => emailValidity.test(email));
    if (!emailValidation)
      return { error: true, message: "One or more invoice emails are invalid." };

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
          addressLineOne: userData?.address?.addressLineOne,
          addressLineTwo: userData?.address?.addressLineTwo,
          town: userData?.address?.town,
          country: userData?.address?.country,
          state: userData?.address?.state,
          zipCode: userData?.address?.zipCode,
          status: true,
        }
      : {
          companyaddress: userData?.billingAddress?.companyaddress,
          addressLineOne: userData?.billingAddress?.addressLineOne,
          addressLineTwo: userData?.billingAddress?.addressLineTwo,
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
            email: userData?.info?.email,
            ...(userData?.info?.password?.trim() && {
              password: userData?.info?.password,
            }),
            status: userData?.info?.status,
            phoneNumber: userData?.info?.phoneNumber,
            countryCode: userData?.info?.countryCode
              ? userData.info.countryCode.startsWith("+")
                ? userData.info.countryCode
                : `+${userData.info.countryCode}`
              : "+1",
            saleTaxNumber: userData?.info?.saleTaxNumber,
            dispatchEmail: userData?.info?.dispatchEmail,
            emailToSendInvoices: userData?.info?.emailToSendInvoices,
            companyName: userData?.info?.companyName,
            // dispatchEmail: userData?.info?.companyInfo,
            registerBy: userData?.info?.registerBy,
            defaultDiscount: userData?.info?.defaultDiscount ?? null,
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
        }, "customer");
        if (res?.data?.status === "success") {
          setLoader(false);
          success_toaster("Customer updated successfully");
          window.history.back()
          // router.push(
          //   userType === "admin"
          //     ? "/customers"
          //     : "/sales-representative/customers"
          // );
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

  return customerData?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl font-inter font-semibold">Update Customer</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDiscountDlgOpen(true)}
              className="px-3 py-2 rounded-sm bg-theme text-white font-inter text-sm"
            >
              Update User Discount
            </button>
          </div>
      </div>
      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center gap-x-2">
          <button
            onClick={
              () => window.history.back()
              // router.push(
              //   userType === "admin"
              //     ? "/customers"
              //     : "/sales-representative/customers"
              // )
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
                        {/* <div className="flex flex-col gap-y-2">
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
                        </div> */}
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
                          <p className="font-black text-xl lg:text-2xl text-theme">Billing Address</p>
                          <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                            <div className="space-y-4">
                              {/* <div className="flex flex-col gap-y-2">
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
                              </div> */}
                              {/* Billing Address Line 1 */}
                              <div className="flex flex-col gap-y-2">
                                <label className="text-labelColor font-medium font-satoshi">Address Line 1</label>
                                <input
                                  type="text"
                                  name="addressLineOne"
                                  onChange={handleBillingAddress}
                                  value={userData?.billingAddress?.addressLineOne}
                                  placeholder="Enter address line 1"
                                  className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                />
                              </div>
                              {/* Billing Address Line 2 */}
                              <div className="flex flex-col gap-y-2">
                                <label className="text-labelColor font-medium font-satoshi">Address Line 2</label>
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
                                  <div className="flex flex-col gap-y-2">
                                    <label className="text-labelColor font-medium font-satoshi">Country</label>
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

                                  {/* State Select */}
                                  <div className="flex flex-col gap-y-2">
                                    <label className="text-labelColor font-medium font-satoshi">State</label>
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
                                  <div className="flex flex-col gap-y-2">
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
                                      placeholder="Enter town"
                                      className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                                      value={userData?.billingAddress?.town}
                                    />
                                  </div>

                                  {/* Zip Code Input */}
                                  <div className="flex flex-col gap-y-2">
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
                        name="dispatchEmail"
                        onChange={handleInfo}
                        value={userData?.info?.dispatchEmail}
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
                          <div className="flex flex-col gap-y-2">
                            <label className="text-labelColor font-medium font-satoshi">Discount (%)</label>
                            <input
                              type="number"
                              name="defaultDiscount"
                              value={userData?.info?.defaultDiscount ?? ""}
                              min={0}
                              max={100}
                              step={0.1}
                              placeholder="Enter discount"
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
                    {/* <div className="flex items-center gap-x-2">
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
                    </div> */}

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
                            <AiOutlineEyeInvisible size={24} color="#000000" />
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
                            <AiOutlineEyeInvisible size={24} color="#000000" />
                          )}
                        </button>
                      </div>
                    </div>
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
          <Dialog
            header="Update User Discount by Category"
            visible={discountDlgOpen}
            onHide={() => setDiscountDlgOpen(false)}
            className="w-[95vw] md:w-[720px]"
            dismissableMask
          >
            {catsError && (
              <p className="text-red-600 font-medium">Failed to load categories.</p>
            )}

            {catsLoading ? (
              <div className="py-6">
                <MiniLoader />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  User Discounts
                </label>

                <div className="border border-borderColor rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                  {!categories?.length ? (
                    <div className="text-sm text-gray-500">No categories found.</div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 items-center px-0.5">
                        <span className="text-xs text-secondary">Category</span>
                        <span className="text-xs text-secondary">Discount %</span>
                      </div>
                      {categories.map((cat) => {
                        const catId = cat?.id ?? cat?.categoryId;
                        const catName =
                          cat?.name || cat?.categoryName || `Category #${catId}`;

                        return (
                          <div key={catId} className="grid gap-3 sm:grid-cols-2 items-center">
                            <input
                              type="text"
                              readOnly
                              value={catName}
                              className="border border-borderColor rounded-[4px] px-2.5 py-3 bg-gray-50 text-black"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                placeholder={`Enter % for ${catName}`}
                                value={categoryDiscounts[catId] ?? ""}
                                onChange={(e) => handleDiscountChange(catId, e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="border border-borderColor rounded-[4px] px-2.5 py-3 text-black placeholder:text-secondary w-full"
                              />
                              {/* <span className="text-sm text-gray-700">%</span> */}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium mt-4">
              <button
                type="button"
                onClick={() => setDiscountDlgOpen(false)}
                className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow px-6"
                disabled={discountSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserDiscounts}
                disabled={discountSaving}
                className="rounded-lg border border-theme text-white px-10 bg-theme disabled:opacity-60"
              >
                {discountSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </Dialog>
      </div>
    </div>
  );
}
