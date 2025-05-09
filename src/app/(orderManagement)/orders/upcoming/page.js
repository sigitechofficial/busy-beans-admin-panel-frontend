"use client";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { FaEye } from "react-icons/fa";
import Select from "react-select";
import selectStyles from "@/utilities/SelectStyle";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import MiniLoader from "@/components/ui/MiniLoader";
import { PostAPI } from "@/utilities/PostAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { info_toaster, success_toaster } from "@/utilities/Toaster";

export default function UpcomingOrders() {
  const router = useRouter();
  const [modal, setModal] = useState("");
  const [items, setItems] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  console.log("🚀 ~ UpcomingOrders ~ selectedRows:", selectedRows);

  const { data, reFetch } = GetAPI(
    "api/v1/admin/order-frequency/upcomming-orders"
  );
  // console.log("🚀 ~ UpcomingOrders ~ data:", data?.data);

  const handleCancel = () => {
    setModal("");
    setItems([]);
  };

  const handleRebookOrder = async () => {
    if(selectedRows.length > 0){
      let orderIds = [];
      selectedRows.map((row) => orderIds.push(row?.id));
      try {
        const res = await PostAPI("api/v1/admin/order-frequency/book-orders", {
          ids: orderIds,
        });
        if (res?.data?.status === "success") {
          success_toaster("Order Rebook Successfully");
          orderIds = [];
          setSelectedRows([]);
          reFetch();
        } else {
          throw new Error(res?.data?.message || "An unexpected error occurred.");
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }else{
      info_toaster("No Order is selected")
    }
  };

  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "customerName", header: "Customer Name" },
    { field: "email", header: "Email" },
    { field: "orderDate", header: "Order Date" },
    { field: "nextOrderDate", header: "Next Order Date" },
    { field: "orderFrequency", header: "Order Frequency" },
    { field: "action", header: "Action" },
  ];

  const columnsItems = [
    { field: "sl", header: "SL", sort: true },
    { field: "product", header: "product", sort: true },
    { field: "price", header: "price", sort: true },
    { field: "qty", header: "qty", sort: true },
  ];

  const datas = [];
  const datasItems = [];
  data?.data?.order?.map((detail, i) => {
    return datas.push({
      id: detail?.id,
      sl: i + 1,
      customerName: detail?.customerName,
      email: detail?.email,
      orderDate: detail?.orderDate,
      nextOrderDate: detail?.nextOrderDate,
      orderFrequency: detail?.frequency,
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            setItems(detail?.items);
            setModal("view");
          }}
        >
          <FaEye size={24} />
        </button>
      ),
    });
  });

  items?.map((detail, i) => {
    return datasItems.push({
      sl: i + 1,
      product: detail?.product,
      price: detail?.price,
      qty: detail?.qty,
    });
  });

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-inter font-semibold">
          Upcoming Orders
        </h2>
        <Select placeholder="Filters" className="w-40" styles={selectStyles} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRebookOrder}
          className="rounded-lg font-inter font-medium text-white px-5 py-3 sm:h-full bg-theme"
        >
          Rebook Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ManagementTab title="Total Orders" desc={data?.data?.order?.length} />
        {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
      </div>

      <div>
        <MyDataTable
          columns={columns}
          data={datas}
          placeholder={"Search ..."}
          pagination={true}
          checkbox={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </div>

      <Dialog
        visible={modal === "view"}
        style={{ width: "60vw" }}
        // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
        className="font-nunito"
        onHide={handleCancel}
        header={
          <div className="font-nunito font-bold text-2xl text-center">
            Item Details
          </div>
        }
      >
        <div className="space-y-4">
          <MyDataTable
            columns={columnsItems}
            data={datasItems}
            placeholder={"Search ..."}
            pagination={true}
            hide={true}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                       shadow-buttonShadow px-6 font-nunito py-3 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
