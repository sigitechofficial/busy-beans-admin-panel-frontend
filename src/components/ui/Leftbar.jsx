"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  MdDashboard,
  MdShoppingCart,
  MdReceiptLong,
  MdBusiness,
  MdGroups,
  MdHandshake,
  MdInventory,
  MdCategory,
  MdManageAccounts,
  MdPublic,
  MdLocalShipping,
  MdInsights,
  MdDescription,
  MdPayments,
  MdAccountBalance,
  MdSavings,
  MdLogout,
  MdCoffeeMaker,
  MdWarehouse,
  MdShoppingBag,
  MdStorefront,
  MdLeaderboard,
} from "react-icons/md";
import { FaAngleDown, FaAngleRight, FaAngleUp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import ListHead from "./ListHead";
import ListItems from "./ListItems";
import Link from "next/link";
import {
  info_toaster,
  success_toaster,
  error_toaster,
} from "@/utilities/Toaster";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";

import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { useDataContext } from "@/utilities/DataContext";
import { getMessagingInstance, onMessage } from "@/utilities/firebase";
import { requestDeviceToken } from "@/utilities/requestFCMToken";
import { hasPermission } from "@/utilities/Permission";
import { LEFTBAR } from "@/components/ui/leftbar.testid";

export default function Leftbar(props) {
  // Initialize to null/false so server and client first paint match (avoids hydration mismatch).
  // Values are set from localStorage in useEffect after mount.
  const [userType, setUserType] = useState(null);
  const [partnerType, setPartnerType] = useState(null);
  const [userID, setUserID] = useState(null);
  const [connectAccountId, setConnectAccountId] = useState(null);
  const [isAccountConnected, setIsAccountConnected] = useState(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeStripeAccountState, setEmployeeStripeAccountState] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateState = () => {
        setUserType(localStorage.getItem("userType"));
        setPartnerType(localStorage.getItem("partnerType"));
        setUserID(localStorage.getItem("userID"));
        setConnectAccountId(localStorage.getItem("connectAccountId"));
        setIsAccountConnected(localStorage.getItem("isAccountConnected"));
        const isEmp = localStorage.getItem("isEmployee") === "true";
        setIsEmployee(isEmp);
        setEmployeeStripeAccountState(localStorage.getItem("employeeStripeAccountState"));
        setEmployeeId(localStorage.getItem("employeeId"));
      };
      
      // Update immediately
      updateState();
      
      // Check multiple times to catch values set during/after login redirect
      const timeoutIds = [
        setTimeout(updateState, 100),
        setTimeout(updateState, 300),
        setTimeout(updateState, 500),
        setTimeout(updateState, 1000),
      ];
      
      return () => timeoutIds.forEach(id => clearTimeout(id));
    }
  }, []);

  // Listen for storage changes to update state immediately (for cross-tab updates)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === "isEmployee") {
        setIsEmployee(e.newValue === "true");
        setForceUpdate(prev => prev + 1);
      }
      if (e.key === "employeeStripeAccountState") {
        setEmployeeStripeAccountState(e.newValue);
        setForceUpdate(prev => prev + 1);
      }
      if (e.key === "employeeId") {
        setEmployeeId(e.newValue);
        setForceUpdate(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Poll localStorage for employee-related values (only when component is mounted and userType is set)
  // This catches same-tab localStorage changes that don't trigger storage events
  useEffect(() => {
    if (typeof window === "undefined" || !userType) return;

    let lastIsEmployee = isEmployee;
    let lastStripeState = employeeStripeAccountState;
    let lastEmployeeId = employeeId;

    const checkLocalStorage = () => {
      const currentIsEmployee = localStorage.getItem("isEmployee") === "true";
      const currentStripeState = localStorage.getItem("employeeStripeAccountState");
      const currentEmployeeId = localStorage.getItem("employeeId");

      if (
        currentIsEmployee !== lastIsEmployee ||
        currentStripeState !== lastStripeState ||
        currentEmployeeId !== lastEmployeeId
      ) {
        setIsEmployee(currentIsEmployee);
        setEmployeeStripeAccountState(currentStripeState);
        setEmployeeId(currentEmployeeId);
        setForceUpdate(prev => prev + 1);
        
        lastIsEmployee = currentIsEmployee;
        lastStripeState = currentStripeState;
        lastEmployeeId = currentEmployeeId;
      }
    };

    // Check immediately
    checkLocalStorage();

    // Then check periodically (only for a limited time after mount to avoid infinite polling)
    const intervalId = setInterval(checkLocalStorage, 200);
    const stopPollingId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000); // Stop polling after 5 seconds

    return () => {
      clearInterval(intervalId);
      clearTimeout(stopPollingId);
    };
  }, [userType]); // Re-run when userType changes (e.g., after login)

  const generateUrl =
    userType === "admin"
      ? "api/v1/admin/order-navigation-counts"
      : userType === "salesRepresentative"
      ? `api/v1/admin/order-navigation-counts/sales-rep/${userID}`
      : userType === "supplier"
      ? `api/v1/admin/order-navigation-counts/supplier/${userID}`
      : null;

  const PartnerCountUrl =
    userType === "admin"
      ? "api/v1/admin/partner-order-navigation-counts"
      : userType === "salesRepresentative"
      ? `api/v1/admin/partner-order-navigation-counts/sales-rep/${userID}`
      : userType === "supplier"
      ? `api/v1/admin/partner-order-navigation-counts/supplier/${userID}`
      : null;

  const overAllData = GetAPI(generateUrl);
  const PartnerCounts = GetAPI(PartnerCountUrl);

  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState({
    quickbooks: {
      tab: "",
      status: false,
    },
    orderManagement: {
      tab: "",
      status: false,
    },
    supplierManagement: {
      tab: "",
      status: false,
    },
    clientManagement: {
      tab: "",
      status: false,
    },
    saleRepresentative: {
      tab: "",
      status: false,
    },
    invoiceManagement: {
      tab: "",
      status: false,
    },
    reportManagement: {
      tab: "",
      status: false,
    },
    roleandEmployeeManagement: {
      tab: "",
      status: false,
    },
    notandAlerts: {
      tab: "",
      status: false,
    },
    collection: {
      tab: "",
      status: false,
    },
    disbursement: {
      tab: "",
      status: false,
    },
    machineSubscriptions: {
      tab: "",
      status: false,
    },
    quickbooks: {
      tab: "",
      status: false,
    },
    inventoryManagement: {
      tab: "",
      status: false,
    },
    quotationManagement: {
      tab: "",
      status: false,
    },
    salesRepInventoryManagement: {
      tab: "",
      status: false,
    },
    categoryManagement: {
      tab: "",
      status: false,
    },
    employees: {
      tab: "",
      status: false,
    },
    employeeManagement: {
      tab: "",
      status: false,
    },
    zoneManagement: {
      tab: "",
      status: false,
    },
    promotionManagement: {
      tab: "",
      status: false,
    },
    pullouts: {
      tab: "",
      status: false,
    },
    partnerOrders: { tab: "", status: false },
    quickbookOrders: { tab: "", status: false },
  });

  const handleActive = (name, status) => {
    setActive({
      ...active,
      [name]: {
        tab: name,
        status: !status,
      },
    });
  };

  const logoutFunc = () => {
    localStorage.clear();
    router.push("/sign-in");
    success_toaster("Logout Successfully");
  };

  const handleInvalidUser = () => {
    router.push("/sign-in");
  };

  const handlePartnerOrdersToggle = () => {
    handleActive("partnerOrders", active?.partnerOrders?.status);
  };
  const handleQuickbooksOrdersToggle = () => {
    handleActive("quickbookOrders", active?.quickbookOrders?.status);
  };
  const handleCustomerOrdersToggle = () => {
    handleActive("customerOrder", active?.customerOrder?.status);
  };

  const authenticateQuickbooks = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";

      const res = await axios.get(BASE_URL + `qbo/auth/login`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res?.data?.status === "success") {
        success_toaster("Redirecting to QuickBooks...");
        window.open(res?.data?.data?.authUrl, "_self");
      } else {
        error_toaster("Failed to authenticate QuickBooks.");
      }
    } catch (error) {
      console.error("Error during QuickBooks authentication:", error);
      error_toaster("Error connecting to QuickBooks.");
    }
  };

  const handleConnectAccount = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
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
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : "";
        const res = await axios.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-dashboard/${userID}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
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

  const handleEmployeeStripeDashboard = async () => {
    if (typeof window === "undefined" || !employeeId) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";
      const res = await axios.get(
        BASE_URL +
          `api/v1/admin/employee/${employeeId}/stripe-connect-account-dashboard`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
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
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  // useEffect(() => {
  //   const stripeAccountStatus = async () => {
  //     try {
  //       const res = await axios.get(
  //         BASE_URL + `api/v1/admin/stripe-connect-account-retrieve/${userID}`
  //       );
  //       console.log("🚀 ~ stripeAccountStatus ~ res:", res?.data);
  //       if (res?.data?.status === "success") {
  //         localStorage.setItem("isAccountConnected", true);
  //       }
  //       else {
  //         throw new Error(
  //           res?.data?.message || "An unexpected error occurred."
  //         );
  //       }
  //     } catch (error) {
  //       console.log("🚀 ~ stripeAccountStatus ~ error:", error)
  //       ErrorHandler(error);
  //     }
  //   };
  //   if (userType === "salesRepresentative") {
  //     stripeAccountStatus();
  //   }
  // }, []);
  const allOrder = overAllData?.data?.data?.reduce(
    (sum, item) => (item?.id !== 7 ? sum + item?.count : sum),
    0
  );

  useEffect(() => {
    let timeoutId = null;

    getMessagingInstance().then((messaging) => {
      if (messaging) {
        onMessage(messaging, (payload) => {
          setNewOrder(true);
          // success_toaster("Firebase notification Order placed");

          setOrderData(payload);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setNewOrder(false);
          }, 10000);
        });
      }
    });

    // Request Device Token
    requestDeviceToken();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const { toggle, setToggle, setNewOrder, newOrder, orderData, setOrderData } =
    useDataContext();
  const [pastFirstPaint, setPastFirstPaint] = useState(false);
  useLayoutEffect(() => {
    setPastFirstPaint(true);
  }, []);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      userType &&
      !["admin", "supplier", "salesRepresentative"].includes(userType)
    ) {
      router.push("/sign-in");
    }
  }, [userType]);

  // Prevent hydration mismatch: render null until userType is loaded
  if (!userType) {
    return null;
  }

  const mobileVisible = pastFirstPaint && toggle;
  return (
    <>
      {/* Backdrop - mobile only when drawer open */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-out ${
          mobileVisible
            ? "opacity-100 pointer-events-auto bg-black/50"
            : "opacity-0 pointer-events-none bg-transparent"
        }`}
        onClick={() => setToggle(false)}
        aria-hidden="true"
      />
      <section
        data-testid={LEFTBAR.root}
        className={`bg-white fixed w-full md:max-w-[240px] lg:max-w-[288px] h-full sm:pb-5 sm:pl-2 border-r-2 z-50
          transition-transform duration-300 ease-out
          max-md:flex max-md:flex-col max-md:max-w-[min(280px,85vw)] max-md:min-h-[100dvh] max-md:pb-[env(safe-area-inset-bottom)] max-md:select-none max-md:touch-pan-y
          ${mobileVisible ? "max-md:translate-x-0 max-md:shadow-xl" : "max-md:-translate-x-full max-md:pointer-events-none"}
          md:translate-x-0 md:block`}
      >
      <div
        className="flex items-center justify-center font-bold text-4xl 2xl:min-h-[70px] h-[70px] 2xl:h-[94px] border-b max-md:hidden"
        data-testid={LEFTBAR.logoContainer}
      >
        <Link href="/">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full max-h-[70px]"
            data-testid={LEFTBAR.logoImage}
          />
        </Link>
      </div>

      {/* Mobile: sticky header with logo + close */}
      <div className="md:hidden flex-shrink-0 sticky top-0 z-10 bg-white border-b flex justify-between items-center py-3 px-4 min-h-[56px] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex items-center font-bold text-4xl min-h-[44px] min-w-[44px]"
          onClick={() => setToggle(false)}
        >
          <img
            src="/images/logocoffee.png"
            alt="Busy Beans"
            className="max-w-[140px] max-h-[44px] object-contain"
            data-testid={LEFTBAR.logoImage}
          />
        </Link>
        <button
          type="button"
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -m-2 rounded-lg active:bg-gray-100 touch-manipulation"
          onClick={() => setToggle(false)}
          aria-label="Close menu"
        >
          <IoClose size={28} className="text-gray-700" />
        </button>
      </div>

      {userType === "admin" ? (
        <ul className="leftbar-nav-scroll flex flex-col space-y-2 md:space-y-1 pt-4 pb-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain md:pt-2 md:pb-0 md:h-[90%]">
          {hasPermission("dashboard_view") && (
            <ListHead
              data-testid={LEFTBAR.dashboardSection}
              title="Dashboard"
              to="/"
              Icon={MdDashboard}
            />
          )}
          {hasPermission("orders_view") && (
            <ListHead
              title="Order Management"
              Icon={MdShoppingCart}
              active={
                pathname.includes("/orders/create") ||
                pathname.includes("/orders/emails") ||
                pathname.includes("/orders/email-logs") ||
                pathname.includes("/orders/delete-invoice")
              }
              Angle={
                FaAngleRight
                // active?.orderManagement?.tab === "orderManagement" &&
                // active?.orderManagement?.status
                //   ? FaAngleUp
                //   : FaAngleDown
              }
              status={
                active?.orderManagement?.tab === "orderManagement" &&
                active?.orderManagement?.status
              }
              onClick={() =>
                handleActive("orderManagement", active?.orderManagement?.status)
              }
              data-testid={LEFTBAR.orderManagementSection}
            />
          )}

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className={`m-2 relative space-y-1`}>
                  {hasPermission("orders_create") && (
                    <ListItems title="Create Order" to="/orders/create" />
                  )}

                  <ListItems title="Emails" to="/orders/emails" />
                  <ListItems title="Email Logs" to="/orders/email-logs" />
                  <ListItems title="Delete Invoice" to="/orders/delete-invoice" />
                </div>
              </>
            )}

          <ListHead
            title="Quickbooks Invoices"
            Icon={MdBusiness}
            active={pathname.includes("/orders/quickbooks")}
            Angle={FaAngleRight}
            onClick={handleQuickbooksOrdersToggle}
            status={active?.quickbookOrders?.status}
          />

          {active?.quickbookOrders?.status && (
            <div className="m-2 relative space-y-1">
              <ListItems
                title="Partner Invoices"
                to="/orders/quickbooks/partner"
                data-testid={LEFTBAR.listItem("partner", "Orders")}
              />

              <ListItems
                title="Customer Invoices"
                to="/orders/quickbooks/customer"
                data-testid={LEFTBAR.listItem("customer", "Orders")}
              />

              <hr className="w-full" />
            </div>
          )}

          <ListHead
            title="Partner Orders"
            Icon={MdBusiness}
            active={pathname.includes("/orders/partnerOrders")}
            Angle={FaAngleRight}
            onClick={handlePartnerOrdersToggle}
            status={active?.partnerOrders?.status}
          />

          {active?.partnerOrders?.status && (
            <div className="m-2 relative space-y-1">
              <ListItems
                title="New Partner Orders"
                to="/orders/partnerOrders/new-orders"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "New Partner Orders"
                )}
                count={PartnerCounts?.data?.data?.[0]?.count}
              />
              {/* <ListItems
                      title="All Partner Orders"
                      to="/orders/partnerOrders/all-orders"
                      data-testid={LEFTBAR.listItem("partnerOrders", "All Partner Orders")}
                    /> */}
              <ListItems
                title="Dispatched Orders"
                to="/orders/partnerOrders/dispatched"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Dispatched Orders"
                )}
                count={PartnerCounts?.data?.data?.[1]?.count}
              />
              <ListItems
                title="Acknowledged Orders"
                to="/orders/partnerOrders/acknowledged"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Acknowledged Orders"
                )}
                count={PartnerCounts?.data?.data?.[2]?.count}
              />
              <ListItems
                title="Shipped Orders"
                to="/orders/partnerOrders/shiped"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Shipped Orders"
                )}
                count={PartnerCounts?.data?.data?.[4]?.count}
              />
              <ListItems
                title="Cancelled Orders"
                to="/orders/partnerOrders/cancelled"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Cancelled Orders"
                )}
                count={PartnerCounts?.data?.data?.[5]?.count}
              />
              <hr className="w-full" />
            </div>
          )}

          <ListHead
            title="Customer Orders"
            Icon={MdShoppingBag}
            active={
              pathname === "/orders" ||
              pathname === "/orders/new-orders" ||
              pathname === "/orders/upcoming" ||
              pathname === "/orders/assigned" ||
              pathname === "/orders/acknowledged" ||
              pathname === "/orders/shiped" ||
              pathname === "/orders/cancelled"
            }
            Angle={FaAngleRight}
            status={active?.customerOrder?.status}
            onClick={handleCustomerOrdersToggle}
          />

          {active?.customerOrder?.status && (
            <div className="m-2 relative space-y-1">
              <ListItems
                title="New Orders"
                to="/orders/new-orders"
                count={overAllData?.data?.data?.[0]?.count || ""}
                data-testid={LEFTBAR.listItem("orderManagement", "New Orders")}
              />
              <ListItems
                title="All Orders"
                to="/orders"
                count={allOrder || ""}
                data-testid={LEFTBAR.listItem("orderManagement", "All Orders")}
              />
              <ListItems
                title="Upcoming Orders"
                to="/orders/upcoming"
                count={overAllData?.data?.data?.[6]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Upcoming Orders"
                )}
              />

              <ListItems
                title="Acknowledged Orders"
                to="/orders/acknowledged"
                count={overAllData?.data?.data?.[2]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Acknowledged Orders"
                )}
              />

              <ListItems
                title="Dispatched Orders"
                to="/orders/assigned"
                count={overAllData?.data?.data?.[1]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Dispatched Orders"
                )}
              />

              <ListItems
                title="Shipped Orders"
                to="/orders/shiped"
                count={overAllData?.data?.data?.[4]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Shipped Orders"
                )}
              />
              {/* <ListItems
                    title="Dispatched Orders"
                    to="/orders/dispatched"
                  /> */}
              <ListItems
                title="Cancelled Orders"
                to="/orders/cancelled"
                count={overAllData?.data?.data?.[5]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Cancelled Orders"
                )}
              />

              <hr className="w-full" />
            </div>
          )}

          {hasPermission("supplier_view") && (
            <ListHead
              title="Supplier Management"
              Icon={MdBusiness}
              data-testid={LEFTBAR.supplierManagementSection}
              active={
                pathname === "/suppliers" || pathname === "/add-new-supplier"
              }
              status={
                active?.supplierManagement?.tab === "supplierManagement" &&
                active?.supplierManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "supplierManagement",
                  active?.supplierManagement?.status
                )
              }
            />
          )}
          {active?.supplierManagement?.tab === "supplierManagement" &&
            active?.supplierManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="All Supplier"
                    to="/suppliers"
                    data-testid={LEFTBAR.listItem(
                      "supplierManagement",
                      "All Supplier"
                    )}
                  />
                  {/* <ListItems title="Active Supplier" to="/active-supplier" />
                  <ListItems
                    title="Inactive Supplier"
                    to="/inactive-supplier"
                  /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {(hasPermission("customer_view") ||
            hasPermission("selected-customer_view")) && (
            <ListHead
              title="Client Management"
              Icon={MdGroups}
              data-testid={LEFTBAR.clientManagementSection}
              active={pathname.includes("/customers")}
              status={
                active?.clientManagement?.tab === "clientManagement" &&
                active?.clientManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "clientManagement",
                  active?.clientManagement?.status
                )
              }
            />
          )}
          {active?.clientManagement?.tab === "clientManagement" &&
            active?.clientManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("customer_view") && (
                    <ListItems
                      title="All Clients"
                      to="/customers"
                      data-testid={LEFTBAR.listItem(
                        "clientManagement",
                        "All Clients"
                      )}
                    />
                  )}
                  {hasPermission("selected-customer_view") && isEmployee && (
                    <ListItems
                      title="Selected Clients"
                      to="/active-clients"
                      data-testid={LEFTBAR.listItem(
                        "clientManagement",
                        "Selected Clients"
                      )}
                    />
                  )}
                  {/* <ListItems title="Inactive Clients" to="/inactive-clients" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("local-partner_view") && (
            <ListHead
              title="Local Partners"
              Icon={MdHandshake}
              data-testid={LEFTBAR.localPartnersSection}
              active={pathname === "/sale-representative"}
              status={
                active?.saleRepresentative?.tab === "saleRepresentative" &&
                active?.saleRepresentative?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "saleRepresentative",
                  active?.saleRepresentative?.status
                )
              }
            />
          )}
          {active?.saleRepresentative?.tab === "saleRepresentative" &&
            active?.saleRepresentative?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="All Local Partners"
                    to="/sale-representative"
                    data-testid={LEFTBAR.listItem(
                      "saleRepresentative",
                      "All Local Partners"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {hasPermission("leads-dashboard_view") && (
            <ListHead
              // data-testid={LEFTBAR.dashboardSection}
              title="Leads Dashboard"
              to="/leads"
              Icon={MdLeaderboard}
            />
          )}

          {hasPermission("subscription_view") && (
            <ListHead
              title="Machine Subscriptions"
              active={
                pathname === "/subscription" ||
                pathname === "/purchased" ||
                pathname === "/addons"
              }
              data-testid={LEFTBAR.subscriptionManagementSection}
              Icon={MdCoffeeMaker}
              status={
                active?.subscription?.tab === "subscription" &&
                active?.subscription?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive("subscription", active?.subscription?.status)
              }
            />
          )}

          {active?.subscription?.tab === "subscription" &&
            active?.subscription?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Subscription"
                    to="/subscription"
                    data-testid={LEFTBAR.listItem(
                      "subscription",
                      "Subscription"
                    )}
                  />
                  <ListItems
                    title="Purchased"
                    to="/purchased"
                    data-testid={LEFTBAR.listItem(
                      "machineSubscriptions",
                      "Purchased"
                    )}
                  />
                  <ListItems
                    title="Addons"
                    to="/addons"
                    data-testid={LEFTBAR.listItem("addons", "Addons")}
                  />
                  {/* <ListItems
                    title="Requests"
                    to="/subscription-requests"
                    data-testid={LEFTBAR.listItem(
                      "subscription-requests",
                      "Requests"
                    )}
                  /> */}

                  {/* <ListItems title="Add-Ons" to="/add-ons" data-testid={LEFTBAR.listItem("add-ons", "Add-Ons")} /> */}
                </div>
                <hr className="w-full" />
              </>
            )}

          {hasPermission("invoice_view") && (
            <ListHead
              title="Invoice Management"
              Icon={MdDescription}
              data-testid={LEFTBAR.invoiceManagementSection}
              status={
                active?.invoiceManagement?.tab === "invoiceManagement" &&
                active?.invoiceManagement?.status
                  ? true
                  : false
              }
              active={
                pathname === "/all-invoices" ||
                pathname === "/customer-invoices" ||
                pathname === "/direct-invoices" ||
                pathname === "/create-invoice"
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "invoiceManagement",
                  active?.invoiceManagement?.status
                )
              }
              disabled={true}
            />
          )}
          {active?.invoiceManagement?.tab === "invoiceManagement" &&
            active?.invoiceManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Create Invoice"
                    to="/create-invoice"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "Create Invoice"
                    )}
                  />

                  <ListItems
                    title="All Invoices"
                    to="/all-invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "All Invoices"
                    )}
                  />

                  <ListItems
                    title="Customer Invoices"
                    to="/invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "Customer Invoices"
                    )}
                  />

                  <ListItems
                    title="Direct Invoices"
                    to="/direct-invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "Direct Invoices"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("payment-pullout_view") && (
            <ListHead
              title="Payment Pullouts"
              active={pathname === "/pullouts"}
              data-testid={LEFTBAR.pulloutsManagementSection}
              Icon={MdPayments}
              status={
                active?.pullouts?.tab === "pullouts" && active?.pullouts?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() => handleActive("pullouts", active?.pullouts?.status)}
            />
          )}

          {active?.pullouts?.tab === "pullouts" && active?.pullouts?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems
                  title="Pullouts"
                  to="/pullouts"
                  data-testid={LEFTBAR.listItem("pullouts", "Pullouts")}
                />
              </div>
              <hr className="w-full" />
            </>
          )}

          {/* <ListHead
          title="Report Management"
          Icon={TbReportAnalytics}
          Angle={
            active?.reportManagement?.tab === "reportManagement" &&
            active?.reportManagement?.status
              ? FaAngleUp
              : FaAngleDown
          }
          onClick={() =>
            handleActive("reportManagement", active?.reportManagement?.status)
          }
        />
        {active?.reportManagement?.tab === "reportManagement" &&
          active?.reportManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="Collection Report" to="" />
                <ListItems title="Disbursement Report" to="" />
                <ListItems title="Top Seller Report" to="" />
                <ListItems title="Top Selling Items" to="" />
                <ListItems title="Top Suppliers" to="" />
                <ListItems title="Top Performing Countries" to="" />
                <ListItems title="Top Performing Cities" to="" />
                <ListItems title="Top Clients" to="" />
              </div>
              <hr className="w-full" />
            </>
          )} */}

          {/* <ListHead
            title="Roles & Employee Manag."
            Icon={MdManageAccounts}
            Angle={
              active?.roleandEmployeeManagement?.tab ===
                "roleandEmployeeManagement" &&
              active?.roleandEmployeeManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "roleandEmployeeManagement",
                active?.roleandEmployeeManagement?.status
              )
            }
            disabled={true}
          /> */}
          {active?.roleandEmployeeManagement?.tab ===
            "roleandEmployeeManagement" &&
            active?.roleandEmployeeManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="All Employees" to="/all-employees" />
                  <ListItems title="Add new Employee" to="/add-new-employee" />
                  <ListItems
                    title="All Roles & Permissions"
                    to="/all-roles-permissions"
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Notification & Alerts"
            Icon={IoNotifications}
            Angle={
              active?.notandAlerts?.tab === "notandAlerts" &&
              active?.notandAlerts?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("notandAlerts", active?.notandAlerts?.status)
            }
          /> */}
          {active?.notandAlerts?.tab === "notandAlerts" &&
            active?.notandAlerts?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Supplier Notifications"
                    to="/supplier-notifications"
                  />
                  <ListItems
                    title="Clients Notifications"
                    to="/clients-notifications"
                  />
                  <ListItems title="Alerts" to="/notification-alerts" />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Collection"
            Icon={BsFillCollectionFill}
            Angle={
              active?.collection?.tab === "collection" &&
              active?.collection?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("collection", active?.collection?.status)
            }
          /> */}
          {active?.collection?.tab === "collection" &&
            active?.collection?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Add Bank Check" to="/add-cheque" />
                  <ListItems
                    title="Collection History"
                    to="/collection-history"
                  />
                  <ListItems
                    title="Bank Checks Due Date"
                    to="/cheques-due-date"
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Disbursement"
            Icon={MdPayment}
            Angle={
              active?.disbursement?.tab === "disbursement" &&
              active?.disbursement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("disbursement", active?.disbursement?.status)
            }
          /> */}
          {active?.disbursement?.tab === "disbursement" &&
            active?.disbursement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Add Disbursement" to="/add-disbursement" />
                  <ListItems
                    title="Disbursement History"
                    to="/disbursement-history"
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("product_view") && (
            <ListHead
              title="Inventory Management"
              // to="/inventory/stock"
              active={pathname === "/inventory/stock"}
              data-testid={LEFTBAR.inventoryManagementSection}
              Icon={MdInventory}
              status={
                active?.inventoryManagement?.tab === "inventoryManagement" &&
                active?.inventoryManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "inventoryManagement",
                  active?.inventoryManagement?.status
                )
              }
            />
          )}

          {active?.inventoryManagement?.tab === "inventoryManagement" &&
            active?.inventoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Inventory Stock"
                    to="/inventory/stock"
                    data-testid={LEFTBAR.listItem(
                      "inventoryManagement",
                      "Inventory Stock"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("category_view") && (
            <ListHead
              title="Category Management"
              // to="/inventory/stock"
              active={pathname === "/category" || pathname === "/sub-category"}
              data-testid={LEFTBAR.categoryManagementSection}
              Icon={MdCategory}
              status={
                active?.categoryManagement?.tab === "categoryManagement" &&
                active?.categoryManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "categoryManagement",
                  active?.categoryManagement?.status
                )
              }
            />
          )}

          {active?.categoryManagement?.tab === "categoryManagement" &&
            active?.categoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Category"
                    to="/category"
                    data-testid={LEFTBAR.listItem(
                      "categoryManagement",
                      "Category"
                    )}
                  />
                  {/* <ListItems title="Sub Category" to="/sub-category" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("employees_view") && (
            <ListHead
              title="Employee Management"
              active={pathname === "/employee"}
              data-testid={LEFTBAR.employeeManagementSection}
              Icon={MdManageAccounts}
              status={
                active?.employees?.tab === "employees" &&
                active?.employees?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive("employees", active?.employees?.status)
              }
            />
          )}

          {active?.employees?.tab === "employees" &&
            active?.employees?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Employee"
                    to="/employee"
                    data-testid={LEFTBAR.listItem("employees", "Employee")}
                  />
                  <ListItems
                    title="Payouts"
                    to="/payouts"
                    data-testid={LEFTBAR.listItem("employees", "Payouts")}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Employee Management"
            // to="/inventory/stock"
            Icon={RiAdminLine}
            active={
              pathname === "/employees" ||
              pathname === "/add-general-employee" ||
              pathname === "/add-sale-representative"
            }
            Angle={
              active?.employeeManagement?.tab === "employeeManagement" &&
              active?.employeeManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "employeeManagement",
                active?.employeeManagement?.status
              )
            }
          /> */}

          {active?.employeeManagement?.tab === "employeeManagement" &&
            active?.employeeManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="All Employees" to="/employees" />
                  <ListItems
                    title="Add General Employee"
                    to="/add-general-employee"
                  />
                  <ListItems
                    title="Add Sale Representative"
                    to="/add-sale-representative"
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("country_view") && (
            <ListHead
              title="Zone Management"
              Icon={MdPublic}
              data-testid={LEFTBAR.zoneManagementSection}
              active={
                pathname === "/zones" ||
                pathname === "/countries" ||
                pathname === "/cities"
              }
              status={
                active?.zoneManagement?.tab === "zoneManagement" &&
                active?.zoneManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive("zoneManagement", active?.zoneManagement?.status)
              }
            />
          )}

          {active?.zoneManagement?.tab === "zoneManagement" &&
            active?.zoneManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="All Countries"
                    to="/countries"
                    data-testid={LEFTBAR.listItem(
                      "zoneManagement",
                      "All Countries"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Promotion Management"
            Icon={GiProgression}
            active={pathname === "/promotions"}
            Angle={
              active?.promotionManagement?.tab === "promotionManagement" &&
              active?.promotionManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "promotionManagement",
                active?.promotionManagement?.status
              )
            }
          /> */}

          {active?.promotionManagement?.tab === "promotionManagement" &&
            active?.promotionManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="All Promotions" to="/promotions" />
                  {/* <ListItems title="All Countries" to="/countries" /> */}
                  {/* <ListItems title="All Cities" to="/cities" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("charges_view") && (
            <ListHead
              title="Shipping Charges Management"
              Icon={MdLocalShipping}
              to={"/shipping-charges"}
              active={pathname.includes("/shipping-charges")}
              data-testid={LEFTBAR.shippingChargesManagementSection}
            />
          )}
          {hasPermission("report_view") && (
            <ListHead
              title="Report Management"
              Icon={MdInsights}
              to={"/reports"}
              active={pathname.includes("/reports")}
              data-testid={LEFTBAR.reportManagementSection}
            />
          )}

          {/* Stripe Dashboard for Employees */}
          {(() => {
            // Always check localStorage directly to ensure we have the latest value
            // This ensures the tab appears immediately when values are set, even before state updates
            if (typeof window === "undefined") {
              return isEmployee && employeeStripeAccountState === "true";
            }
            
            const checkIsEmployee = localStorage.getItem("isEmployee") === "true";
            const checkStripeState = localStorage.getItem("employeeStripeAccountState");
            
            // Update state if localStorage has different values (to keep state in sync)
            if (checkIsEmployee !== isEmployee) {
              setIsEmployee(checkIsEmployee);
            }
            if (checkStripeState !== employeeStripeAccountState) {
              setEmployeeStripeAccountState(checkStripeState);
            }
            
            return checkIsEmployee && checkStripeState === "true";
          })() && (
            <ListHead
              title="Stripe Dashboard"
              Icon={MdPayments}
              onClick={handleEmployeeStripeDashboard}
              active={false}
              data-testid={LEFTBAR.employeeStripeDashboard}
            />
          )}

          {/* Payouts for Employees */}
          {isEmployee && (
            <ListHead
              title="Payouts"
              Icon={MdReceiptLong}
              to="/payouts"
              active={pathname === "/payouts"}
              data-testid={LEFTBAR.employeePayouts}
            />
          )}

          <ListHead
            title="QuickBooks"
            Icon={MdAccountBalance}
            onClick={() =>
              handleActive("quickbooks", active?.quickbooks?.status)
            }
            status={
              active?.quickbooks?.tab === "quickbooks" &&
              active?.quickbooks?.status
                ? true
                : false
            }
            Angle={FaAngleRight}
          />
          {active?.quickbooks?.tab === "quickbooks" &&
            active?.quickbooks?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {!isEmployee && (
                    <button
                      onClick={authenticateQuickbooks}
                      className="w-full flex gap-x-2 text-wrap items-center py-2 px-2 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white duration-200"
                    >
                      Go to QuickBooks
                    </button>
                  )}
                  <ListItems
                    title="Clients"
                    to="/Quickbooks/clients"
                    data-testid={LEFTBAR.listItem("quickbooks", "Clients")}
                  />
                  {/* <ListItems title="Invoices" to="/Quickbooks/invoices" data-testid={LEFTBAR.listItem("quickbooks", "Invoices")} /> */}
                </div>
                <hr className="w-full" />
              </>
            )}

          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 min-h-[44px] py-3 px-3 md:px-2 rounded-lg text-black hover:bg-black hover:text-white active:scale-[0.98] duration-200 touch-manipulation"
              onClick={logoutFunc}
            >
              <MdLogout size={26} />
              <span>Logout</span>
            </button>
          </div>
        </ul>
      ) : userType === "supplier" ? (
        <ul className="leftbar-nav-scroll flex flex-col space-y-2 md:space-y-1 pt-4 pb-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain md:pt-2 md:pb-0 md:h-[90%]">
          <ListHead
            title="Dashboard"
            to="/"
            Icon={MdDashboard}
            data-testid={LEFTBAR.dashboardSection}
          />
          {/* 
          <ListHead
            title="Order Management"
            Icon={MdListAlt}
            data-testid={LEFTBAR.orderManagementSection}
            active={
              pathname === "/supplier/assigned-orders" ||
              pathname === "/supplier/acknowledge-orders" ||
              pathname === "/supplier/dispatched-orders" ||
              pathname === "/supplier/delivered-orders" ||
              pathname === "/supplier/cancelled-orders" ||
              pathname.includes("/supplier/order-detail") ||
              pathname.includes("/supplier/partner")
            }
            status={
              active?.orderManagement?.tab === "orderManagement" &&
              active?.orderManagement?.status
                ? true
                : false
            }
            Angle={FaAngleRight}
            onClick={() =>
              handleActive("orderManagement", active?.orderManagement?.status)
            }
          /> */}

          {/* {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Self Orders"
                    to="/supplier/Self-orders"
                    data-testid={LEFTBAR.listItem(
                      "orderManagement",
                      "Self Orders"
                    )}
                  />

                  <ListHead
                    title="Partner Orders"
                    Icon={MdBusiness}
                    active={pathname.includes("/supplier/partner")}
                    status={active?.partnerOrders?.status ? true : false}
                    Angle={FaAngleRight}
                    onClick={handlePartnerOrdersToggle}
                  />

                  {active?.partnerOrders?.status && (
                    <div className="m-2 relative space-y-1">
                      <ListItems
                        title="New Partner Orders"
                        to="/supplier/partner/new-orders"
                        data-testid={LEFTBAR.listItem(
                          "partnerOrders",
                          "New Partner Orders"
                        )}
                        count={PartnerCounts?.data?.data?.[1]?.count}
                      />

                      <ListItems
                        title="Acknowledged Orders"
                        to="/supplier/partner/acknowledged-orders"
                        data-testid={LEFTBAR.listItem(
                          "partnerOrders",
                          "Acknowledged Orders"
                        )}
                        count={PartnerCounts?.data?.data?.[2]?.count}
                      />
                      <ListItems
                        title="Shipped Orders"
                        to="/supplier/partner/shipped-orders"
                        data-testid={LEFTBAR.listItem(
                          "partnerOrders",
                          "Shipped Orders"
                        )}
                        count={PartnerCounts?.data?.data?.[4]?.count}
                      />

                      <hr className="w-full" />
                    </div>
                  )}

                  <ListHead
                    title="Customer Orders"
                    Icon={MdBusiness}
                    active={
                      pathname === "/supplier/assigned-orders" ||
                      pathname === "/supplier/acknowledge-orders" ||
                      pathname === "/supplier/shiped-orders"
                    }
                    status={active?.customerOrder?.status ? true : false}
                    Angle={FaAngleRight}
                    onClick={handleCustomerOrdersToggle}
                  />

                  {active?.customerOrder?.status && (
                    <div className="m-2 relative space-y-1">
                      <ListItems
                        // title="Assigned Orders"
                        title="New Orders"
                        to="/supplier/assigned-orders"
                        count={overAllData?.data?.data?.[1]?.count || ""}
                        data-testid={LEFTBAR.listItem(
                          "orderManagement",
                          "New Orders"
                        )}
                      />

                      <ListItems
                        title="Acknowledged Orders"
                        to="/supplier/acknowledge-orders"
                        count={overAllData?.data?.data?.[2]?.count || ""}
                        data-testid={LEFTBAR.listItem(
                          "orderManagement",
                          "Acknowledged Orders"
                        )}
                      />

                      <ListItems
                        title="Shipped Orders"
                        to="/supplier/shiped-orders"
                        count={overAllData?.data?.data?.[4]?.count || ""}
                        data-testid={LEFTBAR.listItem(
                          "orderManagement",
                          "Shipped Orders"
                        )}
                      />

                      <hr className="w-full" />
                    </div>
                  )}

                  <ListItems
                    title="Dispatched Orders"
                    to="/supplier/dispatched-orders"
                  />
                  <ListItems
                    title="Cancelled Orders"
                    to="/supplier/cancelled-orders"
                  />
                </div>
              </>
            )} */}

          <div className="m-2 relative space-y-1">
            {/* <ListItems
                    title="Self Orders"
                    to="/supplier/Self-orders"
                    // count={overAllData?.data?.data?.[2]?.count || ""}
                    data-testid={LEFTBAR.listItem(
                      "orderManagement",
                      "Self Orders"
                    )}
                  /> */}

            <ListHead
              title="Partner Orders"
              Icon={MdBusiness}
              active={pathname.includes("/supplier/partner")}
              status={active?.partnerOrders?.status ? true : false}
              Angle={FaAngleRight}
              onClick={handlePartnerOrdersToggle}
            />

            {active?.partnerOrders?.status && (
              <div className="m-2 relative space-y-1">
                <ListItems
                  title="New Partner Orders"
                  to="/supplier/partner/new-orders"
                  data-testid={LEFTBAR.listItem(
                    "partnerOrders",
                    "New Partner Orders"
                  )}
                  count={PartnerCounts?.data?.data?.[1]?.count}
                />

                <ListItems
                  title="Acknowledged Orders"
                  to="/supplier/partner/acknowledged-orders"
                  data-testid={LEFTBAR.listItem(
                    "partnerOrders",
                    "Acknowledged Orders"
                  )}
                  count={PartnerCounts?.data?.data?.[2]?.count}
                />
                <ListItems
                  title="Shipped Orders"
                  to="/supplier/partner/shipped-orders"
                  data-testid={LEFTBAR.listItem(
                    "partnerOrders",
                    "Shipped Orders"
                  )}
                  count={PartnerCounts?.data?.data?.[4]?.count}
                />

                <hr className="w-full" />
              </div>
            )}

            <ListHead
              title="Customer Orders"
              Icon={MdBusiness}
              active={
                pathname === "/supplier/assigned-orders" ||
                pathname === "/supplier/acknowledge-orders" ||
                pathname === "/supplier/shiped-orders"
              }
              status={active?.customerOrder?.status ? true : false}
              Angle={FaAngleRight}
              onClick={handleCustomerOrdersToggle}
            />

            {active?.customerOrder?.status && (
              <div className="m-2 relative space-y-1">
                <ListItems
                  title="New Orders"
                  to="/supplier/assigned-orders"
                  count={overAllData?.data?.data?.[1]?.count || ""}
                  data-testid={LEFTBAR.listItem(
                    "orderManagement",
                    "New Orders"
                  )}
                />

                <ListItems
                  title="Acknowledged Orders"
                  to="/supplier/acknowledge-orders"
                  count={overAllData?.data?.data?.[2]?.count || ""}
                  data-testid={LEFTBAR.listItem(
                    "orderManagement",
                    "Acknowledged Orders"
                  )}
                />

                <ListItems
                  title="Shipped Orders"
                  to="/supplier/shiped-orders"
                  count={overAllData?.data?.data?.[4]?.count || ""}
                  data-testid={LEFTBAR.listItem(
                    "orderManagement",
                    "Shipped Orders"
                  )}
                />

                <hr className="w-full" />
              </div>
            )}

            {/* <ListItems
                    title="Dispatched Orders"
                    to="/supplier/dispatched-orders"
                  /> */}
            {/* <ListItems
                    title="Cancelled Orders"
                    to="/supplier/cancelled-orders"
                  /> */}
          </div>

          <ListHead
            title="Report Management"
            Icon={MdInsights}
            to={"/supplier/reports"}
            active={pathname.includes("/reports")}
            data-testid={LEFTBAR.reportManagementSection}
          />

          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 min-h-[44px] py-3 px-3 md:px-2 rounded-lg text-black hover:bg-black hover:text-white active:scale-[0.98] duration-200 touch-manipulation"
              onClick={logoutFunc}
            >
              <MdLogout size={26} />
              <span>Logout</span>
            </button>
          </div>
        </ul>
      ) : userType === "salesRepresentative" ? (
        <ul className="leftbar-nav-scroll flex flex-col space-y-2 md:space-y-1 pt-4 pb-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain md:pt-2 md:pb-0 md:h-[90%]">
          {hasPermission("dashboard_view") && (
            <ListHead
              data-testid={LEFTBAR.dashboardSection}
              title="Dashboard"
              to="/"
              Icon={MdDashboard}
            />
          )}
          {hasPermission("quotation_view") && (
            <ListHead
              title="Quotation Management"
              active={pathname === "/sales-representative/quotation"}
              Icon={MdReceiptLong}
              data-testid={LEFTBAR.quotationManagementSection}
              status={
                active?.quotationManagement?.tab === "quotationManagement" &&
                active?.quotationManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "quotationManagement",
                  active?.quotationManagement?.status
                )
              }
            />
          )}

          {active?.quotationManagement?.tab === "quotationManagement" &&
            active?.quotationManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Quotation"
                    to="/sales-representative/quotation"
                    data-testid={LEFTBAR.listItem(
                      "quotationManagement",
                      "Quotation"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          <ListHead
            title="Inventory Management"
            active={pathname === "/sales-representative/inventory/stock"}
            data-testid={LEFTBAR.inventoryManagementSection}
            Icon={MdInventory}
            status={
              active?.salesRepInventoryManagement?.tab === "salesRepInventoryManagement" &&
              active?.salesRepInventoryManagement?.status
                ? true
                : false
            }
            Angle={FaAngleRight}
            onClick={() =>
              handleActive(
                "salesRepInventoryManagement",
                active?.salesRepInventoryManagement?.status
              )
            }
          />

          {active?.salesRepInventoryManagement?.tab === "salesRepInventoryManagement" &&
            active?.salesRepInventoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Inventory Stock"
                    to="/sales-representative/inventory/stock"
                    data-testid={LEFTBAR.listItem(
                      "salesRepInventoryManagement",
                      "Inventory Stock"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {(hasPermission("customer_view") ||
            hasPermission("selected-customer_view")) && (
            <ListHead
              title="Client Management"
              Icon={MdGroups}
              data-testid={LEFTBAR.clientManagementSection}
              active={pathname === "/sales-representative/customers"}
              status={
                active?.clientManagement?.tab === "clientManagement" &&
                active?.clientManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "clientManagement",
                  active?.clientManagement?.status
                )
              }
            />
          )}

          {active?.clientManagement?.tab === "clientManagement" &&
            active?.clientManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("customer_view") && (
                    <ListItems
                      title="All Clients"
                      to="/sales-representative/customers"
                      data-testid={LEFTBAR.listItem(
                        "clientManagement",
                        "All Clients"
                      )}
                    />
                  )}
                  {hasPermission("selected-customer_view") && isEmployee && (
                    <ListItems
                      title="Selected Clients"
                      to="/active-clients"
                      data-testid={LEFTBAR.listItem(
                        "clientManagement",
                        "Selected Clients"
                      )}
                    />
                  )}
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* <ListHead
            title="Create Order"
            Icon={AiOutlineUnorderedList}
            to={"/sales-representative/create-order"}
            active={pathname === "/sales-representative/create-order"}
            // Angle={
            //   active?.orderManagement?.tab === "walletManagement" &&
            //   active?.orderManagement?.status
            //     ? FaAngleUp
            //     : FaAngleDown
            // }
            // onClick={() =>
            //   handleActive("walletManagement", active?.orderManagement?.status)
            // }
          /> */}
          {hasPermission("orders_view") && (
            <ListHead
              title="Order Management"
              Icon={MdShoppingCart}
              data-testid={LEFTBAR.orderManagementSection}
              active={
                pathname === "/sales-representative/create-order" ||
                pathname.includes("/orders/delete-invoice")
              }
              status={
                active?.orderManagement?.tab === "orderManagement" &&
                active?.orderManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive("orderManagement", active?.orderManagement?.status)
              }
            />
          )}

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("orders_create") && (
                    <ListItems
                      title="Create Orders"
                      to="/sales-representative/create-order"
                      data-testid={LEFTBAR.listItem(
                        "orderManagement",
                        "Create Orders"
                      )}
                    />
                  )}
                  <ListItems
                    title="Delete Invoice"
                    to="/orders/delete-invoice"
                    data-testid={LEFTBAR.listItem(
                      "orderManagement",
                      "Delete Invoice"
                    )}
                  />
                </div>
              </>
            )}

          <ListHead
            title="Quickbooks Invoices"
            Icon={MdReceiptLong}
            active={pathname.includes("/orders/quickbooks")}
            Angle={FaAngleRight}
            onClick={handleQuickbooksOrdersToggle}
            status={active?.quickbookOrders?.status}
          />

          {active?.quickbookOrders?.status && (
            <div className="m-2 relative space-y-1">
              {/* <ListItems
                        title="Partner Orders"
                        to="/orders/quickbooks/partner"
                        data-testid={LEFTBAR.listItem("partner", "Orders")}
                      /> */}

              <ListItems
                title="Customer Invoices"
                to="/orders/quickbooks/customer"
                data-testid={LEFTBAR.listItem("customer", "Orders")}
              />

              <hr className="w-full" />
            </div>
          )}

          <ListHead
            title="Partner Orders"
            Icon={MdBusiness}
            active={pathname.includes("/orders/partnerOrders")}
            status={active?.partnerOrders?.status ? true : false}
            Angle={FaAngleRight}
            onClick={handlePartnerOrdersToggle}
          />

          {active?.partnerOrders?.status && (
            <div className="m-2 relative space-y-1">
              <ListItems
                title="New Partner Orders"
                to="/orders/partnerOrders/new-orders"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "New Partner Orders"
                )}
                count={PartnerCounts?.data?.data?.[0]?.count}
              />
              {/* <ListItems
                          title="All Partner Orders"
                          to="/orders/partnerOrders/all-orders"
                          data-testid={LEFTBAR.listItem("partnerOrders", "All Partner Orders")}
                        /> */}
              <ListItems
                title="Dispatched Orders"
                to="/orders/partnerOrders/dispatched"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Dispatched Orders"
                )}
                count={PartnerCounts?.data?.data?.[1]?.count}
              />
              <ListItems
                title="Acknowledged Orders"
                to="/orders/partnerOrders/acknowledged"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Acknowledged Orders"
                )}
                count={PartnerCounts?.data?.data?.[2]?.count}
              />
              <ListItems
                title="Shipped Orders"
                to="/orders/partnerOrders/shiped"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Shipped Orders"
                )}
                count={PartnerCounts?.data?.data?.[4]?.count}
              />
              <ListItems
                title="Cancelled Orders"
                to="/orders/partnerOrders/cancelled"
                data-testid={LEFTBAR.listItem(
                  "partnerOrders",
                  "Cancelled Orders"
                )}
                count={PartnerCounts?.data?.data?.[5]?.count}
              />
              <hr className="w-full" />
            </div>
          )}

          <ListHead
            title="Customer Orders"
            Icon={MdShoppingBag}
            active={
              pathname === "/orders" ||
              pathname === "/orders/new-orders" ||
              pathname === "/sales-representative/upcoming-orders" ||
              pathname === "/orders/assigned" ||
              pathname === "/orders/acknowledged" ||
              pathname === "/orders/shiped" ||
              pathname === "/orders/cancelled"
            }
            Angle={active?.customerOrder?.status ? FaAngleUp : FaAngleDown}
            onClick={handleCustomerOrdersToggle}
          />

          {active?.customerOrder?.status && (
            <div className="m-2 relative space-y-1">
              <ListItems
                title="New Orders"
                to="/orders/new-orders"
                count={overAllData?.data?.data?.[0]?.count || ""}
                data-testid={LEFTBAR.listItem("orderManagement", "New Orders")}
              />
              <ListItems
                title="All Orders"
                to="/orders"
                count={allOrder || ""}
                data-testid={LEFTBAR.listItem("orderManagement", "All Orders")}
              />
              <ListItems
                title="Upcoming Orders"
                to="/sales-representative/upcoming-orders"
                count={overAllData?.data?.data?.[6]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Upcoming Orders"
                )}
              />
              <ListItems
                title="Dispatched Orders"
                to="/orders/assigned"
                count={overAllData?.data?.data?.[1]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Dispatched Orders"
                )}
              />
              <ListItems
                title="Acknowledged Orders"
                to="/orders/acknowledged"
                count={overAllData?.data?.data?.[2]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Acknowledged Orders"
                )}
              />
              <ListItems
                title="Shipped Orders"
                to="/orders/shiped"
                count={overAllData?.data?.data?.[4]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Shipped Orders"
                )}
              />
              <ListItems
                title="Cancelled Orders"
                to="/orders/cancelled"
                count={overAllData?.data?.data?.[5]?.count || ""}
                data-testid={LEFTBAR.listItem(
                  "orderManagement",
                  "Cancelled Orders"
                )}
              />{" "}
            </div>
          )}

          {hasPermission("leads-dashboard_view") && (
            <ListHead
              // data-testid={LEFTBAR.dashboardSection}
              title="Leads Dashboard"
              to="/leads"
              Icon={MdLeaderboard}
            />
          )}

          {/* {hasPermission("subscription_view") && (
            <ListHead
              title="Machine Subscriptions"
              active={pathname === "/subscription" || pathname === "/purchased"}
              data-testid={LEFTBAR.subscriptionManagementSection}
              Icon={MdCoffeeMaker}
              Angle={
                active?.subscription?.tab === "subscription" &&
                active?.subscription?.status
                  ? FaAngleUp
                  : FaAngleDown
              }
              onClick={() =>
                handleActive("subscription", active?.subscription?.status)
              }
            />
          )} */}

          {/* {active?.subscription?.tab === "subscription" &&
            active?.subscription?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Subscription"
                    to="/subscription"
                    data-testid={LEFTBAR.listItem(
                      "subscription",
                      "Subscription"
                    )}
                  />
                  <ListItems
                    title="Purchased"
                    to="/purchased"
                    data-testid={LEFTBAR.listItem(
                      "machineSubscriptions",
                      "Purchased"
                    )}
                  />

                </div>
                <hr className="w-full" />
              </>
            )} */}

          {hasPermission("invoice_view") && (
            <ListHead
              title="Invoice Management"
              Icon={MdDescription}
              data-testid={LEFTBAR.invoiceManagementSection}
              status={
                active?.invoiceManagement?.tab === "invoiceManagement" &&
                active?.invoiceManagement?.status
                  ? true
                  : false
              }
              active={
                pathname === "/all-invoices" ||
                pathname === "/customer-invoices" ||
                pathname === "/direct-invoices"
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "invoiceManagement",
                  active?.invoiceManagement?.status
                )
              }
              disabled={true}
            />
          )}
          {active?.invoiceManagement?.tab === "invoiceManagement" &&
            active?.invoiceManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Create Invoice"
                    to="/create-invoice"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "Create Invoice"
                    )}
                  />
                  <ListItems
                    title="All Invoices"
                    to="/all-invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "All Invoices"
                    )}
                  />
                  <ListItems
                    title="Customer Invoices"
                    to="/invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "All Invoices"
                    )}
                  />
                  <ListItems
                    title="Direct Invoices"
                    to="/direct-invoices"
                    data-testid={LEFTBAR.listItem(
                      "invoiceManagement",
                      "Direct Invoices"
                    )}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("payment-pullout_view") && (
            <ListHead
              title="Payment Pullouts"
              active={pathname === "/pullouts"}
              Icon={MdPayments}
              data-testid={LEFTBAR.pulloutsManagementSection}
              status={
                active?.pullouts?.tab === "pullouts" && active?.pullouts?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() => handleActive("pullouts", active?.pullouts?.status)}
            />
          )}

          {active?.pullouts?.tab === "pullouts" && active?.pullouts?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems
                  title="Pullouts"
                  to="/pullouts"
                  data-testid={LEFTBAR.listItem("pullouts", "Pullouts")}
                />
              </div>
              <hr className="w-full" />
            </>
          )}
          {hasPermission("employees_view") && (
            <ListHead
              title="Employee Management"
              active={pathname === "/employee"}
              Icon={MdManageAccounts}
              data-testid={LEFTBAR.employeeManagementSection}
              status={
                active?.employees?.tab === "employees" &&
                active?.employees?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive("employees", active?.employees?.status)
              }
            />
          )}

          {active?.employees?.tab === "employees" &&
            active?.employees?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Employee"
                    to="/employee"
                    data-testid={LEFTBAR.listItem("employees", "Employee")}
                  />
                  <ListItems
                    title="Payouts"
                    to="/payouts"
                    data-testid={LEFTBAR.listItem("employees", "Payouts")}
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("account_view") && (
            <ListHead
              title="Account Management"
              Icon={MdManageAccounts}
              active={pathname.includes("/account")}
              data-testid={LEFTBAR.accountManagementSection}
              status={
                active?.accountManagement?.tab === "accountManagement" &&
                active?.accountManagement?.status
                  ? true
                  : false
              }
              Angle={FaAngleRight}
              onClick={() =>
                handleActive(
                  "accountManagement",
                  active?.accountManagement?.status
                )
              }
            />
          )}

          {active?.accountManagement?.tab === "accountManagement" &&
            active?.accountManagement?.status && (
              <>
                <div className={`px-2`}>
                  <button
                    onClick={handleConnectAccount}
                    className="w-full flex gap-x-2 text-wrap items-center py-2 px-2 rounded-lg font-inter font-medium   duration-200 bg-theme text-white"
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
                <hr className="w-full" />
              </>
            )}
          {hasPermission("wallet_view") && (
            <ListHead
              title="Wallet Management"
              Icon={MdSavings}
              to={"/sales-representative/wallet"}
              data-testid={LEFTBAR.walletManagementSection}
              active={pathname === "/sales-representative/wallet"}
              // Angle={
              //   active?.orderManagement?.tab === "walletManagement" &&
              //   active?.orderManagement?.status
              //     ? FaAngleUp
              //     : FaAngleDown
              // }
              // onClick={() =>
              //   handleActive("walletManagement", active?.orderManagement?.status)
              // }
            />
          )}
          {hasPermission("report_view") && (
            <ListHead
              title="Report Management"
              Icon={MdInsights}
              to={"/sales-representative/reports"}
              active={pathname.includes("/reports")}
              data-testid={LEFTBAR.reportManagementSection}
            />
          )}

          <ListHead
            title="QuickBooks"
            Icon={MdAccountBalance}
            onClick={() =>
              handleActive("quickbooks", active?.quickbooks?.status)
            }
            status={
              active?.quickbooks?.tab === "quickbooks" &&
              active?.quickbooks?.status
                ? true
                : false
            }
            Angle={FaAngleRight}
          />
          {active?.quickbooks?.tab === "quickbooks" &&
            active?.quickbooks?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <button
                    onClick={authenticateQuickbooks}
                    className="w-full flex gap-x-2 text-wrap items-center py-2 px-2 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white duration-200"
                  >
                    Go to QuickBooks
                  </button>
                  <ListItems
                    title="Clients"
                    to="/Quickbooks/clients"
                    data-testid={LEFTBAR.listItem("quickbooks", "Clients")}
                  />
                  {/* <ListItems title="Invoices" to="/Quickbooks/invoices" data-testid={LEFTBAR.listItem("quickbooks", "Invoices")} /> */}
                </div>
                <hr className="w-full" />
              </>
            )}

          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 min-h-[44px] py-3 px-3 md:px-2 rounded-lg text-black hover:bg-black hover:text-white active:scale-[0.98] duration-200 touch-manipulation"
              onClick={logoutFunc}
              data-testid={LEFTBAR.userLogoutButton}
            >
              <MdLogout size={26} />
              <span>Logout</span>
            </button>
          </div>
        </ul>
      ) : null}

      {newOrder && userType !== "supplier" && (
        <div
          onClick={() => {
            router.push(`/orders/detail/${orderData?.data?.orderId}`);
          }}
          className="fixed bottom-5 right-2 w-72 px-4 rounded-md bg-theme text-white cursor-pointer p-2 "
        >
          <p>{orderData?.notification?.title}</p>
          <p>{orderData?.notification?.body}</p>
        </div>
      )}
    </section>
    </>
  );
}
