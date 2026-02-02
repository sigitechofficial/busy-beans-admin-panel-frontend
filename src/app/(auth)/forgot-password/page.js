"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PostAPI } from "@/utilities/PostAPI";
import selectStyles, {
  drawerSelectStyles,
  selectStyles2,
} from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState({
    value: "",
    label: "",
  });
  const [loader, setLoader] = useState(false);

  const options = [
    { value: "/", label: "Admin" },
    { value: "/sales-rep", label: "Local Partner" },
    { value: "/supplier", label: "Supplier" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      info_toaster("email cannot be empty");
    } else if (userType?.value === "") {
      info_toaster("Select User Type");
    } else {
      setLoader(true);
      try {
        const res = await PostAPI(
          `api/v1/admin/forgot-password` + userType?.value,
          {
            email: email,
          }
        );
        if (res?.data?.status === "success") {
          setLoader(false);
          router.push("/verify-email");
          localStorage.setItem("userEmail", res?.data?.data?.email);
          localStorage.setItem("userID", res?.data?.data?.id);
          localStorage.setItem("userType", userType?.label);
        //   localStorage.setItem("otpStatus", "forgotPassword");
          success_toaster("OTP send successfully");
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
    <div className="min-h-screen bg-themeLight py-4 sm:py-5 px-3 sm:px-4 flex items-center justify-center overflow-x-hidden">
      {/* main section start */}
      <div className="border border-theme rounded-xl bg-themeDark w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-none sm:w-4/6 md:w-[70%] lg:w-3/5 xl:w-2/4 py-5 sm:py-6 flex flex-col items-center gap-y-3 sm:gap-y-4 px-3 sm:px-0">
        <div className="w-36 sm:w-60 md:w-72 lg:w-80 shrink-0">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full sm:w-11/12 md:w-[70%] lg:w-3/5 px-1 sm:px-0">
          <p className="font-satoshi text-white font-black text-xl sm:text-2xl lg:text-3xl text-center">
            Forgot Password
          </p>
          <p className="font-normal text-center text-white/60 font-satoshi text-sm sm:text-base">
            Add your email and we will send you a one time password (OTP)
          </p>
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="font-satoshi space-y-3 sm:space-y-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-y-1.5 sm:gap-y-2">
                    <label className="text-white font-medium text-sm sm:text-base">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email"
                      className="border border-borderColor text-themeLight rounded-[4px] outline-none px-3 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1.5 sm:gap-y-2">
                    <label className="text-white font-medium text-sm sm:text-base">
                      Select User Type
                    </label>
                    <Select
                      placeholder="Select User Type"
                      className="w-full min-w-0"
                      value={userType?.value ? userType : null}
                      styles={drawerSelectStyles}
                      options={options}
                      onChange={(e) => {
                        setUserType(e);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="font-medium rounded-[4px] bg-theme text-white w-full py-2.5 sm:py-3 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    Continue
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
