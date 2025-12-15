"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import Loader from "@/components/ui/Loader";
import BackButton from "@/components/ui/BackButton";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";
import dayjs from "dayjs";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";

export default function SubscriptionDetails() {
  const { subscriptionId } = useParams();
  const router = useRouter();
  const { toggle, setToggle } = useDataContext();
  const { data, isLoading, reFetch } = GetAPI(`api/v1/subscription/${subscriptionId}`);
  const subscription = data?.subscription || data?.data || {};

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const handleCancelClick = () => {
    setCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      const res = await PostAPI(`api/v1/subscription/${subscriptionId}/cancel`);
      if (res?.data?.success) {
        success_toaster("Subscription cancelled successfully");
        reFetch();
        setCancelModal(false);
      } else {
        error_toaster(res?.data?.error || "Failed to cancel");
      }
    } catch (err) {
      error_toaster("An error occurred");
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <BackButton />
          <h2 className="text-xl font-semibold">Subscription Details</h2>
        </div>
        {subscription?.status === 'active' && (
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Body */}
      <div className="space-y-6 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        {/* Subscription Status Card */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subscription Information</h3>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                subscription?.status === "active"
                  ? "bg-green-100 text-green-700"
                  : subscription?.status === "canceled"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {subscription?.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer Email</p>
              <p className="font-medium">{subscription?.customerEmail || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer Name</p>
              <p className="font-medium">{subscription?.userName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Subscription ID</p>
              <p className="font-medium font-mono text-sm">{subscription?.id || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Stripe Subscription ID</p>
              <p className="font-medium font-mono text-sm">{subscription?.stripeSubscriptionId || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Period Start</p>
              <p className="font-medium">
                {subscription?.currentPeriodStart
                  ? dayjs(subscription.currentPeriodStart).format("MMM DD, YYYY")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Period End</p>
              <p className="font-medium">
                {subscription?.currentPeriodEnd
                  ? dayjs(subscription.currentPeriodEnd).format("MMM DD, YYYY")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Subscription Days</p>
              <p className="font-medium">{subscription?.subscriptionDays || "-"} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Price</p>
              <p className="font-medium text-lg text-theme">${subscription?.totalPrice || "0.00"}/mo</p>
            </div>
          </div>
        </div>

        {/* Machine Information */}
        {subscription?.machine && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Machine Information</h3>
            <div className="flex gap-6">
              {subscription.machine.image && (
                <img
                  src={BASE_URL + subscription.machine.image}
                  alt={subscription.machine.name}
                  className="w-32 h-32 object-contain rounded-lg border"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2">{subscription.machine.name || "-"}</h4>
                <p className="text-gray-600 mb-2">{subscription.machine.type || "-"}</p>
                <p className="text-lg font-semibold text-theme">
                  ${subscription.machine.price || "0.00"}/{subscription.machine.pricePer || "mo"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        {subscription?.products && subscription.products.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <div className="space-y-3">
              {subscription.products.map((product, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{product.productName || product.name || "Product"}</p>
                      {(product.subscriptionProduct?.sku || product.sku) && (
                        <p className="text-sm text-gray-500">SKU: {product.subscriptionProduct?.sku || product.sku}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity: {product.subscriptionProduct?.quantity || product.quantity || 1} × ${product.subscriptionProduct?.unitPrice || product.unitPrice || product.price || "0.00"}
                      </p>
                    </div>
                    <p className="font-semibold text-theme">
                      ${product.subscriptionProduct?.totalPrice || product.totalPrice || (parseFloat(product.subscriptionProduct?.unitPrice || product.unitPrice || product.price || 0) * (parseInt(product.subscriptionProduct?.quantity || product.quantity || 1))).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {subscription?.productsTotal !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="font-semibold">Products Total</span>
                  <span className="font-bold text-lg">${parseFloat(subscription.productsTotal || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Addons Section */}
        {subscription?.addons && subscription.addons.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add-ons & Extra Items</h3>
            <div className="space-y-3">
              {subscription.addons.map((addon, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {addon.addonName || addon.name || "Item"}
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {addon.subscriptionAddon?.type === "addon" || addon.type === "addon" ? "Add-on" : "Extra"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Quantity: {addon.subscriptionAddon?.quantity || addon.quantity || 1} × ${addon.subscriptionAddon?.unitPrice || addon.unitPrice || addon.price || "0.00"}
                      </p>
                    </div>
                    <p className="font-semibold text-theme">
                      ${addon.subscriptionAddon?.totalPrice || addon.totalPrice || (parseFloat(addon.subscriptionAddon?.unitPrice || addon.unitPrice || addon.price || 0) * (parseInt(addon.subscriptionAddon?.quantity || addon.quantity || 1))).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {subscription?.addonsTotal !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="font-semibold">Add-ons Total</span>
                  <span className="font-bold text-lg">${parseFloat(subscription.addonsTotal || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method ID</p>
              <p className="font-medium font-mono text-sm">{subscription?.paymentMethodId || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Stripe Customer ID</p>
              <p className="font-medium font-mono text-sm">{subscription?.stripeCustomerId || "-"}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Monthly Amount</span>
            <span className="text-2xl font-bold text-theme">
              ${subscription?.totalAmount || subscription?.totalPrice || "0.00"}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <Dialog
        header="Cancel Subscription"
        visible={cancelModal}
        className="w-[90%] max-w-[500px] font-nunito"
        onHide={() => setCancelModal(false)}
      >
        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setCancelModal(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              No, Keep Subscription
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel Subscription"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
