"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { PostAPI } from "@/utilities/PostAPI";
import { BASE_URL } from "@/utilities/URL";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { Button } from "primereact/button";

export default function Page() {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    orderId: "",
    orderType: "",
    emailType: "",
  });

  const orderTypeOptions = [
    { label: "Local Partner", value: "local-partner" },
    { label: "Customer", value: "customer" },
  ];

  const emailTypeOptions = [
    { label: "Order Confirmation", value: "order-confirmation" },
    { label: "Order Dispatch", value: "order-dispatch" },
    { label: "Send Invoice", value: "invoice-sent" },
    { label: "Invoice Reminder", value: "invoice-reminder" },
    { label: "Paid Invoice", value: "paid-invoice" },
    // { label: "Order Ship Supplier", value: "order-ship-supplier" },
    { label: "Order Shipped", value: "order-shipped" },
  ];

  const reset = () => {
    setModal(false);
    setFormData({ orderId: "", orderType: "", emailType: "" });
  };

  const handleSubmit = async () => {
    if (!formData.orderId || !formData.orderType || !formData.emailType) {
      return error_toaster("Please fill all fields.");
    }

    setLoading(true);
    try {
      const res = await PostAPI(
        `${BASE_URL}api/v1/admin/order-management/email-helper`,
        formData
      );
      if (res?.data?.status) {
        success_toaster("Email sent successfully!");
        reset();
      } else {
        error_toaster(res?.data?.message || "Failed to send email.");
      }
    } catch (err) {
      console.error(err);
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      {" "}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Send Order Emails
      </h1>{" "}
      <p className="text-gray-600 max-w-xl text-center mb-6">
        Use this page to send emails related to orders. You can select the order
        type and email type, then send the email directly.{" "}
      </p>
      <button
        className="bg-theme px-6 py-4 text-white rounded-lg"
        onClick={() => setModal(true)}
      >
        Send Email
      </button>
      {/* PrimeReact Modal */}
      <Dialog
        visible={modal}
        className="font-nunito w-[90%] md:w-[600px]"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center ">Send Email</div>
        }
      >
        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-2">
              <label className="font-medium">Order ID*</label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) =>
                  setFormData({ ...formData, orderId: e.target.value })
                }
                placeholder="Enter Order ID"
                className="w-full h-[48px] border rounded-md px-3 outline-none text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Order Type*</label>
              <Dropdown
                value={formData.orderType}
                onChange={(e) =>
                  setFormData({ ...formData, orderType: e.value })
                }
                options={orderTypeOptions}
                placeholder="Select Order Type"
                className="w-full h-[48px] border rounded-md outline-none text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Email Type*</label>
              <Dropdown
                value={formData.emailType}
                onChange={(e) =>
                  setFormData({ ...formData, emailType: e.value })
                }
                options={emailTypeOptions}
                placeholder="Select Email Type"
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
                Send
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
