"use client";
import HomeCards from "@/components/ui/HomeCards";
import HomeMiniCards from "@/components/ui/HomeMiniCards";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
import axios from "axios";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  MdCancel,
  MdPublic,
  MdMap,
  MdLocationCity,
  MdCheckCircle,
  MdGroups,
  MdLocalShipping,
  MdPeopleAlt,
  MdAttachMoney,
  MdTrendingUp,
  MdListAlt,
  MdAssignment,
  MdAssignmentTurnedIn,
  MdPendingActions,
} from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import Loader from "@/components/ui/Loader";
import api from "@/utilities/StatusErrorHandler";
import { hasPermission } from "@/utilities/Permission";
import DASHBOARD from "./dashboard.testids";
import { useTranslations } from "next-intl";
import { formatUSD } from "@/utilities/constants";

export default function Home() {
  const t = useTranslations("HomePage");
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

  const EMPLOYEE_API_MAP = {
    admin: "api/v1/admin/dashboard/admin-employee",
    "local partner": "api/v1/admin/dashboard/local-partner-employee",
  };

  const dashboardEndpoint = useMemo(() => {
    if (isEmployee) {
      const employeeOf = (localStorage.getItem("employeeOf") || "")
        .toLowerCase()
        .trim();
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

  const { data, isLoading } = dashboardEndpoint
    ? GetAPI(dashboardEndpoint, "dashboard")
    : { data: null, isLoading: false };

  const supplierDashboard = data?.data?.dashboard || {};
  const {
    totalOrders,
    dispatchedToSupplierOrders,
    acknowledgedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  } = supplierDashboard;

  const topProducts = data?.data?.topProducts || [];

  const handleConnectAccount = async () => {
    const path = url.split("/");
    if (isAccountConnected === "false" && connectAccountId !== "null") {
      try {
        const res = await PostAPI(
          `api/v1/admin/stripe-connect-account-url/${userID}`,
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
            link.target = "_blank";
            link.rel = "noopener noreferrer";
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
        const res = await PostAPI(
          `api/v1/admin/create-stripe-connect-account/${userID}`,
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

  const handleFinancialConnection = async () => {
    if (linking) return;
    setLinking(true);
    try {
      // Step 1: Create SetupIntent via your backend
      const res = await api.post(
        BASE_URL + `api/v1/admin/create-bank-setup-intent/sales-rep/${userID}`
      );
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
      const attachRes = await PostAPI(
        `api/v1/admin/attach-bank-account-setup/sales-rep/${userID}`,
        {
          setupIntentId: result?.setupIntent?.id,
          paymentMethodId: result?.setupIntent?.payment_method,
        }
      );

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
    } finally {
      setLinking(false);
    }
  };

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const stripeAccountStatus = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : "";
        const res = await api.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-retrieve/${userID}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res?.data?.status === "success") {
          localStorage.setItem("isAccountConnected", "true");
        } else {
          throw new Error(res?.data?.message || "Failed to retrieve account.");
        }
      } catch (error) {
        try {
          const path = url.split("/");
          const fallback = await PostAPI(
            `api/v1/admin/stripe-connect-account-url/${userID}`,
            { returnUrl: "https://" + path[2].trim() }
          );

          if (
            fallback?.data?.status === "success" &&
            fallback?.data?.data?.data?.connectAccount
          ) {
            const link = document.createElement("a");
            link.href = fallback?.data?.data?.data?.connectAccount;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          }
        } catch (fallbackErr) {
          ErrorHandler(fallbackErr);
        }
      }
    };

    if (userType === "salesRepresentative" && !isEmployee) {
      stripeAccountStatus();
      handleFinancialConnection();
    }
  }, [userType, userID, isEmployee]);

  return isLoading || !data ? (
    <Loader />
  ) : userType === "admin" && !isEmployee ? (
    <>
      <div
        className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain"
        data-testid={DASHBOARD.adminRoot}
      >
        <div className="relative z-30 py-5 px-6 2xl:px-12">
          <div
            className="flex justify-between items-center"
            data-testid={DASHBOARD.header}
          >
            <div>
              <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                Welcome, {userName}.
              </h1>
              <p className="text-white font-inter">
                Monitor your business analytics and statistics
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5"
            data-testid={DASHBOARD.statsCardsGrid}
          >
            <HomeCards
              title="Total Countries"
              // description="Upcoming bookings + completed bookings + Cancelled bookings"
              total={data?.data?.totalCountries}
              Icon={MdPublic}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-countries-card"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Total States"
              // description="Total of all the completed bookings only"
              total={data?.data?.totalStates}
              Icon={MdMap}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-states-card"
            />
            <HomeCards
              title="Total Cities"
              // description="All active and inactive Customers"
              total={data?.data?.totalCities}
              Icon={MdLocationCity}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-cities-card"
            />
            <HomeCards
              title="Total Local Partners"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalPatners}
              Icon={MdGroups}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-local-partners-card"
            />
            <HomeCards
              title="Total Suppliers"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalSupplier}
              Icon={MdLocalShipping}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-suppliers-card"
            />
            <HomeCards
              title="Total Clients"
              // description="Salons that have completed at least one registration step. Specifically Add your business address and team size"
              total={data?.data?.totalUser}
              Icon={MdPeopleAlt}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-clients-card"
            />
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12"
            data-testid={DASHBOARD.miniCardsGrid}
          >
            <h4 className="col-span-4 font-semibold text-xl">
              Revenue Collected
            </h4>

            <HomeMiniCards
              title="Total Revenue"
              // description="The bookings that are booked and an employee has been assigned to them."
              total={`${formatUSD(
                (parseFloat(
                  data?.data?.revenueSummaryClient?.revenueCollectedClient
                ) || 0) +
                  parseFloat(
                    data?.data?.revenueSummaryPartners?.revenueCollectedPartners
                  )
              )}`}
              // Icon={FiBox}
              data-testid="dashboard-total-sales"
            />
            <HomeMiniCards
              title="Revenue From Client Orders"
              // description="The bookings that are booked and an employee has been assigned to them."
              total={`${
                formatUSD(data?.data?.revenueSummaryClient?.revenueCollectedClient || 0)
              }`}
              // Icon={FiBox}
              data-testid="dashboard-total-sales"
            />
            <HomeMiniCards
              title="Revenue From Partner Orders"
              // description="The bookings that are booked and an employee has been assigned to them."
              total={`${
                formatUSD(data?.data?.revenueSummaryPartners?.revenueCollectedPartners || 0)
                
              }`}
              // Icon={FiBox}
              data-testid="dashboard-total-sales"
            />
            <div></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <div className="col-span-4">
              <h4 className="col-span-4 font-semibold text-xl">
                Customer Sales Summary
              </h4>
            </div>
            <HomeMiniCards
              title="Admin's Customer Sales"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={formatUSD(data?.data?.clientSalesSummary?.customerPriceTotal || 0)}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />

            <HomeMiniCards
              title="Local Partners Customer Sales"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={formatUSD(data?.data?.clientSalesSummary?.wholesalePriceTotal || 0)}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />

            <HomeMiniCards
              title="Total Sales"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={formatUSD(data?.data?.clientSalesSummary?.sales || 0)}
              // Icon={FiBox}
              data-testid="dashboard-assigned-orders"
            />
            <HomeMiniCards
              title="Total Items"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={parseFloat(
                data?.data?.clientSalesSummary?.numberOfItems || 0
              )}
              // Icon={FiBox}
              data-testid="dashboard-assigned-orders"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <div className="col-span-4">
              <h4 className="col-span-4 font-semibold text-xl">
                Local Partner Sales Summary
              </h4>
            </div>
            <HomeMiniCards
              title="Partner Self Order Sales"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnerSalesSummary?.sales || 0}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
              currency
            />

            <HomeMiniCards
              title="Total Items"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnerSalesSummary?.numberOfItems || 0}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <div className="col-span-4">
              <h4 className="col-span-4 font-semibold text-xl">
                Customer Orders Summary
              </h4>
            </div>
            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.orderPlaced}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.assignedToSupplier}
              // Icon={FiBox}
              data-testid="dashboard-assigned-orders"
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.supplierAcknowledged}
              // Icon={FiBox}
              data-testid="dashboard-acknowledged-orders"
            />

            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.dispatchedOrders}
              // Icon={FiBox}
              data-testid="dashboard-delivered-orders"
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.CanceledOrders}
              // Icon={FiBox}
              data-testid="dashboard-cancelled-orders"
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.paymentPending}
              // Icon={FiBox}
              data-testid="dashboard-unpaid-orders"
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.clientOrdersSummary?.paymentDone}
              // Icon={FiBox}
              data-testid="dashboard-paid-orders"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            <div className="col-span-4">
              <h4 className="col-span-4 font-semibold text-xl">
                Local Partners Order Summary
              </h4>
            </div>

            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.orderPlaced || 0}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.assignedToSupplier}
              // Icon={FiBox}
              data-testid="dashboard-assigned-orders"
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.supplierAcknowledged}
              // Icon={FiBox}
              data-testid="dashboard-acknowledged-orders"
            />

            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.dispatchedOrders}
              // Icon={FiBox}
              data-testid="dashboard-delivered-orders"
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.CanceledOrders}
              // Icon={FiBox}
              data-testid="dashboard-cancelled-orders"
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.paymentPending}
              // Icon={FiBox}
              data-testid="dashboard-unpaid-orders"
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.partnersOrdersSummary?.paymentDone}
              // Icon={FiBox}
              data-testid="dashboard-paid-orders"
            />
          </div>

          <div className="mt-12">
            {/* <Charts today={today} /> */}
            {/* <Charts  /> */}
          </div>
        </div>
      </div>
    </>
  ) : userType === "salesRepresentative" && !isEmployee ? (
    <div data-testid={DASHBOARD.salesRepRoot}>
      <div
        className={`bg-red-500 z-10 text-center text-white py-2 ${
          userType === "salesRepresentative" &&
          (isAccountConnected === "false" || connectAccountId === "null")
            ? "flex items-center justify-center gap-x-2"
            : "hidden"
        }`}
        data-testid={DASHBOARD.connectBanner}
      >
        Your Stripe Account is not Connected {"? click here "}
        <button
          onClick={handleConnectAccount}
          className="flex gap-x-2 text-wrap items-center px-2 rounded-lg font-inter font-medium duration-200 bg-theme text-white"
          data-testid={DASHBOARD.connectBtn}
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
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50"
          data-testid={DASHBOARD.bankRetryModal}
        >
          <div className="bg-white p-6 rounded-md">
            <p className="text-red-600 mb-4 font-semibold">
              Bank account linking is required and Compulsory.
            </p>
            <button
              onClick={handleFinancialConnection}
              className="bg-black text-white hover:text-black hover:bg-white border border-black duration-150 px-4 py-2 rounded-md"
              data-testid={DASHBOARD.bankRetryBtn}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      <div className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain">
        <div className="relative z-30 py-5 px-6 2xl:px-12">
          <div
            className="flex justify-between items-center"
            data-testid={DASHBOARD.header}
          >
            <div>
              <h1 className="text-white text-xl lg:text-3xl font-inter font-semibold">
                Welcome, {userName}.
              </h1>
              <p className="text-white font-inter">
                Monitor your business analytics and statistics
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5"
            data-testid={DASHBOARD.statsCardsGrid}
          >
            <HomeCards
              title="Total Sale"
              // description="Upcoming bookings + completed bookings + Cancelled bookings"
              total={`$${data?.data?.salesSummary?.sales ?? 0}`}
              Icon={MdAttachMoney}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-sales-card"
            />
            <HomeCards
              currecncyunit={"$"}
              title="Total Whole Sale"
              // description="Total of all the completed bookings only"
              total={`$${data?.data?.salesSummary?.wholesalePriceTotal ?? 0}`}
              Icon={MdTrendingUp}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-whole-sales-card"
            />

            <HomeCards
              currecncyunit={"$"}
              title="Revenue Collected"
              // description="Total of all the completed bookings only"
              total={`$${data?.data?.revenueSummary?.revenueCollected ?? "0"}`}
              Icon={FaChartLine}
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-revenue-card"
            />
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6"
            data-testid={DASHBOARD.miniCardsGrid}
          >
            <HomeMiniCards
              title="Total Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.orderPlaced}
              // Icon={FiBox}
              data-testid="dashboard-total-orders"
            />
            <HomeMiniCards
              title="Assigned Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.assignedToSupplier}
              // Icon={FiBox}
              data-testid="dashboard-assigned-orders"
            />
            <HomeMiniCards
              title="Acknowledged Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.supplierAcknowledged}
              // Icon={FiBox}
              data-testid="dashboard-acknowledged-orders"
            />
            <HomeMiniCards
              title="Dispatched Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.dispatchedOrders}
              // Icon={FiBox}
              data-testid="dashboard-dispatched-orders"
            />
            <HomeMiniCards
              title="Delivered Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.deliveredOrders}
              // Icon={FiBox}
              data-testid="dashboard-delivered-orders"
            />
            <HomeMiniCards
              title="Cancelled Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.CanceledOrders}
              // Icon={FiBox}
              data-testid="dashboard-cancelled-orders"
            />
            <HomeMiniCards
              title="Unpaid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentPending}
              // Icon={FiBox}
              data-testid="dashboard-unpaid-orders"
            />
            <HomeMiniCards
              title="Paid Orders"
              // description="The bookings in which minimum 1 service is not assigned to any employee"
              total={data?.data?.ordersSummary?.paymentDone}
              // Icon={FiBox}
              data-testid="dashboard-paid-orders"
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
    <div
      className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain"
      data-testid={DASHBOARD.supplierRoot}
    >
      <div className="relative z-30 py-5 px-6 2xl:px-12">
        <div
          className="flex justify-between items-center"
          data-testid={DASHBOARD.header}
        >
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
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5"
          data-testid={DASHBOARD.statsCardsGrid}
        >
          <HomeCards
            title="Total Orders"
            total={totalOrders}
            Icon={MdListAlt}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-orders"
          />
          <HomeCards
            title="Shipped Orders"
            total={shippedOrders}
            Icon={MdLocalShipping}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-shipped-orders"
          />
          <HomeCards
            title="Acknowledged Orders"
            total={acknowledgedOrders}
            Icon={MdAssignmentTurnedIn}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-acknowledged-orders"
          />
          <HomeCards
            title="Dispatched To Suppliers"
            total={dispatchedToSupplierOrders}
            Icon={MdAssignment}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-dispatched-orders"
          />
          <HomeCards
            title="Delivered Orders"
            total={deliveredOrders}
            Icon={MdCheckCircle}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-delivered-orders"
          />
          <HomeCards
            title="Cancelled Orders"
            total={cancelledOrders}
            Icon={MdCancel}
            bgColor="bg-homeCards"
            iconBg="bg-white"
            data-testid="dashboard-total-cancelled-orders"
          />
        </div>
        <div className="mt-8" data-testid={DASHBOARD.topProductsSection}>
          <h2 className="text-black text-lg font-semibold mb-4">
            Top Products Sold
          </h2>
          {topProducts.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
              data-testid={DASHBOARD.topProductsGrid}
            >
              {topProducts.map((product) => (
                <HomeMiniCards
                  key={product.productId}
                  title={product.productName}
                  // total={`Total Sold: ${product.totalSold}`}
                  total={product.totalSold}
                  data-testid="dashboard-top-products"
                />
              ))}
            </div>
          ) : (
            <p className="text-white">No products available.</p>
          )}
        </div>
      </div>
    </div>
  ) : isEmployee || hasPermission("dashboard_view") ? (
    <div
      className="bg-homeGradient w-full h-44 relative before:absolute before:bg-texture before:w-full before:h-44 before:bg-contain"
      data-testid={DASHBOARD.employeeRoot}
    >
      <div className="relative z-30 py-5 px-6 2xl:px-12">
        <div
          className="flex justify-between items-center"
          data-testid={DASHBOARD.header}
        >
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
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5"
          data-testid={DASHBOARD.statsCardsGrid}
        >
          {(Array.isArray(data?.data)
            ? data.data
            : data?.data?.output || []
          ).map((item) => (
            <HomeCards
              key={item.id}
              title={item.orderStatus}
              total={item.count}
              Icon={
                /cancel/i.test(item.orderStatus)
                  ? MdCancel
                  : /ship|dispatch/i.test(item.orderStatus)
                  ? MdLocalShipping
                  : /deliver/i.test(item.orderStatus)
                  ? MdCheckCircle
                  : /acknowledge/i.test(item.orderStatus)
                  ? MdAssignmentTurnedIn
                  : /unpaid|pending/i.test(item.orderStatus)
                  ? MdPendingActions
                  : /assign/i.test(item.orderStatus)
                  ? MdAssignment
                  : MdListAlt
              }
              bgColor="bg-homeCards"
              iconBg="bg-white"
              data-testid="dashboard-total-orders"
            />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-semibold text-gray-500">
        Dashboard in progress
      </h1>
    </div>
  );
}
