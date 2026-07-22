"use client";
export const dynamic = "force-dynamic";
import BackButton from "@/components/ui/BackButton";
import CusSupInformationCard from "@/components/ui/CusSupInformationCard";
import { RiArrowDownSLine } from "react-icons/ri";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import PartnerOrderCard from "@/components/ui/PartnerOrderCard";
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
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { CgNotes } from "react-icons/cg";
import { LuClipboardList } from "react-icons/lu";
import Link from "next/link";
import dayjs from "dayjs";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { hasPermission } from "@/utilities/Permission";
import { ORDER_DETAIL } from "../../../orders.testids";
import { FiCopy, FiEdit2 } from "react-icons/fi";
import { BASE_URL } from "@/utilities/URL";
import { formatDateTimeISO } from "@/utilities/constants";
import { useUserType } from "@/utilities/useUserType";
import { getEmailHelperRetryPayload, logEmailTypeToBulkApi } from "@/utilities/emailLogTypes";
import {
  MIN_TRACKING_NUMBER_LENGTH,
  MAX_TRACKING_NUMBER_LENGTH,
  sanitizeTrackingNumberInput,
  validateTrackingNumber,
} from "@/utilities/trackingNumber";

export default function OrderDetail() {
  const { isAllowed: canViewEmailLogs } = useUserType(
    ["admin", "salesRepresentative"],
    { redirectIfNotAllowed: false },
  );
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var partnerType = localStorage.getItem("partnerType");
    var isEmployee = localStorage.getItem("isEmployee") ? true : false;
  }

  const { orderID } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [chequeId, setChequeId] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [emailLogsExpanded, setEmailLogsExpanded] = useState(false);
  const [showInvoiceTrackingModal, setShowInvoiceTrackingModal] = useState(false);
  const [retryEmailLogId, setRetryEmailLogId] = useState(null);
  const [retryCooldownEndsAt, setRetryCooldownEndsAt] = useState({});
  const [, setCooldownTick] = useState(0);
  const [sectionRefreshCooldownEndsAt, setSectionRefreshCooldownEndsAt] =
    useState(null);
  const sectionRefreshCooldownEndsAtRef = useRef(null);
  const [modal, setModal] = useState({
    type: "", // addCheque , editCheque , updateTrackingNumber
    status: false,
  });

  const [loader, setLoader] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
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
    `api/v1/admin/partner-order/order-details/${orderID}`,
    "orders"
  );

  const emailLogApiUrl = orderID
    ? `api/v1/admin/order-management/email-log?partnerOrderId=${orderID}`
    : "";
  const {
    data: emailLogData,
    reFetch: reFetchEmailLogs,
    isLoading: emailLogLoading,
  } = GetAPI(emailLogApiUrl);

  const invoiceTrackingApiUrl =
    showInvoiceTrackingModal && orderID
      ? `api/v1/admin/order-management/invoice-tracking/partner-order/${orderID}`
      : "";
  const {
    data: invoiceTrackingData,
    isLoading: invoiceTrackingLoading,
    reFetch: reFetchInvoiceTracking,
  } = GetAPI(invoiceTrackingApiUrl);

  const emailLogs = emailLogData?.data?.emailLogs ?? [];

  const openUpdateTrackingModal = () => {
    setEditTrackingNumber(
      sanitizeTrackingNumberInput(data?.data?.order?.trackingNumber || ""),
    );
    setModal({ type: "updateTrackingNumber", status: true });
  };

  const handleUpdateTrackingNumber = async (e) => {
    e.preventDefault();
    const trackingNumber = editTrackingNumber.trim();
    const validationError = validateTrackingNumber(trackingNumber);
    if (validationError) {
      error_toaster(validationError);
      return;
    }
    setLoader("updateTrackingNumber");
    try {
      const res = await PatchAPI(
        "api/v1/admin/order-management/update-tracking-number",
        {
          orderId: Number(data?.data?.order?.id),
          trackingNumber,
          orderType: "partner-order", // partner-only orders (not customer)
        },
      );
      if (res?.data?.status === "success") {
        setModal({ type: "", status: false });
        setEditTrackingNumber("");
        reFetch();
        setLoader("");
      } else {
        setLoader("");
        throw new Error(
          res?.data?.message || "Failed to update tracking number",
        );
      }
    } catch (error) {
      ErrorHandler(error);
      setLoader("");
    }
  };

  const handleSupplierAcknowledgement = async () => {
    setLoader("acknowledgeSupplier");
    try {
      const res = await PatchAPI("api/v1/admin/supplier-acknowledgement", {
        partnerOrderId: data?.data?.order?.id,
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
        partnerOrderId: data?.data?.order?.id,
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
        partnerOrderId: orderID,
        orderData: {
          supplierId: 16,
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
          partnerOrderId: orderID,
          orderData: {
            paymentMethod: "cheque",
          },
          cheque: {
            chequeNumber: addCheque?.chequeNumber,
            chequeDate: addCheque?.chequeDate,
            chequeStatus: addCheque?.chequeStatus?.value,
            bankName: addCheque?.bankName,
            bankBranch: addCheque?.bankBranch,
            chequeType: addCheque?.chequeType?.value,
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
            res?.data?.message || "An unexpected error occurred."
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
            chequeStatus: addCheque?.chequeStatus?.value,
            bankName: addCheque?.bankName,
            bankBranch: addCheque?.bankBranch,
            chequeType: addCheque?.chequeType?.value,
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
            res?.data?.message || "An unexpected error occurred."
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
          "orders"
        );

        if (res?.data?.status === "success") {
          success_toaster("Order deleted successfully");
          setModal({ type: "", status: false });
          setLoader("");
          router.push("/orders");
        } else {
          setLoader("");
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
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
          partnerOrderId: orderID,
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
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
      }
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
      const res = await PostAPI(
        `api/v1/admin/order-management/send-invoice/${orderID}`,
        {
          order: {
            partnerOrderId: orderID,
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
        }
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
        partnerOrderId: orderID,
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

  const handleRetryEmail = async (log) => {
    const apiEmailType = logEmailTypeToBulkApi(log.emailType);
    setRetryEmailLogId(log.id);
    try {
      const res = await PostAPI("api/v1/admin/order-management/email-helper", {
        ...getEmailHelperRetryPayload(log, { fallbackOrderId: orderID }),
        emailType: apiEmailType,
      });
      if (res?.data?.status === "success" || res?.data?.status === true) {
        success_toaster("Email sent successfully");
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
        if (showInvoiceTrackingModal) {
          reFetchInvoiceTracking();
        }
      }
      const sectionEnd = sectionRefreshCooldownEndsAtRef.current;
      if (sectionEnd != null && now >= sectionEnd) {
        sectionRefreshCooldownEndsAtRef.current = null;
        setSectionRefreshCooldownEndsAt(null);
        reFetchEmailLogs();
        if (showInvoiceTrackingModal) {
          reFetchInvoiceTracking();
        }
      }
      setCooldownTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [reFetchEmailLogs, reFetchInvoiceTracking, showInvoiceTrackingModal]);

  const shortId = (val) =>
    val && val.length > 12
      ? `${val.slice(0, 12)}..${val.slice(-4)}`
      : val || "";

  const stripeUrlForUser = (id, userType, connectAccountId) => {
    if (!id) return "#";
    if (userType === "salesRepresentative" && connectAccountId) {
      return `https://dashboard.stripe.com/payments/${id}?connected_account=${encodeURIComponent(
        connectAccountId
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

  const handleSelfOrderPullout = async (id) => {
    let res = await PostAPI(
      BASE_URL + `api/v1/admin/partner-order/pull-payment-from-bank/${id}`
    );

    if (res?.data?.status === "success") {
      success_toaster("Payment Pullout Successfully");
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const { toggle, setToggle } = useDataContext();

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

        {partnerType !== "direct-partner" && (
          <ul
            className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500"
            data-testid={ORDER_DETAIL.actionsBar}
          >
            {userType === "admin" &&
              data?.data?.order?.partnerOrderDetail &&
              data?.data?.order.paymentStatus === "pending" && (
                <li>
                  <button
                    type="button"
                    className="disabled:cursor-not-allowed"
                    onClick={() =>
                      handleSelfOrderPullout(data?.data?.order?.id)
                    }
                    data-testid={ORDER_DETAIL.pullout}
                  >
                    Pullout
                  </button>
                </li>
              )}
            {!data?.data?.order.selfOrder && (
              <li>
                {hasPermission("invoice_update") && (
                  <button
                    type="button"
                    disabled={data?.data?.order?.statusId === 6 ? true : false}
                    className="disabled:cursor-not-allowed"
                    onClick={() =>
                      handleSendInvoice(data?.data?.order?.statusId)
                    }
                    data-testid={ORDER_DETAIL.sendInvoiceBtn}
                  >
                    {data?.data?.order?.invoiceDate
                      ? "Invoice reminder"
                      : "Send Invoices"}
                  </button>
                )}
              </li>
            )}

            {!data?.data?.order.selfOrder && (
              <li>
                <button
                  onClick={() => router.push(`${pathname}/invoice`)}
                  type="button"
                  data-testid={ORDER_DETAIL.viewPdfBtn}
                >
                  View PDF
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {data?.data?.order?.selfOrder ? (
          ""
        ) : (
          <div className="flex justify-end">
            <div
              className="flex items-center gap-x-2 sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium [&>button]:text-xs lg:[&>button]:text-sm"
              data-testid={ORDER_DETAIL.actionsBar}
            >
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

              {hasPermission("invoice_update") && (
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
                    data?.data?.order?.statusId === 6
                      ? true
                      : false
                  }
                  type="button"
                  onClick={handleCancelOrder}
                  className="bg-theme text-white disabled:cursor-not-allowed"
                  data-testid={ORDER_DETAIL.cancelOrderBtn}
                >
                  Cancel Order
                </button>
              )}
              {(!isEmployee || hasPermission("orders_delete")) && (
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  disabled={
                    data?.data?.order?.statusId === 4 ||
                    data?.data?.order?.statusId === 5
                  }
                  className="bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    data?.data?.order?.statusId === 4 ||
                    data?.data?.order?.statusId === 5
                      ? "Shipped orders cannot be deleted"
                      : ""
                  }
                  data-testid={ORDER_DETAIL.deleteOrderBtn}
                >
                  Delete Order
                </button>
              )}
            </div>
          </div>
        )}

        {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
          <MiniLoader />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:gap-x-12">
            {/* Left side */}
            <div className="space-y-6">
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

                          {((userType === "admin" ||
                            userType === "salesRepresentative") &&
                            data?.data?.order?.paymentMethod === "card") ||
                          data?.data?.order?.statusId === 6 ? (
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
                                  if (isEmployee) return;
                                  handlePaymentStatus(e);
                                }}
                                isDisabled={data?.data?.order?.selfOrder || isEmployee}
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-start rounded-lg border border-blue-100 bg-white/80 px-3 py-2.5 shadow-sm w-full xl:w-auto xl:min-w-[320px] max-w-full">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        Invoice Sent:{" "}
                        <span className="text-gray-700 font-medium">
                          {data?.data?.order?.invoiceDate
                            ? dayjs(data?.data?.order?.invoiceDate).format("MM/DD/YYYY")
                            : "Not Sent"}
                        </span>
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        Invoice Reminder:{" "}
                        <span className="text-gray-700 font-medium">
                          {data?.data?.order?.invoiceReminder &&
                          data?.data?.order?.invoiceDate
                            ? dayjs(data?.data?.order?.invoiceReminder).format("MM/DD/YYYY")
                            : "—"}
                        </span>
                      </p>
                    </div>
                    <div className="relative group shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowInvoiceTrackingModal(true)}
                        className="h-9 w-9 rounded-md border border-theme/30 text-theme flex items-center justify-center hover:bg-theme hover:text-white transition-colors"
                        aria-label="View invoice tracking"
                      >
                        <CgNotes size={16} />
                      </button>
                      <span className="pointer-events-none absolute -top-9 right-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[11px] bg-gray-900 text-white px-2 py-1 rounded">
                        View invoice tracking
                      </span>
                    </div>
                  </div>
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-1">
                                <p>
                                  <span className="font-medium">
                                    Recently viewed:
                                  </span>{" "}
                                  {log.lastOpenedAt
                                    ? formatDateTimeISO(
                                        log.lastOpenedAt,
                                        "datetime",
                                      )
                                    : "—"}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    First opened:
                                  </span>{" "}
                                  {log.firstOpenedAt
                                    ? formatDateTimeISO(
                                        log.firstOpenedAt,
                                        "datetime",
                                      )
                                    : "—"}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Last opened:
                                  </span>{" "}
                                  {log.lastOpenedAt
                                    ? formatDateTimeISO(
                                        log.lastOpenedAt,
                                        "datetime",
                                      )
                                    : "—"}
                                </p>
                                <p>
                                  <span className="font-medium">Open count:</span>{" "}
                                  {log.openCount ?? 0}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Click count:
                                  </span>{" "}
                                  {log.clickCount ?? 0}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Soft bounced at:
                                  </span>{" "}
                                  {log.softBouncedAt
                                    ? formatDateTimeISO(
                                        log.softBouncedAt,
                                        "datetime",
                                      )
                                    : "—"}
                                </p>
                                <p className="sm:col-span-2">
                                  <span className="font-medium">
                                    Soft bounce reason:
                                  </span>{" "}
                                  {log.softBounceReason || "—"}
                                </p>
                              </div>
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
                            connectAccountId
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
                                      "noopener,noreferrer"
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
                            connectAccountId
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
                                      "noopener,noreferrer"
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
                      className="flex items-center gap-5 border-b py-0.5"
                      data-testid={ORDER_DETAIL.summaryCard.trackingNumberRow}
                    >
                      <p className="w-28 shrink-0">Tracking No: </p>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="leading-none">
                          {data?.data?.order?.trackingNumber}
                        </p>
                        <button
                          type="button"
                          onClick={openUpdateTrackingModal}
                          className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title="Update tracking number"
                          aria-label="Update tracking number"
                          data-testid={ORDER_DETAIL.summaryCard.editTrackingBtn}
                        >
                          <FiEdit2 size={14} className="block" />
                        </button>
                      </div>
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
                              "MM/DD/YYYY"
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
                              "MM/DD/YYYY"
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
                              "MM/DD/YYYY"
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
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.addressLineOne && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .addressLineOne
                          }
                        </p>
                      )}
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.addressLineTwo && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .addressLineTwo
                          }
                        </p>
                      )}
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.town && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .town
                          }
                        </p>
                      )}
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.state && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .state
                          }
                        </p>
                      )}
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.zipCode && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .zipCode
                          }
                        </p>
                      )}
                      {data?.data?.order?.salesRep?.billingAddresses?.[0]
                        ?.country && (
                        <p>
                          {
                            data?.data?.order?.salesRep?.billingAddresses[0]
                              .country
                          }
                        </p>
                      )}
                    </div>
                    {/* {(hasPermission("customer_update") || hasPermission("selected-customer_update")) && (
                    <span
                      onClick={() => router.push(`${pathname}/edit`)}
                      className="text-blue-500 text-xs cursor-pointer"
                    >
                      Edit
                    </span> )} */}
                  </div>

                  {/* Bill To Section */}
                  <div
                    className="uppercase"
                    data-testid={ORDER_DETAIL.invoiceTo.wrapper}
                  >
                    <div className="font-bold capitalize">Invoice to</div>
                    <div>
                      {data?.data?.order?.salesRep?.address && (
                        <div>{data?.data?.order?.salesRep?.address}</div>
                      )}

                      {data?.data?.order?.salesRep?.city && (
                        <div>{data?.data?.order?.salesRep?.city}</div>
                      )}

                      {data?.data?.order?.salesRep?.state && (
                        <div>{data?.data?.order?.salesRep?.state}</div>
                      )}

                      {data?.data?.order?.salesRep?.country && (
                        <div>{data?.data?.order?.salesRep?.country}</div>
                      )}
                    </div>
                    {(data?.data?.order?.salesRep?.countryCode ||
                      data?.data?.order?.salesRep?.phoneNumber) && (
                      <div>
                        {[
                          data?.data?.order?.salesRep?.countryCode || "+1",
                          data?.data?.order?.salesRep?.phoneNumber,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                    )}
                    {/* {(hasPermission("customer_update") || hasPermission("selected-customer_update")) && (
                    <span
                      onClick={() => router.push(`${pathname}/edit`)}
                      className="text-blue-500 text-xs cursor-pointer capitalize"
                    >
                      Edit
                    </span> )} */}
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
                              "MM/DD/YYYY"
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
                              data?.data?.order?.orderHistories?.[4]?.on
                            ).format("MM/DD/YYYY")
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                <PartnerOrderCard
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
            modal?.type === "updateTrackingNumber" && modal?.status
          }
          onHide={() => {
            setModal({ type: "", status: false });
            setEditTrackingNumber("");
          }}
          header={
            <div className="font-nunito font-bold text-xl">
              Update Tracking Number
            </div>
          }
          className="font-nunito w-[92vw] max-w-md"
          dismissableMask={true}
          data-testid={ORDER_DETAIL.dialog.updateTrackingRoot}
        >
          {loader === "updateTrackingNumber" ? (
            <div className="w-full min-h-[160px] flex items-center justify-center">
              <MiniLoader />
            </div>
          ) : (
            <form onSubmit={handleUpdateTrackingNumber} className="space-y-5 pt-1">
              <div className="flex flex-col gap-y-2">
                <label className="text-labelColor font-medium font-satoshi">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={editTrackingNumber}
                  onChange={(e) =>
                    setEditTrackingNumber(
                      sanitizeTrackingNumberInput(e.target.value),
                    )
                  }
                  placeholder="Enter tracking number"
                  minLength={MIN_TRACKING_NUMBER_LENGTH}
                  maxLength={MAX_TRACKING_NUMBER_LENGTH}
                  className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3 focus:border-theme"
                  autoFocus
                  data-testid={ORDER_DETAIL.dialog.trackingNumberInput}
                />
                <p className="text-xs text-gray-500">
                  {MIN_TRACKING_NUMBER_LENGTH}–{MAX_TRACKING_NUMBER_LENGTH}{" "}
                  characters. Letters, numbers, and hyphens only (no emojis).
                </p>
              </div>
              <div className="flex items-center justify-end gap-x-3 [&>button]:font-nunito [&>button]:py-2.5 [&>button]:font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setModal({ type: "", status: false });
                    setEditTrackingNumber("");
                  }}
                  className="rounded-lg border border-gray-300 text-gray-700 bg-white shadow-buttonShadow px-5 hover:bg-gray-100 duration-150"
                  data-testid={ORDER_DETAIL.dialog.updateTrackingCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-theme text-white duration-150 rounded-lg border border-theme shadow-buttonShadow px-5 hover:opacity-90"
                  data-testid={ORDER_DETAIL.dialog.updateTrackingSubmitBtn}
                >
                  Update
                </button>
              </div>
            </form>
          )}
        </Dialog>

        <Dialog
          visible={showInvoiceTrackingModal}
          onHide={() => setShowInvoiceTrackingModal(false)}
          header="Invoice Activity"
          className="font-nunito w-[92vw] max-w-md"
          dismissableMask={true}
        >
          <div className="py-1">
            {sectionRefreshCooldownEndsAt != null && (
              <div className="mb-3 rounded-md border border-theme/20 bg-theme/5 px-3 py-2 text-xs text-theme font-medium">
                Refreshing invoice activity in{" "}
                {Math.max(
                  0,
                  Math.ceil((sectionRefreshCooldownEndsAt - Date.now()) / 1000),
                )}
                s...
              </div>
            )}
            {invoiceTrackingLoading ? (
              <div className="w-full min-h-[260px] flex items-center justify-center">
                <MiniLoader />
              </div>
            ) : (
              (() => {
                const invoiceTrackingOrder = invoiceTrackingData?.data?.order;
                return [
                  {
                    label: "Invoice Created",
                    at: invoiceTrackingOrder?.invoiceDate,
                    done: Boolean(invoiceTrackingOrder?.invoiceDate),
                    dateOnly: true,
                  },
                  {
                    label: `Sent ${invoiceTrackingOrder?.invoiceEmailSentCount ?? 0} times`,
                    at:
                      invoiceTrackingOrder?.invoiceReminder ||
                      invoiceTrackingOrder?.invoiceDate,
                    done: Boolean(invoiceTrackingOrder?.invoiceEmailSentCount),
                    dateOnly: true,
                  },
                  {
                    label: "First Open",
                    at: invoiceTrackingOrder?.paymentLinkFirstOpenedAt,
                    done: Boolean(invoiceTrackingOrder?.paymentLinkFirstOpenedAt),
                  },
                  {
                    label: "Recently Opened",
                    at: invoiceTrackingOrder?.paymentLinkLastOpenedAt,
                    done: Boolean(invoiceTrackingOrder?.paymentLinkLastOpenedAt),
                  },
                  {
                    label: `Viewed ${invoiceTrackingOrder?.paymentLinkOpenCount ?? 0} times`,
                    at:
                      invoiceTrackingOrder?.paymentLinkLastOpenedAt ||
                      invoiceTrackingOrder?.paymentLinkFirstOpenedAt,
                    done: (invoiceTrackingOrder?.paymentLinkOpenCount ?? 0) > 0,
                  },
                  {
                    label: "Paid",
                    at: invoiceTrackingOrder?.invoicePaidDate,
                    done: Boolean(invoiceTrackingOrder?.invoicePaidDate),
                    dateOnly: true,
                  },
                ].map((step, index, arr) => (
                  <div key={`${step.label}-${index}`} className="relative pl-8 pb-5">
                    {index !== arr.length - 1 && (
                      <span className="absolute left-[11px] top-5 h-[calc(100%-6px)] w-[2px] bg-gray-200" />
                    )}
                    <span
                      className={`absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 ${
                        step.done
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {step.done && (
                        <span className="absolute inset-[5px] rounded-full bg-green-500" />
                      )}
                    </span>
                    <p className="text-[15px] font-semibold text-gray-800">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {step.at
                        ? step.dateOnly
                          ? dayjs(step.at).format("MM/DD/YYYY")
                          : formatDateTimeISO(step.at, "datetime")
                        : "—"}
                    </p>
                  </div>
                ));
              })()
            )}
          </div>
        </Dialog>

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
