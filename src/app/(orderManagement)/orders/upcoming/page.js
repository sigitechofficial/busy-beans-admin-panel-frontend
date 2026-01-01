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
import dayjs from "dayjs";
import { useDataContext } from "@/utilities/DataContext";
import { CiMenuBurger } from "react-icons/ci";
import { UPCOMING_ORDERS } from "../orders.testids";

export default function UpcomingOrders() {
  const router = useRouter();
  const [modal, setModal] = useState("");
  const [items, setItems] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Build API URL with pagination and search query parameters
  const baseUrl = "api/v1/admin/order-frequency/upcomming-orders";
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }
  const apiUrl = `${baseUrl}?${params.toString()}`;

  const { data, reFetch, isLoading } = GetAPI(apiUrl);

  const handleCancel = () => {
    setModal("");
    setItems([]);
  };

  const handleRebookOrder = async () => {
    if (selectedRows.length > 0) {
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
          throw new Error(
            res?.data?.message || "An unexpected error occurred."
          );
        }
      } catch (error) {
        ErrorHandler(error);
      }
    } else {
      info_toaster("No Order is selected");
    }
  };

  const columns = [
    // { field: "sl", header: "SL", sort: true },
    { field: "id", header: "#", sort: true },
    // { field: "customerName", header: "Customer" },
    { field: "companyName", header: "Company Name" },
    { field: "orderDate", header: "Order Date", sort: true },
    { field: "deliveredOn", header: "Deliver On" },
    // { field: "salesRepName", header: "Local Partner Name" },
    // { field: "subTotal", header: "Sub Total" },
    // { field: "discountPrice", header: "Discount Price" },
    // { field: "discountPercentage", header: "Discount Percentage" },
    // { field: "itemsPrice", header: "Items Price" },
    // { field: "vat", header: "Vat" },
    // { field: "totalWeight", header: "Total Weight" },
    // { field: "shippingCharges", header: "Shipping Charges" },
    // { field: "note", header: "Note" },
    // { field: "paymentMethod", header: "Payment Method" },
    // { field: "poNumber", header: "Po Number" },
    // { field: "orderFrequency", header: "Order Frequency" },

    // { field: "totalBill", header: "Total", sort: true },
    // { field: "paymentStatus", header: "Invoice", sort: true },
    // { field: "createdBy", header: "Created By" },
    // { field: "orderCurrentStatus", header: "Status" },
    // { field: "action", header: "Action" },
  ];

  const columnsItems = [
    { field: "sl", header: "SL", sort: true },
    { field: "product", header: "product", sort: true },
    { field: "price", header: "price", sort: true },
    { field: "qty", header: "qty", sort: true },
  ];

  const datas = [];
  const datasItems = [];
  
  // Handle both possible API response structures for pagination
  const ordersArray = Array.isArray(data?.data?.order)
    ? data?.data?.order
    : Array.isArray(data?.data?.data?.order)
    ? data?.data?.data?.order
    : Array.isArray(data?.data?.data)
    ? data?.data?.data
    : [];
  
  ordersArray?.map((detail, i) => {
    return datas.push({
      id: detail?.id,
      sl: i + 1,
      // customerName: detail?.customerName,
      companyName: detail?.companyName,
      email: detail?.email,
      orderDate: dayjs(detail?.orderDate).format("MM/DD/YYYY"),
      deliveredOn: detail?.nextOrderDate ? dayjs(detail?.nextOrderDate).format("MM/DD/YYYY") : "",
      orderFrequency: detail?.frequency,
      createdBy: detail?.createdBy,
      action: (
        <button
          className="border border-yellow-400 rounded-md p-2 text-yellow-400"
          onClick={() => {
            setItems(detail?.items);
            setModal("view");
          }}
          data-testid={UPCOMING_ORDERS.rowViewBtn(detail?.id)}
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
  const { toggle, setToggle } = useDataContext();
  
  return isLoading ? (
      <Loader />
    ) : (
    <>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
        data-testid={UPCOMING_ORDERS.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Upcoming Orders</h2>
        </div>

        <Select placeholder="Filters" className="w-40" styles={selectStyles} data-testid={UPCOMING_ORDERS.headerFilterSelect}/>
      </div>

      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12" data-testid={UPCOMING_ORDERS.root}>
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Upcoming Orders
          </h2>
          <Select
            placeholder="Filters"
            className="w-40"
            styles={selectStyles}
          />
        </div> */}

        <div className="flex justify-end">
          <button
            onClick={handleRebookOrder}
            className="rounded-lg font-inter font-medium text-white bg-theme hover:text-theme hover:bg-white border border-theme duration-150 px-5 py-3 sm:h-full"
            data-testid={UPCOMING_ORDERS.rebookBtn}
          >
            Rebook Order
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" data-testid={UPCOMING_ORDERS.statsGrid}>
          <ManagementTab
            title="Total Orders"
            desc={data?.pagination?.totalItems || data?.data?.pagination?.totalItems || data?.data?.order?.length || 0}
            data-testid={UPCOMING_ORDERS.totalOrdersCard}
          />
          {/* <ManagementTab title="New Orders" desc="5%" />
        <ManagementTab title="Pending Orders" desc="5000" />
        <ManagementTab title="In progress Orders" desc="5,000" />
        <ManagementTab title="Cancelled Orders" desc="5,000" /> */}
        </div>

        <div div data-testid={UPCOMING_ORDERS.tableWrapper}>
          <MyDataTable
            columns={columns}
            data={datas}
            placeholder={"Search by Order ID, User ID, Frequency"}
            pagination={true}
            serverPagination={{
              page: data?.pagination?.page || data?.data?.pagination?.page || page,
              limit: data?.pagination?.limit || data?.data?.pagination?.limit || limit,
              totalRecords: data?.pagination?.totalItems || data?.data?.pagination?.totalItems || 0,
              totalPages: data?.pagination?.totalPages || data?.data?.pagination?.totalPages,
              onPageChange: (newPage) => setPage(newPage),
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
            searchValue={searchQuery}
            onSearchChange={(searchValue) => {
              setSearchQuery(searchValue);
              setPage(1); // Reset to first page when search changes
            }}
            checkbox={true}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            search={true}
            data-testid={UPCOMING_ORDERS.table}
            rowTestId={(row) => `data-testid-${UPCOMING_ORDERS.row(row.id)}`}
          />
        </div>

        <Dialog
          visible={modal === "view"}
          style={{ width: "60vw" }}
          // breakpoints={{ "1496px": "40vw", "1024px": "70vw", "641px": "80vw" }}
          className="font-nunito"
          dismissableMask={true}
          onHide={handleCancel}
          header={
            <div className="font-nunito font-bold text-2xl text-center" data-testid={UPCOMING_ORDERS.itemsDialogHeader}>
              Item Details
            </div>
          }
        >
          <div className="space-y-4" data-testid={UPCOMING_ORDERS.itemsTableWrapper}>
            <MyDataTable
              columns={columnsItems}
              data={datasItems}
              placeholder={"Search ..."}
              pagination={true}
              hide={true}
              data-testid={UPCOMING_ORDERS.itemsTable}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-theme bg-theme text-white hover:bg-white hover:text-theme duration-150
                       shadow-buttonShadow px-6 font-nunito py-3 font-medium"
                data-testid={UPCOMING_ORDERS.itemsCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
}
