import { FaEdit } from "react-icons/fa";
import MyDataTable from "./MyDataTable";
import { Dialog } from "primereact/dialog";
import AssignSupplierCard from "./AssignSupplierCard";
import GetAPI from "@/utilities/GetAPI";
import { useState } from "react";
import { info_toaster, success_toaster } from "@/utilities/Toaster";
import { PatchAPI } from "@/utilities/PatchAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import Select from "react-select";
import { selectStyles2 } from "@/utilities/SelectStyle";
import MiniLoader from "./MiniLoader";
import { useRouter } from "next/navigation";

export default function OrderCard(props) {
  if (typeof window !== "undefined") {
    var userType = localStorage.getItem("userType");
  }
  // console.log("🚀 ~ OrderCard ~ props:", props?.orderData);
  const router = useRouter();
  const [supplierID, setSupplierID] = useState("");
  const [loader, setLoader] = useState("");

  const wholeSalePrice = props?.orderData?.items?.reduce((a, b) => {
    return a + Number(b?.wholesalePrice);
  }, 0);

  const paymentStausOptions = [
    { value: "done", label: "Paid" },
    { value: "pending", label: "Unpaid" },
  ];

  const [dispatchOrderData, setDispatchOrderData] = useState({
    trackingNumber: "",
    shippingCompany: "UPS",
  });

  const { data: suppliersData } = GetAPI(
    "api/v1/admin/supplier/?sort=-createdAt"
  );

  const handleChange = (e) => {
    setDispatchOrderData({
      ...dispatchOrderData,
      [e.target.name]: e.target.value,
    });
  };
  
  const isTruckCompany = props?.orderData?.shippingCompany?.trim()?.toLowerCase()?.includes("truck") || false;

  const handlePaymentStatus = async (status) => {
    try {
      const res = await PatchAPI("api/v1/admin/edit-order", {
        orderId: props?.orderData?.id,
        orderData: {
          paymentStatus: status?.value, //"pending" , 'done'
        },
      });
      if (res?.data?.status === "success") {
        success_toaster("Status Updated successfully");
        props?.reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (props?.orderData?.statusId === 1) {
      if (suppliersData?.data?.data?.length === 0) {
        info_toaster("No supplier found. Add supplier");
        router.push("/suppliers");
      } else {
        setLoader("assignSupplier");
        try {
          const res = await PatchAPI("api/v1/admin/assign-supplier", {
            orderId: props?.orderData?.id,
            orderData: {
              supplierId: supplierID,
              statusId: 2,
            },
          });
          if (res?.data?.status === "success") {
            success_toaster("Supplier assign successfully");
            props?.reFetch();
            props?.setModal({ type: "", status: false });
            setLoader("");
          } else {
            setLoader("");
            throw new Error(res?.data?.message || "An unexpected error occurred.");
          }
        } catch (error) {
          setLoader("");
          ErrorHandler(error);
        }
      }
    } else if (props?.orderData?.statusId === 3) {
      try {
        const isTruck =
          props?.orderData?.shippingCompany?.trim()?.toLowerCase()?.includes("truck");

        // For non-truck flows, enforce dialog inputs
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
          orderId: props?.orderData?.id,
          orderData: {
            statusId: 4,
            trackingNumber: isTruck
              ? (props?.orderData?.trackingNumber || "")
              : dispatchOrderData?.trackingNumber,
            shippingCompany: isTruck
              ? (props?.orderData?.shippingCompany || "Shipping By Truck")
              : dispatchOrderData?.shippingCompany,
          },
        });

        if (res?.data?.status === "success") {
          success_toaster("Order Shipped successfully");
          props?.setModal({ type: "", status: false });
          setDispatchOrderData({ trackingNumber: "", shippingCompany: "" });
          setLoader("");
        } else {
          setLoader("");
          throw new Error(res?.data?.message || "An unexpected error occurred.");
        }

        // Deliver immediately
        const resDeliver = await PatchAPI("api/v1/admin/order-deliver", {
          orderId: props?.orderData?.id,
          orderData: {
            statusId: 5,
            orderStatus: props?.orderData?.orderCurrentStatus,
            paymentStaus: props?.orderData?.paymentStatus,
          },
        });

        if (resDeliver?.data?.status === "success") {
          success_toaster("Order Delivered successfully");
          props?.reFetch();
        } else {
          throw new Error(resDeliver?.data?.message || "Failed to deliver order.");
        }
      } catch (error) {
        setLoader("");
        ErrorHandler(error);
      }
    }
  };
  
  const columns = [
    { field: "#", header: "#", sort: true, minWidth: "1rem" },
    { field: "product", header: "Product", minWidth: "12rem" },
    { field: "qty", header: "Quantity", minWidth: "6rem" },
    { field: "price", header: "Price", minWidth: "6rem" },
    { field: "discount", header: "Discount", minWidth: "6rem" },
    { field: "total", header: "Total", minWidth: "6rem" },
  ];
  const supplierColumns = [
    { field: "#", header: "#", sort: true, minWidth: "1rem" },
    { field: "product", header: "Product", minWidth: "12rem" },
    { field: "qty", header: "Quantity", minWidth: "6rem" },
  ];

  const datas = [];
  props?.orderData?.items?.map((item, i) => {
    datas.push({
      "#": i + 1,
      product: item?.product,
      qty: item?.qty,
      discount: item?.discount,
      price: `$${item?.price / item?.qty}`,
      total: "$" + item?.price,
    });
  });

  return (
    <div className="space-y-10 py-4 px-4 2xl:px-8 border border-borderColor shadow-tableShadow ">
      {/* Upper section */}
      {props?.orderData?.note && (
        <div className="space-y-4 font-inter">
          {/* <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="font-semibold text-3xl">
              Order# {props?.orderData?.id}
            </p>
       
            <p
              className={`text-black ${
                props?.orderData?.statusId === 4 ? "block" : "hidden"
              }`}
            >
              Tracking No: {props?.orderData?.trackingNumber}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">Order Status</p>
            <div className="bg-themeGreen text-white rounded-lg py-2 px-4 font-medium">
              {props?.orderData?.orderCurrentStatus}
            </div>
          </div>

          {(userType === "admin" || userType === "salesRepresentative") && (
            <div className="flex">
              <span className="text-black/60 w-2/4">Payment Status:</span>

              {userType === "supplier" ||
              (userType === "admin" &&
                props?.orderData?.paymentMethod === "card") ||
              props?.orderData?.statusId === 6 ? (
                <div className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium outline-none">
                  {props?.orderData?.paymentStatus === "done"
                    ? "Paid"
                    : "Unpaid"}
                </div>
              ) : (
                <span className="w-40">
                  <Select
                    placeholder="Select Payment Status"
                    className="w-full"
                    value={
                      props?.orderData?.paymentStatus === "pending"
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
        </div> */}

          <div className="w-full space-y-4">
            <div className="w-full space-y-2">
              {/* <p className="font-semibold text-lg underline">Order Information</p> */}
              <div className="space-y-4 w-full">
                {/* <p className="flex">
                <span className="text-black/60 w-2/4">Payment Method:</span>
                <span className="font-medium uppercase">
                  {props?.orderData?.paymentMethod}
                </span>
              </p> */}
                {/* <div className="flex">
                <span className="text-black/60 w-2/4">Payment Status:</span>

                {userType === "supplier" ||
                (userType === "admin" &&
                  props?.orderData?.paymentMethod === "card") ||
                props?.orderData?.statusId === 6 ? (
                  <div className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium outline-none">
                    {props?.orderData?.paymentStatus === "done"
                      ? "Paid"
                      : "Unpaid"}
                  </div>
                ) : (
                  <span className="w-40">
                    <Select
                      placeholder="Select Payment Status"
                      className="w-full"
                      value={
                        props?.orderData?.paymentStatus === "pending"
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
              </div> */}
                {/* <p className="flex">
                <span className="text-black/60 w-2/4">
                  Expected Delivery Time:
                </span>
                <span className="font-medium">17-02-2025</span>
              </p> */}
                {/* <p
                className={`${
                  props?.userType === "supplier" ? "hidden" : "flex"
                }`}
              >
                <span className="text-black/60 w-2/4">Total Amount:</span>
                <span className="font-medium">
                  $ {props?.orderData?.totalBill}
                </span>
              </p> */}
              </div>
            </div>
            <div className="bg-themeYellowDark text-black font-medium py-2 px-4 rounded-md flex gap-x-4">
              <p>{props?.orderData?.note}</p>
              {/* <div>
              <FaEdit size={24} />
            </div> */}
            </div>
          </div>
        </div>
      )}
      {/* Lower section */}
      {/* <div>
        <MyDataTable
          data={datas}
          columns={props?.userType === "supplier" ? supplierColumns : columns}
          hide="hidden"
          search={false}
          pagination={true}
        />
        <div
          className={`${
            props?.userType === "supplier" ? "hidden" : "flex"
          } font-inter  flex-col sm:items-end sm:[&>p]:w-2/4 [&>p]:flex [&>p]:justify-between pt-4 space-y-0.5`}
        >
          <p>
            <span className="font-bold">Items Price:</span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.itemsPrice}
            </span>
          </p>
          <p>
            <span className="font-bold">Whole Sale Price:</span>{" "}
            <span className="font-semibold">${wholeSalePrice}</span>
          </p>
          <p>
            <span className="font-bold">
              Discount({props?.orderData?.discountPercentage}%):
            </span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.discountPrice}
            </span>
          </p>
          <p>
            <span className="font-bold">Vat/Tax:</span>{" "}
            <span className="font-semibold">${props?.orderData?.vat}</span>
          </p>

          <p>
            <span className="font-bold">Sub Total:</span>{" "}
            <span className="font-semibold">${props?.orderData?.subTotal}</span>
          </p>
          <p>
            <span className="font-bold">Shipping Charges:</span>{" "}
            <span className="font-semibold">${props?.orderData?.shippingCharges}</span>
          </p>
          <p>
            <span className="font-bold">Total:</span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.totalBill}
            </span>
          </p>
        </div>
      </div> */}

      <div className="w-full overflow-auto">
        <table className="w-full border border-gray-200 text-sm border-collapse min-w-[750px]">
          <thead className="bg-gray-100">
            <tr>
              {userType !== "supplier" && (
                <th className="py-2 px-2 text-left border border-gray-200">
                  Code
                </th>
              )}
              <th className="py-2 px-2 text-left border border-gray-200">
                SKU
              </th>
              <th className="py-2 px-2 text-left border border-gray-200">
                Name
              </th>
              <th className="py-2 px-2 text-left border border-gray-200">
                Grind
              </th>
              <th className="py-2 px-2 text-center border border-gray-200">
                Qty.
              </th>
              {userType !== "supplier" && (
                <>
                  <th className="py-2 px-2 text-center border border-gray-200">Discount</th>
                  <th className="py-2 px-2 text-center border border-gray-200">Invoiced</th>
                </>
              )}
              <th className="py-2 px-2 text-center border border-gray-200">
                Paid
              </th>
              <th className="py-2 px-2 text-center border border-gray-200">
                Dispatched
              </th>
              {(userType === "admin" || userType === "salesRepresentative") && (
                <th className="py-2 px-2 text-right border border-gray-200">
                  Unit $
                </th>
              )}
              {(userType === "admin" || userType === "salesRepresentative") && (
                <th className="py-2 px-2 text-right border border-gray-200">
                  Total $
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Coffee Beans Group */}

            {props?.orderData?.items?.map((item) => {
              return (
                <>
                  {/* <tr>
                    <td
                      colSpan={8}
                      className="font-semibold bg-gray-50 border border-gray-200"
                    >
                      category name
                    </td>
                  </tr> */}
                  <tr>
                    {userType !== "supplier" && (
                      <td className="py-2 px-2 border border-gray-200">
                        {item?.productCode ?? item?.code ?? ""}
                      </td>
                    )}
                    <td className="py-2 px-2 border border-gray-200">
                      {item?.supplierSku}
                    </td>
                    <td className="py-2 px-2 font-semibold border border-gray-200">
                      {item?.product ?? item?.productName ?? item?.name ?? ""}
                    </td>
                    <td className="py-2 px-2 border border-gray-200">
                      {item?.grind}
                    </td>

                    <td className="py-2 px-2 text-center border border-gray-200">
                      {item?.qty}
                    </td>
                    {userType !== "supplier" && (
                      <>
                        <td className="py-2 px-2 text-center border border-gray-200">
                          {item?.discount}
                        </td>
                        <td className="py-2 px-2 text-center border border-gray-200">
                          {props?.orderData?.invoicePdf ? "Yes" : "Not Yet"}
                        </td>
                      </>
                    )}
                    <td className="py-2 px-2 text-center border border-gray-200">
                      {props?.orderData?.paymentStatus === "pending"
                        ? "Unpaid"
                        : "Paid"}
                    </td>
                    <td className="py-2 px-2 text-center border border-gray-200">
                      {props?.orderData?.statusId >= "2" ? "Yes" : "Not Yet"}
                    </td>
                    {(userType === "admin" ||
                      userType === "salesRepresentative") && (
                      <td className="py-2 px-2 text-right border border-gray-200">
                        {parseFloat(item?.price / item?.qty).toFixed(2)}
                      </td>
                    )}
                    {(userType === "admin" ||
                      userType === "salesRepresentative") && (
                      <td className="py-2 px-2 text-right border border-gray-200">
                        {parseFloat(item?.price).toFixed(2)}
                      </td>
                    )}
                  </tr>
                </>
              );
            })}

            {/* Subtotal Row */}
            {(userType === "admin" || userType === "salesRepresentative") && (
              <tr>
                <td colSpan={userType !== "supplier" ? 9 : 7} className="border border-gray-200"></td>
                <td className="py-2 px-2 text-right font-semibold border border-gray-200">
                  Sub-Total
                </td>
                <td className="py-2 px-2 text-right font-semibold border border-gray-200">
                  {parseFloat(props?.orderData?.subTotal || 0).toFixed(2)}
                </td>
              </tr>
            )}
            {/* Shipping Row */}
            {(userType === "admin" || userType === "salesRepresentative") && (
              <tr>
                <td colSpan={userType !== "supplier" ? 9 : 7} className="border border-gray-200"></td>
                <td className="py-2 px-2 text-right border border-gray-200">
                  Shipping Charges
                </td>
                <td className="py-2 px-2 text-right border border-gray-200">
                  {parseFloat(props?.orderData?.shippingCharges || 0).toFixed(2)}
                </td>
              </tr>
            )}
            {/* Total Row */}
            {(userType === "admin" || userType === "salesRepresentative") && (
              <tr>
                <td colSpan={userType !== "supplier" ? 9 : 7} className="border border-gray-200"></td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  Total USD ({props?.orderData?.items?.length} items)
                </td>
                <td className="py-2 px-2 text-right font-bold border border-gray-200">
                  {parseFloat(props?.orderData?.totalBill || 0).toFixed(2)}
                </td>
              </tr>
            )}
            {/* Total Weight Row */}
            <tr>
              <td
                colSpan={8}
                className="py-2 px-2 text-left font-medium border border-gray-200"
              >
                Total weight: {props?.orderData?.totalWeight} lbs
              </td>
            </tr>
            {(userType === "admin" || userType === "salesRepresentative") && (
              <tr>
                <td
                  colSpan={8}
                  className="py-2 px-2 text-left font-medium border border-gray-200"
                >
                  Payment Method:{" "}
                  <span className="uppercase">
                    {" "}
                    {props?.orderData?.paymentMethod}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      <Dialog
        visible={
          // (props?.modal?.type === "assignSupplier" && props?.modal?.status) ||
          props?.modal?.type === "dispatchOrder" && props?.modal?.status
        }
        style={{ width: "30vw" }}
        dismissableMask={true}
        className="font-nunito"
        onHide={() => {
          props?.setModal({
            type: "",
            status: false,
          });
          setDispatchOrderData({
            trackingNumber: "",
            shippingCompany: "",
          });
          setSupplierID("");
        }}
        header={
          <div className="font-nunito font-bold text-2xl ">
            {props?.orderData?.statusId === 1
              ? "Assign Supplier"
              : isTruckCompany
              ? "Confirm Truck Shipment"
              : "Ship Order"}
          </div>
          // <div className="font-nunito font-bold text-2xl ">
          //   {props?.orderData?.statusId === 1
          //     ? "Assign Supplier"
          //     : "Dispatch Order"}
          // </div>
        }
      >
        {loader === "assignSupplier" || loader === "dispatchOrder" ? (
          <MiniLoader />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {props?.orderData?.statusId === 1 ? (
              suppliersData?.data?.data?.length === 0 ? (
                <p className="text-labelColor font-nunito font-medium text-lg text-center">
                  No Supplier Found
                </p>
              ) : (
                <div className="space-y-4">
                  {suppliersData?.data?.data?.map((supplier, i) => (
                    <AssignSupplierCard
                      id={supplier?.id}
                      setSupplierID={setSupplierID}
                      checked={
                        i === 0 && !supplierID
                          ? setSupplierID(supplier?.id)
                          : supplier?.id === supplierID
                          ? true
                          : false
                      }
                      name={supplier?.supplierName}
                      email={supplier?.email}
                      phoneNo={supplier?.phoneNum}
                      image={supplier?.image}
                    />
                  ))}
                </div>
              )
            ) : (
                isTruckCompany ? (
                  // Truck confirmation view (no fields required)
                  <div className="space-y-3">
                    <p className="text-labelColor font-nunito font-medium text-lg">
                      Ship this order by <span className="font-semibold">Truck</span>?
                    </p>
                    <p className="text-sm text-gray-600">
                      No tracking number is required for truck shipments.
                    </p>
                    <div className="text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Shipping Company:</span>{" "}
                        <span>{props?.orderData?.shippingCompany || "Shipping By Truck"}</span>
                      </div>
                      {props?.orderData?.totalWeight ? (
                        <div>
                          <span className="font-medium">Total Weight:</span>{" "}
                          <span>{props?.orderData?.totalWeight} lbs</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  // ✉️ Non-truck flow: show existing form
                  <div className="space-y-2">
                    <div className="flex flex-col gap-y-2">
                      <label className="text-labelColor font-medium font-satoshi">
                        Company Name
                      </label>
                      {/* <input
                      type="text"
                      name="shippingCompany"
                      value={dispatchOrderData}
                      onChange={handleChange}
                      placeholder="Enter Description"
                      className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      /> */}
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
                        onChange={handleChange}
                        placeholder="Enter Tracking number"
                        className="border border-borderColor text-labelColor placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                      />
                    </div>
                  </div>
                )
              )}
            <div className="text-end">
              <button
                type="submit"
                className="rounded-lg border border-theme text-white px-10 bg-theme font-nunito py-3 font-medium"
              >
                {props?.orderData?.statusId === 1 &&
                suppliersData?.data?.data?.length === 0
                  ? "Add Supplier"
                  : props?.orderData?.statusId === 1 &&
                    suppliersData?.data?.data?.length > 0
                  ? "Assign Supplier"
                  : isTruckCompany
                  ? "Confirm Ship"
                  : "Ship Order"}
                {/* {props?.orderData?.statusId === 1 &&
                suppliersData?.data?.data?.length === 0
                  ? "Add Supplier"
                  : props?.orderData?.statusId === 1 &&
                    suppliersData?.data?.data?.length > 0
                  ? "Assign Supplier"
                  : "Dispatch Order"} */}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
