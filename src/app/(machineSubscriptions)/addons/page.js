"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { success_toaster, info_toaster, error_toaster } from "@/utilities/Toaster";
import MiniLoader from "@/components/ui/MiniLoader";
import Loader from "@/components/ui/Loader";
import ManagementTab from "@/components/ui/ManagementTab";
import { hasPermission } from "@/utilities/Permission";
import { CiMenuBurger } from "react-icons/ci";
import { useDataContext } from "@/utilities/DataContext";

export default function Addons() {
  const { data, reFetch } = GetAPI("api/v1/subscription/addons");
  const addons = data?.addons ?? [];

  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState("");
  const [addonId, setAddonId] = useState("");
  const [addonItems, setAddonItems] = useState([
    { name: "", description: "", price: "" },
  ]);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const reset = () => {
    setModal("");
    setAddonId("");
    setAddonItems([{ name: "", description: "", price: "" }]);
    setEditForm({ name: "", description: "", price: "" });
  };

  const handleAddItem = () => {
    setAddonItems([...addonItems, { name: "", description: "", price: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (addonItems.length > 1) {
      setAddonItems(addonItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...addonItems];
    updated[index] = { ...updated[index], [field]: value };
    setAddonItems(updated);
  };

  const validateAddItems = () => {
    for (let i = 0; i < addonItems.length; i++) {
      const item = addonItems[i];
      if (!item.name?.trim()) {
        return `Item ${i + 1}: Name is required`;
      }
      if (!item.price?.trim() || isNaN(parseFloat(item.price))) {
        return `Item ${i + 1}: Valid price is required`;
      }
      if (parseFloat(item.price) < 0) {
        return `Item ${i + 1}: Price must be greater than or equal to 0`;
      }
    }
    return null;
  };

  const validateEditForm = () => {
    if (!editForm.name?.trim()) return "Name is required";
    if (!editForm.price?.trim() || isNaN(parseFloat(editForm.price)))
      return "Valid price is required";
    if (parseFloat(editForm.price) < 0)
      return "Price must be greater than or equal to 0";
    return null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const err = validateAddItems();
    if (err) {
      info_toaster(err);
      return;
    }

    setLoading("add");
    try {
      // Prepare payload - filter out empty items and format
      const payload = addonItems
        .filter(
          (item) =>
            item.name?.trim() && item.price?.trim() && !isNaN(parseFloat(item.price))
        )
        .map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || "",
          price: parseFloat(item.price).toFixed(2),
        }));

      if (payload.length === 0) {
        info_toaster("Please add at least one valid addon");
        return;
      }

      const res = await PostAPI("api/v1/subscription/addons", payload);
      if (res?.data?.status === "success" || res?.data?.success) {
        success_toaster(
          `${payload.length} addon${payload.length > 1 ? "s" : ""} added successfully`
        );
        reset();
        reFetch();
      } else {
        error_toaster(res?.data?.message || "Failed to add addons");
      }
    } catch (error) {
      error_toaster("An error occurred while adding addons");
    } finally {
      setLoading("");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const err = validateEditForm();
    if (err) {
      info_toaster(err);
      return;
    }

    setLoading("edit");
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || "",
        price: parseFloat(editForm.price).toFixed(2),
      };

      const res = await PatchAPI(
        `api/v1/subscription/addons/${addonId}`,
        payload
      );
      if (res?.data?.status === "success" || res?.data?.success) {
        success_toaster("Addon updated successfully");
        reset();
        reFetch();
      } else {
        error_toaster(res?.data?.message || "Failed to update addon");
      }
    } catch (error) {
      error_toaster("An error occurred while updating addon");
    } finally {
      setLoading("");
    }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const res = await DeleteAPI(`api/v1/subscription/addons/${addonId}`);
      if (res?.data?.status === "success" || res?.data?.success) {
        success_toaster("Addon deleted successfully");
        reset();
        reFetch();
      } else {
        error_toaster(res?.data?.message || "Failed to delete addon");
      }
    } catch (error) {
      error_toaster("An error occurred while deleting addon");
    } finally {
      setLoading("");
    }
  };

  const openEdit = (addon) => {
    setAddonId(addon.id);
    setEditForm({
      name: addon.name || "",
      description: addon.description || "",
      price: addon.price || "",
    });
    setModal("edit");
  };

  const { toggle, setToggle } = useDataContext();

  if (!data && data !== null) return <Loader />;

  return (
    <div>
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-semibold">Addons</h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          {hasPermission("addon_create") && (
            <li
              onClick={() => {
                reset();
                setAddonItems([{ name: "", description: "", price: "" }]);
                setModal("add");
              }}
            >
              Add Addons
            </li>
          )}
        </ul>
      </div>

      {/* Body */}
      <div className="space-y-8 pt-32 2xl:pt-36 px-6 2xl:px-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Addons" desc={addons.length} />
        </div>

        {/* Addons List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {addons.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No addons found
                    </td>
                  </tr>
                ) : (
                  addons.map((addon, index) => (
                    <tr key={addon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {addon.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <p className="truncate">
                          {addon.description || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(addon.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {hasPermission("addon_update") && (
                            <button
                              className="border border-theme text-theme p-2 rounded hover:bg-theme hover:text-white transition-colors"
                              onClick={() => openEdit(addon)}
                              title="Edit"
                            >
                              <FaEdit size={16} />
                            </button>
                          )}
                          {hasPermission("addon_delete") && (
                            <button
                              className="border border-red-400 text-red-400 p-2 rounded hover:bg-red-400 hover:text-white transition-colors"
                              onClick={() => {
                                setAddonId(addon.id);
                                setModal("delete");
                              }}
                              title="Delete"
                            >
                              <MdDelete size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog
        visible={modal === "add"}
        className="font-nunito w-[90%] md:w-[700px] max-h-[90vh] overflow-y-auto"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center">
            Add Addons
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {loading ? (
            <MiniLoader />
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {addonItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700">
                        Addon {index + 1}
                      </h4>
                      {addonItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., Advanced Water Filter"
                        className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-theme focus:border-theme"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Multi-stage filtration system for the purest coffee taste"
                        rows="2"
                        className="border rounded-md px-3 py-2 w-full resize-none focus:ring-2 focus:ring-theme focus:border-theme"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          placeholder="20.00"
                          className="border rounded-md pl-7 pr-3 py-2 w-full focus:ring-2 focus:ring-theme focus:border-theme"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 text-theme border border-theme rounded-md hover:bg-theme hover:text-white transition-colors"
                >
                  <FaPlus size={14} />
                  Add Another
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={reset}
                  className="border border-theme text-theme px-6 py-3 rounded-lg hover:bg-theme hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-theme text-white px-10 py-3 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        visible={modal === "edit"}
        className="font-nunito w-[90%] md:w-[600px]"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center">Edit Addon</div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {loading ? (
            <MiniLoader />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Advanced Water Filter"
                  className="border rounded-md px-3 py-3 w-full focus:ring-2 focus:ring-theme focus:border-theme"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="e.g., Multi-stage filtration system for the purest coffee taste"
                  rows="3"
                  className="border rounded-md px-3 py-3 w-full resize-none focus:ring-2 focus:ring-theme focus:border-theme"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="20.00"
                    className="border rounded-md pl-7 pr-3 py-3 w-full focus:ring-2 focus:ring-theme focus:border-theme"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={reset}
                  className="border border-theme text-theme px-6 py-3 rounded-lg hover:bg-theme hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-theme text-white px-10 py-3 rounded-lg border border-theme hover:bg-white hover:text-theme transition-colors"
                >
                  Update
                </button>
              </div>
            </>
          )}
        </form>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        visible={modal === "delete"}
        className="font-nunito w-[90%] md:w-[500px]"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center">Delete Addon</div>
        }
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <div className="space-y-4">
            <p className="text-center text-lg text-gray-700">
              Are you sure you want to delete this addon? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={reset}
                className="border border-theme text-theme px-6 py-3 rounded-lg hover:bg-theme hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-10 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

