"use client";
import BackButton from "@/components/ui/BackButton";
import CusSupInformationCard from "@/components/ui/CusSupInformationCard";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import OrderCard from "@/components/ui/OrderCard";
import TrackOrder from "@/components/ui/TrackOrder";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { success_toaster } from "@/utilities/Toaster";
import { useParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useState } from "react";

export default function OrderDetail() {
  const { orderID } = useParams();
  const [modal, setModal] = useState({
    type: "",
    status: false,
  });
  const [loader, setLoader] = useState("");

  const { data, reFetch } = GetAPI(`api/v1/admin/order-details/${orderID}`);

  const handleSupplierAcknowledgement = async () => {
    setLoader("acknowledgeSupplier");
    try {
      const res = await PatchAPI("api/v1/admin/supplier-acknowledgement", {
        orderId: data?.data?.order?.id,
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
        orderId: data?.data?.order?.id,
        orderData: {
          statusId: 5,
          paymentStaus: "done",
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Order Delivered successfully");
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
    if (statusId === 1) {
      setModal({
        type: "assignSupplier",
        status: true,
      });
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

  const handleCancelOrder = () => {
    setModal({
      type: "cancelOrder",
      status: true,
    });
  };

  const cancelOrder = async () => {
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
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      setLoader("");
      ErrorHandler(error);
    }
  };

  return data?.length ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center space-y-2 justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Order Details
          </h2>
        </div>

        <div className="flex items-center gap-x-2 sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium max-sm:[&>button]:text-sm">
          <button
            disabled={
              data?.data?.order?.statusId === 5 ||
              data?.data?.order?.statusId === 6
                ? true
                : false
            }
            className="bg-black text-white disabled:cursor-not-allowed"
            onClick={() => handleAssignSupplier(data?.data?.order?.statusId)}
          >
            {data?.data?.order?.statusId === 1
              ? "Assign Supplier"
              : data?.data?.order?.statusId === 2
              ? "Acknowledge Supplier"
              : data?.data?.order?.statusId === 3
              ? "Dispatch Order"
              : "Order Delivered"}
          </button>
          <button
            disabled={
              data?.data?.order?.statusId === 5 ||
              data?.data?.order?.statusId === 6
                ? true
                : false
            }
            onClick={handleCancelOrder}
            className="bg-theme text-white disabled:cursor-not-allowed"
          >
            Cancel Order
          </button>
          <button className="border border-buttonBorderColor shadow-buttonShadow">
            Print Invoice
          </button>
        </div>
      </div>

      {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
        <MiniLoader />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-x-12">
          {/* Left side */}
          <div className="space-y-6">
            <CusSupInformationCard
              heading="Customer Information"
              name={data?.data?.order?.user?.name}
              email={data?.data?.order?.user?.email}
              phoneNo={data?.data?.order?.user?.phoneNumber}
              subHeading="Delivery Information"
              subHeadingData={{
                "Company Name": "Sigi Technologies",
                "Sale Tax": data?.data?.order?.user?.saleTaxNumber,
                Address: `
                  ${data?.data?.order?.address.companyaddress ?? ""}
                  ${data?.data?.order?.address.addressLineOne ?? ""}
                  ${data?.data?.order?.address.addressLineTwo ?? ""}
                    ${data?.data?.order?.address.town ?? ""}, ${
                  data?.data?.order?.address.state ?? ""
                } - ${data?.data?.order?.address.zipCode ?? ""}
                  ${data?.data?.order?.address.country ?? ""}`,
              }}
            />
            {data?.data?.order?.statusId >= 2 && (
              <CusSupInformationCard
                heading="Supplier Information"
                name={data?.data?.order?.supplier?.supplierName}
                email={data?.data?.order?.supplier?.email}
                phoneNo={data?.data?.order?.supplier?.phoneNum}
                subHeading="Supplier Information"
                subHeadingData={{
                  "Supplier Type": `${data?.data?.order?.supplier?.supplierType}`,
                  "Business Tax No": `${data?.data?.order?.supplier?.businessRegistrationNumber}`,
                  "Business Website": `${data?.data?.order?.supplier?.businessWeb}`,
                  Address: `
                ${data?.data?.order?.supplier.addressOne ?? ""}
                ${data?.data?.order?.supplier.addressTwo ?? ""}
                  ${data?.data?.order?.supplier.city ?? ""}, ${
                    data?.data?.order?.supplier.state ?? ""
                  } - ${data?.data?.order?.supplier.zipCode ?? ""}
                ${data?.data?.order?.supplier.country ?? ""}`,
                }}
              />
            )}
          </div>

          {/* Right side */}
          <div className="space-y-8 -order-last xl:-order-first">
            <TrackOrder
              orderHistories={data?.data?.order?.orderHistories}
              statusId={data?.data?.order?.statusId}
            />
            <OrderCard
              reFetch={reFetch}
              orderData={data?.data?.order}
              modal={modal}
              setModal={setModal}
            />
          </div>
        </div>
      )}

      <Dialog
        visible={modal?.type === "cancelOrder" && modal?.status}
        style={{ width: "40vw" }}
        className="font-nunito"
        onHide={() =>
          setModal({
            type: "",
            status: false,
          })
        }
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Cancel Order
          </div>
        }
      >
        <form
          onSubmit={cancelOrder}
          className="space-y-4 flex flex-col items-center"
        >
          {loader === "cancelOrder" ? (
            <MiniLoader />
          ) : (
            <div className="w-full space-y-4">
              {modal?.type === "cancelOrder" && (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to cancel this Order ?
                </p>
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
                  className="rounded-lg border border-black shadow-buttonShadow  px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-theme text-white px-10 bg-theme"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
