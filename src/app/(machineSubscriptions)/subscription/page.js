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
import { FaPeopleGroup } from "react-icons/fa6";

export default function MachineSubscriptions() {
  const { data, reFetch } = GetAPI("api/v1/admin/category");
  const { machinesData } = GetAPI(`api/v1/admin/machines`);
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
        const res = await PatchAPI(
          `api/v1/admin/machines/${machineId}`,
          buildFD()
        );
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

        <div className="w-full mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {list?.map((machine) => (
            <div
              key={machine?.id}
              className="border border-orange-900/50 rounded-lg overflow-hidden relative group"
            >
              <span
                onClick={() => {
                  setModal("delete");
                }}
                className="absolute top-3 right-3 size-8 rounded-full bg-theme cursor-pointer opacity-0 duration-300 transition-all group-hover:opacity-100 flex justify-center items-center"
              >
                <MdDelete size={18} color="white" />
              </span>

              <div className="text-center">
                <div className="bg-[#fef1d8] rounded-t-lg overflow-hidden">
                  <img
                    src={machine?.image || "/images/coffeemachine.png"}
                    alt={machine?.machineTypeLabel}
                    className="h-[240px] object-contain mx-auto"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-2xl font-semibold">Drip Coffee</h3>
                  <p className="text-lg">Drip Starter</p>
                  <p className="text-sm px-4">
                    Equipment, quarterly checkups, annual service, email
                    support, 10% off parts
                  </p>
                  <div className="text-xl font-bold">{`$${machine?.price}/month`}</div>
                  <div className="mt-4 text-center">
                    <div className="flex justify-center">
                      <FaPeopleGroup size={35} />
                    </div>

                    <p className="text-sm text-gray-500">
                      Up to {machine?.employeeRange} employees
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, includes: e.target.value }))
                    }
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
                      type="text"
                      value={form.officeSize}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, officeSize: e.target.value }))
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
