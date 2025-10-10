"use client";
import { useEffect, useState } from "react";
import {
  MdDashboard,
  MdListAlt,
  MdStore,
  MdGroups,
  MdPeopleAlt,
  MdInventory,
  MdCategory,
  MdManageAccounts,
  MdPublic,
  MdLocalShipping,
  MdInsights,
  MdRequestQuote,
  MdPayments,
  MdAccountCircle,
  MdSavings,
  MdLogout,
  MdReceiptLong,
  MdCoffeeMaker
} from "react-icons/md";
import {
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import ListHead from "./ListHead";
import ListItems from "./ListItems";
import Link from "next/link";
import { info_toaster, success_toaster, error_toaster } from "@/utilities/Toaster";
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
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var userID = localStorage.getItem("userID");
    var connectAccountId = localStorage.getItem("connectAccountId");
    var isAccountConnected = localStorage.getItem("isAccountConnected");
    var isEmployee = localStorage.getItem("isEmployee") ? true : false;
    var url = window.location.href;
  }

  const generateUrl =
    userType === "admin"
      ? "api/v1/admin/order-navigation-counts"
      : userType === "salesRepresentative"
      ? `api/v1/admin/order-navigation-counts/sales-rep/${userID}`
      : `api/v1/admin/order-navigation-counts/supplier/${userID}`;
  const overAllData = GetAPI(generateUrl);

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
    const path = url.split("/");
    if (isAccountConnected === "false" && connectAccountId !== "null") {
      try {
        const res = await PostAPI(`api/v1/admin/stripe-connect-account-url/${userID}`,
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
        const res = await PostAPI(`api/v1/admin/create-stripe-connect-account/${userID}`,
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
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : "";
        const res = await axios.get(
          BASE_URL + `api/v1/admin/stripe-connect-account-dashboard/${userID}`, {
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
    (sum, item) => (sum + item?.count),
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
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !["admin", "supplier", "salesRepresentative"].includes(userType)
    ) {
      router.push("/sign-in");
    }
  }, []);

  return (
    <section
      data-testid={LEFTBAR.root}
      className={`bg-white ${toggle ? "hidden" : "block"
        } md:block fixed w-full md:max-w-[240px] lg:max-w-[288px] h-full sm:pb-5 sm:pl-2 border-r-2 z-50`}
    >
      <div className="flex items-center justify-center font-bold text-4xl 2xl:min-h-[70px] h-[70px] 2xl:h-[94px] border-b max-md:hidden"
       data-testid={LEFTBAR.logoContainer}>
        <Link href="/">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full max-h-[70px]"
            data-testid={LEFTBAR.logoImage}
          />
        </Link>
      </div>

      <div className="md:hidden flex justify-between items-center py-3 w-11/12 mx-auto">
        <div>
          {" "}
          <Link
            href="/"
            className="flex items-center font-bold text-4xl min-h-[70px] max-h-[71px]"
          >
            {/* Busy Bean */}
            {/* <img src="/images/logocoffee.png" alt="logo" className="max-w-16 max-h-[70px]" /> */}
            <img
              src="/images/logocoffee.png"
              alt="logo"
              className="max-w-48 max-h-[70px]"
              data-testid={LEFTBAR.logoImage}
            />
          </Link>
        </div>
        <div
          className="md:hidden"
          onClick={() => {
            // props?.setNavbarVis(!props?.navbarVis);
            setToggle(!toggle);
          }}
        >
          <IoClose size="25px" />
        </div>
      </div>

      {userType === "admin" ? (
        <ul className="flex flex-col space-y-1 pt-2 overflow-auto h-[90%]">
          {hasPermission("dashboard_view") && <ListHead data-testid={LEFTBAR.dashboardSection} title="Dashboard" to="/" Icon={MdDashboard} />}
          {hasPermission("orders_view") && (
          <ListHead
            title="Order Management"
            Icon={MdListAlt}
            active={pathname.includes("/orders")}
            Angle={
              active?.orderManagement?.tab === "orderManagement" &&
              active?.orderManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("orderManagement", active?.orderManagement?.status)
            }
            data-testid={LEFTBAR.orderManagementSection}
          /> )}

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("orders_create") && ( <ListItems title="Create Order" to="/orders/create" /> )}
                <ListHead
                  title="Partner Orders"
                  Icon={MdStore}
                  active={pathname.includes("/orders/partnerOrders")}
                  Angle={active?.partnerOrders?.status ? FaAngleUp : FaAngleDown}
                  onClick={handlePartnerOrdersToggle}
                />

                {active?.partnerOrders?.status && (
                  <div className="m-2 relative space-y-1">
                    <ListItems
                      title="New Partner Orders"
                      to="/orders/partnerOrders/new-orders"
                      data-testid={LEFTBAR.listItem("partnerOrders", "New Partner Orders")}
                    />
                    {/* <ListItems
                      title="All Partner Orders"
                      to="/orders/partnerOrders/all-orders"
                      data-testid={LEFTBAR.listItem("partnerOrders", "All Partner Orders")}
                    /> */}
                    <hr className="w-full" />
                  </div>
                )}
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
                    data-testid={LEFTBAR.listItem("orderManagement", "Upcoming Orders")} 
                  /> 
                  <ListItems
                    title="Dispatched Orders"
                    to="/orders/assigned"
                    count={overAllData?.data?.data?.[1]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Dispatched Orders")} 
                  /> 
                  <ListItems
                    title="Acknowledged Orders"
                    to="/orders/acknowledged"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Acknowledged Orders")} 
                  /> 
                  <ListItems
                    title="Shipped Orders"
                    to="/orders/shiped"
                    count={overAllData?.data?.data?.[4]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Shipped Orders")} 
                  /> 
                  {/* <ListItems
                    title="Dispatched Orders"
                    to="/orders/dispatched"
                  /> */}
                  <ListItems
                    title="Cancelled Orders"
                    to="/orders/cancelled"
                    count={overAllData?.data?.data?.[5]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Cancelled Orders")} 
                  /> 
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("supplier_view") && (
          <ListHead
            title="Supplier Management"
            Icon={MdStore}
            data-testid={LEFTBAR.supplierManagementSection}
            active={
              pathname === "/suppliers" || pathname === "/add-new-supplier"
            }
            Angle={
              active?.supplierManagement?.tab === "supplierManagement" &&
              active?.supplierManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "supplierManagement",
                active?.supplierManagement?.status
              )
            }
          /> )}
          {active?.supplierManagement?.tab === "supplierManagement" &&
            active?.supplierManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="All Supplier" to="/suppliers" 
                  data-testid={LEFTBAR.listItem("supplierManagement", "All Supplier")} />
                  {/* <ListItems title="Active Supplier" to="/active-supplier" />
                  <ListItems
                    title="Inactive Supplier"
                    to="/inactive-supplier"
                  /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {(hasPermission("customer_view") || hasPermission("selected-customer_view")) && (
          <ListHead
            title="Client Management"
            Icon={MdGroups}
            data-testid={LEFTBAR.clientManagementSection}
            active={pathname.includes("/customers")}
            Angle={
              active?.clientManagement?.tab === "clientManagement" &&
              active?.clientManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("clientManagement", active?.clientManagement?.status)
            }
          /> )}
          {active?.clientManagement?.tab === "clientManagement" &&
            active?.clientManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("customer_view") && <ListItems title="All Clients" to="/customers" data-testid={LEFTBAR.listItem("clientManagement", "All Clients")} />}
                  {hasPermission("selected-customer_view") && isEmployee && <ListItems title="Selected Clients" to="/active-clients" data-testid={LEFTBAR.listItem("clientManagement", "Selected Clients")} />}
                  {/* <ListItems title="Inactive Clients" to="/inactive-clients" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("local-partner_view") && (
          <ListHead
            title="Local Partners"
            Icon={MdPeopleAlt}
            data-testid={LEFTBAR.localPartnersSection}
            active={pathname === "/sale-representative"}
            Angle={
              active?.saleRepresentative?.tab === "saleRepresentative" &&
              active?.saleRepresentative?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "saleRepresentative",
                active?.saleRepresentative?.status
              )
            }
          /> )}
          {active?.saleRepresentative?.tab === "saleRepresentative" &&
            active?.saleRepresentative?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="All Local Partners"
                    to="/sale-representative"
                    data-testid={LEFTBAR.listItem("saleRepresentative", "All Local Partners")} 
                  />
                </div>
                <hr className="w-full" />
              </>
            )}

          {/* {hasPermission("subscription_view") && (
          <ListHead
            title="Machine Subscriptions"
            active={pathname === "/subscription"}
            data-testid={LEFTBAR.subscriptionManagementSection}
            Icon={MdCoffeeMaker}
            Angle={
              active?.subscription?.tab === "subscription" &&
              active?.subscription?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "subscription",
                active?.subscription?.status
              )
            }
          /> )}

          {active?.subscription?.tab === "subscription" &&
            active?.subscription?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Subscription" to="/subscription" data-testid={LEFTBAR.listItem("subscription", "Subscription")} />
                  <ListItems title="Requests" to="/subscription-requests" data-testid={LEFTBAR.listItem("subscription-requests", "Requests")} />
                  <ListItems title="Add-Ons" to="/add-ons" data-testid={LEFTBAR.listItem("add-ons", "Add-Ons")} />
                </div>
                <hr className="w-full" />
              </>
            )} */}

          {hasPermission("invoice_view") && (
          <ListHead
            title="Invoice Management"
            Icon={MdRequestQuote}
            data-testid={LEFTBAR.invoiceManagementSection}
            Angle={
              active?.invoiceManagement?.tab === "invoiceManagement" &&
              active?.invoiceManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "invoiceManagement",
                active?.invoiceManagement?.status
              )
            }
            disabled={true}
          /> )}
          {active?.invoiceManagement?.tab === "invoiceManagement" &&
            active?.invoiceManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Create Invoice" to="/create-invoice" data-testid={LEFTBAR.listItem("invoiceManagement", "Create Invoice")} />
                  <ListItems title="All Invoices" to="/invoices" data-testid={LEFTBAR.listItem("invoiceManagement", "All Invoices")} />
                  <ListItems title="Individual Invoices" to="/individual-invoices" data-testid={LEFTBAR.listItem("invoiceManagement", "Individual Invoices")} />
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
            Angle={
              active?.pullouts?.tab === "pullouts" &&
              active?.pullouts?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "pullouts",
                active?.pullouts?.status
              )
            }
          /> )}

          {active?.pullouts?.tab === "pullouts" &&
            active?.pullouts?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Pullouts" to="/pullouts" data-testid={LEFTBAR.listItem("pullouts", "Pullouts")} />
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
            Angle={
              active?.inventoryManagement?.tab === "inventoryManagement" &&
              active?.inventoryManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "inventoryManagement",
                active?.inventoryManagement?.status
              )
            }
          /> )}

          {active?.inventoryManagement?.tab === "inventoryManagement" &&
            active?.inventoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Inventory Stock" to="/inventory/stock" data-testid={LEFTBAR.listItem("inventoryManagement", "Inventory Stock")} />
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
            Angle={
              active?.categoryManagement?.tab === "categoryManagement" &&
              active?.categoryManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "categoryManagement",
                active?.categoryManagement?.status
              )
            }
          /> )}

          {active?.categoryManagement?.tab === "categoryManagement" &&
            active?.categoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Category" to="/category" data-testid={LEFTBAR.listItem("categoryManagement", "Category")} />
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
            Angle={
              active?.employees?.tab === "employees" &&
              active?.employees?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "employees",
                active?.employees?.status
              )
            }
          /> )}

          {active?.employees?.tab === "employees" &&
            active?.employees?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Employee" to="/employee" data-testid={LEFTBAR.listItem("employees", "Employee")} />
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
            Angle={
              active?.zoneManagement?.tab === "zoneManagement" &&
              active?.zoneManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("zoneManagement", active?.zoneManagement?.status)
            }
          /> )}

          {active?.zoneManagement?.tab === "zoneManagement" &&
            active?.zoneManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="All Countries" to="/countries" data-testid={LEFTBAR.listItem("zoneManagement", "All Countries")} />
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
          {hasPermission("charges_view") &&
          <ListHead
            title="Shipping Charges Management"
            Icon={MdLocalShipping}
            to={"/shipping-charges"}
            active={pathname.includes("/shipping-charges")}
            data-testid={LEFTBAR.shippingChargesManagementSection}
          /> }
          {hasPermission("report_view") &&
          <ListHead
            title="Report Management"
            Icon={MdInsights}
            to={"/reports"}
            active={pathname.includes("/reports")}
            data-testid={LEFTBAR.reportManagementSection}
          /> }

          <ListHead
            title="QuickBooks"
            Icon={MdAccountCircle}
            onClick={() => handleActive("quickbooks", active?.quickbooks?.status)}
            Angle={
              active?.quickbooks?.tab === "clientManagement" &&
              active?.quickbooks?.status
                ? FaAngleUp
                : FaAngleDown
            }
          />
          {active?.quickbooks?.tab === "quickbooks" && active?.quickbooks?.status && (
            <>
            <div className="m-2 relative space-y-1">
              <button 
               onClick={authenticateQuickbooks} 
               className="w-full flex gap-x-2 text-wrap items-center py-2 px-2 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white duration-200"
              >
                Go to QuickBooks
              </button>
              <ListItems title="Clients" to="/Quickbooks/clients" data-testid={LEFTBAR.listItem("quickbooks", "Clients")} />
              {/* <ListItems title="Invoices" to="/Quickbooks/invoices" data-testid={LEFTBAR.listItem("quickbooks", "Invoices")} /> */}
            </div>
            <hr className="w-full" />
            </>
          )}

          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 px-2 py-3 rounded-lg text-black hover:bg-black hover:text-white 
          duration-200"
              onClick={logoutFunc}
            >
              <MdLogout size={26} />
              <span>Logout</span>
            </button>
          </div>
        </ul>
      ) : userType === "supplier" ? (
        <ul className="flex flex-col space-y-1 pt-2  overflow-auto h-[90%]">
          <ListHead title="Dashboard" to="/" Icon={MdDashboard} data-testid={LEFTBAR.dashboardSection}/>

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
              pathname.includes("/supplier/order-detail")
            }
            Angle={
              active?.orderManagement?.tab === "orderManagement" &&
              active?.orderManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("orderManagement", active?.orderManagement?.status)
            }
          />

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    // title="Assigned Orders"
                    title="New Orders"
                    to="/supplier/assigned-orders"
                    count={overAllData?.data?.data?.[1]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "New Orders")} 
                  />
                  <ListItems
                    title="Acknowledged Orders"
                    to="/supplier/acknowledge-orders"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Acknowledged Orders")} 
                  />
                  <ListItems
                    title="Shipped Orders"
                    to="/supplier/shiped-orders"
                    count={overAllData?.data?.data?.[4]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Shipped Orders")} 
                  />
                  {/* <ListItems
                    title="Dispatched Orders"
                    to="/supplier/dispatched-orders"
                  /> */}
                  {/* <ListItems
                    title="Cancelled Orders"
                    to="/supplier/cancelled-orders"
                  /> */}
                </div>
                <hr className="w-full" />
              </>
            )}

          <ListHead
            title="Report Management"
            Icon={MdInsights}
            to={"/supplier/reports"}
            active={pathname.includes("/reports")}
            data-testid={LEFTBAR.reportManagementSection}
          />

          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 px-2 py-3 rounded-lg text-black hover:bg-black hover:text-white 
        duration-200"
              onClick={logoutFunc}
            >
              <MdLogout size={26} />
              <span>Logout</span>
            </button>
          </div>
        </ul>
      ) : userType === "salesRepresentative" ? (
        <ul className="flex flex-col space-y-1 pt-2 overflow-auto h-[90%]">
          {hasPermission("dashboard_view") && <ListHead data-testid={LEFTBAR.dashboardSection} title="Dashboard" to="/" Icon={MdDashboard} />}
          {hasPermission("quotation_view") &&
          <ListHead
            title="Quotation Management"
            active={pathname === "/sales-representative/quotation"}
            Icon={MdReceiptLong}
            data-testid={LEFTBAR.quotationManagementSection}
            Angle={
              active?.inventoryManagement?.tab === "inventoryManagement" &&
              active?.inventoryManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "inventoryManagement",
                active?.inventoryManagement?.status
              )
            }
          />}

          {active?.inventoryManagement?.tab === "inventoryManagement" &&
            active?.inventoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Quotation"
                    to="/sales-representative/quotation"
                    data-testid={LEFTBAR.listItem("inventoryManagement", "Quotation")} 
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
            
          {(hasPermission("customer_view") || hasPermission("selected-customer_view")) && (
          <ListHead
            title="Client Management"
            Icon={MdGroups}
            data-testid={LEFTBAR.clientManagementSection}
            active={pathname === "/sales-representative/customers"}
            Angle={
              active?.clientManagement?.tab === "clientManagement" &&
              active?.clientManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("clientManagement", active?.clientManagement?.status)
            }
          /> )}

          {active?.clientManagement?.tab === "clientManagement" &&
            active?.clientManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("customer_view") && <ListItems
                    title="All Clients"
                    to="/sales-representative/customers"
                    data-testid={LEFTBAR.listItem("clientManagement", "All Clients")} 
                  />}
                  {hasPermission("selected-customer_view") && isEmployee && <ListItems title="Selected Clients" to="/active-clients" 
                  data-testid={LEFTBAR.listItem("clientManagement", "Selected Clients")} />}
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
            Icon={MdListAlt}
            data-testid={LEFTBAR.orderManagementSection}
            active={pathname.includes("/orders") || pathname.includes("-order")}
            Angle={
              active?.orderManagement?.tab === "orderManagement" &&
              active?.orderManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive("orderManagement", active?.orderManagement?.status)
            }
          /> )}

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("orders_create") &&
                  <ListItems
                    title="Create Orders"
                    to="/sales-representative/create-order"
                    data-testid={LEFTBAR.listItem("orderManagement", "Create Orders")} 
                  />}
                    <ListHead
                      title="Partner Orders"
                      Icon={MdStore}
                      active={pathname.includes("/orders/partnerOrders")}
                      Angle={active?.partnerOrders?.status ? FaAngleUp : FaAngleDown}
                      onClick={handlePartnerOrdersToggle}
                    />

                    {active?.partnerOrders?.status && (
                      <div className="m-2 relative space-y-1">
                        <ListItems
                          title="New Partner Orders"
                          to="/orders/partnerOrders/new-orders"
                          data-testid={LEFTBAR.listItem("partnerOrders", "New Partner Orders")}
                        />
                        {/* <ListItems
                      title="All Partner Orders"
                      to="/orders/partnerOrders/all-orders"
                      data-testid={LEFTBAR.listItem("partnerOrders", "All Partner Orders")}
                    /> */}
                        <hr className="w-full" />
                      </div>
                    )}
                  <ListItems
                    title="New Orders"
                    to="/orders/new-orders"
                    count={overAllData?.data?.data?.[0]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "New Orders")} 
                  />
                  <ListItems title="All Orders" to="/orders" count={allOrder || ""} 
                  data-testid={LEFTBAR.listItem("orderManagement", "All Orders")} />

                  <ListItems
                    title="Upcoming Orders"
                    to="/sales-representative/upcoming-orders"
                    count={overAllData?.data?.data?.[6]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Upcoming Orders")} 
                  />
                  {/* <ListItems title="Assigned Orders" to="/orders/assigned" /> */}
                  <ListItems
                    title="Dispatched Orders"
                    to="/orders/assigned"
                    count={overAllData?.data?.data?.[1]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Dispatched Orders")} 
                  />

                  <ListItems
                    title="Acknowledged Orders"
                    to="/orders/acknowledged"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Acknowledged Orders")} 
                  />
                  <ListItems
                    title="Shipped Orders"
                    to="/orders/shiped"
                    count={overAllData?.data?.data?.[4]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Shipped Orders")} 
                  />
                  <ListItems 
                    title="Cancelled Orders" 
                    to="/orders/cancelled"
                    count={overAllData?.data?.data?.[5]?.count || ""}
                    data-testid={LEFTBAR.listItem("orderManagement", "Cancelled Orders")} 
                   />
                </div>
                <hr className="w-full" />
              </>
            )}
          {/* {hasPermission("subscription_view") && (
          <ListHead
            title="Machine Subscriptions"
            active={pathname === "/subscription"}
            data-testid={LEFTBAR.subscriptionManagementSection}
            Icon={MdCoffeeMaker}
            Angle={
              active?.subscription?.tab === "subscription" &&
              active?.subscription?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "subscription",
                active?.subscription?.status
              )
            }
          /> )}

          {active?.subscription?.tab === "subscription" &&
            active?.subscription?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Subscription" to="/subscription" data-testid={LEFTBAR.listItem("subscription", "Subscription")} />
                  <ListItems title="Requests" to="/subscription-requests" data-testid={LEFTBAR.listItem("subscription-requests", "Requests")} />
                  <ListItems title="Add-Ons" to="/add-ons" data-testid={LEFTBAR.listItem("add-ons", "Add-Ons")} />
                </div>
                <hr className="w-full" />
              </>
            )} */}
            
          {hasPermission("invoice_view") && (
          <ListHead
            title="Invoice Management"
            Icon={MdRequestQuote}
            data-testid={LEFTBAR.invoiceManagementSection}
            Angle={
              active?.invoiceManagement?.tab === "invoiceManagement" &&
              active?.invoiceManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "invoiceManagement",
                active?.invoiceManagement?.status
              )
            }
            disabled={true}
          /> )}
          {active?.invoiceManagement?.tab === "invoiceManagement" &&
            active?.invoiceManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Create Invoice" to="/create-invoice" 
                  data-testid={LEFTBAR.listItem("invoiceManagement", "Create Invoice")} />
                  <ListItems title="All Invoices" to="/invoices" 
                  data-testid={LEFTBAR.listItem("invoiceManagement", "All Invoices")} />
                  <ListItems title="Individual Invoices" to="/individual-invoices" 
                  data-testid={LEFTBAR.listItem("invoiceManagement", "Individual Invoices")} />
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
            Angle={
              active?.pullouts?.tab === "pullouts" &&
              active?.pullouts?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "pullouts",
                active?.pullouts?.status
              )
            }
          /> )}

          {active?.pullouts?.tab === "pullouts" &&
            active?.pullouts?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Pullouts" to="/pullouts" 
                  data-testid={LEFTBAR.listItem("pullouts", "Pullouts")} />
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
            Angle={
              active?.employees?.tab === "employees" &&
              active?.employees?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "employees",
                active?.employees?.status
              )
            }
          /> )}

          {active?.employees?.tab === "employees" &&
            active?.employees?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems title="Employee" to="/employee" 
                  data-testid={LEFTBAR.listItem("employees", "Employee")} />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("account_view") &&
          <ListHead
            title="Account Management"
            Icon={MdAccountCircle}
            active={pathname.includes("/account")}
            data-testid={LEFTBAR.accountManagementSection}
            Angle={
              active?.accountManagement?.tab === "accountManagement" &&
              active?.accountManagement?.status
                ? FaAngleUp
                : FaAngleDown
            }
            onClick={() =>
              handleActive(
                "accountManagement",
                active?.accountManagement?.status
              )
            }
          />}

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
          {hasPermission("wallet_view") &&
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
          />}
          {hasPermission("report_view") && (
          <ListHead
            title="Report Management"
            Icon={MdInsights}
            to={"/sales-representative/reports"}
            active={pathname.includes("/reports")}
            data-testid={LEFTBAR.reportManagementSection}
          /> )}
          
          <ListHead
            title="QuickBooks"
            Icon={MdAccountCircle}
            onClick={() => handleActive("quickbooks", active?.quickbooks?.status)}
            Angle={
              active?.quickbooks?.tab === "clientManagement" &&
              active?.quickbooks?.status
                ? FaAngleUp
                : FaAngleDown
            }
          />
          {active?.quickbooks?.tab === "quickbooks" && active?.quickbooks?.status && (
            <>
            <div className="m-2 relative space-y-1">
              <button 
               onClick={authenticateQuickbooks} 
               className="w-full flex gap-x-2 text-wrap items-center py-2 px-2 rounded-lg font-inter font-medium text-themeLightGray hover:bg-theme hover:text-white duration-200"
              >
                Go to QuickBooks
              </button>
              <ListItems title="Clients" to="/Quickbooks/clients" data-testid={LEFTBAR.listItem("quickbooks", "Clients")} />
              {/* <ListItems title="Invoices" to="/Quickbooks/invoices" data-testid={LEFTBAR.listItem("quickbooks", "Invoices")} /> */}
            </div>
            <hr className="w-full" />
            </>
          )}
          
          <div className="mx-2 pb-7">
            <button
              className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 px-2 py-3 rounded-lg text-black hover:bg-black hover:text-white 
          duration-200"
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
  );
}
