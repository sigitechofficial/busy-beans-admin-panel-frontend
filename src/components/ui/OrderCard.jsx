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
  const router = useRouter();
  const [supplierID, setSupplierID] = useState("");
  const [loader, setLoader] = useState("");
  const [dispatchOrderData, setDispatchOrderData] = useState({
    trackingNumber: "",
    shippingCompany: "",
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
          console.log("🚀 ~ handleSubmit ~ res:", res);
          if (res?.data?.status === "success") {
            success_toaster("Supplier assign successfully");
            props?.reFetch();
            props?.setModal({
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
    } else if (props?.orderData?.statusId === 3) {
      try {
        if (!dispatchOrderData?.trackingNumber) {
          info_toaster("Enter Tracking number");
        } else if (!dispatchOrderData?.shippingCompany) {
          info_toaster("Select dispatching company");
        } else {
          setLoader("dispatchOrder");
          const res = await PatchAPI("api/v1/admin/order-dispatch", {
            orderId: props?.orderData?.id,
            orderData: {
              statusId: 4,
              trackingNumber: dispatchOrderData?.trackingNumber,
              shippingCompany: dispatchOrderData?.shippingCompany,
            },
          });
          console.log("🚀 ~ handleSubmit ~ res:", res);
          if (res?.data?.status === "success") {
            success_toaster("Order Dispatched successfully");
            props?.reFetch();
            props?.setModal({
              type: "",
              status: false,
            });
            setDispatchOrderData({
              trackingNumber: "",
              shippingCompany: "",
            });
            setLoader("");
          } else {
            setLoader("");
            throw new Error(
              res?.data?.message || "An unexpected error occurred."
            );
          }
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

  const datas = [];
  props?.orderData?.items?.map((item, i) => {
    datas.push({
      "#": i + 1,
      product: item?.product,
      qty: item?.qty,
      discount: item?.discount,
      price: `$${item?.price}`,
      total: "$" + item?.qty * item?.price,
    });
  });

  return (
    <div className="space-y-10 py-4 px-8 border border-borderColor shadow-tableShadow ">
      {/* Upper section */}
      <div className="space-y-4 font-inter">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="font-semibold text-3xl">
              Order# {props?.orderData?.id}
            </p>
            {/* <p className="text-black/40 text-sm">15-01-2025, 05:32</p> */}
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
            <button className="bg-themeGreen text-white rounded-lg py-2 px-4 font-medium">
              {props?.orderData?.orderCurrentStatus}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-lg underline">Order Information</p>
            <div className="space-y-1">
              <p className="flex">
                <span className="text-black/60 w-2/4">Payment Method:</span>
                <span className="font-medium ">
                  {props?.orderData?.paymentMethod}
                </span>
              </p>
              <p className="flex">
                <span className="text-black/60 w-2/4">Payment Status:</span>
                <button className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium outline-none">
                  {props?.orderData?.paymentStatus}
                </button>
              </p>
              {/* <p className="flex">
                <span className="text-black/60 w-2/4">
                  Expected Delivery Time:
                </span>
                <span className="font-medium">17-02-2025</span>
              </p> */}
              <p className="flex">
                <span className="text-black/60 w-2/4">Total Amount:</span>
                <span className="font-medium">
                  $ {props?.orderData?.totalBill}
                </span>
              </p>
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
      {/* Lower section */}
      <div>
        <MyDataTable
          data={datas}
          columns={columns}
          hide="hidden"
          search={false}
          pagination={true}
        />
        <div className="font-inter flex flex-col sm:items-end sm:[&>p]:w-2/4 [&>p]:flex [&>p]:justify-between pt-4 space-y-0.5">
          <p>
            <span className="font-bold">Items Price:</span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.itemsPrice}
            </span>
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
            <span className="font-bold">Total Weight:</span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.totalWeight}
            </span>
          </p>
          <p>
            <span className="font-bold">Sub Total:</span>{" "}
            <span className="font-semibold">${props?.orderData?.subTotal}</span>
          </p>
          <p>
            <span className="font-bold">Total:</span>{" "}
            <span className="font-semibold">
              ${props?.orderData?.totalBill}
            </span>
          </p>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={
          (props?.modal?.type === "assignSupplier" && props?.modal?.status) ||
          (props?.modal?.type === "dispatchOrder" && props?.modal?.status)
        }
        style={{ width: "30vw" }}
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
              : "Dispatch Order"}
          </div>
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
              <div className="space-y-2">
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
                    className="border border-borderColor text-secondary placeholder:text-secondary rounded-[4px] outline-none px-2.5 py-3"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-labelColor font-medium font-satoshi">
                    Description
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
                    styles={selectStyles2}
                    options={[{ value: "DHL", label: "DHL" }]}
                    onChange={(e) => {
                      setDispatchOrderData({
                        ...dispatchOrderData,
                        shippingCompany: e.value,
                      });
                    }}
                  />
                </div>
              </div>
            )}
            <div className="text-end">
              <button
                type="submit"
                // onClick={() => console.log("supplierID:- ", supplierID)}
                className="rounded-lg border border-theme text-white px-10 bg-theme font-nunito py-3 font-medium"
              >
                {props?.orderData?.statusId === 1 &&
                suppliersData?.data?.data?.length === 0
                  ? "Add Supplier"
                  : props?.orderData?.statusId === 1 &&
                    suppliersData?.data?.data?.length > 0
                  ? "Assign Supplier"
                  : "Dispatch Order"}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
