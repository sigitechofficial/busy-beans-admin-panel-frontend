"use client";

import MiniLoader from "@/components/ui/MiniLoader";
import ErrorHandler from "@/utilities/ErrorHandler";
import { PostAPI } from "@/utilities/PostAPI";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { RETURN_URL } from "@/utilities/URL";
import api from "@/utilities/StatusErrorHandler";
import { broadcastEmployeeStripeConnected } from "@/utilities/stripeSyncChannel";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const getTypeSuffix = (loginType) => {
  if (loginType === "sales-rep") return "/sales-rep";
  if (loginType === "supplier") return "/supplier";
  return "";
};

export default function VerifyLoginOtp() {
  const router = useRouter();
  const [timer, setTimer] = useState(60);
  const [loader, setLoader] = useState(false);
  const inputRefs = useRef([]);

  const loginOtpUserId =
    typeof window !== "undefined" ? localStorage.getItem("loginOtpUserId") : "";
  const loginOtpEmail =
    typeof window !== "undefined" ? localStorage.getItem("loginOtpEmail") : "";
  const loginOtpContext =
    typeof window !== "undefined"
      ? localStorage.getItem("loginOtpContext") || "login"
      : "login";
  const loginOtpType =
    typeof window !== "undefined" ? localStorage.getItem("loginOtpType") : "";

  const clearLoginOtpCache = () => {
    localStorage.removeItem("loginOtpUserId");
    localStorage.removeItem("loginOtpEmail");
    localStorage.removeItem("loginOtpEntity");
    localStorage.removeItem("loginOtpContext");
    localStorage.removeItem("loginOtpType");
  };

  const handleResendOtp = async () => {
    if (!loginOtpEmail) {
      info_toaster("Email not found. Please login again.");
      router.push("/sign-in");
      return;
    }
    setTimer(60);
    try {
      const suffix = getTypeSuffix(loginOtpType);
      const res = await PostAPI(`api/v1/admin/resend-otp${suffix}`, {
        email: loginOtpEmail,
        context: "login",
      });
      if (res?.data?.status === "success" || res?.data?.status === true) {
        success_toaster(res?.data?.message || "OTP sent successfully");
      } else {
        throw new Error(res?.data?.message || "Unable to resend OTP.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = `${inputRefs.current[0]?.value || ""}${inputRefs.current[1]?.value || ""}${inputRefs.current[2]?.value || ""}${inputRefs.current[3]?.value || ""}`;
    if (otp.length !== 4 || !loginOtpUserId) return;

    setLoader(true);
    try {
      const suffix = getTypeSuffix(loginOtpType);
      const res = await PostAPI(`api/v1/admin/otp-verification${suffix}`, {
        id: Number(loginOtpUserId),
        otp,
        context: loginOtpContext || "login",
        tokenId: localStorage.getItem("devToken"),
      });

      if (res?.data?.status === "success" || res?.data?.status === true) {
        const loginType = loginOtpType || "admin";
        const user = res?.data?.data?.user || {};
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
                : user?.name,
        );
        localStorage.setItem("email", user?.email || "");
        localStorage.setItem("partnerType", user?.partnerType || "");
        localStorage.setItem("userID", user?.id || "");
        localStorage.setItem(
          "userType",
          loginType === "sales-rep" ? "salesRepresentative" : loginType,
        );
        if (Array.isArray(user?.permissions) && user?.permissions.length > 0) {
          localStorage.setItem(
            "permissions",
            JSON.stringify(user.permissions.map((p) => p.key)),
          );
        } else {
          localStorage.setItem("permissions", "all");
        }
        localStorage.setItem("employeeId", user?.id || "");

        let shouldRedirectToOnboarding = false;

        if (user?.employeeOf) {
          localStorage.setItem("isEmployee", "true");
          localStorage.setItem("employeeOf", user.employeeOf);
          try {
            const employeeId = user?.id;
            const stripeResponse = await api.post(
              `api/v1/admin/employee/${employeeId}/stripe-connect-account`,
              { returnUrl: RETURN_URL },
              { suppressSuccessToast: true },
            );

            if (stripeResponse?.data?.status === "success") {
              const stripeData = stripeResponse?.data?.data;
              if (stripeData?.accountId) {
                localStorage.setItem(
                  "employeeStripeAccountId",
                  stripeData.accountId,
                );
              }
              if (stripeData?.accountState !== undefined) {
                localStorage.setItem(
                  "employeeStripeAccountState",
                  stripeData.accountState.toString(),
                );
              }
              if (stripeData?.accountState === true) {
                localStorage.removeItem(
                  "employeeStripeConnectionInProgress",
                );
                localStorage.removeItem("employeeStripeOnboardingLink");
                if (stripeData?.account) {
                  localStorage.setItem(
                    "employeeStripeAccount",
                    JSON.stringify(stripeData.account),
                  );
                }
                broadcastEmployeeStripeConnected({
                  accountState: true,
                  accountId: stripeData?.accountId,
                });
              } else if (
                stripeData?.accountState === false &&
                stripeData?.onboardingLink
              ) {
                localStorage.setItem(
                  "employeeStripeOnboardingLink",
                  stripeData.onboardingLink,
                );
                localStorage.setItem(
                  "employeeStripeConnectionInProgress",
                  "true",
                );
                info_toaster(
                  stripeData?.message || "Stripe account setup required",
                );
                shouldRedirectToOnboarding = true;
                window.open(
                  stripeData.onboardingLink,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            }
          } catch (error) {
            console.error("Error fetching Stripe Connect account:", error);
          }
        }

        if (loginType === "sales-rep") {
          localStorage.setItem("connectAccountId", user?.connectAccountId || "");
          localStorage.setItem(
            "isAccountConnected",
            user?.isAccountConnected || "",
          );
        }
        clearLoginOtpCache();
        if (!shouldRedirectToOnboarding) {
          success_toaster(res?.data?.message || "Login Successfully");
          router.push("/");
        }
      } else {
        throw new Error(res?.data?.message || "OTP verification failed.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoader(false);
    }
  };

  const handleInput = (event, index) => {
    const value = event.target.value;
    if (value.length > 1) event.target.value = value.slice(0, 1);
    if (event.target.value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    if (
      inputRefs.current[0]?.value?.length === 1 &&
      inputRefs.current[1]?.value?.length === 1 &&
      inputRefs.current[2]?.value?.length === 1 &&
      inputRefs.current[3]?.value?.length === 1
    ) {
      handleVerifyOtp();
    }
  };

  const handleKeyDown = (event, index) => {
    const value = event.target.value;
    if (event.key === "Backspace" && value.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
      inputRefs.current[index - 1].value = "";
    }
  };

  useEffect(() => {
    if (!loginOtpUserId || !loginOtpEmail) {
      router.push("/sign-in");
      return;
    }
    inputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const timeout = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timeout);
  }, [timer]);

  return (
    <div className="min-h-screen bg-themeLight py-4 sm:py-5 px-3 sm:px-4 flex items-center justify-center overflow-x-hidden">
      <div className="border border-theme rounded-xl bg-themeDark w-full min-w-0 max-w-[calc(100vw-1.5rem)] sm:max-w-none sm:w-4/6 md:w-[70%] lg:w-3/5 xl:w-2/4 py-5 sm:py-6 flex flex-col items-center gap-y-3 sm:gap-y-4 px-3 sm:px-0">
        <div className="w-36 sm:w-60 md:w-72 lg:w-80 shrink-0">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full w-full object-contain"
          />
        </div>
        {loader ? (
          <MiniLoader />
        ) : (
          <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full sm:w-11/12 md:w-[70%] lg:w-3/5 px-1 sm:px-0">
            <p className="font-satoshi text-white font-black text-xl sm:text-2xl lg:text-3xl text-center">
              Verify Login OTP
            </p>
            <p className="font-normal text-center text-white/60 font-satoshi text-sm sm:text-base break-words">
              Please enter the 4 digit code sent to {loginOtpEmail}
            </p>
            <div className="font-satoshi space-y-3 sm:space-y-4">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4 sm:space-y-6 flex flex-col justify-between"
              >
                <div className="flex justify-center items-center gap-x-1.5 sm:gap-x-3 md:gap-x-6 [&>input]:w-12 [&>input]:h-14 sm:[&>input]:w-16 sm:[&>input]:h-[72px] md:[&>input]:w-20 md:[&>input]:h-[88px] [&>input]:rounded-lg [&>input]:border [&>input]:border-themePlaceholder [&>input]:border-opacity-60 [&>input]:text-4xl sm:[&>input]:text-5xl md:[&>input]:text-6xl [&>input]:text-center [&>input]:flex [&>input]:items-center [&>input]:justify-center [&>input]:min-w-0">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <input
                      key={index}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      onInput={(e) => handleInput(e, index)}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                        handleKeyDown(e, index);
                      }}
                      onPaste={(e) => {
                        const paste = e.clipboardData.getData("text");
                        if (!/^\d+$/.test(paste)) e.preventDefault();
                      }}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="input-code pe-0.5 sm:pe-1.5"
                    />
                  ))}
                </div>
                <div className="space-y-2 [&>p]:text-center flex justify-center flex-col items-center">
                  <p className="text-white/60 text-sm sm:text-base">
                    00:{timer < 10 ? `0${timer}` : timer}
                  </p>
                  <button
                    type="button"
                    disabled={timer !== 0}
                    onClick={handleResendOtp}
                    className="text-base sm:text-lg text-theme disabled:cursor-not-allowed underline touch-manipulation py-1"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

