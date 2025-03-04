"use client";
import { MdDashboard, MdOutlineMailOutline } from "react-icons/md";
import { BsCardList } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { GiSaloon } from "react-icons/gi";
import { BiCategory } from "react-icons/bi";
import { TbAlignBoxBottomCenter } from "react-icons/tb";
import { FaAngleDown, FaUserEdit, FaAngleUp } from "react-icons/fa";
import { RiCouponLine } from "react-icons/ri";
import { MdOutlineSubscriptions } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { PiChartBar } from "react-icons/pi";
import { RiAdminLine } from "react-icons/ri";
import { ImCross } from "react-icons/im";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ListHead from "./ListHead";
import ListItems from "./ListItems";
import Link from "next/link";

export default function Leftbar(props) {
  const pathname = usePathname();
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

  return (
    <section
      className={`bg-white ${
        props?.navbarVis
          ? "fixed w-full sm:max-w-[240px] lg:max-w-[288px]"
          : "hidden"
      } h-full sm:py-5 sm:pl-2 mt-0 sm:mt-[94px] border-r-2 z-50`}
    >
      <div className="sm:hidden flex justify-between items-center py-3 w-11/12 mx-auto">
        <div>
          {" "}
          <Link
            href="/"
            className="flex items-center font-bold text-4xl min-h-[70px] max-h-[71px]"
          >
            Busy Bean
            {/* <img src="/images/logo.png" alt="logo" className="max-w-16 max-h-[70px]" /> */}
          </Link>
        </div>
        <div
          className="sm:hidden"
          onClick={() => props?.setNavbarVis(!props?.navbarVis)}
        >
          <ImCross size="25px" />
        </div>
      </div>

      <ul className="flex flex-col space-y-1 overflow-auto h-[90%]">
        <ListHead title="Dashboard" to="/" Icon={MdDashboard} />

        <ListHead
          title="Order Management"
          Icon={RiAdminLine}
          active={pathname === "/orders"}
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
                <ListItems title="All Orders" to="/orders" />
                <ListItems title="Pending Orders" to="" />
                <ListItems title="Delivered Orders" to="" />
                <ListItems title="Cancelled Orders" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Supplier Management"
          Icon={RiAdminLine}
          active={pathname === "/suppliers" || pathname === "/add-new-supplier"}
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
        />
        {active?.supplierManagement?.tab === "supplierManagement" &&
          active?.supplierManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="All Supplier" to="/suppliers" />
                <ListItems title="Active Supplier" to="" />
                <ListItems title="Inactive Supplier" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Client Management"
          Icon={RiAdminLine}
          active={pathname === "/customers"}
          Angle={
            active?.clientManagement?.tab === "clientManagement" &&
            active?.clientManagement?.status
              ? FaAngleUp
              : FaAngleDown
          }
          onClick={() =>
            handleActive("clientManagement", active?.clientManagement?.status)
          }
        />
        {active?.clientManagement?.tab === "clientManagement" &&
          active?.clientManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="All Clients" to="/customers" />
                <ListItems title="Active Clients" to="" />
                <ListItems title="Inactive Clients" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Report Management"
          Icon={RiAdminLine}
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
          )}

        <ListHead
          title="Roles & Employee Manag."
          Icon={RiAdminLine}
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
        />
        {active?.roleandEmployeeManagement?.tab ===
          "roleandEmployeeManagement" &&
          active?.roleandEmployeeManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="All Employees" to="" />
                <ListItems title="Add new Employee" to="" />
                <ListItems title="All Roles & Permissions" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Notification & Alerts"
          Icon={RiAdminLine}
          Angle={
            active?.notandAlerts?.tab === "notandAlerts" &&
            active?.notandAlerts?.status
              ? FaAngleUp
              : FaAngleDown
          }
          onClick={() =>
            handleActive("notandAlerts", active?.notandAlerts?.status)
          }
        />
        {active?.notandAlerts?.tab === "notandAlerts" &&
          active?.notandAlerts?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="Supplier Notifications" to="" />
                <ListItems title="Clients Notifications" to="" />
                <ListItems title="Alerts" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Collection"
          Icon={RiAdminLine}
          Angle={
            active?.collection?.tab === "collection" &&
            active?.collection?.status
              ? FaAngleUp
              : FaAngleDown
          }
          onClick={() => handleActive("collection", active?.collection?.status)}
        />
        {active?.collection?.tab === "collection" &&
          active?.collection?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="Add Cheque" to="" />
                <ListItems title="Collection History" to="" />
                <ListItems title="Cheques Due Date" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Disbursement"
          Icon={RiAdminLine}
          Angle={
            active?.disbursement?.tab === "disbursement" &&
            active?.disbursement?.status
              ? FaAngleUp
              : FaAngleDown
          }
          onClick={() =>
            handleActive("disbursement", active?.disbursement?.status)
          }
        />
        {active?.disbursement?.tab === "disbursement" &&
          active?.disbursement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="Add Disbursement" to="" />
                <ListItems title="Disbursement History" to="" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Inventory Management"
          // to="/inventory/stock"
          active={pathname === "/inventory/stock"}
          Icon={RiAdminLine}
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
        />

        {active?.inventoryManagement?.tab === "inventoryManagement" &&
          active?.inventoryManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="Inventory Stock" to="/inventory/stock" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
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
        />

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

        <ListHead
          title="Zone Management"
          Icon={RiAdminLine}
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
        />

        {active?.zoneManagement?.tab === "zoneManagement" &&
          active?.zoneManagement?.status && (
            <>
              <div className="m-2 relative space-y-1">
                <ListItems title="All Zones" to="/zones" />
                <ListItems title="All Countries" to="/countries" />
                <ListItems title="All Cities" to="/cities" />
              </div>
              <hr className="w-full" />
            </>
          )}

        <ListHead
          title="Promotion Management"
          Icon={RiAdminLine}
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
        />

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

        <div className="mx-2 pb-7">
          <button
            className="w-full font-inter font-medium text-lg sm:text-sm lg:text-base flex items-center gap-x-2 px-2 py-3 rounded-lg text-black hover:bg-black hover:text-white 
          duration-200"
            // onClick={logoutFunc}
          >
            <MdLogout size={26} />
            <span>Logout</span>
          </button>
        </div>
      </ul>
    </section>
  );
}
