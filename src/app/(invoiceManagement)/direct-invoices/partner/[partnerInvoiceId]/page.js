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
import React, { useState } from "react";
import Select from "react-select";
import { CgNotes } from "react-icons/cg";
import { LuClipboardList } from "react-icons/lu";
import Link from "next/link";
import dayjs from "dayjs";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import { hasPermission } from "@/utilities/Permission";
import { ORDER_DETAIL } from "../../../../(orderManagement)/orders/orders.testids";
import { FiCopy } from "react-icons/fi";
import { BASE_URL } from "@/utilities/URL";

export default function OrderDetail() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
    var partnerType = localStorage.getItem("partnerType");
    var isEmployee = localStorage.getItem("isEmployee") ? true : false;
  }

  const { partnerInvoiceId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [chequeId, setChequeId] = useState("");
  const [copiedId, setCopiedId] = useState(null);
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
    `api/v1/admin/partner-order/order-details/${partnerInvoiceId}`,
    "orders"
  );

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
        partnerOrderId: partnerInvoiceId,
        orderData: {
          supplierId: 16,
          statusId: 2,
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Supplier assign successfully");
        reFetch();
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
          partnerOrderId: partnerInvoiceId,
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
          `api/v1/admin/order-management/delete-order/${partnerInvoiceId}`,
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
          partnerOrderId: partnerInvoiceId,
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
        `api/v1/admin/order-management/send-invoice/${partnerInvoiceId}`,
        {
          order: {
            partnerOrderId: partnerInvoiceId,
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
        partnerOrderId: partnerInvoiceId,
        orderData: {
          paymentStatus: status?.value, //"pending" , 'done'
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Status Updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

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
            onClick={() => router.push("/direct-invoices")}
            data-testid={ORDER_DETAIL.breadcrumbOrdersLink}
          >
            Invoice /
          </p>{" "}
          <span data-testid={ORDER_DETAIL.orderIdText(data?.data?.order?.id)}>
            {data?.data?.order?.invoiceNumber}
          </span>
          {/* <p
            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${data?.data?.order?.orderCurrentStatus?.includes("Cancelled")
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
          </p> */}
        </div>

        {partnerType !== "direct-partner" && (
          <ul
            className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative text-blue-500"
            data-testid={ORDER_DETAIL.actionsBar}
          >
            {/* {userType === "admin" &&
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
              )} */}
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
              {/* Dispatch / Supplier Actions - Hidden for invoices */}

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

              {/* Cancel and Delete buttons - Hidden for invoices */}
            </div>
          </div>
        )}

        {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
          <MiniLoader />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:gap-x-12">
            {/* Left side */}
            <div className="space-y-6">
              <div className="w-full bg-blue-50 flex justify-between bg-blue-50 rounded-md w-full px-4 lg:px-6 py-6 ">
                <div
                  className="flex gap-x-2"
                  data-testid={ORDER_DETAIL.infoBanner}
                >
                  {/* <div>
                    <LuClipboardList size={25} />
                  </div> */}
                  <div className="space-y-4">
                    {/* <p className="font-semibold">
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
                    </p> */}
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
                                  handlePaymentStatus(e);
                                }}
                                isDisabled={data?.data?.order?.selfOrder}
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
                          "MM/DD/YYYY"
                        )
                      : "Not Sent"}
                  </p>
                  {data?.data?.order?.invoiceReminder &&
                    data?.data?.order?.invoiceDate && (
                      <p className="font-semibold">
                        Invoice Reminder:{" "}
                        {dayjs(data?.data?.order?.invoiceReminder).format(
                          "MM/DD/YYYY"
                        )}
                      </p>
                    )}
                </div>
              </div>

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
              {data?.data?.order?.type !== "direct-invoice" && (
                <TrackOrder
                  orderHistories={data?.data?.order?.orderHistories}
                  statusId={data?.data?.order?.statusId}
                />
              )}
              <div data-testid={ORDER_DETAIL.orderCardSection}>
                <PartnerOrderCard
                  reFetch={reFetch}
                  orderData={data?.data?.order}
                  modal={modal}
                  setModal={setModal}
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
