"use client";

import { useState } from "react";
import ManagementTab from "@/components/ui/ManagementTab";
import MyDataTable from "@/components/ui/MyDataTable";
import { Dialog } from "primereact/dialog";
import Switch from "react-switch";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import MiniLoader from "@/components/ui/MiniLoader";
import Loader from "@/components/ui/Loader";
import { hasPermission } from "@/utilities/Permission";
import { CiMenuBurger } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useDataContext } from "@/utilities/DataContext";

export default function AddOns() {
  const { data, reFetch } = GetAPI("api/v1/admin/category", "addon");

  const [modal, setModal] = useState(""); 
  const [loading, setLoading] = useState("");
  const [addonId, setAddonId] = useState("");

  const [form, setForm] = useState({
    name: "",
    priceFrom: "",
    priceTo: "",
    isVariable: false,
    status: true,
  });

  const reset = () => {
    setModal("");
    setAddonId("");
    setForm({ name: "", priceFrom: "", priceTo: "", isVariable: false, status: true });
  };

  const validate = () => {
    if (!form.name.trim()) return "Add-On name is required";
    if (form.priceFrom === "" || Number.isNaN(Number(form.priceFrom))) return "Valid price (from) is required";
    if (form.isVariable) {
      if (form.priceTo === "" || Number.isNaN(Number(form.priceTo))) return "Valid price (to) is required";
      if (Number(form.priceTo) < Number(form.priceFrom)) return "Price (to) must be ≥ price (from)";
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return info_toaster(err);

    setLoading(modal);
    try {
      if (modal === "add") {
        const res = await PostAPI("api/v1/admin/addon", form, "addon");
        if (res?.data?.status === "success") {
          success_toaster("Add-On added");
          reset();
          reFetch();
        }
      } else if (modal === "edit") {
        const res = await PatchAPI(`api/v1/admin/addon/${addonId}`, form, "addon");
        if (res?.data?.status === "success") {
          success_toaster("Add-On updated");
          reset();
          reFetch();
        }
      } else if (modal === "delete") {
        const res = await DeleteAPI(`api/v1/admin/addon/${addonId}`, "addon");
        if (res?.data?.status === "success") {
          success_toaster("Add-On deleted");
          reset();
          reFetch();
        }
      }
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (id, status) => {
    const res = await PatchAPI(`api/v1/admin/addon/${id}`, { status: !status }, "addon");
    if (res?.data?.status === "success") {
      success_toaster("Status updated");
      reFetch();
    }
  };

  const openEdit = (row) => {
    setAddonId(row.id);
    setForm({
      name: row.name ?? "",
      priceFrom: String(row.priceFrom ?? ""),
      priceTo: String(row.priceTo ?? ""),
      isVariable: !!row.isVariable,
      status: !!row.status,
    });
    setModal("edit");
  };

  const cols = [
    { field: "sl", header: "SL", sort: true },
    { field: "name", header: "Add-On" },
    { field: "type", header: "Type" },
    { field: "priceFrom", header: "Price From ($)" },
    { field: "priceTo", header: "Price To ($)" },
    // { field: "currentStatus", header: "Current Status" },
    { field: "changeStatus", header: "Change Status" },
    { field: "action", header: "Action" },
  ];

  const rows = [];
  data?.data?.data?.forEach((a, i) =>
    rows.push({
      id: a?.id,
      sl: i + 1,
      name: a?.name,
      type: a?.isVariable ? "Range" : "Fixed",
      priceFrom: Number(a?.priceFrom ?? 0).toFixed(2),
      priceTo: a?.isVariable ? Number(a?.priceTo ?? 0).toFixed(2) : "-",
      currentStatus: (
        <div>
          {a?.status ? (
            <div className="w-24 bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
              Active
            </div>
          ) : (
            <div className="w-24 bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
              Inactive
            </div>
          )}
        </div>
      ),
      changeStatus: (hasPermission("addon_update") ? (
        <label className="flex items-center gap-2 ">
          <div>
            {a?.status ? (
              <div className="w-max text-xs bg-theme text-white font-semibold p-2 rounded-md flex justify-center">
                Active
              </div>
            ) : (
              <div className="w-max text-xs bg-[#EE4A4A14] text-[#EE4A4A] font-semibold p-2 rounded-md flex justify-center">
                Inactive
              </div>
            )}
          </div>
        <Switch
          onChange={() => toggleStatus(a?.id, a?.status)}
          checked={a?.status}
          uncheckedIcon={false}
          checkedIcon={false}
          onColor="#86644c"
          onHandleColor="#fff"
          className="react-switch"
        />
         </label>
      ) : (
        <span className="text-gray-400">No Access</span>
      )),
      action: (
        <div className="flex gap-2">
          {hasPermission("addon_update") && (
            <button
              className="border border-theme text-theme p-2 rounded"
              onClick={() => openEdit(a)}
            >
              <FaEdit size={18} />
            </button>
          )}
          {hasPermission("addon_delete") && (
            <button
              className="border border-red-400 text-red-400 p-2 rounded"
              onClick={() => {
                setAddonId(a?.id);
                setModal("delete");
              }}
            >
              <MdDelete size={18} />
            </button>
          )}
        </div>
      ),
    })
  );

  const { toggle, setToggle } = useDataContext();

  if (data?.length === 0) return <Loader />;

  return (
    <div>
      {/* header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-semibold">Add-Ons</h2>
        </div>

        <ul className="flex items-center text-sm font-medium [&>li]:border-r [&>li]:px-2 [&>li]:cursor-pointer">
          {hasPermission("addon_create") && (
            <li
              onClick={() => {
                reset();
                setModal("add");
              }}
            >
              New Add-On
            </li>
          )}
        </ul>
      </div>

      {/* body */}
      <div className="space-y-8 pt-32 px-6 2xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Add-Ons" desc={data?.data?.data?.length ?? 0} />
        </div>

        <MyDataTable 
         columns={cols} 
         data={rows} 
         placeholder={"Search ..."}
         pagination={true}
         search={true} 
        />

        <Dialog
          visible={modal === "add" || modal === "edit" || modal === "delete"}
          className="font-satoshi w-[90%] max-w-[560px]"
          onHide={reset}
          header={<div className="font-bold text-2xl text-center">{modal === "add" ? "Add" : modal === "edit" ? "Update" : "Delete"} Add-On</div>}
        >
          <form onSubmit={submit} className="space-y-6">
            {loading ? (
              <MiniLoader />
            ) : modal === "delete" ? (
              <p className="text-center text-lg">Are you sure you want to delete this Add-On?</p>
            ) : (
              <>
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Add-Ons name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Drip coffee"
                    className="border rounded-md px-3 py-3 w-full"
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price from</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <input
                        type="text"
                        value={form.priceFrom}
                        onChange={(e) => setForm((p) => ({ ...p, priceFrom: e.target.value }))}
                        className="border rounded-md pl-7 pr-3 py-3 w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price to</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <input
                        type="text"
                        value={form.priceTo}
                        onChange={(e) => setForm((p) => ({ ...p, priceTo: e.target.value }))}
                        disabled={!form.isVariable}
                        className="border rounded-md pl-7 pr-3 py-3 w-full disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-medium">Price variation</span>
                  <Switch
                    onChange={(v) =>
                      setForm((p) => ({ ...p, isVariable: v, priceTo: v ? p.priceTo : "" }))
                    }
                    checked={form.isVariable}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    onColor="#16a34a"
                    onHandleColor="#fff"
                  />
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 rounded-md bg-black text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-md bg-[#8a6a53] text-white"
              >
                {modal === "add" ? "Save" : modal === "edit" ? "Save" : "Delete"}
              </button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
