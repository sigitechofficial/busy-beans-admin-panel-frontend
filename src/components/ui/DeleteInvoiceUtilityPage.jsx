"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { PostAPI } from "@/utilities/PostAPI";
import { error_toaster, success_toaster } from "@/utilities/Toaster";
import ErrorHandler from "@/utilities/ErrorHandler";
import MiniLoader from "@/components/ui/MiniLoader";
import { getFeatureScope } from "@/utilities/subAdminNav";

export default function DeleteInvoiceUtilityPage() {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    orderType: "",
  });

  const orderScope = getFeatureScope("orders");
  const orderTypeOptions = [
    ...(orderScope.customer ? [{ label: "Customer", value: "customer" }] : []),
    ...(orderScope.partner ? [{ label: "Local Partner", value: "local-partner" }] : []),
  ];

  const reset = () => {
    setModal(false);
    setLoading(false);
    setFormData({
      orderId: "",
      orderType: "",
    });
  };

  const handleDeleteInvoice = async () => {
    if (!formData.orderId?.trim() || !formData.orderType) {
      error_toaster("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await PostAPI("api/v1/admin/order-management/delete-invoice", {
        id: formData.orderId.trim(),
        orderType: formData.orderType,
      });

      if (res?.data?.status === "success") {
        success_toaster(res?.data?.message || "Invoice deleted successfully.");
        reset();
      } else {
        throw new Error(res?.data?.message || "Failed to delete invoice.");
      }
    } catch (error) {
      ErrorHandler(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Delete Invoice</h1>
      <p className="text-gray-600 max-w-xl text-center mb-6">
        Use this page to delete an invoice by providing order ID and order type.
      </p>
      <button
        className="bg-theme px-6 py-4 text-white rounded-lg"
        onClick={() => setModal(true)}
      >
        Delete Invoice
      </button>

      <Dialog
        visible={modal}
        className="font-nunito w-[90%] md:w-[560px]"
        onHide={reset}
        dismissableMask={!loading}
        closable={!loading}
        header={
          <div className="font-bold text-2xl text-center">Delete Invoice</div>
        }
      >
        {loading ? (
          <div className="py-10">
            <MiniLoader />
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleDeleteInvoice();
            }}
          >
            <div className="space-y-2">
              <label className="font-medium">Order ID*</label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, orderId: e.target.value }))
                }
                placeholder="Enter Order ID"
                className="w-full h-[48px] border rounded-md px-3 outline-none text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">User Type*</label>
              <Dropdown
                value={formData.orderType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, orderType: e.value }))
                }
                options={orderTypeOptions}
                placeholder="Select User Type"
                className="w-full h-[48px] border rounded-md outline-none text-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={reset}
                className="border border-theme text-theme px-6 py-3 rounded-lg hover:bg-theme hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-theme text-white px-10 py-3 rounded-lg border border-theme hover:bg-white hover:text-theme"
              >
                Delete
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

