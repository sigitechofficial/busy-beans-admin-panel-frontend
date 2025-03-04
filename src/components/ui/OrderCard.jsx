import { FaEdit } from "react-icons/fa";
import MyDataTable from "./MyDataTable";
import { Dialog } from "primereact/dialog";
import AssignSupplierCard from "./AssignSupplierCard";

export default function OrderCard(props) {
  const columns = [
    { field: "#", header: "#", sort: true, minWidth: "1rem" },
    { field: "product", header: "Product", minWidth: "12rem" },
    { field: "discount", header: "Discount", minWidth: "3rem" },
    { field: "price", header: "Price", minWidth: "3rem" },
  ];

  const datas = [
    {
      "#": "01",
      product: (
        <div className="flex items-center gap-x-2">
          <div className="rounded-lg bg-white shadow-tabShadow h-16 py-1 px-2">
            <img
              src="/images/stock1.png"
              alt="product-image"
              className="bg-contain w-full h-full"
            />
          </div>
          <div className="font-inter">
            <p className="text-lg font-medium text-black">Coffee</p>
            <p className="text-sm">3x $110</p>
          </div>
        </div>
      ),
      discount: <p className="font-inter font-medium text-black">$30.00</p>,
      price: <p className="font-inter font-medium text-black">$300.00</p>,
    },
  ];

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
                <span className="font-medium ">Cheque</span>
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
                <span className="font-medium">$ 300.00</span>
              </p>
            </div>
          </div>
          <div className="bg-themeYellowDark text-black font-medium py-2 px-4 rounded-md flex gap-x-4">
            <p>
              Important note here regarding default 30 days but you also set
              enter a rendom date for cheque submittion in their records
            </p>
            <div>
              <FaEdit size={24} />
            </div>
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
            <span className="font-semibold">$330.00</span>
          </p>
          <p>
            <span className="font-bold">Discount:</span>{" "}
            <span className="font-semibold">$30.00</span>
          </p>
          <p>
            <span className="font-bold">Vat/Tax:</span>{" "}
            <span className="font-semibold">$0.00</span>
          </p>
          <p>
            <span className="font-bold">Total:</span>{" "}
            <span className="font-semibold">$300.00</span>
          </p>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={
          props?.modal?.type === "assignSupplier" && props?.modal?.status
        }
        style={{ width: "30vw" }}
        className="font-nunito"
        onHide={() =>
          props?.setModal({
            type: "",
            status: false,
          })
        }
        header={
          <div className="font-nunito font-bold text-2xl ">Assign Supplier</div>
        }
      >
        <div className="space-y-4">
          <AssignSupplierCard
            name="Ali Ali"
            email="Ahsanmunir753@gmail.com"
            phoneNo="+6362735238"
          />
          <AssignSupplierCard
            name="Ali Ali"
            email="Ahsanmunir753@gmail.com"
            phoneNo="+6362735238"
          />
          <AssignSupplierCard
            name="Ali Ali"
            email="Ahsanmunir753@gmail.com"
            phoneNo="+6362735238"
          />
          <AssignSupplierCard
            name="Ali Ali"
            email="Ahsanmunir753@gmail.com"
            phoneNo="+6362735238"
          />
        </div>
      </Dialog>
    </div>
  );
}
