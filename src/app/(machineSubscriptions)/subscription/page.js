"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import Select from "react-select";
import { LuImageUp } from "react-icons/lu";
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
import { FaPeopleGroup } from "react-icons/fa6";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";

export default function MachineSubscriptions() {
  const { data, reFetch } = GetAPI("api/v1/admin/coffee-machine");
  // const { machinesData } = GetAPI(`api/v1/admin/machines`);
  const allMachines = data?.data?.data ?? [];
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState("");
  const [machineId, setMachineId] = useState("");
  const [preview, setPreview] = useState("");
  const [subscribingMachine, setSubscribingMachine] = useState(null);
  const [filterType, setFilterType] = useState(""); // "" means "All"

  const [form, setForm] = useState({
    name: "",
    tag: "",
    type: "",
    desc: "",
    price: "",
    uptoEmployees: "",
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

  // Extract unique types from API response
  const uniqueTypes = Array.from(
    new Set(
      allMachines
        .map((machine) => machine?.type)
        .filter((type) => type != null && type !== "")
    )
  ).sort();

  // Create filter options with "All" option
  const filterOptions = [
    { value: "", label: "All" },
    ...uniqueTypes.map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
    })),
  ];

  // Filter list based on selected filter
  const list = filterType
    ? allMachines.filter((machine) => machine?.type === filterType)
    : allMachines;

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
      const res = await fetch(`${BASE_URL}api/v1/admin/coffee-machine/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      });

      const json = await res.json();
      const m = json?.data?.data || {};

      setForm({
        name: m?.name ?? "",
        tag: m?.tag ?? "",
        type: m?.type ? { label: m?.type, name: m?.type } : "",
        desc: m?.desc ?? "",
        price: m?.price ?? "",
        uptoEmployees: m?.uptoEmployees ?? "",
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
    fd.append("name", form.name);
    fd.append("tag", form.tag);
    fd.append("type", form.type.label);
    fd.append("desc", form.desc);
    fd.append("price", String(form.price));
    fd.append("uptoEmployees", String(form.uptoEmployees));

    if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    return fd;
  };

  const reset = () => {
    setForm({
      name: "",
      tag: "",
      type: "",
      desc: "",
      price: "",
      uptoEmployees: "",
      image: "",
    });

    setPreview("");
    setMachineId("");
    setModal("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (modal !== "delete") {
      if (
        !form.name.trim() ||
        !form.type.label.trim() ||
        !String(form.price).trim()
      ) {
        info_toaster("Name, Type, and Price are required");
        return;
      }
    }

    setLoading(modal);

    try {
      if (modal === "add") {
        const res = await PostAPI("api/v1/admin/coffee-machine", buildFD());
        if (res?.data?.status === "success") {
          success_toaster("Machine Added");
          reset();
          reFetch();
        }
      }

      if (modal === "edit") {
        const res = await PatchAPI(
          `api/v1/admin/coffee-machine/${machineId}`,
          buildFD()
        );
        if (res?.data?.status === "success") {
          success_toaster("Machine Updated");
          reset();
          reFetch();
        }
      }

      if (modal === "delete") {
        const res = await DeleteAPI(`api/v1/admin/coffee-machine/${machineId}`);
        if (res?.data?.status === "success") {
          success_toaster("Machine Deleted");
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
            options={filterOptions}
            value={filterOptions.find((opt) => opt.value === filterType) || filterOptions[0]}
            onChange={(selected) => setFilterType(selected?.value ?? "")}
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

        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {list?.map((machine) => (
            <div
              key={machine?.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Delete button on hover */}
              <span
                onClick={() => {
                  setModal("delete");
                  setMachineId(machine?.id);
                }}
                className="absolute top-3 right-3 z-10 size-8 rounded-full bg-red-500 cursor-pointer opacity-0 group-hover:opacity-100 duration-300 transition-all flex justify-center items-center shadow-lg hover:bg-red-600 hover:scale-110"
              >
                <MdDelete size={16} color="white" />
              </span>

              {/* Compact Image Container */}
              <div className="bg-gradient-to-br from-[#fef1d8] via-[#fef7e8] to-[#fff9f0] overflow-hidden">
                <div className="relative h-[180px] flex items-center justify-center p-4">
                  <img
                    src={
                      BASE_URL + machine?.image || "/images/coffeemachine.png"
                    }
                    alt={machine?.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      if (e.target.src !== "/images/coffeemachine.png") {
                        e.target.src = "/images/coffeemachine.png";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Compact Content Section */}
              <div className="p-4 flex flex-col flex-1">
                {/* Title and Type - Compact */}
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 capitalize mb-1">
                    {machine?.name}
                  </h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-theme/10 text-theme text-xs font-medium capitalize">
                    {machine?.type}
                  </div>
                </div>

                {/* Description - Compact */}
                {machine?.desc && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-snug">
                    {machine?.desc}
                  </p>
                )}

                {/* Price and Employee - Side by Side */}
                <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      ${machine?.price}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        /{machine?.pricePer || "mo"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <FaPeopleGroup size={16} className="text-theme" />
                    <span className="font-medium">{machine?.uptoEmployees}</span>
                  </div>
                </div>

                {/* Compact Action Buttons */}
                <div className="flex items-center gap-2 mt-auto">
                  {hasPermission("machine_update") && (
                    <button
                      onClick={() => openEdit(machine?.id)}
                      className="flex-1 bg-gray-900 text-white h-10 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => setSubscribingMachine(machine)}
                    className={`${hasPermission("machine_update") ? "flex-1" : "w-full"} bg-theme text-white h-10 py-2 px-3 rounded-lg text-sm font-medium hover:bg-theme/90 transition-all duration-200 active:scale-95`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubscriptionModal
        visible={!!subscribingMachine}
        onHide={() => setSubscribingMachine(null)}
        machine={subscribingMachine}
      />

      {/* Modal */}
      <Dialog
        visible={!!modal}
        className="font-nunito w-[90%] md:w-[600px]"
        onHide={reset}
        header={
          <div className="font-bold text-2xl text-center">
            {modal === "add"
              ? "Add New Coffee Machine"
              : modal === "edit"
                ? "Update Machine"
                : "Delete Machine"}
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
                  onClick={() =>
                    document.getElementById("machine-img")?.click()
                  }
                  className="mx-auto overflow-hidden rounded-xl border border-tabBorderColor/40 size-28 flex items-center justify-center"
                >
                  <input
                    id="machine-img"
                    type="file"
                    className="hidden"
                    onChange={onImagePick}
                  />
                  {preview ? (
                    <img
                      src={preview}
                      alt="machine"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LuImageUp size={100} color="rgba(0,0,0,.6)" />
                  )}
                </button>

                <div className="space-y-2">
                  <label className="font-medium">Machine Name*</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Type Name.."
                    className="border rounded px-3 py-3 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Machine Type*</label>
                  <Select
                    value={form.type}
                    onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                    options={machineTypeOptions}
                    styles={selectStyles2}
                    placeholder="Drip coffee"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Tag*</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tag: e.target.value }))
                    }
                    placeholder="Type Name.."
                    className="border rounded px-3 py-3 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">What’s included</label>
                  <textarea
                    type="text"
                    value={form.desc}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, desc: e.target.value }))
                    }
                    placeholder="Add details"
                    className="border rounded px-3 py-3 w-full resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Price* (per month)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="$150 / month"
                      className="border rounded px-3 py-3 w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Office size</label>
                    <input
                      type="number"
                      value={form.uptoEmployees}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          uptoEmployees: e.target.value,
                        }))
                      }
                      placeholder="25"
                      className="border rounded px-3 py-3 w-full"
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="font-semibold text-center text-lg min-h-[200px] flex items-center justify-center">
                Are you sure you want to delete this machine?
              </p>
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
                {modal === "add"
                  ? "Save"
                  : modal === "edit"
                    ? "Update"
                    : "Delete"}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
