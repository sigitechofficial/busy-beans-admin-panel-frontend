"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import { loginSchema } from "@/schema";
import ErrorHandler from "@/utilities/ErrorHandler";
import { getMessagingInstance, onMessage } from "@/utilities/firebase";
import { loginAPI } from "@/utilities/PostAPI";
import { requestDeviceToken } from "@/utilities/requestFCMToken";
import { error_toaster, success_toaster, info_toaster } from "@/utilities/Toaster";
import { BASE_URL, RECAPTCHA_SITE_KEY, RETURN_URL } from "@/utilities/URL";
import api from "@/utilities/StatusErrorHandler";
import { useFormik } from "formik";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useRef, useState } from "react";
import SIGN_IN from "./sign-in.testids";
import Script from "next/script";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SignIn() {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [type, setType] = useState("admin"); // sales-rep, admin, supplier
  const initialValues = {
    email: "",
    password: "",
  };

  useEffect(() => {
    getMessagingInstance().then((messaging) => {
      if (messaging) {
        onMessage(messaging, (payload) => {
          console.log("📩 Foreground message:", payload);

          success_toaster("Firebase Notification here");
        });
      }
    });

    // Request Device Token
    requestDeviceToken();
  }, []);

  // const handleConnectAccountID = (srId) => {
  //   try {
  //     const res = axios.get(
  //       BASE_URL + `api/v1/admin/create-stripe-connect-account/${srId}`
  //     );
  //     console.log("🚀 ~ handleConnectAccountID ~ res:", res?.data?.data);
  //     if (res?.data?.status === "success") {
  //       success_toaster("API success");
  //     } else {
  //       throw new Error(res?.data?.message || "An unexpected error occurred.");
  //     }
  //   } catch (error) {
  //     ErrorHandler(error);
  //   }
  // };

  const validateRecaptcha = async () => {
    // Generate reCAPTCHA token
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {
      action: "submit",
    });

    if (!token) {
      error_toaster("reCAPTCHA is not ready");
      return;
    }

    const res = await fetch("/api/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (data.success) return true;
    else false;
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema: loginSchema,
      onSubmit: async (values, action) => {
        setLoader(true);
        let captchaRes = await validateRecaptcha();

        if (!captchaRes) {
          error_toaster("Bot Detection");
          setLoader(false);
          return;
        }
        try {
          let res = await loginAPI(
            type === "admin"
              ? "api/v1/admin/login"
              : `api/v1/admin/login/${type}`,
            {
              email: values.email,
              password: values.password,
              tokenId: localStorage.getItem("devToken"),
            }
          );
          if (res?.data?.status === "success") {
            setLoader(false);

            router.push("/");
            localStorage.setItem("accessToken", res?.data?.data?.token);
            localStorage.setItem("loginStatus", true);
            localStorage.setItem(
              "userName",
              type === "admin"
                ? res?.data?.data?.user?.name
                : type === "supplier"
                ? res?.data?.data?.user?.supplierName
                : type === "sales-rep"
                ? res?.data?.data?.user?.srName || res?.data?.data?.user?.name
                : res?.data?.data?.user?.name
            );

            localStorage.setItem("email", res?.data?.data?.user?.email);
            localStorage.setItem(
              "partnerType",
              res?.data?.data?.user?.partnerType
            );
            localStorage.setItem("userID", res?.data?.data?.user?.id);
            localStorage.setItem(
              "userType",
              type === "sales-rep" ? "salesRepresentative" : type
            );

            if (
              Array.isArray(res?.data?.data?.user?.permissions) &&
              res?.data?.data?.user?.permissions.length > 0
            ) {
              localStorage.setItem(
                "permissions",
                JSON.stringify(
                  res?.data?.data?.user?.permissions.map((p) => p.key)
                )
              );
            } else {
              localStorage.setItem("permissions", "all");
            }
            localStorage.setItem("employeeId", res?.data?.data?.user?.id);

            let shouldRedirectToOnboarding = false;

            if (res?.data?.data?.user?.employeeOf) {
              localStorage.setItem("isEmployee", "true");
              localStorage.setItem(
                "employeeOf",
                res?.data?.data?.user?.employeeOf
              );
              
              // Call Stripe Connect Account API for employee
              try {
                const employeeId = res?.data?.data?.user?.id;
                const stripeResponse = await api.post(
                  `api/v1/admin/employee/${employeeId}/stripe-connect-account`,
                  {
                    returnUrl: RETURN_URL,
                  },
                  {
                    suppressSuccessToast: true,
                  }
                );
                
                // Handle Stripe Connect Account response
                if (stripeResponse?.data?.status === "success") {
                  const stripeData = stripeResponse?.data?.data;
                  
                  // Store account ID
                  if (stripeData?.accountId) {
                    localStorage.setItem("employeeStripeAccountId", stripeData.accountId);
                  }
                  
                  // Store account state
                  if (stripeData?.accountState !== undefined) {
                    localStorage.setItem("employeeStripeAccountState", stripeData.accountState.toString());
                  }
                  
                  // Scenario A: Account is active
                  if (stripeData?.accountState === true) {
                    // Account is fully connected and active
                    if (stripeData?.account) {
                      localStorage.setItem("employeeStripeAccount", JSON.stringify(stripeData.account));
                    }
                  }
                  // Scenario B & C: Account exists but not active OR new account created
                  else if (stripeData?.accountState === false && stripeData?.onboardingLink) {
                    // Store onboarding link for later use
                    localStorage.setItem("employeeStripeOnboardingLink", stripeData.onboardingLink);
                    // Show info message about pending onboarding
                    info_toaster(stripeData?.message || "Stripe account setup required");
                    // Set flag to redirect
                    shouldRedirectToOnboarding = true;
                    // Navigate to onboarding link
                    window.location.href = stripeData.onboardingLink;
                  }
                }
              } catch (error) {
                // Silently handle error - don't block login if this fails
                console.error("Error fetching Stripe Connect account:", error);
              }
            }
            
            // Only show success toast if not redirecting to onboarding
            if (!shouldRedirectToOnboarding) {
              success_toaster("Login Successfully");
            }
            if (type === "sales-rep") {
              localStorage.setItem(
                "connectAccountId",
                res?.data?.data?.user?.connectAccountId
              );
              localStorage.setItem(
                "isAccountConnected",
                res?.data?.data?.user?.isAccountConnected
              );
              // handleConnectAccountID(res?.data?.data?.user?.id);
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
        action.resetForm();
      },
    });
  return (
    <div className="bg-signInBackgroundImage bg-cover min-h-screen flex items-center justify-center">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <div className="grid sm:grid-cols-2 w-[80%] xl:w-3/5 backdrop-blur-md rounded-lg border border-theme [&>div]:px-6 sm:[&>div]:px-10 xl:[&>div]:px-14">
        {/* left side */}
        <div className=" flex flex-col justify-center items-center">
          <div className="w-40 sm:h-4/5 sm:w-full flex items-center justify-center">
            <Image
              src="/images/logowhite.png"
              alt="logo_image"
              width={200}
              height={144}
              className="object-contain w-full sm:h-36"
              priority
            />
          </div>

          <p className="hidden sm:flex items-center justify-between font-switzer text-white text-sm font-normal gap-x-2">
            <Link href="">Terms of Services</Link>
            <Link href="">Privacy Policy</Link>
            <Link href="">Help & Suppport</Link>
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col py-10 xl:py-16 border-l-2 border-theme gap-y-5 sm:gap-y-10">
          <h1 className="font-satoshi font-black text-white text-xl lg:text-3xl">
            Sign In to Busy Bean
          </h1>

          {loader ? (
            <MiniLoader />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-2">
                  <label className="text-white font-medium font-satoshi">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Email"
                    className="border border-inputBorder rounded-lg outline-none px-3 py-2"
                    data-testid={SIGN_IN.emailInput}
                  />
                  <div className={errors.email && touched.email}>
                    {errors.email && touched.email && (
                      <div className=" text-red-600 space-y-1 pb-1">
                        <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                        <p>{errors.email}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-white font-medium font-satoshi">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="password"
                      className="border border-inputBorder rounded-lg outline-none px-3 py-2 pr-10 w-full"
                      data-testid={SIGN_IN.passwordInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible size={20} />
                      ) : (
                        <AiOutlineEye size={20} />
                      )}
                    </button>
                  </div>
                  <div className={errors.password && touched.password}>
                    {" "}
                    {errors.password && touched.password && (
                      <div className="text-red-600 space-y-1 pb-1">
                        <hr className="border-none h-0.5 bg-white bg-opacity-20" />
                        <p>{errors.password}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm text-end font-normal">
                    <Link
                      href={"/forgot-password"}
                      data-testid={SIGN_IN.forgotPasswordLink}
                    >
                      {" "}
                      Forgot Password?
                    </Link>
                  </p>
                </div>
                <div className="flex flex-col  gap-2 text-white font-inter font-normal">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="admin"
                      name="admin"
                      value="admin"
                      checked={type === "admin" ?? false}
                      onClick={() => setType("admin")}
                      data-testid={SIGN_IN.adminChk}
                    />
                    <label htmlFor="admin" className="ml-2 font-inter">
                      Admin
                    </label>
                  </div>
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="supplier"
                      name="supplier"
                      value="supplier"
                      checked={type === "supplier" ?? false}
                      onClick={() => setType("supplier")}
                      data-testid={SIGN_IN.supplierChk}
                    />
                    <label htmlFor="supplier" className="ml-2 font-inter">
                      Supplier
                    </label>
                  </div>
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="sales-rep"
                      name="sales-rep"
                      value="sales-rep"
                      checked={type === "sales-rep" ?? false}
                      onClick={() => setType("sales-rep")}
                      data-testid={SIGN_IN.salesRepChk}
                    />
                    <label htmlFor="sales-rep" className="ml-2 font-inter">
                      Local Partner
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loader}
                  className="bg-theme text-white hover:bg-white hover:text-theme border border-theme outline-none duration-150 font-satoshi py-2 rounded-lg w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-theme disabled:hover:text-white flex items-center justify-center gap-2"
                  data-testid={SIGN_IN.submitBtn}
                >
                  {loader && (
                    <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                  )}
                  {loader ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
