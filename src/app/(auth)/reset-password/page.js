"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { IoCheckmark } from "react-icons/io5";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import MiniLoader from "@/components/ui/MiniLoader";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RETURN_URL } from "@/utilities/URL";
import api from "@/utilities/StatusErrorHandler";

export default function ResetPassword() {
  if (typeof window !== "undefined") {
    var userID = localStorage.getItem("userID") ?? "";
    var userType = localStorage.getItem("userType") ?? "";
  }
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [visibility, setVisibility] = useState({
    pass: false,
    confirmPass: false,
  });
  const [modal, setModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords?.newPassword.trim() === "") {
      info_toaster("Enter new password");
    } else if (passwords?.newPassword.trim().length < 6) {
      info_toaster("Password must be atleast 6 characters");
    } else if (passwords?.confirmPassword.trim() === "") {
      info_toaster("Confirm new password");
    } else if (passwords?.confirmPassword.trim().length < 6) {
      info_toaster("Confirm Password must be atleast 6 characters");
    } else if (
      passwords?.newPassword.trim() !== passwords?.confirmPassword.trim()
    ) {
      info_toaster("Password and Confirm password not matched");
    } else {
      setLoader(true);
      try {
        const res = await PostAPI(
          "api/v1/admin/reset-password" +
            (userType === "Local Partner"
              ? "/sales-rep"
              : userType === "Supplier"
              ? "/supplier"
              : ""),
          {
            id: userID,
            password: passwords?.newPassword,
            tokenId: localStorage.getItem("devToken"),
          }
        );
        if (res?.data?.status === "success") {
          setModal(true);
          setLoader(false);
          const user = res?.data?.data?.user || {};
          const loginType =
            userType === "Local Partner"
              ? "sales-rep"
              : userType === "Supplier"
                ? "supplier"
                : "admin";

          localStorage.setItem("accessToken", res?.data?.data?.token || "");
          localStorage.setItem("loginStatus", true);
          localStorage.setItem(
            "userName",
            loginType === "admin"
              ? user?.name
              : loginType === "supplier"
                ? user?.supplierName
                : loginType === "sales-rep"
                  ? user?.srName || user?.name
                  : user?.name
          );
          localStorage.setItem("email", user?.email || "");
          localStorage.setItem("partnerType", user?.partnerType || "");
          localStorage.setItem("userID", user?.id || "");
          localStorage.setItem(
            "userType",
            loginType === "sales-rep" ? "salesRepresentative" : loginType
          );

          if (Array.isArray(user?.permissions) && user?.permissions.length > 0) {
            localStorage.setItem(
              "permissions",
              JSON.stringify(user.permissions.map((p) => p.key))
            );
          } else {
            localStorage.setItem("permissions", "all");
          }
          localStorage.setItem("employeeId", user?.id || "");

          if (user?.employeeOf) {
            localStorage.setItem("isEmployee", "true");
            localStorage.setItem("employeeOf", user.employeeOf);
            try {
              const employeeId = user?.id;
              const stripeResponse = await api.post(
                `api/v1/admin/employee/${employeeId}/stripe-connect-account`,
                { returnUrl: RETURN_URL },
                { suppressSuccessToast: true }
              );
              if (stripeResponse?.data?.status === "success") {
                const stripeData = stripeResponse?.data?.data;
                if (stripeData?.accountId) {
                  localStorage.setItem("employeeStripeAccountId", stripeData.accountId);
                }
                if (stripeData?.accountState !== undefined) {
                  localStorage.setItem(
                    "employeeStripeAccountState",
                    stripeData.accountState.toString()
                  );
                }
                if (stripeData?.accountState === true && stripeData?.account) {
                  localStorage.setItem(
                    "employeeStripeAccount",
                    JSON.stringify(stripeData.account)
                  );
                } else if (
                  stripeData?.accountState === false &&
                  stripeData?.onboardingLink
                ) {
                  localStorage.setItem(
                    "employeeStripeOnboardingLink",
                    stripeData.onboardingLink
                  );
                }
              }
            } catch (error) {
              console.error("Error fetching Stripe Connect account:", error);
            }
          }

          if (loginType === "sales-rep") {
            localStorage.setItem("connectAccountId", user?.connectAccountId || "");
            localStorage.setItem("isAccountConnected", user?.isAccountConnected || "");
          }
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
            Reset Password
          </p>
          {loader ? (
            <MiniLoader />
          ) : (
            <div className="font-satoshi space-y-3 sm:space-y-4 pb-10">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-y-1.5 sm:gap-y-2 relative">
                    <label className="text-white font-medium text-sm sm:text-base">
                      New Password
                    </label>
                    <input
                      type={visibility?.pass ? "text" : "password"}
                      name="newPassword"
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter Password"
                      className="border border-borderColor text-themeLight rounded-[4px] outline-none px-3 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0 pr-10"
                    />
                    <div>
                      {" "}
                      {passwords?.newPassword.length > 0 &&
                        passwords?.newPassword.length < 6 && (
                          <div className="text-red-600 space-y-1 pb-1">
                            <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                            <p>Password must be atleast 6 characters</p>
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() =>
                        setVisibility({
                          ...visibility,
                          pass: !visibility?.pass,
                        })
                      }
                      type="button"
                      className="text-black absolute right-3 top-[2.65rem] touch-manipulation p-1"
                      aria-label={visibility?.pass ? "Hide password" : "Show password"}
                    >
                      {visibility?.pass ? (
                        <AiOutlineEye size={20} className="sm:w-6 sm:h-6" color="#000000" />
                      ) : (
                        <AiOutlineEyeInvisible size={20} className="sm:w-6 sm:h-6" color="#000000" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-y-1.5 sm:gap-y-2 relative">
                    <label className="text-white font-medium text-sm sm:text-base">
                      Confirm Password
                    </label>
                    <input
                      type={visibility?.confirmPass ? "text" : "password"}
                      name="confirmPassword"
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Enter Confirm Password"
                      className="border border-borderColor text-themeLight rounded-[4px] outline-none px-3 py-2.5 text-sm sm:text-base min-h-[40px] w-full min-w-0 pr-10"
                    />
                    <div>
                      {" "}
                      {passwords?.confirmPassword.length > 0 &&
                        passwords?.confirmPassword.length < 6 && (
                          <div className="text-red-600 space-y-1 pb-1 text-xs sm:text-sm">
                            <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                            <p>Confirm Password must be atleast 6 characters</p>
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() =>
                        setVisibility({
                          ...visibility,
                          confirmPass: !visibility?.confirmPass,
                        })
                      }
                      type="button"
                      className="text-black absolute right-3 top-[2.65rem] touch-manipulation p-1"
                      aria-label={visibility?.confirmPass ? "Hide password" : "Show password"}
                    >
                      {visibility?.confirmPass ? (
                        <AiOutlineEye size={20} className="sm:w-6 sm:h-6" color="#000000" />
                      ) : (
                        <AiOutlineEyeInvisible size={20} className="sm:w-6 sm:h-6" color="#000000" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="font-medium rounded-sm bg-theme text-white w-full py-2.5 sm:py-3 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    Done
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <Dialog
        visible={modal}
        // style={{ width: "70vw" }}
        breakpoints={{
          "1496px": "35vw",
          "1024px": "40vw",
          "768px": "80vw",
          "400px": "92vw",
          "200px": "96vw",
        }}
        // onHide={() => setModal(false)}
        closeIcon
        dismissableMask={true}
        header={
          <div className="text-white bg-[#28922E] size-16 rounded-full flex items-center justify-center mx-auto mt-5">
            <IoCheckmark size={50} />
          </div>
        }
      >
        <div className="space-y-4 p-5 flex flex-col items-center">
          {/* header */}
          <p className="font-inter font-bold text-xl text-center">
            Password Reset Successfully!
          </p>

          {/* body */}
          <button
            onClick={() => {
              success_toaster("Login Successfully");
              router.push("/");
            }}
            className="py-3 max-w-[500px] rounded-lg border border-theme text-white bg-theme font-satoshi w-full"
          >
            Login
          </button>
        </div>
      </Dialog>
    </div>
  );
}
