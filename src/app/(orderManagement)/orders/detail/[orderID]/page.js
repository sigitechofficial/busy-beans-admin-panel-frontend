"use client";
export const dynamic = "force-dynamic";
import BackButton from "@/components/ui/BackButton";
import CusSupInformationCard from "@/components/ui/CusSupInformationCard";
import { RiArrowDownSLine } from "react-icons/ri";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import OrderCard from "@/components/ui/OrderCard";
import TrackOrder from "@/components/ui/TrackOrder";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { CgNotes } from "react-icons/cg";
import { LuClipboardList } from "react-icons/lu";
import Link from "next/link";
import dayjs from "dayjs";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { hasPermission } from "@/utilities/Permission";
import { ORDER_DETAIL } from "../../orders.testids";
import { FiCopy } from "react-icons/fi";
import { QuickbooksPingCheck, formatDateTimeISO } from "@/utilities/constants";
import { useUserType } from "@/utilities/useUserType";

export default function OrderDetail() {
  const { isAllowed: canViewEmailLogs } = useUserType(
    ["admin", "salesRepresentative"],
    { redirectIfNotAllowed: false },
  );
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var isEmployee = localStorage.getItem("isEmployee") ? true : false;
  }
  const [disabled, setDisabled] = useState("");
  // Get accessToken and realmId from localStorage
  const accessTokenQbo =
    typeof window !== "undefined" ? localStorage.getItem("accessTokenQbo") : "";
  const realmId =
    typeof window !== "undefined" ? localStorage.getItem("realmId") : "";

  const { orderID } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [chequeId, setChequeId] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [emailLogsExpanded, setEmailLogsExpanded] = useState(false);
  const [retryEmailLogId, setRetryEmailLogId] = useState(null);
  const [retryCooldownEndsAt, setRetryCooldownEndsAt] = useState({});
  const [, setCooldownTick] = useState(0);
  const [sectionRefreshCooldownEndsAt, setSectionRefreshCooldownEndsAt] =
    useState(null);
  const sectionRefreshCooldownEndsAtRef = useRef(null);
  const [modal, setModal] = useState({
    type: "", // addCheque , editCheque
    status: false,
  });

  const [loader, setLoader] = useState("");
  const [addCheque, setAddCheque] = useState({
    chequeNumber: "",
    chequeDate: "",
    chequeStatus: {
      value: "",
      label: "",
    },
    bankName: "",
    bankBranch: "",
    chequeType: {
      value: "",
      label: "",
    },
    chequeReceiptDate: "",
  });

  const paymentStausOptions = [
    { value: "done", label: "Paid" },
    { value: "pending", label: "Unpaid" },
  ];

  const chequeStatusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Cleared", label: "Cleared" },
    { value: "Bounced", label: "Bounced" },
  ];

  const chequeTypeOptions = [
    { value: "personal check", label: "Personal check" },
    { value: "business check", label: "Business check" },
    { value: "cashier's check", label: "Cashier's check" },
  ];

  const { data, reFetch, isLoading } = GetAPI(
    `api/v1/admin/order-details/${orderID}`,
    "orders",
  );

  const emailLogApiUrl = orderID
    ? `api/v1/admin/order-management/email-log?orderId=${orderID}`
    : "";
  const {
    data: emailLogData,
    reFetch: reFetchEmailLogs,
    isLoading: emailLogLoading,
  } = GetAPI(emailLogApiUrl);

  const emailLogs = emailLogData?.data?.emailLogs ?? [];

  const handleSupplierAcknowledgement = async () => {
    setLoader("acknowledgeSupplier");
    try {
      const res = await PatchAPI("api/v1/admin/supplier-acknowledgement", {
        [pathname.includes("/supplier/partner") ? "partnerOrderId" : "orderId"]:
          data?.data?.order?.id,
        orderData: {
          statusId: 3,
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Supplier Acknowledged successfully");
        reFetch();
        setLoader("");
      } else {
        setLoader("");
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader("");
    }
  };

  const handleOrderDelivered = async () => {
    setLoader("orderDelivered");
    try {
      const res = await PatchAPI("api/v1/admin/order-deliver", {
        [pathname.includes("/supplier/partner") ? "partnerOrderId" : "orderId"]:
          data?.data?.order?.id,
        orderData: {
          statusId: 5,
          // paymentStaus: "done",
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Order Dispatched successfully");
        reFetch();
        startSectionRefreshTimer();
        setLoader("");
      } else {
        setLoader("");
        reFetch();
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader("");
      reFetch();
    }
  };

  const handleAssignSupplier = (statusId) => {
    if (statusId === 1) {
      AssignSupplierTravis();
      // setModal({
      //   type: "assignSupplier",
      //   status: true,
      // });
    } else if (statusId === 2) {
      handleSupplierAcknowledgement();
    } else if (statusId === 3) {
      setModal({
        type: "dispatchOrder",
        status: true,
      });
    } else if (statusId === 4) {
      handleOrderDelivered();
    }
  };

  const AssignSupplierTravis = async (e) => {
    try {
      const res = await PatchAPI("api/v1/admin/assign-supplier", {
        orderId: orderID,
        orderData: {
          supplierId: 16, //Suppier name Travis
          statusId: 2,
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Supplier assign successfully");
        reFetch();
        startSectionRefreshTimer();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleCancelOrder = () => {
    setModal({
      type: "cancelOrder",
      status: true,
    });
  };

  const handleDeleteOrder = () => {
    setModal({
      type: "deleteOrder",
      status: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal?.type === "addCheque" && modal.status) {
      setLoader("addCheque");
      try {
        const res = await PatchAPI("api/v1/admin/add-cheque", {
          orderId: orderID,
          orderData: {
            paymentMethod: "cheque",
          },
          cheque: {
            chequeNumber: addCheque?.chequeNumber,
            chequeDate: addCheque?.chequeDate,
            chequeStatus: addCheque?.chequeStatus?.value, // Pending, Cleared, Bounced
            bankName: addCheque?.bankName,
            bankBranch: addCheque?.bankBranch,
            chequeType: addCheque?.chequeType?.value, // personal check, business check, or cashier's check
            chequeReceiptDate: addCheque?.chequeReceiptDate,
          },
        });
        if (res?.data?.status === "success") {
          success_toaster("Bank Check Added successfully");
          reFetch();
          setModal({
            type: "",
            status: false,
          });
          setLoader("");
        } else {
          setLoader("");
          throw new Error(
            res?.data?.message || "An unexpected error occurred.",
          );
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
      }
    } else if (modal?.type === "editCheque" && modal.status) {
      setLoader("editCheque");
      try {
        const res = await PatchAPI("api/v1/admin/edit-cheque", {
          chequeId: chequeId,
          cheque: {
            chequeNumber: addCheque?.chequeNumber,
            chequeDate: addCheque?.chequeDate,
            chequeStatus: addCheque?.chequeStatus?.value, // Pending, Cleared, Bounced
            bankName: addCheque?.bankName,
            bankBranch: addCheque?.bankBranch,
            chequeType: addCheque?.chequeType?.value, // personal check, business check, or cashier's check
            chequeReceiptDate: addCheque?.chequeReceiptDate,
          },
        });
        if (res?.data?.status === "success") {
          success_toaster("Bank Check Updated successfully");
          reFetch();
          setChequeId("");
          setModal({
            type: "",
            status: false,
          });
          setLoader("");
        } else {
          setLoader("");
          throw new Error(
            res?.data?.message || "An unexpected error occurred.",
          );
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
      }
    } else if (modal?.type === "deleteOrder" && modal.status) {
      setLoader("deleteOrder");
      try {
        const res = await DeleteAPI(
          `api/v1/admin/order-management/delete-order/${orderID}`,
          "orders",
        );

        if (res?.data?.status === "success") {
          success_toaster("Order deleted successfully");
          setModal({ type: "", status: false });
          setLoader("");
          router.push("/orders");
        } else {
          setLoader("");
          throw new Error(
            res?.data?.message || "An unexpected error occurred.",
          );
        }
      } catch (error) {
        setLoader("");
        // ErrorHandler(error);
      }
    } else {
      setLoader("cancelOrder");
      try {
        const res = await PatchAPI("api/v1/admin/order-cancel", {
          orderId: orderID,
          orderData: {
            statusId: 6,
            paymentStaus: "pending",
            totalBill: data?.data?.order?.totalBill,
          },
        });
        if (res?.data?.status === "success") {
          success_toaster("Order Cancelled successfully");
          reFetch();
          setModal({
            type: "",
            status: false,
          });
          setLoader("");
        } else {
          setLoader("");
          throw new Error(
            res?.data?.message || "An unexpected error occurred.",
          );
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
      }
    }
  };

  const handleQBOInvoice = async () => {
    setDisabled("QBO");

    try {
      const payload = { orderId: orderID };
      const res = await PostAPI(
        `qbo/order-invoice/create/${orderID}`,
        payload,
        "",
        {},
        {
          // "x-qbo-access": accessTokenQbo,
          // "x-qbo-realmid": realmId,
        },
      );

      if (res?.data?.status === "success") {
        success_toaster("QBO Invoice Created Successfully");
        reFetch();
        return;
      }
    } catch (error) {
      error_toaster(error);
    } finally {
      // Always re-enable button, even if API or network fails
      setDisabled("");
    }
  };

  const handleAddChequeModel = () => {
    if (data?.data?.order?.chequeDetail) {
      setModal({
        type: "editCheque",
        status: true,
      });
      setChequeId(data?.data?.order?.chequeDetail?.id);
      setAddCheque({
        chequeNumber: data?.data?.order?.chequeDetail?.chequeNumber,
        chequeDate: data?.data?.order?.chequeDetail?.chequeDate,
        chequeStatus: {
          value: data?.data?.order?.chequeDetail?.chequeStatus,
          label: data?.data?.order?.chequeDetail?.chequeStatus,
        },
        bankName: data?.data?.order?.chequeDetail?.bankName,
        bankBranch: data?.data?.order?.chequeDetail?.bankBranch,
        chequeType: {
          value: data?.data?.order?.chequeDetail?.chequeType,
          label: data?.data?.order?.chequeDetail?.chequeType,
        },
        chequeReceiptDate: data?.data?.order?.chequeDetail?.chequeReceiptDate,
      });
    } else {
      setModal({
        type: "addCheque",
        status: true,
      });
    }
  };

  const handleChange = (e) => {
    setAddCheque({ ...addCheque, [e.target.name]: e.target.value });
  };

  const handleSendInvoice = async () => {
    try {
      const isPaidInvoice = data?.data?.order?.paymentStatus === "done";

      if (isPaidInvoice) {
        const res = await PostAPI(
          "api/v1/admin/order-management/email-helper",
          {
            orderId: orderID,
            orderType: "customer",
            emailType: "paid-invoice",
          },
        );
        if (res?.data?.status === "success") {
          success_toaster("Paid invoice email sent successfully");
          reFetch();
          startSectionRefreshTimer();
        } else {
          throw new Error(
            res?.data?.message || "An unexpected error occurred.",
          );
        }
        return;
      }

      const res = await PostAPI(
        `api/v1/admin/order-management/send-invoice/${orderID}`,
        {
          order: {
            orderId: orderID,
            reminder: data?.data?.order?.invoicePdf ? true : false,
            invoiceDate: data?.data?.order?.invoiceDate
              ? undefined
              : Date.now(),
            invoiceReminder: data?.data?.order?.invoiceDate
              ? Date.now()
              : undefined,
          },
          successUrl:
            "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-success",
          cancelUrl:
            "https://main.d28wfx1ny3of09.amplifyapp.com/invoice-payment-failure",
        },
      );
      if (res?.data?.status === "success") {
        success_toaster("Invoice Send Successfully");
        reFetch();
        startSectionRefreshTimer();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handlePaymentStatus = async (status) => {
    try {
      const res = await PatchAPI("api/v1/admin/edit-order", {
        orderId: orderID,
        orderData: {
          paymentStatus: status?.value, //"pending" , 'done'
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Status Updated successfully");
        reFetch();
        if (status?.value === "done") {
          startSectionRefreshTimer();
        }
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  // Map email log type to email-helper API emailType
  const logEmailTypeToApi = {
    invoice_sent: "invoice-sent",
    invoice_reminder: "invoice-reminder",
    paid_receipt: "paid-invoice",
    paid_receipt_admin: "paid-invoice",
    supplier_new_order: "order-ship-supplier",
  };

  const handleRetryEmail = async (log) => {
    const apiEmailType = logEmailTypeToApi[log.emailType] || log.emailType;
    const orderTypeApi =
      log.orderType === "local-partner" ? "local-partner" : "customer";
    setRetryEmailLogId(log.id);
    try {
      const res = await PostAPI("api/v1/admin/order-management/email-helper", {
        orderId: String(log.orderId),
        orderType: orderTypeApi,
        emailType: apiEmailType,
      });
      if (res?.data?.status === "success" || res?.data?.status === true) {
        success_toaster("Email sent successfully");
        // Email-log API is only hit when the 30s timer ends (in the interval)
      } else {
        throw new Error(res?.data?.message || "Failed to send email.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setRetryEmailLogId(null);
      setRetryCooldownEndsAt((prev) => ({
        ...prev,
        [log.id]: Date.now() + 12000,
      }));
    }
  };

  // Ref to read current cooldown in interval (for detecting expiry)
  const cooldownEndsAtRef = useRef(retryCooldownEndsAt);
  useEffect(() => {
    cooldownEndsAtRef.current = retryCooldownEndsAt;
  }, [retryCooldownEndsAt]);
  useEffect(() => {
    sectionRefreshCooldownEndsAtRef.current = sectionRefreshCooldownEndsAt;
  }, [sectionRefreshCooldownEndsAt]);

  const startSectionRefreshTimer = () => {
    const end = Date.now() + 12000;
    setSectionRefreshCooldownEndsAt(end);
    sectionRefreshCooldownEndsAtRef.current = end;
  };

  // Tick every second; refetch email logs when the LAST retry timer ends OR when section refresh cooldown ends
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const prev = cooldownEndsAtRef.current;
      const next = {};
      Object.entries(prev).forEach(([id, end]) => {
        if (end > now) next[id] = end;
      });
      const hadActive = Object.keys(prev).length > 0;
      const lastTimerEnded = hadActive && Object.keys(next).length === 0;
      setRetryCooldownEndsAt(Object.keys(next).length ? next : {});
      if (lastTimerEnded) {
        reFetchEmailLogs();
      }
      const sectionEnd = sectionRefreshCooldownEndsAtRef.current;
      if (sectionEnd != null && now >= sectionEnd) {
        sectionRefreshCooldownEndsAtRef.current = null;
        setSectionRefreshCooldownEndsAt(null);
        reFetchEmailLogs();
      }
      setCooldownTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [reFetchEmailLogs]);

  const shortId = (val) =>
    val && val.length > 12
      ? `${val.slice(0, 12)}..${val.slice(-4)}`
      : val || "";

  const stripeUrlForUser = (id, userType, connectAccountId) => {
    if (!id) return "#";
    if (userType === "salesRepresentative" && connectAccountId) {
      return `https://dashboard.stripe.com/payments/${id}?connected_account=${encodeURIComponent(
        connectAccountId,
      )}`;
    }
    return `https://dashboard.stripe.com/payments/${id}`;
  };

  const copyLink = async (fullUrl, id, setCopiedId) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };

  const { toggle, setToggle } = useDataContext();

  useEffect(() => {
    QuickbooksPingCheck();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div data-testid={ORDER_DETAIL.root}>
      <div
        className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={ORDER_DETAIL.headerBar}
      >
        <div className="text-xl font-inter font-semibold flex items-center gap-2 [&>p]:cursor-pointer [&>p]:whitespace-nowrap">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <p
            onClick={() => router.push("/orders")}
            data-testid={ORDER_DETAIL.breadcrumbOrdersLink}
          >
            Order /
          </p>{" "}
          <span data-testid={ORDER_DETAIL.orderIdText(data?.data?.order?.id)}>
            {data?.data?.order?.id}
          </span>
          <p
            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
              data?.data?.order?.orderCurrentStatus?.includes("Cancelled")
                ? "bg-red-500 "
                : "bg-themeGreen "
            }`}
            data-testid={ORDER_DETAIL.statusPill}
          >
            {data?.data?.order?.statusId == 4 ||
            data?.data?.order?.statusId == 5
              ? "Shipped"
              : data?.data?.order?.statusId == 1
                ? "Order Placed"
                : data?.data?.order?.statusId == 2
                  ? "Dispatched"
                  : data?.data?.order?.statusId == 3
                    ? "Acknowledged"
                    : data?.data?.order?.statusId == 6
                      ? "Cancelled"
                      : "fulfilled"}
          </p>
        </div>

        <ul
          className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500"
          data-testid={ORDER_DETAIL.actionsBar}
        >
          {/* <li onClick={() => router.push(`${pathname}/add-invoice`)}>
            {data?.data?.order?.invoicePdf ? "Update Invoice" : "Add Invoice"}
          </li> */}
          <li>
            {hasPermission("invoice_update") && (
              <button
                type="button"
                disabled={data?.data?.order?.statusId === 6 ? true : false}
                className="disabled:cursor-not-allowed"
                onClick={() => handleSendInvoice(data?.data?.order?.statusId)}
                data-testid={ORDER_DETAIL.sendInvoiceBtn}
              >
                {data?.data?.order?.invoiceDate &&
                data?.data?.order?.paymentStatus === "pending"
                  ? "Invoice reminder"
                  : data?.data?.order?.paymentStatus === "done"
                    ? "Send Receipt"
                    : "Send Invoice"}
              </button>
            )}
          </li>
          {/* {!data?.data?.order?.quickBooksInvoiceId && (
            <li>
              <button
                onClick={handleQBOInvoice}
                type="button"
                disabled={
                  data?.data?.order?.statusId === 6 || disabled === "QBO"
                    ? true
                    : false
                }
                className="disabled:cursor-not-allowed"
              >
                QBO Invoice
              </button>
            </li>
          )} */}
          <li>
            <button
              onClick={() => router.push(`${pathname}/invoice`)}
              type="button"
              data-testid={ORDER_DETAIL.viewPdfBtn}
            >
              View PDF
            </button>
          </li>
          {/* <li>Edit Details</li>
          <li>Modify Items</li>
          <li>Convert to Standing Order</li>
          <li className="group flex items-center">
            More
            <RiArrowDownSLine />
            <ul className="absolute top-5 right-0 bg-theme text-white rounded-lg p-3 space-y-2 hidden group-hover:block">
              <li>Email</li>
              <li>Export</li>
              <li>Cancel Order</li>
            </ul>
          </li> */}
        </ul>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex justify-end">
          {/* <div className="flex items-center gap-x-2">
            <BackButton />
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Order/{data?.data?.order?.id}
            </h2>

            <div className="bg-themeGreen text-white rounded-lg py-2 px-4 font-medium text-sm">
              {data?.data?.order?.orderCurrentStatus}
            </div>
          </div> */}

          <div
            className="flex items-center gap-x-2 sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium [&>button]:text-xs lg:[&>button]:text-sm"
            data-testid={ORDER_DETAIL.actionsBar}
          >
            {/* <button
            type="button"
            onClick={handleAddChequeModel}
            className="bg-black text-white disabled:cursor-not-allowed"
          >
            {data?.data?.order?.chequeDetail
              ? "Edit Bank Check"
              : "Add Bank Check"}
          </button> */}
            {/* {userType === "admin" && !isEmployee && data?.data?.order?.statusId !== 5 ? (
              <button
                type="button"
                disabled={
                  data?.data?.order?.statusId === 5 ||
                  data?.data?.order?.statusId === 6
                    ? true
                    : false
                }
                className="bg-black text-white disabled:cursor-not-allowed"
                onClick={() =>
                  handleAssignSupplier(data?.data?.order?.statusId)
                }
              >
                {data?.data?.order?.statusId === 1
                  ? "Dispatch to Supplier"
                  : data?.data?.order?.statusId === 2
                  ? "Acknowledge Supplier"
                  : data?.data?.order?.statusId === 3
                  ? "Ship Order"
                  : "Dispatch Order"}
              </button>
            ) : (
              <button
                type="button"
                // disabled={
                //   data?.data?.order?.statusId === 2 ||
                //   data?.data?.order?.statusId === 3 ||
                //   data?.data?.order?.statusId === 5 ||
                //   data?.data?.order?.statusId === 6
                //     ? true
                //     : false
                // }
                className={`${
                  // data?.data?.order?.statusId === 2 ||
                  // data?.data?.order?.statusId === 3 ||
                  data?.data?.order?.statusId === 1 ? "block" : "hidden"
                } bg-black text-white disabled:cursor-not-allowed`}
                onClick={() =>
                  handleAssignSupplier(data?.data?.order?.statusId)
                }
              >
                {data?.data?.order?.statusId === 1
                  ? "Dispatch to Supplier"
                  : data?.data?.order?.statusId === 2
                  ? "Acknowledge Supplier"
                  : ""}
              </button> 
            )} */}

            {/* Dispatch / Supplier Actions */}
            {(userType === "admin" || userType === "salesRepresentative") &&
              !isEmployee &&
              data?.data?.order?.statusId !== 5 && (
                <button
                  type="button"
                  disabled={
                    data?.data?.order?.statusId === 5 ||
                    data?.data?.order?.statusId === 6
                  }
                  className="bg-black text-white disabled:cursor-not-allowed"
                  onClick={() =>
                    handleAssignSupplier(data?.data?.order?.statusId)
                  }
                  data-testid={ORDER_DETAIL.dispatchFlowBtn}
                >
                  {data?.data?.order?.statusId === 1
                    ? "Dispatch to Supplier"
                    : data?.data?.order?.statusId === 2
                      ? "Acknowledge Supplier"
                      : data?.data?.order?.statusId === 3
                        ? "Ship Order"
                        : "Dispatch Order"}
                </button>
              )}

            {/* <button
              type="button"
              disabled={data?.data?.order?.statusId === 6 ? true : false}
              className="bg-black text-white disabled:cursor-not-allowed"
              onClick={() => handleSendInvoice(data?.data?.order?.statusId)}
            >
              {data?.data?.order?.invoicePdf
                ? "Invoice reminder"
                : "Send Invoice"}
            </button> */}
            {/* Hide Add Invoice button when order is cancelled */}
            {hasPermission("invoice_update") &&
              data?.data?.order?.statusId !== 6 && (
                <button
                  type="button"
                  onClick={() => router.push(`${pathname}/add-invoice`)}
                  className="border border-buttonBorderColor shadow-buttonShadow"
                  data-testid={ORDER_DETAIL.addOrUpdateInvoiceBtn}
                >
                  {data?.data?.order?.invoiceDate
                    ? "Update Invoice"
                    : "Add Invoice"}
                </button>
              )}

            {(!isEmployee || hasPermission("orders_update")) && (
              <button
                disabled={
                  data?.data?.order?.statusId === 5 ||
                  data?.data?.order?.statusId === 6 ||
                  data?.data?.order?.paymentStatus === "done"
                    ? true
                    : false
                }
                type="button"
                onClick={handleCancelOrder}
                className="bg-theme text-white disabled:cursor-not-allowed"
                data-testid={ORDER_DETAIL.cancelOrderBtn}
              >
                {data?.data?.order?.statusId === 6
                  ? "Cancelled"
                  : "Cancel Order"}
              </button>
            )}
            {(!isEmployee || hasPermission("orders_delete")) && (
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={
                  data?.data?.order?.statusId === 4 ||
                  data?.data?.order?.statusId === 5 ||
                  data?.data?.order?.paymentStatus === "done"
                }
                className="bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  data?.data?.order?.statusId === 4 ||
                  data?.data?.order?.statusId === 5
                    ? "Shipped orders cannot be deleted"
                    : data?.data?.order?.paymentStatus === "done"
                      ? "Paid orders cannot be deleted"
                      : ""
                }
                data-testid={ORDER_DETAIL.deleteOrderBtn}
              >
                Delete Order
              </button>
            )}

            {/* <button
              onClick={() => router.push(`${pathname}/invoice`)}
              type="button"
              className="border border-buttonBorderColor shadow-buttonShadow"
            >
              Edit Invoice
            </button> */}
          </div>
        </div>

        {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
          <MiniLoader />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:gap-x-12">
            {/* Left side */}
            <div className="space-y-6">
              {/* <CusSupInformationCard
              heading="Customer Information"
              image={data?.data?.order?.user?.image}
              name={data?.data?.order?.user?.name}
              email={data?.data?.order?.user?.email}
              phoneNo={data?.data?.order?.user?.phoneNumber}
              subHeading="Delivery Information"
              subHeadingData={{
                "Company Name": "Sigi Technologies",
                "Sale Tax": data?.data?.order?.user?.saleTaxNumber,
                Address: `
                  ${data?.data?.order?.address?.companyaddress ?? ""}
                  ${data?.data?.order?.address?.addressLineOne ?? ""}
                  ${data?.data?.order?.address?.addressLineTwo ?? ""}
                    ${data?.data?.order?.address?.town ?? ""}, ${
                  data?.data?.order?.address?.state ?? ""
                } - ${data?.data?.order?.address?.zipCode ?? ""}
                  ${data?.data?.order?.address?.country ?? ""}`,
              }}
            /> */}

              <div className="w-full bg-blue-50 flex justify-between rounded-md px-4 lg:px-6 py-6 ">
                <div
                  className="flex gap-x-2"
                  data-testid={ORDER_DETAIL.infoBanner}
                >
                  <div>
                    <LuClipboardList size={25} />
                  </div>
                  <div className="space-y-4">
                    <p className="font-semibold">
                      This order is{" "}
                      {data?.data?.order?.statusId == 4 ||
                      data?.data?.order?.statusId == 5
                        ? "Shipped"
                        : data?.data?.order?.statusId == 1
                          ? "New"
                          : data?.data?.order?.statusId == 2
                            ? "Dispatched to Supplier"
                            : data?.data?.order?.statusId == 3
                              ? "Acknowledged by Supplier"
                              : data?.data?.order?.statusId == 6
                                ? "Cancelled"
                                : "fulfilled"}
                    </p>
                    <p>Optional actions:</p>

                    <div className="flex gap-x-2 items-center">
                      <p className="font-semibold">Record a payment:</p>
                      {(userType === "admin" ||
                        userType === "salesRepresentative") && (
                        <div className="flex">
                          {/* <span className="text-black/60 w-2/4">Payment Status:</span> */}

                          {userType === "none" ? (
                            // && data?.data?.order?.paymentStatus === "done"

                            <div
                              className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium outline-none"
                              data-testid={ORDER_DETAIL.paymentStatusReadonly}
                            >
                              {data?.data?.order?.paymentStatus === "done"
                                ? "Paid"
                                : "Unpaid"}
                            </div>
                          ) : (
                            <span
                              className="w-40"
                              data-testid={ORDER_DETAIL.paymentStatusSelect}
                            >
                              <Select
                                placeholder="Select Payment Status"
                                className="w-full"
                                value={
                                  data?.data?.order?.paymentStatus === "pending"
                                    ? { value: "pending", label: "Unpaid" }
                                    : { value: "done", label: "Paid" }
                                }
                                styles={selectStyles2}
                                options={paymentStausOptions}
                                onChange={(e) => {
                                  handlePaymentStatus(e);
                                }}
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold">
                    Invoice Sent:{" "}
                    {data?.data?.order?.invoiceDate
                      ? dayjs(data?.data?.order?.invoiceDate).format(
                          "MM/DD/YYYY",
                        )
                      : "Not Sent"}
                  </p>
                  {data?.data?.order?.invoiceReminder &&
                    data?.data?.order?.invoiceDate && (
                      <p className="font-semibold">
                        Invoice Reminder:{" "}
                        {dayjs(data?.data?.order?.invoiceReminder).format(
                          "MM/DD/YYYY",
                        )}
                      </p>
                    )}
                </div>
              </div>

              {/* Emails/Invoices sent for this order (admin & sales rep only) */}
              {canViewEmailLogs && (
                <div
                  className="w-full py-4 px-4 2xl:px-8 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm"
                  data-testid={ORDER_DETAIL.emailLogsSection}
                >
                  <button
                    type="button"
                    onClick={() => setEmailLogsExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2 text-left font-semibold text-gray-800 mb-1 hover:opacity-80 transition-opacity"
                    aria-expanded={emailLogsExpanded}
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <CgNotes size={18} />
                      Emails/Invoices sent for this order
                      <span className="text-gray-500 font-normal text-sm">
                        ({emailLogs.length})
                      </span>
                      {sectionRefreshCooldownEndsAt != null && (
                        <span className="text-theme font-medium text-sm">
                          (Refreshing in{" "}
                          {Math.max(
                            0,
                            Math.ceil(
                              (sectionRefreshCooldownEndsAt - Date.now()) /
                                1000,
                            ),
                          )}
                          s…)
                        </span>
                      )}
                    </span>
                    <RiArrowDownSLine
                      size={22}
                      className={`shrink-0 transition-transform duration-200 ${
                        emailLogsExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {emailLogsExpanded && (
                    <div className="space-y-3 mt-4">
                      {emailLogLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-6">
                          <MiniLoader />
                          <p className="text-gray-500 text-sm">
                            Loading email logs…
                          </p>
                        </div>
                      ) : emailLogs.length === 0 ? (
                        <p className="text-gray-500 text-sm py-2">
                          No emails sent for this order.
                        </p>
                      ) : (
                        emailLogs.map((log) => {
                          let meta = {};
                          try {
                            meta =
                              typeof log.metadata === "string"
                                ? JSON.parse(log.metadata)
                                : {};
                          } catch {
                            meta = {};
                          }
                          const typeLabel =
                            {
                              invoice_sent: "Invoice sent",
                              invoice_reminder: "Payment reminder",
                              paid_receipt: "Paid receipt (customer)",
                              paid_receipt_admin:
                                "Paid receipt (admin/partner)",
                              supplier_new_order: "Supplier new order",
                            }[log.emailType] ||
                            log.emailType ||
                            "—";
                          const isFailed = log.emailSent === "Failed";
                          const isRetrying = retryEmailLogId === log.id;
                          const cooldownEnd = retryCooldownEndsAt[log.id];
                          const remainingSeconds = cooldownEnd
                            ? Math.max(
                                0,
                                Math.ceil((cooldownEnd - Date.now()) / 1000),
                              )
                            : 0;
                          const retryDisabled =
                            isRetrying || remainingSeconds > 0;
                          return (
                            <div
                              key={log.id}
                              className="border border-gray-200 rounded-lg p-3 text-sm space-y-1.5 bg-gray-50/50"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="font-medium text-gray-700">
                                    {formatDateTimeISO(log.sentAt, "datetime")}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-theme/10 text-theme font-medium">
                                    {typeLabel}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                                      isFailed
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                                    }`}
                                  >
                                    {log.emailSent === "Failed"
                                      ? "Failed"
                                      : log.emailSent || "Sent"}
                                  </span>
                                </div>
                                {isFailed && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryEmail(log)}
                                    disabled={retryDisabled}
                                    className="shrink-0 px-4 py-2 rounded-lg border-2 border-theme text-theme text-sm font-semibold hover:bg-theme hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {isRetrying
                                      ? "Sending…"
                                      : remainingSeconds > 0
                                        ? `Retry (${remainingSeconds}s)`
                                        : "Retry"}
                                  </button>
                                )}
                              </div>
                              {log.recipients && (
                                <p className="text-gray-600">
                                  <span className="font-medium">To:</span>{" "}
                                  {log.recipients}
                                </p>
                              )}
                              {meta.subject && (
                                <p className="text-gray-600 truncate max-w-full">
                                  <span className="font-medium">Subject:</span>{" "}
                                  {meta.subject}
                                </p>
                              )}
                              {isFailed && log.errorMessage && (
                                <p className="text-red-600 text-xs">
                                  <span className="font-medium">Error:</span>{" "}
                                  {log.errorMessage}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              <div
                className="w-full grid xl:grid-cols-2 gap-10 xl:gap-20 py-4 px-4 2xl:px-8 space-y-4 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm"
                data-testid={ORDER_DETAIL.summaryCard.wrapper}
              >
                <div className="w-full [&>div]:h-10 text-sm">
                  {data?.data?.order?.on && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.orderedOnRow}
                    >
                      <p className="w-28">Ordered On </p>
                      <p>{dayjs(data?.data?.order?.on).format("MM/DD/YYYY")}</p>
                    </div>
                  )}
                  {/* {data?.data?.order?.customerName && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Customer</p>
                      <p>{data?.data?.order?.customerName}</p>
                    </div>
                  )} */}
                  {data?.data?.order?.customerName && (
                    <div
                      onClick={() =>
                        router.push(`/customers/${data?.data?.order?.user?.id}`)
                      }
                      className="flex items-center gap-5 border-b capitalize cursor-pointer"
                      data-testid={ORDER_DETAIL.summaryCard.companyRow}
                    >
                      <p className="w-28">Company Name</p>
                      <p className="text-blue-500">
                        {data?.data?.order?.user?.companyName}
                      </p>
                    </div>
                  )}
                  {data?.data?.order?.createdBy && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.createdByRow}
                    >
                      <p className="w-28">Created By</p>

                      <p className="">{data?.data?.order?.createdBy}</p>
                    </div>
                  )}
                  {data?.data?.order?.supplier?.supplierName && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.supplierRow}
                    >
                      <p className="w-28">Supplier</p>
                      <Link
                        href={
                          userType === "admin"
                            ? `/suppliers/edit/${data?.data?.order?.supplier?.id}`
                            : ""
                        }
                      >
                        <p
                          className={
                            userType === "admin" ? `text-blue-500` : ""
                          }
                        >
                          {data?.data?.order?.supplier?.supplierName}
                        </p>
                      </Link>
                    </div>
                  )}
                  {data?.data?.order?.salesRepName && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.salesRepRow}
                    >
                      <p className="w-28">Local Partner</p>
                      <Link
                        href={
                          userType === "admin"
                            ? `/sale-representative/details/${data?.data?.order?.salesRep?.id}`
                            : ""
                        }
                      >
                        <p
                          className={
                            userType === "admin" ? `text-blue-500` : ""
                          }
                        >
                          {data?.data?.order?.salesRepName}
                        </p>
                      </Link>
                    </div>
                  )}
                  {data?.data?.order?.poNumber && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.poNumberRow}
                    >
                      <p className="w-28">P.O. # </p>
                      <p>{data?.data?.order?.poNumber}</p>
                    </div>
                  )}
                  {data?.data?.order?.invoiceNumber && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.invoiceNumberRow}
                    >
                      <p className="w-28">Invoice No </p>
                      <p>{data?.data?.order?.invoiceNumber}</p>
                    </div>
                  )}
                  {data?.data?.order?.pulloutIntentId && (
                    <div className="flex items-center gap-2 border-b">
                      <p className="w-29">Pullout Transfer ID</p>
                      <p>{data?.data?.order?.pulloutIntentId}</p>
                    </div>
                  )}

                  {data?.data?.order?.paymentStatus === "done" &&
                    (data?.data?.order?.paymentIntentId
                      ? (() => {
                          const intentId = data?.data?.order?.paymentIntentId;
                          const connectAccountId =
                            data?.data?.order?.salesRep?.connectAccountId;
                          const intentUrl = stripeUrlForUser(
                            intentId,
                            userType,
                            connectAccountId,
                          );

                          return (
                            <div className="flex items-center gap-2 border-b">
                              <p className="w-32">Payment Intent ID</p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`underline text-blue-600 hover:text-blue-800 transition ${
                                    copiedId === intentId ? "animate-pulse" : ""
                                  }`}
                                  title="Open in Stripe Dashboard"
                                  onClick={() =>
                                    window.open(
                                      intentUrl,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  {shortId(intentId)}
                                </button>
                                <FiCopy
                                  className={`cursor-pointer text-gray-500 hover:text-black ${
                                    copiedId === intentId ? "animate-pulse" : ""
                                  }`}
                                  onClick={() =>
                                    copyLink(intentUrl, intentId, setCopiedId)
                                  }
                                  title="Copy Stripe dashboard link"
                                />
                              </div>
                            </div>
                          );
                        })()
                      : data?.data?.order?.invoiceId &&
                        (() => {
                          const sessionId = data?.data?.order?.invoiceId;
                          const connectAccountId =
                            data?.data?.order?.salesRep?.connectAccountId;
                          const sessionUrl = stripeUrlForUser(
                            sessionId,
                            userType,
                            connectAccountId,
                          );

                          return (
                            <div className="flex items-center gap-2 border-b">
                              <p className="w-32">Checkout Session ID</p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`underline text-blue-600 hover:text-blue-800 transition ${
                                    copiedId === sessionId
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                  title="Open in Stripe Dashboard"
                                  onClick={() =>
                                    window.open(
                                      sessionUrl,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  {shortId(sessionId)}
                                </button>
                                <FiCopy
                                  className={`cursor-pointer text-gray-500 hover:text-black ${
                                    copiedId === sessionId
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    copyLink(sessionUrl, sessionId, setCopiedId)
                                  }
                                  title="Copy Stripe dashboard link"
                                />
                              </div>
                            </div>
                          );
                        })())}

                  {data?.data?.order?.shippingCompany && (
                    <div
                      className="flex items-center gap-2 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.shippingCompanyRow}
                    >
                      <p className="w-29">Shipping Company</p>
                      <p>{data?.data?.order?.shippingCompany}</p>
                    </div>
                  )}
                  {data?.data?.order?.trackingNumber && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.trackingNumberRow}
                    >
                      <p className="w-28">Tracking No: </p>
                      <p>{data?.data?.order?.trackingNumber}</p>
                    </div>
                  )}
                  {data?.data?.order?.frequency && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.frequencyRow}
                    >
                      <p className="w-28">Frequency: </p>
                      <p>{data?.data?.order?.frequency}</p>
                    </div>
                  )}
                  {data?.data?.order?.invoiceDate && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.invoicePaidDateRow}
                    >
                      <p className="w-28">Invoice Date: </p>
                      <p>
                        {data?.data?.order?.invoiceDate
                          ? dayjs(data?.data?.order?.invoiceDate).format(
                              "MM/DD/YYYY",
                            )
                          : ""}
                      </p>
                    </div>
                  )}
                  {data?.data?.order?.invoicePaidDate && (
                    <div
                      className="flex items-center gap-5 border-b"
                      data-testid={ORDER_DETAIL.summaryCard.trackingNumberRow}
                    >
                      <p className="w-28">Invoice Paid Date: </p>
                      <p>
                        {data?.data?.order?.invoicePaidDate
                          ? dayjs(data?.data?.order?.invoicePaidDate).format(
                              "MM/DD/YYYY",
                            )
                          : ""}
                      </p>
                    </div>
                  )}
                  {data?.data?.order?.pulloutDate && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Pullout Date: </p>
                      <p>
                        {data?.data?.order?.pulloutDate
                          ? dayjs(data?.data?.order?.pulloutDate).format(
                              "MM/DD/YYYY",
                            )
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
                {/* ================ */}
                <div className="w-full grid grid-cols-2 gap-10 text-xs lg:text-sm">
                  {/* Deliver To */}
                  <div data-testid={ORDER_DETAIL.deliverTo.wrapper}>
                    <h6 className="font-semibold">Deliver To</h6>
                    <div className="items-center uppercase">
                      {data?.data?.order?.address?.companyaddress && (
                        <p>{data.data.order.address.companyaddress}</p>
                      )}
                      <p>{data?.data?.order?.address?.addressLineOne}</p>
                      <p>{data?.data?.order?.address?.addressLineTwo}</p>
                      <p>
                        {data?.data?.order?.address?.town},{" "}
                        {data?.data?.order?.address?.state}{" "}
                        {data?.data?.order?.address?.zipCode}
                      </p>
                      <p>{data?.data?.order?.address?.country}</p>
                      {data?.data?.order?.user?.phoneNumber && (
                        <p>
                          Phone: {data?.data?.order?.user?.countryCode || "+1"}{" "}
                          {data?.data?.order?.user?.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className="lowercase break-all">
                      {data?.data?.order?.user?.dispatchEmail}
                    </div>
                    {(hasPermission("customer_update") ||
                      hasPermission("selected-customer_update")) && (
                      <span
                        onClick={() => router.push(`${pathname}/edit`)}
                        className="text-blue-500 text-xs cursor-pointer"
                      >
                        Edit
                      </span>
                    )}
                  </div>

                  {/* Bill To Section */}
                  <div
                    className="uppercase"
                    data-testid={ORDER_DETAIL.invoiceTo.wrapper}
                  >
                    <div className="font-bold capitalize">Invoice to</div>

                    {/* Company address or name */}
                    {data?.data?.order?.user?.billingAddresses?.[0]
                      ?.companyaddress && (
                      <div>
                        {
                          data?.data?.order?.user?.billingAddresses[0]
                            .companyaddress
                        }
                      </div>
                    )}

                    {/* Company name if available */}
                    {data?.data?.order?.user?.companyName && (
                      <div>{data?.data?.order?.user?.companyName}</div>
                    )}

                    {/* Address lines */}
                    {data?.data?.order?.user?.billingAddresses?.[0]
                      ?.addressLineOne && (
                      <div>
                        {data?.data?.order?.user?.billingAddresses[0]
                          .addressLineOne +
                          ", " +
                          data?.data?.order?.user?.billingAddresses?.[0]
                            ?.addressLineTwo}
                      </div>
                    )}
                    {/* {data?.data?.order?.user?.billingAddresses?.[0]?.addressLineTwo && (
                  <div>
                    {invoiceData.user.billingAddresses[0].addressLineTwo}
                  </div>
                )} */}

                    {/* Town, State, Zip */}
                    {(data?.data?.order?.user?.billingAddresses?.[0]?.town ||
                      data?.data?.order?.user?.billingAddresses?.[0]?.state ||
                      data?.data?.order?.user?.billingAddresses?.[0]
                        ?.zipCode) && (
                      <div>
                        {[
                          data?.data?.order?.user?.billingAddresses[0].town,
                          data?.data?.order?.user?.billingAddresses[0].state,
                          data?.data?.order?.user?.billingAddresses[0].zipCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Country */}
                    {data?.data?.order?.user?.billingAddresses?.[0]
                      ?.country && (
                      <div>
                        {data?.data?.order?.user?.billingAddresses[0].country}
                      </div>
                    )}

                    {/* Phone */}
                    {(data?.data?.order?.user?.countryCode ||
                      data?.data?.order?.user?.phoneNumber) && (
                      <div>
                        {[
                          data?.data?.order?.user?.countryCode || "+1",
                          data?.data?.order?.user?.phoneNumber,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}

                    {/* Email */}
                    {data?.data?.order?.user?.email && (
                      <div className="lowercase break-all">
                        {data?.data?.order?.user?.emailToSendInvoices}
                      </div>
                    )}
                    {(hasPermission("customer_update") ||
                      hasPermission("selected-customer_update")) && (
                      <span
                        onClick={() => router.push(`${pathname}/edit`)}
                        className="text-blue-500 text-xs cursor-pointer capitalize"
                      >
                        Edit
                      </span>
                    )}
                  </div>

                  {data?.data?.order?.invoiceDate && (
                    <div
                      onClick={() => router.push(`${pathname}/invoice`)}
                      className="max-w-32 flex flex-col items-center text-xs text-gray-500"
                      data-testid={ORDER_DETAIL.invoiceCard}
                    >
                      <img
                        src={
                          data?.data?.order?.paymentStatus == "pending"
                            ? "/images/invoice.png"
                            : "/images/invoicePaid.png"
                        }
                        alt="invoice image"
                      />
                      <p> {data?.data?.order?.invoiceNumber}</p>
                      <p>
                        {data?.data?.order?.invoiceDate
                          ? dayjs(data?.data?.order?.invoiceDate).format(
                              "MM/DD/YYYY",
                            )
                          : ""}
                      </p>
                    </div>
                  )}
                  {data?.data?.order?.statusId == 5 && (
                    <div
                      className="max-w-32 flex flex-col items-center text-xs text-gray-500"
                      data-testid={ORDER_DETAIL.dispatchedCard}
                    >
                      <img src="/images/dispatch.png" alt="dispatch image" />
                      <p>Dispatched</p>
                      <p>
                        {" "}
                        {data?.data?.order?.orderHistories
                          ? dayjs(
                              data?.data?.order?.orderHistories?.[4]?.on,
                            ).format("MM/DD/YYYY")
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* {data?.data?.order?.statusId >= 2 && (
              <CusSupInformationCard
                heading="Supplier Information"
                image={data?.data?.order?.supplier?.image}
                name={data?.data?.order?.supplier?.supplierName}
                email={data?.data?.order?.supplier?.email}
                phoneNo={data?.data?.order?.supplier?.phoneNum}
                subHeading="Supplier Information"
                subHeadingData={{
                  "Supplier Type": `${data?.data?.order?.supplier?.supplierType}`,
                  "Business Tax No": `${data?.data?.order?.supplier?.businessRegistrationNumber}`,
                  "Business Website": `${data?.data?.order?.supplier?.businessWeb}`,
                  Address: `
                ${data?.data?.order?.supplier?.addressOne ?? ""}
                ${data?.data?.order?.supplier?.addressTwo ?? ""}
                  ${data?.data?.order?.supplier?.city ?? ""}, ${
                    data?.data?.order?.supplier?.state ?? ""
                  } - ${data?.data?.order?.supplier?.zipCode ?? ""}
                ${data?.data?.order?.supplier?.country ?? ""}`,
                }}
              />
            )} */}
            </div>

            {/* Right side */}
            <div
              className="space-y-8"
              data-testid={ORDER_DETAIL.trackOrderSection}
            >
              <TrackOrder
                orderHistories={data?.data?.order?.orderHistories}
                statusId={data?.data?.order?.statusId}
              />
              <div data-testid={ORDER_DETAIL.orderCardSection}>
                <OrderCard
                  reFetch={reFetch}
                  orderData={data?.data?.order}
                  modal={modal}
                  setModal={setModal}
                  onSectionRefreshTrigger={startSectionRefreshTimer}
                />
              </div>
            </div>
          </div>
        )}

        <Dialog
          visible={
            (modal?.type === "cancelOrder" && modal?.status) ||
            (modal?.type === "addCheque" && modal?.status) ||
            (modal?.type === "editCheque" && modal?.status) ||
            (modal?.type === "deleteOrder" && modal?.status)
          }
          style={{ width: "40vw" }}
          className="font-nunito"
          dismissableMask={true}
          onHide={() =>
            setModal({
              type: "",
              status: false,
            })
          }
          header={
            <div
              className="font-nunito font-bold text-2xl text-center"
              data-testid={ORDER_DETAIL.dialog.title}
            >
              {modal?.type === "cancelOrder"
                ? "Cancel Order"
                : modal?.type === "addCheque"
                  ? "Add Bank Check"
                  : modal?.type === "editCheque"
                    ? "Edit Bank Check"
                    : "Delete Order"}
            </div>
          }
          data-testid={ORDER_DETAIL.dialog.root}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            {loader === "cancelOrder" ||
            loader === "addCheque" ||
            loader === "deleteOrder" ? (
              <MiniLoader data-testid={ORDER_DETAIL.miniLoader} />
            ) : (
              <div className="w-full space-y-4">
                {modal?.type === "cancelOrder" ? (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to cancel this Order ?
                  </p>
                ) : modal?.type === "deleteOrder" ? (
                  <div className="space-y-3">
                    <p className="text-red-600 font-semibold text-center">
                      This action is permanent.
                    </p>
                    <p className="text-labelColor font-nunito font-medium text-lg text-center">
                      Are you sure you want to permanently delete this Order?
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Number
                      </label>
                      <input
                        type="text"
                        name="chequeNumber"
                        value={addCheque?.chequeNumber}
                        onChange={handleChange}
                        placeholder="Enter Cheque Number"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        data-testid={ORDER_DETAIL.dialog.chequeNumberInput}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Date
                      </label>
                      <input
                        type="date"
                        name="chequeDate"
                        value={addCheque?.chequeDate}
                        onChange={handleChange}
                        placeholder="Select Cheque Date"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        data-testid={ORDER_DETAIL.dialog.chequeDateInput}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Status
                      </label>
                      {/* <input
                      type="chequeStatus"
                      name="desc"
                      value={addCheque?.chequeStatus}
                      onChange={handleChange}
                      placeholder="Enter Description"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      inputId={ORDER_DETAIL.dialog.chequeStatusSelect}
                    /> */}
                      <Select
                        placeholder="Select Cheque Status"
                        className="w-full"
                        value={
                          addCheque?.chequeStatus?.value
                            ? addCheque?.chequeStatus
                            : null
                        }
                        styles={selectStyles2}
                        options={chequeStatusOptions}
                        onChange={(e) => {
                          setAddCheque({ ...addCheque, chequeStatus: e });
                        }}
                        inputId={ORDER_DETAIL.dialog.chequeStatusSelect}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={addCheque?.bankName}
                        onChange={handleChange}
                        placeholder="Enter Bank Name"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        data-testid={ORDER_DETAIL.dialog.bankNameInput}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Branch
                      </label>
                      <input
                        type="text"
                        name="bankBranch"
                        value={addCheque?.bankBranch}
                        onChange={handleChange}
                        placeholder="Enter Bank Branch"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        data-testid={ORDER_DETAIL.dialog.bankBranchInput}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Type
                      </label>
                      {/* <input
                      type="chequeType"
                      name="desc"
                      value={addCheque?.chequeType}
                      onChange={handleChange}
                      placeholder="Enter Description"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    /> */}
                      <Select
                        placeholder="Select Bank Check Type"
                        className="w-full"
                        value={
                          addCheque?.chequeType?.value
                            ? addCheque?.chequeType
                            : null
                        }
                        styles={selectStyles2}
                        options={chequeTypeOptions}
                        onChange={(e) => {
                          setAddCheque({ ...addCheque, chequeType: e });
                        }}
                        inputId={ORDER_DETAIL.dialog.chequeTypeSelect}
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Bank Check Receipt Date
                      </label>
                      <input
                        type="date"
                        name="chequeReceiptDate"
                        value={addCheque?.chequeReceiptDate}
                        onChange={handleChange}
                        placeholder="Enter Description"
                        className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                        data-testid={ORDER_DETAIL.dialog.chequeReceiptDateInput}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-x-4 [&>button]:font-nunito [&>button]:py-3 [&>button]:font-medium">
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        type: "",
                        status: false,
                      })
                    }
                    className="hover:bg-theme hover:text-white duration-150 rounded-lg border border-theme text-theme shadow-buttonShadow  px-6"
                    data-testid={ORDER_DETAIL.dialog.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10 bg-theme"
                    data-testid={ORDER_DETAIL.dialog.submitBtn}
                  >
                    {modal?.type === "cancelOrder"
                      ? "Cancel Order"
                      : modal?.type === "addCheque"
                        ? "Add Bank Check"
                        : modal?.type === "editCheque"
                          ? "Update Bank Check"
                          : "Delete Order"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Dialog>
      </div>
    </div>
  );
}
