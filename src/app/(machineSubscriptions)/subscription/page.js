"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import Select from "react-select";
import { LuImageUp } from "react-icons/lu";
import MyDataTable from "@/components/ui/MyDataTable";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import { PostAPI } from "@/utilities/PostAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import { success_toaster, info_toaster } from "@/utilities/Toaster";
import selectStyles, { selectStyles2 } from "@/utilities/SelectStyle";
import ManagementTab from "@/components/ui/ManagementTab";
import MiniLoader from "@/components/ui/MiniLoader";
import { hasPermission } from "@/utilities/Permission";
import { BASE_URL } from "@/utilities/URL";

export default function MachineSubscriptions() {
  const { data, reFetch } = GetAPI("api/v1/admin/category");
  const list = data?.data?.data ?? [];

  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState("");
  const [machineId, setMachineId] = useState("");
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    machineType: null,
    planName: null,
    includes: "",
    price: "",
    officeSize: "",
    image: "",
  });

  const machineTypeOptions = [
    { value: "drip", label: "Drip coffee" },
    { value: "espresso", label: "Espresso" },
    { value: "commercial", label: "Commercial" },
  ];
  const planOptions = [
    { value: "drip_starter", label: "Drip Starter" },
    { value: "espresso_starter", label: "Espresso Starter" },
    { value: "professional", label: "Professional" },
    { value: "enterprise", label: "Enterprise" },
  ];
  
  const columns = [
    { field: "sl", header: "SL", sort: true },
    { field: "machineType", header: "Machine" },
    { field: "planName", header: "Plan" },
    { field: "includes", header: "What’s included" },
    { field: "officeSize", header: "Office size" },
    { field: "price", header: "Price /mo" },
    { field: "image", header: "Image" },
    { field: "action", header: "Action" },
  ];

  const rows = [];
  data?.data?.data?.forEach((m, i) =>
    rows.push({
      sl: i + 1,
      machineType: m?.machineTypeLabel ?? m?.machineType,
      planName: m?.planNameLabel ?? m?.planName,
      includes: m?.includes,
      officeSize: m?.officeSize,
      price: `$${m?.price}`,
      image: (
        <img
          src={BASE_URL + (m?.image ?? "")}
          alt="machine"
          className="w-16 h-12 object-contain"
        />
      ),
      action: (
        <div className="flex gap-2">
          {hasPermission("machine_update") && (
            <button
              className="border border-theme text-theme p-2 rounded"
              onClick={() => openEdit(m?.id)}
            >
              <FaEdit size={18} />
            </button>
          )}
          {hasPermission("machine_delete") && (
            <button
              className="border border-red-400 text-red-400 p-2 rounded"
              onClick={() => {
                setMachineId(m?.id);
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

  const openEdit = async (id) => {
    setLoading("prefill");
    try {
      const res = await fetch(`${BASE_URL}api/v1/admin/machines/${id}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      const m = json?.data || {};
      setForm({
        machineType: m?.machineType
          ? { value: m.machineType, label: m.machineTypeLabel ?? m.machineType }
          : null,
        planName: m?.planName
          ? { value: m.planName, label: m.planNameLabel ?? m.planName }
          : null,
        includes: m?.includes ?? "",
        price: m?.price ?? "",
        officeSize: m?.officeSize ?? "",
        image: m?.image ?? "",
      });
      setPreview(m?.image ? BASE_URL + m.image : "");
      setMachineId(m?.id ?? "");
      setModal("edit");
    } finally {
      setLoading("");
    }
  };

  const onImagePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((p) => ({ ...p, image: f }));
    setPreview(URL.createObjectURL(f));
  };

  const buildFD = () => {
    const fd = new FormData();
    fd.append("machineType", form?.machineType?.value ?? "");
    fd.append("planName", form?.planName?.value ?? "");
    fd.append("includes", form?.includes ?? "");
    fd.append("price", String(form?.price ?? ""));
    fd.append("officeSize", String(form?.officeSize ?? ""));
    if (form?.image instanceof File) fd.append("image", form.image);
    return fd;
  };

  const reset = () => {
    setForm({
      machineType: null,
      planName: null,
      includes: "",
      price: "",
      officeSize: "",
      image: "",
    });
    setPreview("");
    setMachineId("");
    setModal("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.machineType || !form.planName || !String(form.price).trim()) {
      info_toaster("Machine Type, Plan and Price are required");
      return;
    }
    setLoading(modal);
    try {
      if (modal === "add") {
        const res = await PostAPI("api/v1/admin/machines", buildFD());
        if (res?.data?.status === "success") {
          success_toaster("Machine added");
          reset();
          reFetch();
        }
      } else if (modal === "edit") {
        const res = await PatchAPI(`api/v1/admin/machines/${machineId}`, buildFD());
        if (res?.data?.status === "success") {
          success_toaster("Machine updated");
          reset();
          reFetch();
        }
      } else if (modal === "delete") {
        const res = await DeleteAPI(`api/v1/admin/machines/${machineId}`);
        if (res?.data?.status === "success") {
          success_toaster("Machine deleted");
          reset();
          reFetch();
        }
      }
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <h2 className="text-xl font-semibold">Coffee Machine Membership</h2>
      </div>

      <div className="space-y-8 pb-10 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <div className="flex items-center gap-4 justify-end">
          <Select
            placeholder="Filters"
            styles={selectStyles}
            className="w-40"
            options={[
              { value: "drip", label: "Drip" },
              { value: "espresso", label: "Espresso" },
              { value: "commercial", label: "Commercial" },
            ]}
          />
          {hasPermission("machine_create") && (
            <button
              onClick={() => setModal("add")}
              className="bg-theme text-white px-4 py-2 rounded-lg border border-theme hover:bg-white hover:text-theme"
            >
              Add New Machine
            </button>
          )}
        </div>
        
         {/* stat card (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <ManagementTab title="Total Machines" desc={list.length} />
        </div>
        {/* <MyDataTable
          columns={columns}
          data={rows}
          placeholder={"Search ..."}
          pagination={true}
          search={true}
        /> */}
        {/* 4-up card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {list.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border overflow-hidden bg-white shadow-sm flex flex-col"
            >
              <div className="bg-[#FAF3EC] flex items-center justify-center h-48">
                <img
                  src={BASE_URL + (m?.image ?? "")}
                  alt={m?.machineTypeLabel ?? "machine"}
                  className="h-40 object-contain"
                />
              </div>

              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="text-lg font-semibold">{m?.machineTypeLabel}</div>
                <div className="text-xs text-gray-500">{m?.planNameLabel}</div>
                <p className="text-xs text-gray-600 leading-snug">{m?.includes}</p>

                <div className="pt-2">
                  <div className="text-2xl font-bold">${m?.price}/month</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Up to {m?.employeeRange || "25+ employees"}
                  </div>
                </div>

                <div className="mt-auto flex gap-3 pt-3">
                  {hasPermission("machine_update") && (
                    <button
                      className="px-4 py-2 text-sm rounded border"
                      onClick={() => openEdit(m.id)}
                    >
                      Edit
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm rounded bg-[#8E6C53] text-white">
                    Subscribe plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        visible={!!modal}
        className="font-nunito w-[90%] md:w-[600px]"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center">
            {modal === "add" ? "Add New Coffee Machine" : modal === "edit" ? "Update Machine" : "Delete Machine"}
          </div>
        }
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {modal !== "delete" ? (
              <>
                <button
                  type="button"
                  onClick={() => document.getElementById("machine-img")?.click()}
                  className="mx-auto overflow-hidden rounded-xl border border-tabBorderColor/40 size-28 flex items-center justify-center"
                >
                  <input id="machine-img" type="file" className="hidden" onChange={onImagePick} />
                  {preview ? (
                    <img src={preview} alt="machine" className="h-full w-full object-cover" />
                  ) : (
                    <LuImageUp size={100} color="rgba(0,0,0,.6)" />
                  )}
                </button>

                <div className="space-y-2">
                  <label className="font-medium">Machine Type*</label>
                  <Select
                    value={form.machineType}
                    onChange={(v) => setForm((p) => ({ ...p, machineType: v }))}
                    options={machineTypeOptions}
                    styles={selectStyles2}
                    placeholder="Drip coffee"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Plan Name*</label>
                  <Select
                    value={form.planName}
                    onChange={(v) => setForm((p) => ({ ...p, planName: v }))}
                    options={planOptions}
                    styles={selectStyles2}
                    placeholder="Drip Starter"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">What’s included</label>
                  <input
                    type="text"
                    value={form.includes}
                    onChange={(e) => setForm((p) => ({ ...p, includes: e.target.value }))}
                    placeholder="Add details"
                    className="border rounded px-3 py-3 w-full"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Price* (per month)</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="$150 / month"
                      className="border rounded px-3 py-3 w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Office size</label>
                    <input
                      type="text"
                      value={form.officeSize}
                      onChange={(e) => setForm((p) => ({ ...p, officeSize: e.target.value }))}
                      placeholder="25"
                      className="border rounded px-3 py-3 w-full"
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-lg">Are you sure you want to delete this machine?</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
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
                {modal === "add" ? "Save" : modal === "edit" ? "Update" : "Delete"}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
