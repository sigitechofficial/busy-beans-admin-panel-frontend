import { FaEdit } from "react-icons/fa";
import MyDataTable from "./MyDataTable";
import { Dialog } from "primereact/dialog";
import AssignSupplierCard from "./AssignSupplierCard";
import GetAPI from "@/utilities/GetAPI";
import { useState } from "react";
import { info_toaster } from "@/utilities/Toaster";

export default function OrderCard(props) {
  const [supplierID, setSupplierID] = useState("");
  const { data: suppliersData } = GetAPI(
    "api/v1/admin/supplier/?sort=-createdAt"
  );

  const columns = [
    { field: "#", header: "#", sort: true, minWidth: "1rem" },
    { field: "product", header: "Product", minWidth: "12rem" },
    { field: "discount", header: "Discount", minWidth: "3rem" },
    { field: "price", header: "Price", minWidth: "3rem" },
  ];

  const datas = [];
  props?.orderData?.items?.map((item, i) => {
    datas.push({
      "#": i + 1,
      product: item?.product,
      discount: item?.discount,
      price: item?.price,
    });
  });
  // const datas = [
  //   {
  //     "#": "01",
  //     product: (
  //       <div className="flex items-center gap-x-2">
  //         <div className="rounded-lg bg-white shadow-tabShadow h-16 py-1 px-2">
  //           <img
  //             src="/images/stock1.png"
  //             alt="product-image"
  //             className="bg-contain w-full h-full"
  //           />
  //         </div>
  //         <div className="font-inter">
  //           <p className="text-lg font-medium text-black">Coffee</p>
  //           <p className="text-sm">3x $110</p>
  //         </div>
  //       </div>
  //     ),
  //     discount: <p className="font-inter font-medium text-black">$30.00</p>,
  //     price: <p className="font-inter font-medium text-black">$300.00</p>,
  //   },
  // ];

  return (
    <div className="space-y-10 py-4 px-8 border border-borderColor shadow-tableShadow ">
      {/* Upper section */}
      <div className="space-y-4 font-inter">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="font-semibold text-3xl">Order# 25896</p>
            <p className="text-black/40 text-sm">15-01-2025, 05:32</p>
            <p className="text-black">Tracking No: 1223522589962</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">Order Status</p>
            <button className="bg-themeGreen text-white rounded-lg py-2 px-4 font-medium">
              Confirmed
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
                <button className="bg-themeYellowLight text-black rounded-lg py-2 px-4 font-medium">
                  Pending
                </button>
              </p>
              <p className="flex">
                <span className="text-black/60 w-2/4">
                  Expected Delivery Time:
                </span>
                <span className="font-medium">17-02-2025</span>
              </p>
              <p className="flex">
                <span className="text-black/60 w-2/4">Total Amount:</span>
                <span className="font-medium">
                  $ {props?.orderData?.totalBill}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-themeYellowDark text-black font-medium py-2 px-4 rounded-md flex gap-x-4">
            <p>
             {props?.orderData?.note}
            </p>
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
        />
        <div className="font-inter flex flex-col sm:items-end sm:[&>p]:w-2/4 [&>p]:flex [&>p]:justify-between pt-4 space-y-0.5">
          <p>
            <span className="font-bold">Items Price:</span>{" "}
            <span className="font-semibold">${props?.orderData?.itemsPrice}</span>
          </p>
          <p>
            <span className="font-bold">Discount({props?.orderData?.discountPercentage}%):</span>{" "}
            <span className="font-semibold">${props?.orderData?.discountPrice}</span>
          </p>
          <p>
            <span className="font-bold">Vat/Tax:</span>{" "}
            <span className="font-semibold">${props?.orderData?.vat}</span>
          </p>
          <p>
            <span className="font-bold">Total Weight:</span>{" "}
            <span className="font-semibold">${props?.orderData?.totalWeight}</span>
          </p>
          <p>
            <span className="font-bold">Sub Total:</span>{" "}
            <span className="font-semibold">${props?.orderData?.subTotal}</span>
          </p>
          <p>
            <span className="font-bold">Total:</span>{" "}
            <span className="font-semibold">${props?.orderData?.totalBill}</span>
          </p>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={
          suppliersData?.data?.data?.length === 0
            ? info_toaster("No supplier found")
            : props?.modal?.type === "assignSupplier" && props?.modal?.status
        }
        style={{ width: "30vw" }}
        className="font-nunito"
        onHide={() => {
          props?.setModal({
            type: "",
            status: false,
          });
          setSupplierID("");
        }}
        header={
          <div className="font-nunito font-bold text-2xl ">Assign Supplier</div>
        }
      >
        <div className="space-y-4">
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
          <div className="text-end">
            <button
              // type="submit"
              onClick={() => console.log("supplierID:- ", supplierID)}
              className="rounded-lg border border-theme text-white px-10 bg-theme font-nunito py-3 font-medium"
            >
              Assign Supplier
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
