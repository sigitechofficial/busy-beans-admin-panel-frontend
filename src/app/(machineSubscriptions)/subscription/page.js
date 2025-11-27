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

export default function MachineSubscriptions() {
  const { data, reFetch } = GetAPI("api/v1/admin/coffee-machine");
  // const { machinesData } = GetAPI(`api/v1/admin/machines`);
  const list = data?.data?.data ?? [];
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState("");
  const [machineId, setMachineId] = useState("");
  const [preview, setPreview] = useState("");

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

        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {list?.map((machine) => (
            <div
              key={machine?.id}
              className="border border-orange-900/50 rounded-lg overflow-hidden relative group"
            >
              <span
                onClick={() => {
                  setModal("delete");
                  setMachineId(machine?.id);
                }}
                className="absolute top-3 right-3 size-8 rounded-full bg-theme cursor-pointer opacity-0 duration-300 transition-all group-hover:opacity-100 flex justify-center items-center"
              >
                <MdDelete size={18} color="white" />
              </span>

              <div className="text-center">
                <div className="bg-[#fef1d8] rounded-t-lg overflow-hidden">
                  <img
                    src={
                      BASE_URL + machine?.image || "/images/coffeemachine.png"
                    }
                    alt={machine?.name}
                    className="h-[240px] object-contain mx-auto"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-2xl font-semibold line-clamp-1">
                    {machine?.name}
                  </h3>

                  <p className="text-lg">{machine?.type}</p>

                  <p className="text-sm px-4 h-20 flex justify-center line-clamp-4 overflow-ellipsis">
                    {machine?.desc}
                  </p>

                  <div className="text-xl font-bold">{`$${machine?.price}/${machine?.pricePer}`}</div>

                  <div className="mt-4 text-center">
                    <div className="flex justify-center">
                      <FaPeopleGroup size={35} />
                    </div>

                    <p className="text-sm text-gray-500">
                      Up to {machine?.uptoEmployees} employees
                    </p>

                    <div className="flex items-center gap-x-3">
                      {hasPermission("machine_update") && (
                        <button
                          onClick={() => openEdit(machine?.id)}
                          className="bg-black text-white w-max h-[56px] py-2 px-6 mt-8 rounded-md"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        // onClick={handleContactClick}
                        className="bg-theme text-white w-full h-[56px] py-2 px-6 mt-8 rounded-md"
                      >
                        Subscribe plan
                      </button>
                    </div>
                  </div>
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

                {/* <div className="space-y-2">
                  <label className="font-medium">Plan Name*</label>
                  <Select
                    value={form.planName}
                    onChange={(v) => setForm((p) => ({ ...p, planName: v }))}
                    options={planOptions}
                    styles={selectStyles2}
                    placeholder="Drip Starter"
                  />
                </div> */}

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
