"use client";
export const dynamic = "force-dynamic";
import BackButton from "@/components/ui/BackButton";
import CusSupInformationCard from "@/components/ui/CusSupInformationCard";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import OrderCard from "@/components/ui/OrderCard";
import TrackOrder from "@/components/ui/TrackOrder";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster } from "@/utilities/Toaster";
import { useParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useState } from "react";
import Select from "react-select";

export default function OrderDetail() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const { orderID } = useParams();
  // const [chequeId, setChequeId] = useState("");
  const [modal, setModal] = useState({
    type: "", // addCheque , editCheque
    status: false,
  });

  const [loader, setLoader] = useState("");
  // const [addCheque, setAddCheque] = useState({
  //   chequeNumber: "",
  //   chequeDate: "",
  //   chequeStatus: {
  //     value: "",
  //     label: "",
  //   },
  //   bankName: "",
  //   bankBranch: "",
  //   chequeType: {
  //     value: "",
  //     label: "",
  //   },
  //   chequeReceiptDate: "",
  // });

  // const chequeStatusOptions = [
  //   { value: "Pending", label: "Pending" },
  //   { value: "Cleared", label: "Cleared" },
  //   { value: "Bounced", label: "Bounced" },
  // ];

  // const chequeTypeOptions = [
  //   { value: "personal check", label: "Personal check" },
  //   { value: "business check", label: "Business check" },
  //   { value: "cashier's check", label: "Cashier's check" },
  // ];

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

  const handleAssignSupplier = (statusId) => {
    // if (statusId === 1) {
    //   setModal({
    //     type: "assignSupplier",
    //     status: true,
    //   });
    // } else
    if (statusId === 2) {
      handleSupplierAcknowledgement();
    } else if (statusId === 3) {
      setModal({
        type: "dispatchOrder",
        status: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    // if (modal?.type === "addCheque" && modal.status) {
    //   setLoader("addCheque");
    //   try {
    //     const res = await PatchAPI("api/v1/admin/add-cheque", {
    //       orderId: orderID,
    //       orderData: {
    //         paymentMethod: "cheque",
    //       },
    //       cheque: {
    //         chequeNumber: addCheque?.chequeNumber,
    //         chequeDate: addCheque?.chequeDate,
    //         chequeStatus: addCheque?.chequeStatus?.value, // Pending, Cleared, Bounced
    //         bankName: addCheque?.bankName,
    //         bankBranch: addCheque?.bankBranch,
    //         chequeType: addCheque?.chequeType?.value, // personal check, business check, or cashier's check
    //         chequeReceiptDate: addCheque?.chequeReceiptDate,
    //       },
    //     });
    //     if (res?.data?.status === "success") {
    //       success_toaster("Cheque Added successfully");
    //       reFetch();
    //       setModal({
    //         type: "",
    //         status: false,
    //       });
    //       setLoader("");
    //     } else {
    //       setLoader("");
    //       throw new Error(
    //         res?.data?.message || "An unexpected error occurred."
    //       );
    //     }
    //   } catch (error) {
    //     setLoader("");
    //     ErrorHandler(error);
    //   }
    // } else if (modal?.type === "editCheque" && modal.status) {
    //   setLoader("editCheque");
    //   try {
    //     const res = await PatchAPI("api/v1/admin/edit-cheque", {
    //       chequeId: chequeId,
    //       cheque: {
    //         chequeNumber: addCheque?.chequeNumber,
    //         chequeDate: addCheque?.chequeDate,
    //         chequeStatus: addCheque?.chequeStatus?.value, // Pending, Cleared, Bounced
    //         bankName: addCheque?.bankName,
    //         bankBranch: addCheque?.bankBranch,
    //         chequeType: addCheque?.chequeType?.value, // personal check, business check, or cashier's check
    //         chequeReceiptDate: addCheque?.chequeReceiptDate,
    //       },
    //     });
    //     if (res?.data?.status === "success") {
    //       success_toaster("Cheque Updated successfully");
    //       reFetch();
    //       setChequeId("");
    //       setModal({
    //         type: "",
    //         status: false,
    //       });
    //       setLoader("");
    //     } else {
    //       setLoader("");
    //       throw new Error(
    //         res?.data?.message || "An unexpected error occurred."
    //       );
    //     }
    //   } catch (error) {
    //     setLoader("");
    //     ErrorHandler(error);
    //   }
    // } else {
    e.preventDefault();
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
    // }
  };

  // const handleAddChequeModel = () => {
  //   if (data?.data?.order?.chequeDetail) {
  //     setModal({
  //       type: "editCheque",
  //       status: true,
  //     });
  //     setChequeId(data?.data?.order?.chequeDetail?.id);
  //     setAddCheque({
  //       chequeNumber: data?.data?.order?.chequeDetail?.chequeNumber,
  //       chequeDate: data?.data?.order?.chequeDetail?.chequeDate,
  //       chequeStatus: {
  //         value: data?.data?.order?.chequeDetail?.chequeStatus,
  //         label: data?.data?.order?.chequeDetail?.chequeStatus,
  //       },
  //       bankName: data?.data?.order?.chequeDetail?.bankName,
  //       bankBranch: data?.data?.order?.chequeDetail?.bankBranch,
  //       chequeType: {
  //         value: data?.data?.order?.chequeDetail?.chequeType,
  //         label: data?.data?.order?.chequeDetail?.chequeType,
  //       },
  //       chequeReceiptDate: data?.data?.order?.chequeDetail?.chequeReceiptDate,
  //     });
  //   } else {
  //     setModal({
  //       type: "addCheque",
  //       status: true,
  //     });
  //   }
  // };

  // const handleChange = (e) => {
  //   setAddCheque({ ...addCheque, [e.target.name]: e.target.value });
  // };

  return data?.length ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold flex items-center gap-2">
          <div className="text-base">
            <BackButton />
          </div>
          Order / {orderID}{" "}
          <span
            className={` rounded-lg py-2 px-4 font-medium text-sm text-white ${
              data?.data?.order?.orderCurrentStatus?.includes("Cancelled")
                ? "bg-red-500 "
                : "bg-themeGreen "
            }`}
          >
            {data?.data?.order?.orderCurrentStatus}
          </span>
        </h2>

        {/* <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          <li>Invoice</li>
          <li>Quickbooks</li>
          <li>Schedule</li>
          <li>Bulk Modify</li>
          <li>Export</li>
        </ul> */}
      </div>
      <div className=" space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 justify-between">
          {/* <div className="flex items-center gap-x-2">
            <BackButton />
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Order Details
            </h2>
          </div> */}

          <div className="flex items-center gap-x-2 ml-auto sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium max-sm:[&>button]:text-sm">
            {/* <button
            onClick={handleAddChequeModel}
            className="bg-black text-white disabled:cursor-not-allowed"
          >
            {data?.data?.order?.chequeDetail ? "Edit Cheque" : "Add Cheque"}
          </button> */}

            {/* 
 ${
                data?.data?.order?.statusId === 2 ||
                data?.data?.order?.statusId === 3
                  ? "block"
                  : "hidden"
              } */}
            <button
              type="button"
              className={`bg-black text-white disabled:cursor-not-allowed 
               ${
                 data?.data?.order?.statusId === 2 ||
                 data?.data?.order?.statusId === 3
                   ? "block"
                   : "hidden"
               }
              `}
              onClick={() => handleAssignSupplier(data?.data?.order?.statusId)}
            >
              {data?.data?.order?.statusId === 2
                ? "Acknowledge order"
                : data?.data?.order?.statusId === 3
                ? "Ship Order" // dispatch order text replaced with ship order
                : ""}
            </button>
            {/* <button
            disabled={
              data?.data?.order?.statusId === 5 ||
              data?.data?.order?.statusId === 6
                ? true
                : false
            }
            className={`bg-black text-white disabled:cursor-not-allowed ${
              data?.data?.order?.statusId === 4 ? "block" : "hidden"
            }`}
            onClick={() => handleAssignSupplier(data?.data?.order?.statusId)}
          >
            Order Delivered
          </button> */}

            {/* <button
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
          </button> */}
            {/* <button className="border border-buttonBorderColor shadow-buttonShadow">
            Print Invoice
          </button> */}
          </div>
        </div>

        {loader === "acknowledgeSupplier" || loader === "orderDelivered" ? (
          <MiniLoader />
        ) : (
          <div className="mx-auto">
            {/* Left side */}
            {/* <div className="space-y-6">
            <CusSupInformationCard
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
            />
            {data?.data?.order?.statusId >= 2 && (
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
            )}
          </div> */}

            {/* Right side */}
            <div className="space-y-8 -order-last xl:-order-first">
              <TrackOrder
                orderHistories={data?.data?.order?.orderHistories}
                statusId={data?.data?.order?.statusId}
              />
              <OrderCard
                userType={userType}
                reFetch={reFetch}
                orderData={data?.data?.order}
                modal={modal}
                setModal={setModal}
              />
            </div>
          </div>
        )}

        <Dialog
          visible={
            modal?.type === "cancelOrder" && modal?.status
            // ||
            // (modal?.type === "addCheque" && modal?.status) ||
            // (modal?.type === "editCheque" && modal?.status)
          }
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
              {/* {modal?.type === "cancelOrder"
              ? "Cancel Order"
              : modal?.type === "addCheque"
              ? "Add Cheque"
              : "Edit Cheque"} */}
              Cancel Order
            </div>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            {/* {loader === "cancelOrder" || loader === "addCheque" ? ( */}
            {loader === "cancelOrder" ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                {/* {modal?.type === "cancelOrder" ? (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to cancel this Order ?
                </p>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={addCheque?.chequeNumber}
                      onChange={handleChange}
                      placeholder="Enter Cheque Number"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      name="chequeDate"
                      value={addCheque?.chequeDate}
                      onChange={handleChange}
                      placeholder="Select Cheque Date"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Cheque Status
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
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Bank Branch
                    </label>
                    <input
                      type="text"
                      name="bankBranch"
                      value={addCheque?.bankBranch}
                      onChange={handleChange}
                      placeholder="Enter Bank Branch"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Cheque Type
                    </label>
                
                    <Select
                      placeholder="Select Cheque Type"
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
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <label className="text-labelColor font-medium font-satoshi">
                      Cheque Receipt Date
                    </label>
                    <input
                      type="date"
                      name="chequeReceiptDate"
                      value={addCheque?.chequeReceiptDate}
                      onChange={handleChange}
                      placeholder="Enter Description"
                      className="border border-borderColor text-black placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                    />
                  </div>
                </div>
              )} */}
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  Are you sure you want to cancel this Order ?
                </p>

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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10 bg-theme"
                  >
                    {/* {modal?.type === "cancelOrder"
                    ? "Cancel Order"
                    : modal?.type === "addCheque"
                    ? "Add Cheque"
                    : "Update Cheque"} */}
                    Cancel Order
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
