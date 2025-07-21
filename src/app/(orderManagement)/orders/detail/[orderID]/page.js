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
import { selectStyles2 } from "@/utilities/SelectStyle";
import { success_toaster } from "@/utilities/Toaster";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import React, { useState } from "react";
import Select from "react-select";
import { CgNotes } from "react-icons/cg";
import { LuClipboardList } from "react-icons/lu";

export default function OrderDetail() {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  const { orderID } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [chequeId, setChequeId] = useState("");
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
        success_toaster("Order Dispatched successfully");
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
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
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
          orderId: orderID,
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

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div>
      <div className="w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold flex items-center gap-2">
          Order / {data?.data?.order?.id}{" "}
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

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer relative">
          <li onClick={()=>router.push(`${pathname}/add-invoice`)}>Add Invoice</li>
          <li>Edit Details</li>
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
          </li>
        </ul>
      </div>

      <div className="space-y-8 pb-6 pt-32 px-6 2xl:px-12">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 justify-end">
          {/* <div className="flex items-center gap-x-2">
            <BackButton />
            <h2 className="text-xl lg:text-2xl font-inter font-semibold">
              Order/{data?.data?.order?.id}
            </h2>

            <div className="bg-themeGreen text-white rounded-lg py-2 px-4 font-medium text-sm">
              {data?.data?.order?.orderCurrentStatus}
            </div>
          </div> */}

          <div className="flex items-center gap-x-2 sm:gap-x-4 [&>button]:py-2 sm:[&>button]:py-3 [&>button]:px-2 sm:[&>button]:px-5 [&>button]:rounded-lg [&>button]:font-nunito [&>button]:font-medium max-sm:[&>button]:text-sm">
            {/* <button
            type="button"
            onClick={handleAddChequeModel}
            className="bg-black text-white disabled:cursor-not-allowed"
          >
            {data?.data?.order?.chequeDetail
              ? "Edit Bank Check"
              : "Add Bank Check"}
          </button> */}
            {userType === "admin" ? (
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
                  ? "Assign Supplier"
                  : data?.data?.order?.statusId === 2
                  ? "Acknowledge Supplier"
                  : data?.data?.order?.statusId === 3
                  ? "Ship Order"
                  : "Dispatch Order"}
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  data?.data?.order?.statusId === 2 ||
                  data?.data?.order?.statusId === 3 ||
                  data?.data?.order?.statusId === 5 ||
                  data?.data?.order?.statusId === 6
                    ? true
                    : false
                }
                className={`${
                  data?.data?.order?.statusId === 2 ||
                  data?.data?.order?.statusId === 3 ||
                  data?.data?.order?.statusId === 4
                    ? "block"
                    : "hidden"
                } bg-black text-white disabled:cursor-not-allowed`}
                onClick={() => handleAssignSupplier(4)}
              >
                {/* {data?.data?.order?.statusId === 1
                ? "Assign Supplier"
                : data?.data?.order?.statusId === 2
                ? "Acknowledge Supplier"
                : ""} */}
                Dispatch Order
              </button> // dispatch Order basically rpelaced with status 4 which is delivered Order beacuse dispatch is done by supplier so here we use only text dispatch but inside it hit status code of 4
            )}

            <button
              type="button"
              disabled={data?.data?.order?.statusId === 6 ? true : false}
              className="bg-black text-white disabled:cursor-not-allowed"
              onClick={() => handleSendInvoice(data?.data?.order?.statusId)}
            >
              {data?.data?.order?.invoiceId
                ? "Invoice reminder"
                : "Send Invoice"}
            </button>

            {userType === "admin" && (
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
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={() => router.push(`${pathname}/invoice`)}
              type="button"
              className="border border-buttonBorderColor shadow-buttonShadow"
            >
              Edit Invoice
            </button>
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

              <div className="bg-blue-50 rounded-md w-full p-6 flex gap-x-2">
                <div >
                  <LuClipboardList size={25} />
                </div>
                <div className="space-y-4">
                  <p className="font-semibold">This order is fulfilled</p>
                  <p>Optional actions:</p>

                  <div className="flex gap-x-2 items-center">
                    <p className="font-semibold">Record a payment:</p>
                    {(userType === "admin" ||
                      userType === "salesRepresentative") && (
                      <div className="flex">
                        {/* <span className="text-black/60 w-2/4">Payment Status:</span> */}

                        {userType === "supplier" ||
                        (userType === "admin" &&
                          data?.data?.order?.paymentMethod === "card") ||
                        data?.data?.order?.statusId === 6 ? (
                          <div className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium outline-none">
                            {data?.data?.order?.paymentStatus === "done"
                              ? "Paid"
                              : "Unpaid"}
                          </div>
                        ) : (
                          <span className="w-40">
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

              <div className="w-full grid grid-cols-2 gap-20 py-4 px-8 space-y-4 font-inter border border-borderColor bg-white shadow-tableShadow rounded-sm">
                <div className="w-full [&>div]:h-10 text-sm">
                  {data?.data?.order?.on && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Ordered On </p>
                      <p>{data?.data?.order?.on}</p>
                    </div>
                  )}
                  {/* {data?.data?.order?.customerName && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Customer</p>
                      <p>{data?.data?.order?.customerName}</p>
                    </div>
                  )} */}
                  {data?.data?.order?.customerName && (
                    <div className="flex items-center gap-5 border-b capitalize">
                      <p className="w-28">Company Name</p>
                      <p>{data?.data?.order?.user?.companyName}</p>
                    </div>
                  )}
                  {data?.data?.order?.createdBy && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Created By</p>
                      <p>{data?.data?.order?.createdBy}</p>
                    </div>
                  )}
                  {data?.data?.order?.supplier?.supplierName && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Supplier</p>
                      <p>{data?.data?.order?.supplier?.supplierName}</p>
                    </div>
                  )}
                  {data?.data?.order?.salesRepName && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Local Partner</p>
                      <p>{data?.data?.order?.salesRepName}</p>
                    </div>
                  )}
                  {data?.data?.order?.poNumber && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">P.O. # </p>
                      <p>{data?.data?.order?.poNumber}</p>
                    </div>
                  )}
                  {data?.data?.order?.invoiceNumber && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Invoice No </p>
                      <p>{data?.data?.order?.invoiceNumber}</p>
                    </div>
                  )}
                  {data?.data?.order?.trackingNumber && (
                    <div className="flex items-center gap-5 border-b">
                      <p className="w-28">Tracking No: </p>
                      <p>{data?.data?.order?.trackingNumber}</p>
                    </div>
                  )}
                </div>
                {/* ================ */}
                <div className="w-full grid grid-cols-2 gap-10 text-sm">
                  <div>
                    <h6>Deliver To</h6>

                    <div className="flex gap-2 items-center">
                      <p>{data?.data?.order?.address?.companyaddress}</p>
                      <p>{data?.data?.order?.address?.addressLineOne}</p>
                      <p>{data?.data?.order?.address?.addressLineTwo}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <p>{data?.data?.order?.address?.town}</p>
                      <p>{data?.data?.order?.address?.state}</p>
                      <p>{data?.data?.order?.address?.zipCode}</p>
                    </div>

                    <p>{data?.data?.order?.address?.country}</p>
                    <p>Phone: {data?.data?.order?.address?.phoneNum}</p>
                    <span
                      onClick={() => router.push(`${pathname}/edit`)}
                      className="text-blue-500 text-xs cursor-pointer"
                    >
                      Edit
                    </span>
                  </div>
                  <div>
                    <h6>Invoice To</h6>
                    <div className="flex gap-2 items-center">
                      <p>{data?.data?.order?.user?.companyName}</p>
                      <p>{data?.data?.order?.user?.billingAddress}</p>
                      {/* <p>{data?.data?.order?.user?.addressLineTwo}</p> */}
                    </div>

                    <div className="flex gap-2 items-center">
                      <p>{data?.data?.order?.user?.town}</p>
                      <p>{data?.data?.order?.user?.state}</p>
                      <p>{data?.data?.order?.user?.zipCode}</p>
                    </div>

                    <p>{data?.data?.order?.user?.country}</p>
                    <p>
                      Phone: {data?.data?.order?.address?.countryCode}{" "}
                      {data?.data?.order?.address?.phoneNumber}
                    </p>
                    <span
                      onClick={() => router.push(`${pathname}/edit`)}
                      className="text-blue-500 text-xs cursor-pointer"
                    >
                      Edit
                    </span>
                  </div>
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
          visible={
            (modal?.type === "cancelOrder" && modal?.status) ||
            (modal?.type === "addCheque" && modal?.status) ||
            (modal?.type === "editCheque" && modal?.status)
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
              {modal?.type === "cancelOrder"
                ? "Cancel Order"
                : modal?.type === "addCheque"
                ? "Add Bank Check"
                : "Edit Bank Check"}
            </div>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            {loader === "cancelOrder" || loader === "addCheque" ? (
              <MiniLoader />
            ) : (
              <div className="w-full space-y-4">
                {modal?.type === "cancelOrder" ? (
                  <p className="text-labelColor font-nunito font-medium text-lg text-center">
                    Are you sure you want to cancel this Order ?
                  </p>
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
                        Bank Check Branch
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-theme text-white px-10 bg-theme"
                  >
                    {modal?.type === "cancelOrder"
                      ? "Cancel Order"
                      : modal?.type === "addCheque"
                      ? "Add Bank Check"
                      : "Update Bank Check"}
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
