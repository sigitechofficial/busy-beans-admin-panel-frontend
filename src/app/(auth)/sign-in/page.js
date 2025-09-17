"use client";
import MiniLoader from "@/components/ui/MiniLoader";
import { loginSchema } from "@/schema";
import ErrorHandler from "@/utilities/ErrorHandler";
import { getMessagingInstance, onMessage } from "@/utilities/firebase";
// import { onMessage } from "firebase/messaging";
import { loginAPI } from "@/utilities/PostAPI";
import { requestDeviceToken } from "@/utilities/requestFCMToken";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useState } from "react";
import SIGN_IN from "./sign-in.testids";

export default function SignIn() {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
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

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema: loginSchema,
      onSubmit: async (values, action) => {
        setLoader(true);
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
            const user = res?.data?.data?.user;
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
            localStorage.setItem("userID", res?.data?.data?.user?.id);
            const normalizedUserType = type === "sales-rep" ? "salesRepresentative" : type;
            localStorage.setItem("userType", normalizedUserType);
            
            const isEmployee = Boolean(user?.employeeOf);
            if (isEmployee) {
              localStorage.setItem("isEmployee", "true");
              localStorage.setItem("employeeOf", user.employeeOf);
            } else {
              localStorage.removeItem("isEmployee");
              localStorage.removeItem("employeeOf");
            }
            
            if (isEmployee) {
              localStorage.setItem("permissions", "[]"); 
            } else if (
              normalizedUserType === "admin" ||
              normalizedUserType === "salesRepresentative"
            ) {
              localStorage.setItem("permissions", "all");
            } else if (Array.isArray(user?.permissions) && user.permissions.length > 0) {
              localStorage.setItem(
                "permissions",
                JSON.stringify(user.permissions.map((p) => p.key))
              );
            } else {
              localStorage.setItem("permissions", "[]");
            }

            localStorage.setItem("employeeId", user?.id);

            success_toaster("Login Successfully");
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
      <div className="grid sm:grid-cols-2 w-[80%] xl:w-3/5 backdrop-blur-md rounded-lg border border-theme [&>div]:px-6 sm:[&>div]:px-10 xl:[&>div]:px-14">
        {/* left side */}
        <div className=" flex flex-col justify-center items-center">
          <div className="w-40 sm:h-4/5 sm:w-full flex items-center justify-center">
            <img
              src="/images/logowhite.png"
              alt="logo_image"
              className="object-contain w-full sm:h-36"
            />
          </div>
          <p className="hidden sm:flex items-center justify-between font-switzer text-white text-sm font-normal">
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
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="password"
                    className="border border-inputBorder rounded-lg outline-none px-3 py-2"
                    data-testid={SIGN_IN.passwordInput}
                  />
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
                    > Forgot Password?</Link>
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
                  className="bg-theme text-white hover:bg-white hover:text-theme border border-theme outline-none duration-150 font-satoshi py-2 rounded-lg w-full font-medium"
                  data-testid={SIGN_IN.submitBtn}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
