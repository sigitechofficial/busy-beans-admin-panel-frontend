import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function ExtraItemsStep({ 
  subscriptionDays, 
  onDaysChange, 
  extraItems, 
  onAddExtraItem, 
  onRemoveExtraItem,
  onUpdateExtraItem 
}) {
  const PRESETS = [7, 14, 30, 60, 90, 180, 365];
  const [daysInput, setDaysInput] = useState(String(subscriptionDays));
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setDaysInput(String(subscriptionDays));
  }, [subscriptionDays]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    quantity: "1"
  });

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price) {
      onAddExtraItem({
        id: Date.now(), // Temporary ID
        name: newItem.name.trim(),
        price: parseFloat(newItem.price) || 0,
        quantity: parseInt(newItem.quantity) || 1
      });
      setNewItem({ name: "", price: "", quantity: "1" });
      setShowAddForm(false);
    }
  };

  const handleUpdateItem = (itemId, field, value) => {
    onUpdateExtraItem(itemId, field, value);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Days */}
      <div className="space-y-2">
        <label className="font-semibold text-gray-700">Subscription Days</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={9999}
            value={daysInput}
            onChange={(e) => {
              const raw = e.target.value;
              setDaysInput(raw);
              const n = parseInt(raw, 10);
              if (!Number.isNaN(n) && n >= 1) onDaysChange(Math.min(9999, n));
            }}
            onBlur={() => {
              const n = parseInt(daysInput, 10);
              if (Number.isNaN(n) || n < 1) {
                setDaysInput("30");
                onDaysChange(30);
              }
            }}
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme focus:border-theme text-sm"
          />
          <span className="text-sm text-gray-600">days</span>
        </div>
        <p className="text-xs text-gray-500 mb-1.5">Quick select:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onDaysChange(days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                subscriptionDays === days
                  ? "bg-theme text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Extra Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-700">Extra Items</label>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <FaPlus size={14} />
            ADD EXTRA
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-theme focus:border-theme"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-theme focus:border-theme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-theme focus:border-theme"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-theme text-white rounded hover:bg-orange-600 text-sm font-medium"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ name: "", price: "", quantity: "1" });
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Extra Items List */}
        {extraItems.length > 0 && (
          <div className="space-y-3">
            {extraItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between gap-4"
              >
                <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-theme focus:border-theme"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-theme focus:border-theme"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-theme focus:border-theme"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                    <p className="text-sm font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveExtraItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove item"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {extraItems.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-500 text-center py-4">No extra items added yet.</p>
        )}
      </div>
    </div>
  );
}
