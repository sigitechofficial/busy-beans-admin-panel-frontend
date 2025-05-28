"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import { passwordStrength } from "@/utilities/AuthValidation";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { emailValidity } from "@/utilities/Validations";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaLongArrowAltLeft } from "react-icons/fa";

export default function page() {
  const router = useRouter();
  const [step, setStep] = useState(3);
  const [loader, setLoader] = useState(false);
  const [visibility, setVisibility] = useState({
    pass: false,
    confirmPass: false,
  });
  const [userData, setUserData] = useState({
    info: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      status: true,
      phoneNumber: "",
      saleTaxNumber: "",
      emailToSendInvoices: "",
      companyName: "",
      companyInfo: "",
    },
    address: {
      companyaddress: "",
      addressLineOne: "",
      addressLineTwo: "",
      town: "",
      zipCode: "",
      country: "",
      state: "",
      status: true,
    },
  });
  // console.log("🚀 ~ SignUpStep1 ~ userData:", userData);

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

  const handleStep1 = () => {
    if (userData?.address?.companyaddress.trim() === "") {
      info_toaster("Company address cannot be empty");
    } else if (userData?.address?.addressLineOne.trim() === "") {
      info_toaster("address Line 1 cannot be empty");
    } else if (userData?.address?.addressLineTwo.trim() === "") {
      info_toaster("address Line 2 cannot be empty");
    } else if (userData?.address?.town.trim() === "") {
      info_toaster("Town cannot be empty");
    } else if (userData?.address?.zipCode.trim() === "") {
      info_toaster("Zip code cannot be empty");
    } else if (userData?.address?.country.trim() === "") {
      info_toaster("Country name cannot be empty");
    } else if (userData?.address?.state.trim() === "") {
      info_toaster("State name cannot be empty");
    } else {
      success_toaster("Step 1 completed successfully");
      setStep(2);
    }
  };

  const handleStep2 = () => {
    if (!userData?.info?.companyName.trim()) {
      info_toaster("Company Name cannot be empty");
    } else if (!userData?.info?.companyInfo.trim()) {
      info_toaster("Company Info cannot be empty");
    } else if (!userData?.info?.phoneNumber.trim()) {
      info_toaster("Phone number cannot be empty");
    } else if (!userData?.info?.emailToSendInvoices.trim()) {
      info_toaster("Invoice email cannot be empty");
    } else if (
      !emailValidity.test(userData?.info?.emailToSendInvoices.trim())
    ) {
      info_toaster("Invalid email format");
    } else {
      success_toaster("Step 2 completed successfully");
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData?.info?.name.trim() === "") {
      info_toaster("Name cannot be empty");
    } else if (userData?.info?.email.trim() === "") {
      info_toaster("Email cannot be empty");
    } else if (!emailValidity.test(userData?.info?.email.trim())) {
      info_toaster("Invalid Email");
    } else if (userData?.info?.password.trim().length < 6) {
      info_toaster("Password must be of minimum 6");
    } else if (
      !passwordStrength?.weak?.test(userData?.info?.password.trim()) ||
      !passwordStrength?.medium?.test(userData?.info?.password.trim()) ||
      !passwordStrength?.strong?.test(userData?.info?.password.trim())
    ) {
      info_toaster("Password must be Strong");
    } else if (userData?.info?.confirmPassword.trim() === "") {
      info_toaster("Enter password again");
    } else if (
      userData?.info?.password.trim() !== userData?.info?.confirmPassword.trim()
    ) {
      info_toaster("Password and confirm password must be same");
    } else {
      try {
        setLoader(true);
        const res = await SignupAPI("api/v1/users/signup", {
          info: {
            name: userData?.info?.name,
            email: userData?.info?.email,
            password: userData?.info?.password,
            status: true,
            phoneNumber: userData?.info?.phoneNumber,
            saleTaxNumber: userData?.info?.saleTaxNumber,
            emailToSendInvoices: userData?.info?.emailToSendInvoices,
            companyName: userData?.info?.companyName,
            companyInfo: userData?.info?.companyInfo,
          },
          address: {
            companyaddress: userData?.address?.companyaddress,
            addressLineOne: userData?.address?.addressLineOne,
            addressLineTwo: userData?.address?.addressLineTwo,
            town: userData?.address?.town,
            zipCode: userData?.address?.zipCode,
            country: userData?.address?.country,
            state: userData?.address?.state,
            status: true,
          },
        });
        if (res?.data?.status === "success") {
          router.push("/verify-email");
          setLoader(false);
          success_toaster(res?.data?.data?.message);
          localStorage.setItem("userName", res?.data?.data?.data?.name);
          localStorage.setItem("userID", res?.data?.data?.data?.id);
          localStorage.setItem("userEmail", res?.data?.data?.data?.email);
          localStorage.setItem("addressId", res?.data?.data?.data?.address?.id);
          localStorage.setItem("otpStatus", "signUp");
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
      <h2 className="text-xl lg:text-2xl font-inter font-semibold">
        Add New Customer
      </h2>

      {/* main section start */}
      <div className="lg:gap-x-12 xl:gap-16 relative px-5 md:px-10 xl:px-14 py-5 md:py-8 xl:py-10 shadow-tableShadow border border-borderColor rounded-sm gap-y-4">
        {(step === 2 || step === 3) && !loader && (
          <button
            onClick={() => setStep(step - 1)}
            className="absolute left-5 top-2 flex justify-center items-center w-8 h-8 text-theme rounded-full hover:bg-theme hover:text-white hover:text-theme duration-200"
          >
            <FaLongArrowAltLeft size={30} />
          </button>
        )}
        {/* <div className="w-60 md:w-72 lg:w-80">
            <img
              src="/images/logocoffee.png"
              alt="logo"
              className="h-full w-full object-contain"
            />
          </div> */}

        {loader ? (
          <MiniLoader />
        ) : (
          <div>
            {/* <p className="font-satoshi text-theme font-black text-2xl lg:text-3xl text-center">
                Welcome to Busy Bean Coffee
              </p> */}
            {step === 1 && (
              <div className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme">
                  1. Company Address
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Company Address
                      </label>
                      <input
                        type="text"
                        name="companyaddress"
                        onChange={handleAddress}
                        value={userData?.address?.companyaddress}
                        placeholder="Enter company address"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
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
                            Town / City
                          </label>
                          <input
                            type="text"
                            name="town"
                            onChange={handleAddress}
                            value={userData?.address?.town}
                            placeholder="Enter Town / City"
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
                      <div className="md:grid md:grid-cols-2 gap-x-4 max-md:space-y-4">
                        <div className="flex flex-col gap-y-2">
                          <label className="text-labelColor font-medium font-satoshi">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            onChange={handleAddress}
                            value={userData?.address?.country}
                            placeholder="Enter Country"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                        </div>
                        <div className="flex flex-col gap-y-2">
                          <label className="text-labelColor font-medium font-satoshi">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            onChange={handleAddress}
                            value={userData?.address?.state}
                            placeholder="Enter State"
                            className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleStep1}
                        className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
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
                        placeholder="Enter Company Name"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Company Info
                      </label>
                      <input
                        type="text"
                        name="companyInfo"
                        onChange={handleInfo}
                        value={userData?.info?.companyInfo}
                        placeholder="Enter Company Info"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Phone Number
                      </label>
                      <input
                        type="number"
                        name="phoneNumber"
                        onChange={handleInfo}
                        value={userData?.info?.phoneNumber}
                        placeholder="Enter Phone Number"
                        className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
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
                          Email to send invoices
                        </label>
                        <input
                          type="email"
                          name="emailToSendInvoices"
                          onChange={handleInfo}
                          value={userData?.info?.emailToSendInvoices}
                          placeholder="Enter Email"
                          className="border border-borderColor text-black focus:border-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={handleStep2}
                        className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="font-satoshi space-y-4">
                <p className="font-black text-xl lg:text-2xl text-theme">
                  3. User Details
                </p>
                <div className="grid xl:grid-cols-2 gap-y-4 lg:gap-x-12 xl:gap-16">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Your Name
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
                        Email Address
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
                          className="text-black absolute right-4 top-10"
                        >
                          {visibility?.pass ? (
                            <AiOutlineEye size={24} color="#ffffff" />
                          ) : (
                            <AiOutlineEyeInvisible size={24} color="#ffffff" />
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
                          className="text-black absolute right-4 top-10"
                        >
                          {visibility?.confirmPass ? (
                            // <AiOutlineEye size={24} color="#ffffff" />
                            <h1>hamza </h1>
                          ) : (
                            <h1>hamza </h1>
                            // <AiOutlineEyeInvisible size={24} color="#ffffff" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="font-inter font-medium rounded-sm text-buttonTextColor bg-theme w-full py-3"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
