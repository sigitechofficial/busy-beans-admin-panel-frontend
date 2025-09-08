"use client";
import { useEffect, useState } from "react";
import { MdDashboard, MdOutlineMailOutline } from "react-icons/md";
import { BsCardList } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { GiSaloon } from "react-icons/gi";
import { BiCategory } from "react-icons/bi";
import { TbAlignBoxBottomCenter } from "react-icons/tb";
import {
  FaAngleDown,
  FaUserEdit,
  FaAngleUp,
  FaShippingFast,
} from "react-icons/fa";
import { SlDrawer } from "react-icons/sl";
import { RiCouponLine } from "react-icons/ri";
import { MdOutlineSubscriptions } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { PiChartBar, PiInvoiceBold } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { MdInventory } from "react-icons/md";
import { GiProgression } from "react-icons/gi";
import { GoPeople } from "react-icons/go";
import { RiTimeZoneLine } from "react-icons/ri";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { MdPayment } from "react-icons/md";
import { BsFillCollectionFill } from "react-icons/bs";
import { IoNotifications } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { GiHumanTarget } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { usePathname, useRouter } from "next/navigation";
import ListHead from "./ListHead";
import ListItems from "./ListItems";
import Link from "next/link";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import axios from "axios";
import { BASE_URL } from "@/utilities/URL";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { useDataContext } from "@/utilities/DataContext";
import { getMessagingInstance, onMessage } from "@/utilities/firebase";
import { requestDeviceToken } from "@/utilities/requestFCMToken";
import { hasPermission } from "@/utilities/Permission";


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

  const handleConnectAccount = async () => {
    if (typeof window === "undefined") return;
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
    (sum, item) => (item?.id != 6 ? sum + item?.count : sum),
    0
  );
  useEffect(() => {
    let timeoutId = null;

    getMessagingInstance().then((messaging) => {
      if (messaging) {
        onMessage(messaging, (payload) => {
          setNewOrder(true);
          success_toaster("Firebase notification Order placed");

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
      className={`bg-white ${toggle ? "hidden" : "block"
        } md:block fixed w-full md:max-w-[240px] lg:max-w-[288px] h-full sm:pb-5 sm:pl-2 border-r-2 z-50`}
    >
      <div className="flex items-center justify-center font-bold text-4xl 2xl:min-h-[70px] h-[70px] 2xl:h-[94px] border-b max-md:hidden">
        <Link href="/">
          <img
            src="/images/logocoffee.png"
            alt="logo"
            className="h-full max-h-[70px]"
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
          {hasPermission("dashboard_view") && <ListHead title="Dashboard" to="/" Icon={MdDashboard} />}
          {hasPermission("orders_view") && (
          <ListHead
            title="Order Management"
            Icon={AiOutlineUnorderedList}
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
          /> )}

          {active?.orderManagement?.tab === "orderManagement" &&
            active?.orderManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  {hasPermission("orders_create") && ( <ListItems title="Create Order" to="/orders/create" /> )}
                  <ListItems
                    title="New Orders"
                    to="/orders/new-orders"
                    count={overAllData?.data?.data?.[0]?.count || ""}
                  /> 
                  <ListItems
                    title="All Orders"
                    to="/orders"
                    count={allOrder || ""}
                  /> 
                  <ListItems
                    title="Upcoming Orders"
                    to="/orders/upcoming"
                    count={overAllData?.data?.data?.[6]?.count || ""}
                  /> 
                  <ListItems
                    title="Dispatched Orders"
                    to="/orders/assigned"
                    count={overAllData?.data?.data?.[1]?.count || ""}
                  /> 
                  <ListItems
                    title="Acknowledged Orders"
                    to="/orders/acknowledged"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                  /> 
                  <ListItems
                    title="Shipped Orders"
                    to="/orders/shiped"
                    count={overAllData?.data?.data?.[4]?.count || ""}
                  /> 
                  {/* <ListItems
                    title="Dispatched Orders"
                    to="/orders/dispatched"
                  /> */}
                  <ListItems
                    title="Cancelled Orders"
                    to="/orders/cancelled"
                    count={overAllData?.data?.data?.[5]?.count || ""}
                  /> 
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("supplier_view") && (
          <ListHead
            title="Supplier Management"
            Icon={GiHumanTarget}
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
                  <ListItems title="All Supplier" to="/suppliers" />
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
            Icon={GoPeople}
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
                  {hasPermission("customer_view") && <ListItems title="All Clients" to="/customers" />}
                  {hasPermission("selected-customer_view") && isEmployee && <ListItems title="Selected Clients" to="/active-clients" />}
                  {/* <ListItems title="Inactive Clients" to="/inactive-clients" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("local-partner_view") && (
          <ListHead
            title="Local Partners"
            Icon={GoPeople}
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
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("invoice_view") && (
          <ListHead
            title="Invoice Management"
            Icon={PiInvoiceBold}
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
                  <ListItems title="All Invoices" to="/invoices" />
                  <ListItems title="Individual Invoices" to="/individual-invoices" />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("payment-pullout_view") && (
          <ListHead
            title="Payment Pullouts"
            active={pathname === "/pullouts"}
            Icon={SlDrawer}
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
                  <ListItems title="Pullouts" to="/pullouts" />
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
                  <ListItems title="Inventory Stock" to="/inventory/stock" />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("category_view") && (
          <ListHead
            title="Category Management"
            // to="/inventory/stock"
            active={pathname === "/category" || pathname === "/sub-category"}
            Icon={MdInventory}
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
                  <ListItems title="Category" to="/category" />
                  {/* <ListItems title="Sub Category" to="/sub-category" /> */}
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("employees_view") && (
          <ListHead
            title="Employee Management"
            active={pathname === "/employee"}
            Icon={GiHumanTarget}
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
                  <ListItems title="Employee" to="/employee" />
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
            Icon={RiTimeZoneLine}
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
                  <ListItems title="All Countries" to="/countries" />
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
            Icon={FaShippingFast}
            to={"/shipping-charges"}
            active={pathname.includes("/shipping-charges")}
          /> }
          {hasPermission("report_view") &&
          <ListHead
            title="Report Management"
            Icon={PiChartBar}
            to={"/reports"}
            active={pathname.includes("/reports")}
          /> }

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
          <ListHead title="Dashboard" to="/" Icon={MdDashboard} />

          <ListHead
            title="Order Management"
            Icon={AiOutlineUnorderedList}
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
                    count={overAllData?.data?.data?.[0]?.count || ""}
                  />
                  <ListItems
                    title="Acknowledged Orders"
                    to="/supplier/acknowledge-orders"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                  />
                  <ListItems
                    title="Shipped Orders"
                    to="/supplier/shiped-orders"
                    count={overAllData?.data?.data?.[3]?.count || ""}
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
            Icon={PiChartBar}
            to={"/supplier/reports"}
            active={pathname.includes("/reports")}
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
          {hasPermission("dashboard_view") && <ListHead title="Dashboard" to="/" Icon={MdDashboard} />}
          {hasPermission("quotation_view") &&
          <ListHead
            title="Quotation Management"
            active={pathname === "/sales-representative/quotation"}
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
          />}

          {active?.inventoryManagement?.tab === "inventoryManagement" &&
            active?.inventoryManagement?.status && (
              <>
                <div className="m-2 relative space-y-1">
                  <ListItems
                    title="Quotation"
                    to="/sales-representative/quotation"
                  />
                </div>
                <hr className="w-full" />
              </>
            )}
            
          {(hasPermission("customer_view") || hasPermission("selected-customer_view")) && (
          <ListHead
            title="Client Management"
            Icon={GoPeople}
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
                  />}
                  {hasPermission("selected-customer_view") && isEmployee && <ListItems title="Selected Clients" to="/active-clients" />}
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
            Icon={AiOutlineUnorderedList}
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
                  />}
                  <ListItems
                    title="New Orders"
                    to="/orders/new-orders"
                    count={overAllData?.data?.data?.[0]?.count || ""}
                  />
                  <ListItems title="All Orders" to="/orders" count={allOrder || ""} />

                  <ListItems
                    title="Upcoming Orders"
                    to="/sales-representative/upcoming-orders"
                    count={overAllData?.data?.data?.[6]?.count || ""}
                  />
                  {/* <ListItems title="Assigned Orders" to="/orders/assigned" /> */}
                  <ListItems
                    title="Dispatched Orders"
                    to="/orders/assigned"
                    count={overAllData?.data?.data?.[1]?.count || ""}
                  />

                  <ListItems
                    title="Acknowledged Orders"
                    to="/orders/acknowledged"
                    count={overAllData?.data?.data?.[2]?.count || ""}
                  />
                  <ListItems
                    title="Shipped Orders"
                    to="/orders/shiped"
                    count={overAllData?.data?.data?.[4]?.count || ""}
                  />
                  <ListItems 
                    title="Cancelled Orders" 
                    to="/orders/cancelled"
                    count={overAllData?.data?.data?.[5]?.count || ""}
                   />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("invoice_view") && (
          <ListHead
            title="Invoice Management"
            Icon={PiInvoiceBold}
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
                  <ListItems title="All Invoices" to="/invoices" />
                  <ListItems title="Individual Invoices" to="/individual-invoices" />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("payment-pullout_view") && (
          <ListHead
            title="Payment Pullouts"
            active={pathname === "/pullouts"}
            Icon={SlDrawer}
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
                  <ListItems title="Pullouts" to="/pullouts" />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("employees_view") && (
          <ListHead
            title="Employee Management"
            active={pathname === "/employee"}
            Icon={GiHumanTarget}
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
                  <ListItems title="Employee" to="/employee" />
                </div>
                <hr className="w-full" />
              </>
            )}
          {hasPermission("account_view") &&
          <ListHead
            title="Account Management"
            Icon={AiOutlineUnorderedList}
            active={pathname.includes("/account")}
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
            Icon={AiOutlineUnorderedList}
            to={"/sales-representative/wallet"}
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
            Icon={PiChartBar}
            to={"/sales-representative/reports"}
            active={pathname.includes("/reports")}
          /> )}

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
