"use client";
import Loader from "@/components/ui/Loader";
import MiniLoader from "@/components/ui/MiniLoader";
import { useDataContext } from "@/utilities/DataContext";
import ErrorHandler from "@/utilities/ErrorHandler";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { success_toaster } from "@/utilities/Toaster";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { hasPermission } from "@/utilities/Permission";
import { SHIPPING_CHARGES } from "./shipping-charges.testids";

export default function ShippingChargesManagement() {
  const [rows, setRows] = useState([]);
  const [loader, setLoader] = useState(false);
  const [modal, setModal] = useState(false);

  const { data, reFetch, isLoading } = GetAPI("api/v1/admin/shipping-charges-list", "charges");

  useEffect(() => {
    if (data?.data?.data?.length > 0) {
      const formattedRows = data.data.data
        .map((item) => ({
          min: item.weightFrom,
          max: item.weightTo,
          charge: item.charges,
          id: item.id,
        }))
        // .reverse(); // Reverse the mapped array
      setRows(formattedRows);
    }
  }, [data]);

  // const addRow = () => {
  //   setRows([...rows, { min: "", max: "", charge: "" }]);
  // };
  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    const newMin = lastRow ? Number(lastRow.max) + 1 : 0;

    setRows([
      ...rows,
      {
        min: newMin,
        max: "",
        charge: "",
      },
    ]);
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        row.min === "" ||
        row.max === "" ||
        row.charge === "" ||
        isNaN(row.min) ||
        isNaN(row.max) ||
        isNaN(row.charge)
      ) {
        ErrorHandler(new Error(`Please fill all fields for row ${i + 1}.`));
        return;
      }

      if (Number(row.min) >= Number(row.max)) {
        ErrorHandler(
          new Error(`Min value cannot be greater than Max in row ${i + 1}.`)
        );
        return;
      }
    }

    const payload = {
      company: "FedEx Ground E",
      ranges: rows.map((row) => ({
        company: "FedEx Ground E",
        weightFrom: Number(row.min),
        weightTo: Number(row.max),
        charges: row.charge.toString(),
      })),
    };

    setLoader(true);
    try {
      const res = await PatchAPI("api/v1/admin/shipping-charges-update", {
        ranges: [...payload?.ranges],
      }, "charges");
      if (res?.data?.status === "success") {
        success_toaster("Shipping Ranges updated successfully");
        reFetch();
      } else {
        throw new Error(res?.data?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoader(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log("🚀 Submitting PATCH payload:", payload);

  //   try {
  //     setLoader(true);
  //     const response = await fetch("/api/v1/admin/shipping-charges", {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await response.json();
  //     console.log("✅ Response:", result);
  //     setLoader(false);
  //   } catch (error) {
  //     console.error("❌ Error submitting patch:", error);
  //     setLoader(false);
  //   }
  // };

  // const handleCancel = () => {
  //   setModal(false);
  // };
  const { toggle, setToggle } = useDataContext();
 
  return isLoading ? (
      <Loader />
    ) : (
    <div data-testid={SHIPPING_CHARGES.root}>
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed"
       data-testid={SHIPPING_CHARGES.headerBar}>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold" data-testid={SHIPPING_CHARGES.title}>
            Shipping Charges Management
          </h2>
        </div>
      </div>

      {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Shipping Charges Management
          </h2>
        </div> */}
      <div className="space-y-8 pt-28 2xl:pt-32 px-6 2xl:px-12 ">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-inter font-semibold">
            Shipping Charges Management
          </h2>
        </div> */}

        {loader ? (
          <MiniLoader data-testid={SHIPPING_CHARGES.miniLoader}/>
        ) : (
          <div>
            <div className="space-y-4" id="shipping-rows" data-testid={SHIPPING_CHARGES.rowsContainer}>
                  <div className="grid grid-cols-4 gap-4 items-center font-semibold text-gray-700 border-b pb-2 mb-4 text-sm sm:text-base">
                    <div className="truncate">
                      Min Range
                    </div>
                    <div className="truncate">
                      Max Range
                    </div>
                    <div className="truncate">
                      Charges($)
                    </div>
                    <div className="truncate">
                      Action
                    </div>
                  </div>
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 items-center"
                  data-testid={SHIPPING_CHARGES.row(index)}
                >
                  <input
                    type="number"
                    placeholder="Min Range"
                    className="w-full px-4 py-2 border rounded-md disabled:cursor-not-allowed"
                    value={index === 0 ? 0 : row.min}
                    onChange={(e) => updateRow(index, "min", e.target.value)}
                    disabled={true}
                    data-testid={SHIPPING_CHARGES.minInput(index)}
                    // disabled={index !== 0 || index === 0}
                  />
                  <input
                    type="number"
                    placeholder="Max Range"
                    className="w-full px-4 py-2 border rounded-md"
                    value={row.max}
                    onChange={(e) => updateRow(index, "max", e.target.value)}
                    disabled={!hasPermission("charges_update")}
                    data-testid={SHIPPING_CHARGES.maxInput(index)}
                  />
                  <input
                    type="number"
                    placeholder="Charges"
                    className="w-full px-4 py-2 border rounded-md"
                    value={row.charge}
                    onChange={(e) => updateRow(index, "charge", e.target.value)}
                    disabled={!hasPermission("charges_update")}
                    data-testid={SHIPPING_CHARGES.chargeInput(index)}
                  />
                  {hasPermission("charges_delete") && (
                  <button
                    onClick={() => deleteRow(index)}
                    className="text-red-600 font-semibold border border-red-600 w-20"
                    data-testid={SHIPPING_CHARGES.deleteBtn(index)}
                  >
                    Delete
                  </button> )}
                </div>
              ))}

              <div className="flex justify-end gap-x-2">
                {hasPermission("charges_create") && (
                <button
                  onClick={addRow}
                  className="mt-6 px-6 py-2.5 bg-theme text-white font-semibold rounded hover:bg-white hover:text-theme border border-theme"
                  data-testid={SHIPPING_CHARGES.addRowBtn}
                >
                  Add More Charges
                </button> )}
                {hasPermission("charges_update") && (
                <button
                  onClick={handleSubmit}
                  className="mt-6 px-6 py-2.5 bg-theme text-white font-semibold rounded hover:bg-white hover:text-theme border border-theme"
                  data-testid={SHIPPING_CHARGES.saveBtn}
                >
                  Save
                </button> )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
