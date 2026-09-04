"use client";
export const dynamic = "force-dynamic";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { useDataContext } from "@/utilities/DataContext";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import dayjs from "dayjs";
import { useParams, usePathname } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";

function historyDate(orderHistories, statusId) {
  const match = orderHistories?.find(
    (history) => Number(history?.statusId) === Number(statusId)
  );
  return match?.on || null;
}

function formatLongDate(value) {
  if (!value) return "";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMMM D, YYYY") : "";
}

function getDeliverTo(order) {
  const address = order?.address || {};
  const partnerAddr = order?.salesRep?.billingAddresses?.[0] || {};
  const userAddr = order?.user?.addresses?.[0] || {};

  const hasCustomerShipTo = Boolean(
    address.addressLineOne || address.companyaddress
  );
  const locationName = [
    address.companyaddress,
    address.locationName,
    partnerAddr.companyaddress,
    !hasCustomerShipTo ? order?.salesRep?.companyName : null,
  ].find((value) => String(value || "").trim());

  const attention = [
    address.shippingContact,
    userAddr.shippingContact,
    partnerAddr.shippingContact,
    order?.user?.name,
    order?.salesRep?.srName,
    order?.salesRep?.name,
  ].find((value) => String(value || "").trim());

  const street = address.addressLineOne || partnerAddr.addressLineOne || "";
  const street2 = address.addressLineTwo || partnerAddr.addressLineTwo || "";
  const town = address.town || partnerAddr.town || "";
  const state = address.state || partnerAddr.state || "";
  const zip = address.zipCode || partnerAddr.zipCode || "";
  const country = address.country || partnerAddr.country || "";

  return { locationName, attention, street, street2, town, state, zip, country };
}

function statusDateLine(order) {
  const statusId = Number(order?.statusId);
  const histories = order?.orderHistories;
  const currentLabel = order?.orderCurrentStatus || "";

  if (statusId >= 4 && statusId !== 6) {
    const date =
      formatLongDate(historyDate(histories, 4)) ||
      formatLongDate(order?.dispatchedAt) ||
      formatLongDate(order?.shippedAt);
    return date ? `Dispatched on ${date}` : currentLabel || "Shipped";
  }

  if (statusId === 6 || String(currentLabel).toLowerCase().includes("cancel")) {
    const date =
      formatLongDate(historyDate(histories, 6)) ||
      formatLongDate(order?.cancelledAt);
    return date ? `Cancelled on ${date}` : currentLabel || "Cancelled";
  }

  if (statusId === 3) {
    const date =
      formatLongDate(historyDate(histories, 3)) ||
      formatLongDate(order?.acknowledgedAt);
    return date ? `Acknowledged on ${date}` : currentLabel || "Acknowledged";
  }

  const assignedDate =
    formatLongDate(historyDate(histories, 2)) ||
    formatLongDate(order?.assignedAt) ||
    formatLongDate(order?.on) ||
    formatLongDate(order?.createdAt);
  if (assignedDate) {
    return statusId === 2 || /new|assign/i.test(currentLabel)
      ? `Assigned on ${assignedDate}`
      : `${currentLabel || "New"} on ${assignedDate}`;
  }
  return currentLabel || "";
}

function itemLabel(item) {
  const name = item?.product ?? item?.productName ?? item?.name ?? "";
  const grind = String(item?.grind || "").trim();
  return grind ? `${name} — ${grind}` : name;
}

function itemSku(item) {
  return item?.supplierSku || item?.sku || item?.productCode || item?.code || "";
}

function supplierTrackStep(orderHistories, statusId) {
  const result = orderHistories?.find(
    (history) => history?.statusId == statusId
  );
  return {
    status: !!result,
    date: result ? dayjs(result.on)?.format("MM/DD/YYYY HH:mm A") : null,
  };
}

