import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import AddonSelection from "./AddonSelection";
import UserSelection from "./UserSelection";
import ProductSelection from "./ProductSelection";
import CardSelection from "./CardSelection";
import ExtraItemsStep from "./ExtraItemsStep";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { success_toaster, error_toaster } from "@/utilities/Toaster";
import { BASE_URL } from "@/utilities/URL";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";

const STEPS = {
  USER_SELECT: 0,
  PRODUCT_SELECT: 1,
  ADDONS: 2,
  EXTRA_ITEMS: 3,
  REVIEW: 4,
  CHECKOUT: 5,
  SUCCESS: 6,
};

export default function SubscriptionModal({ visible, onHide, machine }) {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.USER_SELECT);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [subscriptionDays, setSubscriptionDays] = useState(30);
  const [extraItems, setExtraItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [stripeCustomerId, setStripeCustomerId] = useState(null);

  useEffect(() => {
    if (visible) {
      setStep(STEPS.USER_SELECT);
      setSelectedAddons([]);
      setSelectedProducts([]);
      setSelectedUser(null);
      setSelectedMethodId(null);
      setSubscriptionDays(30);
      setExtraItems([]);
      setStripeCustomerId(null);
    }
  }, [visible]);

  // Fetch Add-ons
  const { data: addonData, isLoading: addonsLoading } = GetAPI(
    visible ? "api/v1/subscription/addons" : null
  );
  const addons = addonData?.addons ?? [];

  // Fetch payment cards to get stripeCustomerId (same API as CardSelection uses)
  const { data: paymentCardsData } = GetAPI(
    visible && selectedUser?.value ? `api/v1/admin/customer-management/payment-cards/${selectedUser.value}` : null
  );

  // Extract cards array from API response
  const cards = paymentCardsData?.data?.cards || paymentCardsData?.cards || paymentCardsData?.data?.data?.cards || [];

  // Extract stripeCustomerId from the selected card
  useEffect(() => {
    if (selectedMethodId && cards.length > 0) {
      const selectedCard = cards.find(card => card.id === selectedMethodId);
      if (selectedCard?.stripeCustomerId) {
        setStripeCustomerId(selectedCard.stripeCustomerId);
      }
    } else {
      setStripeCustomerId(null);
    }
  }, [selectedMethodId, cards]);

  // Product Handlers
  const handleProductToggle = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          customPrice: product.price,
        },
      ]);
    }
  };

  const handleProductQuantityChange = (productId, newQuantity) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity: Math.max(1, newQuantity) } : p
      )
    );
  };

  const handleProductPriceChange = (productId, newPrice) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, customPrice: Math.max(0, newPrice) } : p
      )
    );
  };

  // Addon Handlers
  const handleAddonToggle = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([
        ...selectedAddons,
        {
          ...addon,
          quantity: 1,
          customPrice: addon.price,
        },
      ]);
    }
  };

  const handleAddonQuantityChange = (addonId, newQuantity) => {
    setSelectedAddons(
      selectedAddons.map((a) =>
        a.id === addonId ? { ...a, quantity: Math.max(1, newQuantity) } : a
      )
    );
  };

  const handleAddonPriceChange = (addonId, newPrice) => {
    setSelectedAddons(
      selectedAddons.map((a) =>
        a.id === addonId ? { ...a, customPrice: Math.max(0, newPrice) } : a
      )
    );
  };

  // Extra Items Handlers
  const handleAddExtraItem = (item) => {
    setExtraItems([...extraItems, item]);
  };

  const handleRemoveExtraItem = (itemId) => {
    setExtraItems(extraItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateExtraItem = (itemId, field, value) => {
    setExtraItems(
      extraItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Review Step Handlers (can edit from review)
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleRemoveAddon = (addonId) => {
    setSelectedAddons(selectedAddons.filter((a) => a.id !== addonId));
  };

  // Calculate Totals
  const calculateTotal = () => {
    const machinePrice = parseFloat(machine?.price || 0);
    
    const productsPrice = selectedProducts.reduce(
      (sum, p) => sum + (parseFloat(p.customPrice || p.price) * (p.quantity || 1)),
      0
    );
    
    const addonsPrice = selectedAddons.reduce(
      (sum, a) => sum + (parseFloat(a.customPrice || a.price) * (a.quantity || 1)),
      0
    );
    
    const extraItemsPrice = extraItems.reduce(
      (sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)),
      0
    );

    return (machinePrice + productsPrice + addonsPrice + extraItemsPrice).toFixed(2);
  };

  // Handle Add New User Navigation
  const handleAddNewUser = () => {
    // Store current modal state in sessionStorage
    sessionStorage.setItem('subscriptionModalState', JSON.stringify({
      machineId: machine?.id,
      step: step
    }));
    router.push("/customers/add?returnTo=subscription");
  };

  // Payment Submit
  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      // Prepare detailed payload with quantities and prices
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.id,
        sku: p.sku || "",
        quantity: p.quantity || 1,
        unitPrice: parseFloat(p.customPrice !== undefined ? p.customPrice : p.price),
        totalPrice: parseFloat(p.customPrice !== undefined ? p.customPrice : p.price) * (p.quantity || 1),
      }));

      // Calculate products total
      const productsTotal = productsPayload.reduce((sum, p) => sum + p.totalPrice, 0);

      // Prepare addons with type: "addon"
      const addonsPayload = selectedAddons.map((a) => ({
        addonId: a.id,
        type: "addon",
        quantity: a.quantity || 1,
        unitPrice: parseFloat(a.customPrice !== undefined ? a.customPrice : a.price),
        totalPrice: parseFloat(a.customPrice !== undefined ? a.customPrice : a.price) * (a.quantity || 1),
      }));

      // Prepare extra items with type: "extra" and add them to addons array
      const extraItemsPayload = extraItems.map((item) => ({
        name: item.name,
        type: "extra",
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.price || 0),
        totalPrice: parseFloat(item.price || 0) * (item.quantity || 1),
      }));

      // Combine addons and extra items into single addons array
      const combinedAddons = [...addonsPayload, ...extraItemsPayload];

      // Calculate addons total (includes both addons and extra items)
      const addonsTotal = combinedAddons.reduce((sum, item) => sum + item.totalPrice, 0);

      const payload = {
        customerEmail: selectedUser?.email,
        userName: selectedUser?.name || selectedUser?.label || "",
        paymentMethodId: selectedMethodId,
        stripeCustomerId: stripeCustomerId || "",
        machineId: machine.id,
        machineName: machine.name || "",
        machinePrice: parseFloat(machine.price || 0),
        userId: selectedUser?.value || selectedUser?.id,
        subscriptionDays: subscriptionDays,
        products: productsPayload,
        productsTotal: productsTotal,
        addons: combinedAddons,
        addonsTotal: addonsTotal,
        totalAmount: parseFloat(calculateTotal()),
      };

      const res = await PostAPI("api/v1/subscription/create", payload);

      if (res?.data?.success) {
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
              }}
              onAddNewUser={handleAddNewUser}
            />
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onHide}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
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
              User: <strong>{selectedUser?.label || selectedUser?.name}</strong>
            </div>

            <ProductSelection
              selectedProducts={selectedProducts}
              onToggle={handleProductToggle}
              onQuantityChange={handleProductQuantityChange}
              onPriceChange={handleProductPriceChange}
            />

            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <button
                onClick={() => setStep(STEPS.USER_SELECT)}
                className="text-gray-500 hover:underline"
              >
                Back
              </button>
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
                onQuantityChange={handleAddonQuantityChange}
                onPriceChange={handleAddonPriceChange}
              />
            )}

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <div className="text-lg">
                Subtotal: <span className="font-bold">${calculateTotal()}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(STEPS.PRODUCT_SELECT)}
                  className="text-gray-500 hover:underline"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(STEPS.EXTRA_ITEMS)}
                  className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600"
                >
                  Next: Extra Items
                </button>
              </div>
            </div>
          </div>
        );

      case STEPS.EXTRA_ITEMS:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Items</h3>
            <ExtraItemsStep
              subscriptionDays={subscriptionDays}
              onDaysChange={setSubscriptionDays}
              extraItems={extraItems}
              onAddExtraItem={handleAddExtraItem}
              onRemoveExtraItem={handleRemoveExtraItem}
              onUpdateExtraItem={handleUpdateExtraItem}
            />

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <button
                onClick={() => setStep(STEPS.ADDONS)}
                className="text-gray-500 hover:underline"
              >
                Back
              </button>
              <button
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
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <h3 className="font-semibold text-lg">Review & Confirm</h3>

            {/* Machine */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 text-sm border-b pb-2">Machine</h4>
              <div className="flex gap-4 items-center">
                <img
                  src={BASE_URL + machine?.image}
                  alt={machine?.name}
                  className="w-20 h-20 object-contain mix-blend-multiply"
                />
                <div className="flex-1">
                  <h5 className="font-semibold">{machine?.name}</h5>
                  <p className="text-sm text-gray-600">{machine?.type}</p>
                  <p className="font-semibold mt-1 text-theme">
                    ${machine?.price}/{machine?.pricePer}
                  </p>
                </div>
              </div>
            </div>

            {/* Products */}
            {selectedProducts.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold mb-3 text-sm border-b pb-2">Products</h4>
                <div className="space-y-3">
                  {selectedProducts.map((p) => {
                    const unitPrice = p.customPrice !== undefined ? p.customPrice : p.price;
                    const quantity = p.quantity || 1;
                    const subtotal = unitPrice * quantity;

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{p.name}</p>
                            {p.sku && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">
                                {p.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleProductQuantityChange(p.id, quantity - 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <RiSubtractFill size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                  handleProductQuantityChange(
                                    p.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-12 h-6 text-center border border-gray-300 rounded text-xs"
                              />
                              <button
                                onClick={() =>
                                  handleProductQuantityChange(p.id, quantity + 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <BiPlus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={unitPrice}
                                onChange={(e) =>
                                  handleProductPriceChange(
                                    p.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 h-6 px-2 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <span className="text-sm font-semibold text-theme">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addons */}
            {selectedAddons.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold mb-3 text-sm border-b pb-2">Add-ons</h4>
                <div className="space-y-3">
                  {selectedAddons.map((a) => {
                    const unitPrice = a.customPrice !== undefined ? a.customPrice : a.price;
                    const quantity = a.quantity || 1;
                    const subtotal = unitPrice * quantity;

                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{a.name || a.addonName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleAddonQuantityChange(a.id, quantity - 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <RiSubtractFill size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                  handleAddonQuantityChange(
                                    a.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-12 h-6 text-center border border-gray-300 rounded text-xs"
                              />
                              <button
                                onClick={() =>
                                  handleAddonQuantityChange(a.id, quantity + 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <BiPlus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={unitPrice}
                                onChange={(e) =>
                                  handleAddonPriceChange(
                                    a.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 h-6 px-2 border border-gray-300 rounded text-xs"
                              />
                              <span className="text-xs text-gray-500">/mo</span>
                            </div>
                            <span className="text-sm font-semibold text-theme">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAddon(a.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra Items */}
            {extraItems.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold mb-3 text-sm border-b pb-2">Extra Items</h4>
                <div className="space-y-3">
                  {extraItems.map((item) => {
                    const subtotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateExtraItem(item.id, "quantity", (item.quantity || 1) - 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <RiSubtractFill size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) =>
                                  handleUpdateExtraItem(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-12 h-6 text-center border border-gray-300 rounded text-xs"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateExtraItem(item.id, "quantity", (item.quantity || 1) + 1)
                                }
                                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                              >
                                <BiPlus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price || 0}
                                onChange={(e) =>
                                  handleUpdateExtraItem(
                                    item.id,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 h-6 px-2 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <span className="text-sm font-semibold text-theme">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveExtraItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subscription Days:</span>
                  <span className="font-semibold">{subscriptionDays} days</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-theme">${calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(STEPS.EXTRA_ITEMS)}
                className="text-gray-500 hover:underline"
              >
                Back
              </button>
              <button
                onClick={() => setStep(STEPS.CHECKOUT)}
                className="bg-theme text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                Next: Payment
              </button>
            </div>
          </div>
        );

      case STEPS.CHECKOUT:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 px-5 py-4">
                <h4 className="font-semibold text-lg text-gray-800">Order Summary</h4>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Machine */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-medium text-gray-800">{machine?.name}</span>
                    <span className="text-xs text-gray-500 ml-2">Machine</span>
                  </div>
                  <span className="font-semibold text-gray-800">${machine?.price}</span>
                </div>

                {/* Products Section */}
                {selectedProducts?.length > 0 && (
                  <div className="space-y-3">
                    <div className="border-t border-gray-200 pt-3">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Products</h5>
                      <div className="space-y-2">
                        {selectedProducts.map((p) => {
                          const unitPrice = parseFloat(p?.customPrice !== undefined ? p.customPrice : p.price) || 0;
                          const quantity = parseInt(p?.quantity) || 1;
                          return (
                            <div key={p.id} className="flex items-center justify-between py-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{p.name}</span>
                                  {p.sku && (
                                    <span className="text-xs text-gray-500 font-mono">({p.sku})</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">Quantity: {quantity} × ${unitPrice.toFixed(2)}</span>
                              </div>
                              <span className="font-semibold text-gray-800 ml-4">${(unitPrice * quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Addons Section */}
                {selectedAddons.length > 0 && (
                  <div className="space-y-3">
                    <div className="border-t border-gray-200 pt-3">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Add-ons</h5>
                      <div className="space-y-2">
                        {selectedAddons.map((a) => {
                          const unitPrice = parseFloat(a.customPrice !== undefined ? a.customPrice : a.price) || 0;
                          const quantity = parseInt(a.quantity) || 1;
                          return (
                            <div key={a.id} className="flex items-center justify-between py-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-800">{a.addonName || a.name}</span>
                                <span className="text-xs text-gray-500 block">Quantity: {quantity} × ${unitPrice.toFixed(2)}</span>
                              </div>
                              <span className="font-semibold text-gray-800 ml-4">${(unitPrice * quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra Items Section */}
                {extraItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="border-t border-gray-200 pt-3">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Extra Items</h5>
                      <div className="space-y-2">
                        {extraItems.map((item) => {
                          const unitPrice = parseFloat(item.price) || 0;
                          const quantity = parseInt(item.quantity) || 1;
                          const subtotal = unitPrice * quantity;
                          return (
                            <div key={item.id} className="flex items-center justify-between py-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-800">{item.name}</span>
                                <span className="text-xs text-gray-500 block">Quantity: {quantity} × ${unitPrice.toFixed(2)}</span>
                              </div>
                              <span className="font-semibold text-gray-800 ml-4">${subtotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-700">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardSelection
              userId={selectedUser?.value || selectedUser?.id}
              selectedMethodId={selectedMethodId}
              onSelect={setSelectedMethodId}
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(STEPS.REVIEW)}
                className="text-gray-500 hover:underline"
              >
                Back
              </button>
              <button
                onClick={handlePaymentSubmit}
                // disabled={loading || !selectedMethodId}
                // disabled
                className="bg-theme text-white w-full max-w-[200px] py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed ml-auto"
              >
                {loading ? "Processing..." : (() => {
                  if (cards?.length === 0) {
                    return `Invoice To attach card $${calculateTotal()}`;
                  } else if (cards?.length > 0 && !selectedMethodId) {
                    return `Attach another card $${calculateTotal()}`;
                  } else {
                    return `Pay $${calculateTotal()}`;
                  }
                })()}
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
              Subscription to <strong>{machine.name}</strong> has been successfully created for{" "}
              <strong>{selectedUser?.label || selectedUser?.name}</strong>.
            </p>
            <button
              onClick={() => {
                onHide();
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
      className="w-[90%] max-w-[700px] font-nunito"
      onHide={onHide}
    >
      {renderContent()}
    </Dialog>
  );
}
