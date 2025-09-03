"use client";
import Charts from "@/components/ui/Charts";
import HomeCards from "@/components/ui/HomeCards";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
import axios from "axios";
import { useEffect, useState, useRef, useMemo } from "react";
import { BsCardList } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import { PiHandbagFill, PiUsersThreeBold } from "react-icons/pi";
import { MdCancel } from 'react-icons/md'; 
import { loadStripe } from "@stripe/stripe-js";
import Loader from "@/components/ui/Loader";
import api from "@/utilities/StatusErrorHandler";
import { hasPermission } from "@/utilities/Permission";
// ✅ Required since PrimeReact requires Client Components

export default function Home() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var userName = localStorage.getItem("userName");
    var userID = localStorage.getItem("userID");
    var connectAccountId = localStorage.getItem("connectAccountId");
    var isAccountConnected = localStorage.getItem("isAccountConnected");
    var isEmployee = localStorage.getItem("isEmployee") === "true";
    var url = window.location.href;
    var windowClose = window;
  }

  const [showBankRetry, setShowBankRetry] = useState(false);
  const didInitRef = useRef(false);
  const [linking, setLinking] = useState(false);

  // const { data } = GetAPI(
  //   userType === "admin"
  //     ? "api/v1/admin/dashboard"
  //     : userType === "salesRepresentative"
  //     ? `api/v1/admin/sales-rep-dashboard/${userID}`
  //     : `api/v1/admin/supplier-dashboard/${userID}`
  // );

  const EMPLOYEE_API_MAP = {
    admin: "api/v1/admin/dashboard/admin-employee",
    "local partner": "api/v1/admin/dashboard/local-partner-employee"
  };

  const dashboardEndpoint = useMemo(() => {
    if (isEmployee) {
      const employeeOf = (localStorage.getItem("employeeOf") || "").toLowerCase().trim();
      return EMPLOYEE_API_MAP[employeeOf] || null;
    }

    if (userType === "admin") return "api/v1/admin/dashboard";
    if (userType === "salesRepresentative")
      return `api/v1/admin/sales-rep-dashboard/${userID}`;
    if (userType === "supplier")
      return `api/v1/admin/supplier-dashboard/${userID}`;

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, userID, isEmployee]);

  const { data } = dashboardEndpoint ? GetAPI(dashboardEndpoint, 'dashboard') : { data: null };
  
  const supplierDashboard = data?.data?.dashboard || {}; 
  const { totalOrders, dispatchedToSupplierOrders, acknowledgedOrders, shippedOrders, deliveredOrders, cancelledOrders } = supplierDashboard;

  const topProducts = data?.data?.topProducts || []; 
  // console.log("Top Products:", topProducts);

  const handleConnectAccount = async () => {
    const path = url.split("/");
    if (isAccountConnected === "false" && connectAccountId !== "null") {
      try {
        const res = await axios.post(
          BASE_URL + `api/v1/admin/stripe-connect-account-url/${userID}`,
          {
            returnUrl: "https://" + path[2].trim(),
          }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          // localStorage.setItem("isAccountConnected", true);
          if (res?.data?.data?.data?.connectAccount) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.connectAccount;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (
      (connectAccountId === "null" || !connectAccountId) &&
      isAccountConnected === "false"
    ) {
      try {
        const res = await axios.post(
          BASE_URL + `api/v1/admin/create-stripe-connect-account/${userID}`,
          {
            returnUrl: "https://" + path[2].trim(),
          }
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          localStorage.setItem(
            "connectAccountId",
            res?.data?.data?.data?.accountId
          );
          if (res?.data?.data?.data?.accountLink?.url) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.accountLink?.url;
            link.target = "_self";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else if (
      (connectAccountId !== "null" || !connectAccountId) &&
      isAccountConnected === "true"
    ) {
      try {
        const res = await axios.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-dashboard/${userID}`
        );
        if (res?.data?.status === "success") {
          success_toaster(res?.data?.data?.message);
          if (res?.data?.data?.data?.connectAccount) {
            const link = document.createElement("a");
            link.href = res?.data?.data?.data?.connectAccount;
            link.target = "_blank";
            link.click();
          }
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }
  };

  // const handleFinancialConnection = async () => {
  //   try {
  //     // Step 1: Create Stripe Financial Connections Session
  //     const res = await axios.post(
  //       BASE_URL +
  //         `api/v1/admin/create-financial-connection-session/sales-rep/${userID}`
  //     );
  //     const clientSecret = res?.data?.data?.clientSecret;

  //     if (!clientSecret) {
  //       success_toaster("Your bank account is already connected");
  //       return;
  //     }

  //     // Step 2: Load Stripe
  //     const stripe = await loadStripe(
  //       "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl"
  //     );

  //     if (!stripe) {
  //       error_toaster("Stripe failed to load");
  //       return;
  //     }

  //     // Step 3: Open the bank linking popup
  //     // const { error, session } =
  //     //   await stripe.collectFinancialConnectionsAccounts({ clientSecret });
  //     const session = await stripe.collectFinancialConnectionsAccounts({
  //       clientSecret,
  //     });
  //     console.log(
  //       "🚀 ~ handleFinancialConnection ~ session:",
  //       session?.financialConnectionsSession?.id
  //     );
  //     console.log("🚀 ~ handleFinancialConnection ~ session:", session);
  //     // console.log("resSees:----- ", resSees)

  //     // Step 4: If user closed or something went wrong
  //     if (!session?.financialConnectionsSession?.id) {
  //       console.warn("User did not complete linking");
  //       setShowBankRetry(true); // <-- trigger retry modal
  //       return;
  //     }

  //     // Step 5: Send session.id to your backend for verification/attachment
  //     const attachRes = await axios.post(
  //       BASE_URL + `api/v1/admin/attach-bank-account/sales-rep/${userID}`,
  //       {
  //         sessionId: session?.financialConnectionsSession?.id,
  //       }
  //     );
  //     console.log("🚀 ~ handleFinancialConnection ~ attachRes:", attachRes);
  //     console.log("🚀 ~ handleFinancialConnection ~ attachRes:", attachRes);
  //     // Step 6: Handle response
  //     if (attachRes?.data?.status === "success") {
  //       setShowBankRetry(false);
  //       success_toaster("Bank account linked successfully!");
  //     } else {
  //       error_toaster("Failed to attach bank account. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("handleFinancialConnection error:", err);
  //     error_toaster("An error occurred while linking your bank account.");
  //   }
  // };

  // const handleFinancialConnection = async () => {
  //   try {
  //     // Step 1: Call your API to get the SetupIntent client_secret
  //     const res = await axios.post(
  //       BASE_URL +
  //         `api/v1/admin/create-financial-connection-session/sales-rep/${userID}`
  //     );
  //     console.log("🚀 ~ handleFinancialConnection ~ res:", res)

  //     const clientSecret = res?.data?.data?.clientSecret;
  //     console.log("🚀 ~ handleFinancialConnection ~ clientSecret:", clientSecret)

  //     if (!clientSecret) {
  //       success_toaster("Your bank account is already connected");
  //       return;
  //     }

  //     // Step 2: Load Stripe.js
  //     const stripe = await loadStripe(
  //       "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl"
  //     );
  //     console.log("🚀 ~ handleFinancialConnection ~ stripe:", stripe)

  //     if (!stripe) {
  //       error_toaster("Stripe failed to load");
  //       return;
  //     }

  //     // Step 3: Open Stripe's Financial Connections popup
  //     const result = await stripe.collectBankAccountForSetup({
  //       clientSecret,
  //       params: {
  //         payment_method_type: "us_bank_account",
  //       },
  //     });

  //     console.log("Stripe SetupIntent result:", result);

  //     // Step 4: Extract SetupIntent details
  //     // const setupIntentId = result?.setupIntent?.id;
  //     // const setupIntentStatus = result?.setupIntent?.status;

  //     // If user closed the popup or linking failed
  //     // if (!setupIntentId || setupIntentStatus !== "succeeded") {
  //     //   console.warn("Bank linking was not completed.");
  //     //   setShowBankRetry(true);
  //     //   return;
  //     // }

  //     // Step 5: Send the setupIntentId to your existing backend endpoint
  //     // const attachRes = await axios.post(
  //     //   BASE_URL + `api/v1/admin/attach-bank-account/sales-rep/${userID}`,
  //     //   {
  //     //     sessionId: setupIntentId, // ✅ using "sessionId" name for compatibility
  //     //   }
  //     // );

  //     // console.log("Attach response:", attachRes?.data);

  //     // if (attachRes?.data?.status === "success") {
  //     //   setShowBankRetry(false);
  //     //   success_toaster("Bank account linked successfully!");
  //     // } else {
  //     //   error_toaster("Failed to attach bank account. Please try again.");
  //     // }
  //   } catch (err) {
  //     console.error("handleFinancialConnection error:", err);
  //     error_toaster("An error occurred while linking your bank account.");
  //   }
  // };

  const handleFinancialConnection = async () => {
    if (linking) return; 
    setLinking(true);
    try {
      // Step 1: Create SetupIntent via your backend
      const res = await api.post(
        BASE_URL + `api/v1/admin/create-bank-setup-intent/sales-rep/${userID}`
      );
      // console.log("🚀 ~ handleFinancialConnection ~ res:", res);
      const clientSecret = res?.data?.data?.clientSecret;

      if (!clientSecret) {
        success_toaster("Your bank account is already connected");
        return;
      }

      // Step 2: Load Stripe
      // Live key
      const stripe = await loadStripe(
        "pk_live_51HGqhQECVLSM4sc2wb1g4dx3lUe61VcK3BMjnUPk28Y5qaRC9sDQ6X6Ar5OZHmVoAIVe2rXncVOxHUax10qb4d8L00KCAdXpd5"
      );

      // Test Key
      // const stripe = await loadStripe(
      //   "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl"
      // );

      if (!stripe) {
        error_toaster("Stripe failed to load");
        return;
      }

      // Step 3: Open Stripe's Financial Connections popup
      // let result;
      // try {
      const result = await stripe.collectBankAccountForSetup({
        clientSecret,
        params: {
          payment_method_type: "us_bank_account",
          payment_method_data: {
            billing_details: {
              name: `${userName}`,
            },
          },
        },
      });
      // } catch (error) {
      //   ErrorHandler(error);
      // }

      // console.log("Stripe collect result:", result);

      if (result.setupIntent.status === "requires_confirmation") {
        const confirmedIntent = await stripe.confirmSetup({
          clientSecret,
          confirmParams: {
            return_url: window.location.href, // or your own custom URL
          },
          redirect: "if_required", // ensures no redirect if it's not necessary
        });
        if (confirmedIntent.error) {
          throw new Error(confirmedIntent.error.message);
        }
        if (confirmedIntent.setupIntent.status !== "succeeded") {
          throw new Error("SetupIntent not confirmed successfully.");
        }
      }
      // Only handle errors or incomplete status
      if (
        !result || // nothing returned
        result?.error || // Stripe reported error
        !result?.setupIntent?.id || // no setupIntent returned
        !result?.setupIntent?.payment_method // missing critical info
      ) {
        error_toaster("User cancelled or did not complete linking.");
        setShowBankRetry(true);
        return;
      }

      // Now handle attachment with backend
      const attachRes = await axios.post(
        BASE_URL + `api/v1/admin/attach-bank-account-setup/sales-rep/${userID}`,
        {
          setupIntentId: result?.setupIntent?.id,
          paymentMethodId: result?.setupIntent?.payment_method,
        }
      );
      // console.log("🚀 attachRes:", attachRes?.data);

      // ✅ Only show retry modal if the attach failed
      if (attachRes?.data?.status === "success") {
        setShowBankRetry(false); // success, no retry needed
        success_toaster("Bank account linked successfully via SetupIntent!");
        windowClose.location.reload();
      } else {
        error_toaster("Failed to attach bank account. Please try again.");
      }
    } catch (err) {
      ErrorHandler(err);
      // console.error("handleFinancialConnection error:", err);
      // error_toaster("An error occurred while linking your bank account.");
    } finally {
    setLinking(false);
    }
  };

  useEffect(() => {
    if (didInitRef.current) return; 
    didInitRef.current = true;
    const stripeAccountStatus = async () => {
      try {
        const res = await api.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-retrieve/${userID}`
        );
        if (res?.data?.status === "success") {
          localStorage.setItem("isAccountConnected", true);
        }
        //  else {
        //   throw new Error(
        //     "Connect Stripe Acocunt in order to create order"
        //   );
        // }
      } catch (error) {
        // console.log("🚀 ~ stripeAccountStatus ~ error:", error);
        // ErrorHandler("Connect Stripe Account");
      }
    };

    // const createFinancialConnectionSection = async () => {
    //   try {
    //     const res = await axios.post(
    //       BASE_URL +
    //         `api/v1/admin/create-financial-connection-session/sales-rep/${userID}`
    //     );
    //     const clientSecret = res?.data?.data?.clientSecret;

    //     // If no clientSecret, assume bank is already connected
    //     if (!clientSecret) {
    //       success_toaster("Your bank account is connected. You're all set");
    //       return;
    //     }

    //     const stripe = await loadStripe(
    //       "pk_test_51RPXZNCxTuXimvwHkvKO6MrVTckQ45X3JC2AkCVyV9fxLCK442YPbG8yM2NOexEqnD3wNAXdKfrOyEH2dTSzYKpt00WTyK7kzl"
    //     );

    //     if (!stripe) {
    //       throw new Error("Stripe failed to load");
    //     }

    //     const { error, session } =
    //       await stripe.collectFinancialConnectionsAccounts({
    //         clientSecret,
    //       });

    //     // 🛑 Stop if user aborted or error occurred
    //     if (error || !session?.id) {
    //       error_toaster(
    //         "Bank account linking not completed: Compulsory Step",
    //         error?.message || "Session missing"
    //       );
    //       return;
    //     }

    //     // ✅ Proceed to attach only if session is valid and no error
    //     const attachRes = await axios.post(
    //       BASE_URL + `api/v1/admin/attach-bank-account`,
    //       {
    //         sessionId: session.id,
    //         customerId: userID,
    //       }
    //     );

    //     if (attachRes?.data?.status === "success") {
    //       success_toaster("Bank account linked successfully!");
    //     } else {
    //       throw new Error("Bank attach failed");
    //     }
    //   } catch (error) {
    //     ErrorHandler(error);
    //   }
    // };

    if (userType === "salesRepresentative") {
      stripeAccountStatus();
      handleFinancialConnection();
    }
  }, [userType, userID]);

  return data?.length === 0 ? (
    <Loader />
  ) : userType === "admin" && hasPermission("dashboard_view") ? (
    <>
      {/* <div
        className={`bg-red-500 z-10 text-center text-white py-2 ${
          userType === "salesRepresentative" &&
          (isAccountConnected === "false" || connectAccountId === "null")
            ? "flex items-center justify-center gap-x-2"
            : "hidden"
        }`}
      >
        Your Stripe Account is not Connected {"? click here "}
        <button
          onClick={handleConnectAccount}
          className="flex gap-x-2 text-wrap items-center px-2 rounded-lg font-inter font-medium   duration-200 bg-theme text-white"
        >
          {(connectAccountId !== "null" || !connectAccountId) &&
          isAccountConnected === "true"
            ? "Stripe Dashboard"
            : (connectAccountId === "null" || !connectAccountId) &&
              isAccountConnected === "false"
            ? "Connect Account"
            : "Complete Account Registration"}
        </button>
      </div> */}
      <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
        <div className="relative z-30 py-5 px-6 2xl:px-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                Welcome, {userName}.
              </h1>
              <p className="text-white font-inter">
                Monitor your business analytics and statistics
              </p>
            </div>

            {/* <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex gap-x-2 items-center h-[42px]">
                <div className=" space-x-2">
                  <label
                    htmlFor="startDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    Start Date:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDates?.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="space-x-2">
                  <label
                    htmlFor="endDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    End Date:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDates?.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-black text-black bg-white hover:text-white hover:bg-black duration-200 group"
                  >
                    <ImCross size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-bold">
                <Select
                  styles={selectStyles}
                  defaultValue={{ value: "allTime", label: "All Time" }}
                  placeholder="Select Year, Month, Week ..."
                  value={selectedOption ? selectedOption : null}
                  onChange={(val) => handleChange(val)}
                  options={options ? options : null}
                />
              </div>
            )}
          </div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            <HomeCards
              title="Total Countries"
              // description="Upcoming bookings + completed bookings + Cancelled bookings"
              total={data?.data?.totalCountries}
              Icon={BsCardList}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Total States"
              // description="Total of all the completed bookings only"
              total={data?.data?.totalStates}
              Icon={FaChartLine}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Cities"
              // description="All active and inactive Customers"
              total={data?.data?.totalCities}
              Icon={PiUsersThreeBold}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Local Partners"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalPatners}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Suppliers"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalSupplier}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              title="Total Clients"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalUser}
              Icon={PiHandbagFill}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
            <HomeMiniCards
              title="Total Sale"
              // description="The bookings that are booked and an employee has been assigned to them."
              total={`$${data?.data?.salesSummary?.sales}`}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Whole Sale"
              total={`$${data?.data?.salesSummary?.wholesalePriceTotal}`}
              // Icon={LuPackageCheck}
            />
            <HomeMiniCards
              title="Suppliers Earning"
              total={`$${data?.data?.revenueSummary?.revenueCollected||0}`}
              // Icon={LuPackageX}
            />
            {/* <HomeMiniCards
            title="Pending Payments"
            description="The bookings in which minimum 1 service is not assigned to any employee"
            total={"$2000"}
            Icon={FiBox}
          /> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.orderPlaced}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.assignedToSupplier}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.supplierAcknowledged}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.dispatchedOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Delivered Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.deliveredOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.CanceledOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentPending}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentDone}
              // Icon={FiBox}
            />
          </div>

          <div className="mt-12">
            {/* <Charts today={today} /> */}
            {/* <Charts  /> */}
          </div>
        </div>
      </div>
    </>
  ) : userType === "salesRepresentative" && hasPermission("dashboard_view") ? (
    <div>
      <div
        className={`bg-red-500 z-10 text-center text-white py-2 ${
          userType === "salesRepresentative" &&
          (isAccountConnected === "false" || connectAccountId === "null")
            ? "flex items-center justify-center gap-x-2"
            : "hidden"
        }`}
      >
        Your Stripe Account is not Connected {"? click here "}
        <button
          onClick={handleConnectAccount}
          className="flex gap-x-2 text-wrap items-center px-2 rounded-lg font-inter font-medium   duration-200 bg-theme text-white"
        >
          {(connectAccountId !== "null" || !connectAccountId) &&
          isAccountConnected === "true"
            ? "Stripe Dashboard"
            : (connectAccountId === "null" || !connectAccountId) &&
              isAccountConnected === "false"
            ? "Connect Account"
            : "Complete Account Registration"}
        </button>
      </div>

      {showBankRetry && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md">
            <p className="text-red-600 mb-4 font-semibold">
              Bank account linking is required and Compulsory.
            </p>
            <button
              onClick={handleFinancialConnection}
              className="bg-black text-white hover:text-black hover:bg-white border border-black duration-150 px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
        <div className="relative z-30 py-5 px-6 2xl:px-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                Welcome, {userName}.
              </h1>
              <p className="text-white font-inter">
                Monitor your business analytics and statistics
              </p>
            </div>

            {/* <div className="min-w-40">
            {displayCustomFilters ? (
              <div className="flex gap-x-2 items-center h-[42px]">
                <div className=" space-x-2">
                  <label
                    htmlFor="startDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    Start Date:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDates?.startDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="space-x-2">
                  <label
                    htmlFor="endDate"
                    className=" text-labelColor font-workSans font-semibold"
                  >
                    End Date:
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDates?.endDate}
                    onChange={handleCustomDates}
                    className="h-[42px] rounded-md px-3 outline-none border font-workSans font-medium 
                            text-labelColor"
                  />
                </div>
                <div className="h-full flex items-center gap-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 h-full rounded-lg border border-black text-black bg-white hover:text-white hover:bg-black duration-200 group"
                  >
                    <ImCross size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-bold">
                <Select
                  styles={selectStyles}
                  defaultValue={{ value: "allTime", label: "All Time" }}
                  placeholder="Select Year, Month, Week ..."
                  value={selectedOption ? selectedOption : null}
                  onChange={(val) => handleChange(val)}
                  options={options ? options : null}
                />
              </div>
            )}
          </div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
            <HomeCards
              title="Total Sale"
              // description="Upcoming bookings + completed bookings + Cancelled bookings"
              total={`$${data?.data?.salesSummary?.sales ?? 0}`}
              Icon={BsCardList}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Total Whole Sale"
              // description="Total of all the completed bookings only"
              total={`$${data?.data?.salesSummary?.wholesalePriceTotal ?? 0}`}
              Icon={FaChartLine}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Revenue Collected"
              // description="Total of all the completed bookings only"
              total={`$${data?.data?.revenueSummary?.revenueCollected ?? "0"}`}
              Icon={FaChartLine}
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
            <HomeMiniCards
              title="Total Sale"
              description="The bookings that are booked and an employee has been assigned to them."
              total={`$${data?.data?.salesSummary?.sales}`}
              Icon={FiBox}
            />
            <HomeMiniCards
              title="Whole Sale"
              total={`$${data?.data?.salesSummary?.wholesalePriceTotal}`}
              Icon={LuPackageCheck}
            />
            <HomeMiniCards
              title="Suppliers Earning"
              total={`$${data?.data?.revenueSummary?.revenueCollected ?? 0}`}
              Icon={LuPackageX}
            />
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.orderPlaced}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.assignedToSupplier}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.supplierAcknowledged}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.dispatchedOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Delivered Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.deliveredOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.CanceledOrders}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentPending}
              // Icon={FiBox}
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentDone}
              // Icon={FiBox}
            />
          </div>

          <div className="mt-12">
            {/* <Charts today={today} /> */}
            {/* <Charts  /> */}
          </div>
        </div>
      </div>
    </div>
  ) : userType === "supplier" ? (
      <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
      <div className="relative z-30 py-5 px-6 2xl:px-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
              Welcome, {userName}.
            </h1>
            <p className="text-white font-inter">
              Monitor your business analytics and statistics
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
          <HomeCards
            title="Total Orders"
            total={totalOrders}
            Icon={BsCardList}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
          <HomeCards
            title="Shipped Orders"
            total={shippedOrders}
            Icon={FaChartLine}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
          <HomeCards
            title="Acknowledged Orders"
            total={acknowledgedOrders}
            Icon={PiUsersThreeBold}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
          <HomeCards
            title="Dispatched To Suppliers"
            total={dispatchedToSupplierOrders}
            Icon={FaChartLine}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
          <HomeCards
            title="Delivered Orders"
            total={deliveredOrders}
            Icon={PiHandbagFill}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
          <HomeCards
            title="Cancelled Orders"
            total={cancelledOrders}
            Icon={MdCancel}
            bgColor="bg-homeCards"
            iconBg="bg-white"
          />
        </div>
        <div className="mt-8">
          <h2 className="text-black text-lg font-semibold mb-4">Top Products Sold</h2>
          {topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {topProducts.map((product) => (
                <HomeMiniCards
                  key={product.productId}
                  title={product.productName}
                  // total={`Total Sold: ${product.totalSold}`}
                  total={product.totalSold}
                />
              ))}
            </div>
          ) : (
            <p className="text-white">No products available.</p>
          )}
        </div>
      </div>
    </div>
    ) : isEmployee ? (
  <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
    <div className="relative z-30 py-5 px-6 2xl:px-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
            Welcome, {userName}.
          </h1>
          <p className="text-white font-inter">
            Monitor your assigned orders and overdue invoices
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">
        {(Array.isArray(data?.data) ? data.data : data?.data?.output || []).map(
          (item) => (
            <HomeCards
              key={item.id}
              title={item.orderStatus}
              total={item.count}
              Icon={
                item.orderStatus.toLowerCase().includes("cancel")
                  ? MdCancel
                  : BsCardList
              }
              bgColor="bg-homeCards"
              iconBg="bg-white"
            />
          )
        )}
      </div>
    </div>
  </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-semibold text-gray-500">
        🚫 You don’t have permission to view the Dashboard
      </h1>
    </div>
  );
}