function SupplierOrderTimeline({ orderHistories }) {
  const steps = [
    { heading: "Dispatched to Supplier", ...supplierTrackStep(orderHistories, 2) },
    { heading: "Supplier Acknowledged", ...supplierTrackStep(orderHistories, 3) },
    { heading: "Shipped Orders", ...supplierTrackStep(orderHistories, 4) },
  ];

  return (
    <div className="relative z-0 w-full max-w-[220px] mx-auto lg:mx-0 lg:shrink-0 lg:pt-1">
      <div className="absolute left-[8px] top-2 bottom-2 border-l-2 border-dashed border-dottedLine/40 z-10" />
      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <div
            key={step.heading}
            className="flex items-start gap-2.5 font-switzer relative z-20"
          >
            <div
              className={`${
                step.status ? "bg-themeGreen" : "bg-themeGray3"
              } size-4 rounded-full flex items-center justify-center shrink-0`}
            >
              <FaCheck color="#FFFFFF" size={8} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-xs">{step.heading}</p>
              <p className="text-black text-opacity-40 text-[11px] mt-0.5">
                {step.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const pathname = usePathname();
  const { orderID, id } = useParams();
  const { toggle, setToggle } = useDataContext();
  const [modal, setModal] = useState({
    type: "",
    status: false,
  });
  const [loader, setLoader] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [dispatchOrderData, setDispatchOrderData] = useState({
    trackingNumber: "",
    shippingCompany: "UPS",
  });

  const url = pathname.includes("/supplier/partner")
    ? `api/v1/admin/partner-order/order-details/${id}`
    : `api/v1/admin/order-details/${orderID}`;
  const { data, reFetch, isLoading } = GetAPI(url);
  const order = data?.data?.order;
  const displayId = order?.id || orderID || id;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("userName");
    setSupplierName(stored || "");
  }, []);

  const greetingName =
    supplierName || order?.supplier?.supplierName || "Supplier";

  const handleSupplierAcknowledgement = async () => {
    setLoader("acknowledgeSupplier");
    try {
      const res = await PatchAPI("api/v1/admin/supplier-acknowledgement", {
        [pathname.includes("/supplier/partner") ? "partnerOrderId" : "orderId"]:
          order?.id,
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

  const handleAssignSupplier = (statusId) => {
    if (statusId === 2) {
      handleSupplierAcknowledgement();
    } else if (statusId === 3) {
      setModal({
        type: "dispatchOrder",
        status: true,
      });
    }
  };

  const isTruckCompany =
    order?.shippingCompany?.trim()?.toLowerCase()?.includes("truck") || false;

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (Number(order?.statusId) !== 3) return;

    try {
      const isTruck = order?.shippingCompany
        ?.trim()
        ?.toLowerCase()
        ?.includes("truck");

      if (!isTruck) {
        if (!dispatchOrderData?.trackingNumber) {
          info_toaster("Enter Tracking number");
          return;
        } else if (!dispatchOrderData?.shippingCompany) {
          info_toaster("Select Shipping company");
          return;
        }
      }

      setLoader("dispatchOrder");
      const res = await PatchAPI("api/v1/admin/order-dispatch", {
        [pathname.includes("/supplier/partner") ? "partnerOrderId" : "orderId"]:
          order?.id,
        orderData: {
          statusId: 4,
          trackingNumber: isTruck
            ? order?.trackingNumber || ""
            : dispatchOrderData?.trackingNumber,
          shippingCompany: isTruck
            ? order?.shippingCompany || "Shipping By Truck"
            : dispatchOrderData?.shippingCompany,
        },
      });

      if (res?.data?.status === "success") {
        success_toaster("Order Shipped successfully");
        setModal({ type: "", status: false });
        setDispatchOrderData({ trackingNumber: "", shippingCompany: "" });
        setLoader("");
      } else {
        setLoader("");
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }

      const resDeliver = await PatchAPI("api/v1/admin/order-deliver", {
        [pathname.includes("/supplier/partner") ? "partnerOrderId" : "orderId"]:
          order?.id,
        orderData: {
          statusId: 5,
          orderStatus: order?.orderCurrentStatus,
        },
      });

      if (resDeliver?.data?.status === "success") {
        success_toaster("Order Delivered successfully");
        reFetch();
      } else {
        reFetch();
        throw new Error(
          resDeliver?.data?.message || "Failed to deliver order."
        );
      }
    } catch (error) {
      setLoader("");
      ErrorHandler(error);
      reFetch();
    }
  };

  const deliverTo = getDeliverTo(order);
  const cityLine = [deliverTo.town, deliverTo.state, deliverTo.zip]
    .filter((part) => String(part || "").trim())
    .join(" ");
  const items = Array.isArray(order?.items) ? order.items : [];
  const totalQty = items.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0);
  const showAction =
    Number(order?.statusId) === 2 || Number(order?.statusId) === 3;
  const statusLine = statusDateLine(order);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="text-xl font-inter font-semibold flex items-center gap-2 [&>p]:cursor-pointer">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <p onClick={() => window.history.back()}>Order </p>/ {displayId}{" "}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full text-white whitespace-nowrap ${
              order?.orderCurrentStatus?.includes("Cancelled")
                ? "bg-red-500 "
                : "bg-themeGreen "
            }`}
          >
            {order?.orderCurrentStatus}
          </span>
        </div>
      </div>

      <div className="space-y-8 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 justify-between">
          <div className="flex items-center gap-x-2 ml-auto sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium max-sm:[&>button]:text-sm">
            <button
              type="button"
              className={`bg-black text-white disabled:cursor-not-allowed ${
                showAction ? "block" : "hidden"
              }`}
              onClick={() => handleAssignSupplier(order?.statusId)}
            >
              {Number(order?.statusId) === 2
                ? "Acknowledge order"
                : Number(order?.statusId) === 3
                ? "Ship Order"
                : ""}
            </button>
          </div>
        </div>

        {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
          <MiniLoader />
        ) : (
          <div className="mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8 xl:gap-12">
            <div className="mx-auto lg:mx-0 w-full max-w-[560px] rounded-[16px] bg-white px-6 py-8 font-inter text-[#111] text-[15px] leading-6">
            {order?.note && (
              <div className="mb-6 bg-themeYellowDark text-black font-medium py-2 px-4 rounded-md">
                {order.note}
              </div>
            )}

            <p className="text-lg font-bold">Hi {greetingName},</p>
            <p className="mt-1 text-[15px] font-normal text-[#222]">
              Please ship the following order.
            </p>

            <h1 className="mt-6 text-[28px] leading-8 font-bold tracking-tight">
              Order #{displayId}
            </h1>

            <div className="mt-6">
              <h6 className="font-bold">Deliver To</h6>
              {deliverTo.locationName && <p>{deliverTo.locationName}</p>}
              {deliverTo.attention &&
                deliverTo.attention !== deliverTo.locationName && (
                  <p>{deliverTo.attention}</p>
                )}
              {deliverTo.street && <p>{deliverTo.street}</p>}
              {deliverTo.street2 && <p>{deliverTo.street2}</p>}
              {cityLine && <p>{cityLine}</p>}
              {deliverTo.country && <p>{deliverTo.country}</p>}
              {statusLine && <p className="mt-1">{statusLine}</p>}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-[14px] border-collapse">
                <thead>
                  <tr className="bg-[#ebebeb]">
                    <th className="text-left font-bold py-2 px-3">SKU</th>
                    <th className="text-left font-bold py-2 px-3">Item</th>
                    <th className="text-right font-bold py-2 px-3">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item?.id || `${itemSku(item)}-${index}`}>
                      <td className="py-2 px-3 align-top whitespace-nowrap">
                        {itemSku(item)}
                      </td>
                      <td className="py-2 px-3 align-top">{itemLabel(item)}</td>
                      <td className="py-2 px-3 align-top text-right">
                        {item?.qty ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-2 px-3 font-bold">Total</td>
                    <td className="py-2 px-3" />
                    <td className="py-2 px-3 font-bold text-right">{totalQty}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            </div>
            <SupplierOrderTimeline orderHistories={order?.orderHistories} />
          </div>
        )}

        <Dialog
          visible={modal?.type === "dispatchOrder" && modal?.status}
          style={{ width: "30vw" }}
          dismissableMask={true}
          className="font-nunito"
          onHide={() => {
            setModal({
              type: "",
              status: false,
            });
            setDispatchOrderData({
              trackingNumber: "",
              shippingCompany: "",
            });
          }}
          header={
            <div className="font-nunito font-bold text-2xl ">
              {isTruckCompany ? "Confirm Truck Shipment" : "Ship Order"}
            </div>
          }
        >
          {loader === "dispatchOrder" ? (
            <MiniLoader />
          ) : (
            <form onSubmit={handleShipSubmit} className="space-y-4">
              {isTruckCompany ? (
                <div className="space-y-3">
                  <p className="text-labelColor font-nunito font-medium text-lg">
                    Ship this order by{" "}
                    <span className="font-semibold">Truck</span>?
                  </p>
                  <p className="text-sm text-gray-600">
                    No tracking number is required for truck shipments.
                  </p>
                  <div className="text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Shipping Company:</span>{" "}
                      <span>
                        {order?.shippingCompany || "Shipping By Truck"}
                      </span>
                    </div>
                    {order?.totalWeight ? (
                      <div>
                        <span className="font-medium">Total Weight:</span>{" "}
                        <span>{order?.totalWeight} lbs</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Company Name
                    </label>
                    <Select
                      placeholder="Select dispatch order company"
                      className="w-full"
                      defaultValue={{ value: "UPS", label: "UPS" }}
                      styles={selectStyles2}
                      options={[{ value: "UPS", label: "UPS" }]}
                      onChange={(e) => {
                        setDispatchOrderData({
                          ...dispatchOrderData,
                          shippingCompany: e.value,
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      value={dispatchOrderData?.trackingNumber}
                      onChange={(e) =>
                        setDispatchOrderData({
                          ...dispatchOrderData,
                          trackingNumber: e.target.value,
                        })
                      }
                      placeholder="Enter Tracking number"
                      className="border border-borderColor text-labelColor placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                </div>
              )}
              <div className="text-end">
                <button
                  type="submit"
                  className="rounded-lg border border-theme text-white px-10 bg-theme font-nunito py-3 font-medium"
                >
                  {isTruckCompany ? "Confirm Ship" : "Ship Order"}
                </button>
              </div>
            </form>
          )}
        </Dialog>
      </div>
    </div>
  );
}
