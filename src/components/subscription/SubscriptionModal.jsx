import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js"; // Not used in this admin flow version
import AddonSelection from "./AddonSelection";
// import PaymentForm from "./PaymentForm"; // Not used in this admin flow version
import UserSelection from "./UserSelection";
import ProductSelection from "./ProductSelection";
import CardSelection from "./CardSelection";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { BASE_URL, stripePublishKey, stripePublishKeyTest } from "@/utilities/URL";

// TODO: Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe(stripePublishKey);

const STEPS = {
  USER_SELECT: 0,
  PRODUCT_SELECT: 1, // New step
  REVIEW: 2,
  ADDONS: 3,
  CHECKOUT: 4,
  SUCCESS: 5,
};

export default function SubscriptionModal({ visible, onHide, machine }) {
  const [step, setStep] = useState(STEPS.USER_SELECT);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]); // New state
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  useEffect(() => {
    if (visible) {
      setStep(STEPS.USER_SELECT);
      setSelectedAddons([]);
      setSelectedProducts([]); // Reset products
      setCustomerEmail("");
      setSelectedUser(null);
      setSelectedMethodId(null);
    }
  }, [visible]);

  // Fetch Add-ons
  const { data: addonData, isLoading: addonsLoading } = GetAPI(
    visible ? "api/v1/subscription/addons" : null
  );
  const addons = addonData?.addons ?? [];

  const handleAddonToggle = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleProductToggle = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const calculateTotal = () => {
    const machinePrice = parseFloat(machine?.price || 0);
    const addonsPrice = selectedAddons.reduce(
      (sum, a) => sum + parseFloat(a.price),
      0
    );
    const productsPrice = selectedProducts.reduce(
      (sum, p) => sum + parseFloat(p.price),
      0
    );
    return (machinePrice + addonsPrice + productsPrice).toFixed(2);
  };

  const handlePaymentSubmit = async (paymentMethodId) => {
    // Determine the payment method ID to use:
    // If Admin selected a saved card, use `selectedMethodId`.
    // If we were using PaymentForm (for new cards), it would pass `paymentMethodId`.

    // For this flow, we primarily expect `selectedMethodId` from the CardSelection step.
    const pmId = paymentMethodId || selectedMethodId;

    if (!pmId) {
      error_toaster("Please select a payment method.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerEmail: selectedUser?.email || customerEmail, // Use selected user's email
        paymentMethodId: pmId,
        machineId: machine.id,
        addonIds: selectedAddons.map((a) => a.id),
        productIds: selectedProducts.map((p) => p.id), // Add products
        userId: selectedUser?.value, // Pass user ID to associate subscription
      };

      const res = await PostAPI("api/v1/subscription/create", payload);

      if (res?.data?.success) {
        // const { clientSecret, status } = res.data; 
        // Logic for 3DS could be added here if needed

        setStep(STEPS.SUCCESS);
        success_toaster("Subscription created successfully!");
      } else {
        error_toaster(res?.data?.message || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      error_toaster("An error occurred during subscription.");
    } finally {
      setLoading(false);
    }
  };


  const renderContent = () => {
    switch (step) {
      case STEPS.USER_SELECT:
        return (
          <div className="space-y-6">
            <UserSelection
              selectedUser={selectedUser}
              onSelect={(opt) => {
                setSelectedUser({ ...opt });
                // opt contains label, value, email, etc.
              }}
            />
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={onHide} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button
                disabled={!selectedUser}
                onClick={() => setStep(STEPS.PRODUCT_SELECT)}
                className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Next: Select Products
              </button>
            </div>
          </div>
        );

      case STEPS.PRODUCT_SELECT:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Products</h3>
            <div className="bg-blue-50 p-2 rounded text-sm text-blue-800 mb-2">
              User: <strong>{selectedUser?.label}</strong>
            </div>

            {/* Import ProductSelection here */}
            <ProductSelection
              selectedProducts={selectedProducts}
              onToggle={handleProductToggle}
            />

            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <button onClick={() => setStep(STEPS.USER_SELECT)} className="text-gray-500 hover:underline">Back</button>
              <button
                // Optional: Allow proceeding without products? Assuming yes.
                onClick={() => setStep(STEPS.REVIEW)}
                className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                Next: Review
              </button>
            </div>
          </div>
        );

      case STEPS.REVIEW:
        return (
          <div className="space-y-4">
            <div className="flex gap-4 border p-4 rounded-lg bg-gray-50">
              <img
                src={BASE_URL + machine?.image}
                alt={machine.name}
                className="w-24 h-24 object-contain mix-blend-multiply"
              />
              <div>
                <h3 className="font-bold text-lg">{machine.name}</h3>
                <p className="text-gray-600">{machine.type}</p>
                <p className="font-semibold mt-1">
                  ${machine.price}/{machine.pricePer}
                </p>
              </div>
            </div>

            {/* Show selected products */}
            {selectedProducts.length > 0 && (
              <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2 text-sm border-b pb-1">Selected Products</h4>
                <ul className="space-y-2">
                  {selectedProducts.map(p => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span>${p.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-blue-50 text-blue-800 rounded text-sm">
              Subscribing for: <strong>{selectedUser?.label}</strong>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(STEPS.PRODUCT_SELECT)} className="text-gray-500 hover:underline">Back</button>
              <button
                onClick={() => setStep(STEPS.ADDONS)}
                className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                Next: Select Add-ons
              </button>
            </div>
          </div>
        );

      case STEPS.ADDONS:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recommended Add-ons</h3>
            {addonsLoading ? (
              <p>Loading add-ons...</p>
            ) : (
              <AddonSelection
                addons={addons}
                selectedAddons={selectedAddons}
                onToggle={handleAddonToggle}
              />
            )}

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <div className="text-lg">
                Subtotal: <span className="font-bold">${calculateTotal()}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(STEPS.REVIEW)} className="text-gray-500 hover:underline">Back</button>
                <button
                  onClick={() => setStep(STEPS.CHECKOUT)}
                  className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600"
                >
                  Next: Payment
                </button>
              </div>
            </div>
          </div>
        );

      case STEPS.CHECKOUT:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold border-b pb-2 mb-2">Order Summary</h4>
              <div className="flex justify-between">
                <span>{machine.name}</span>
                <span>${machine.price}</span>
              </div>
              {selectedProducts.map((p) => (
                <div key={p.id} className="flex justify-between text-sm text-gray-600">
                  <span>+ {p.name}</span>
                  <span>${p.price}</span>
                </div>
              ))}
              {selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm text-gray-600">
                  <span>+ {addon.addonName || addon.name}</span> {/* Handle inconsistencies if any */}
                  <span>${addon.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t pt-2 mt-2 text-lg">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>

            {/* Admin Payment Selection */}
            <CardSelection
              userId={selectedUser?.value}
              selectedMethodId={selectedMethodId}
              onSelect={setSelectedMethodId}
            />

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setStep(STEPS.ADDONS)} className="text-gray-500 hover:underline">Back</button>
              <button
                onClick={() => handlePaymentSubmit()}
                disabled={loading || !selectedMethodId}
                className="bg-theme text-white w-full max-w-[200px] py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed ml-auto"
              >
                {loading ? "Processing..." : `Pay $${calculateTotal()}`}
              </button>
            </div>
          </div>
        );

      case STEPS.SUCCESS:
        return (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-green-700">Success!</h3>
            <p className="text-gray-600">
              Subscription to <strong>{machine.name}</strong> has been successfully created for <strong>{selectedUser?.label}</strong>.
            </p>
            <button
              onClick={() => {
                onHide();
                // Optionally redirect to purchased list
                window.location.href = "/purchased";
              }}
              className="mt-6 bg-theme text-white px-8 py-3 rounded-lg hover:bg-orange-600"
            >
              Done
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      header="Subscribe to Plan"
      visible={visible}
      className="w-[90%] max-w-[600px] font-nunito"
      onHide={onHide}
    >
      {renderContent()}
    </Dialog>
  );
}
