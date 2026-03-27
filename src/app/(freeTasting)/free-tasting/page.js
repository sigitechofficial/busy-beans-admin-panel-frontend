"use client";

import { useMemo, useState } from "react";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { useUserType } from "@/utilities/useUserType";
import { CiMenuBurger } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { Dialog } from "primereact/dialog";
import dayjs from "dayjs";

const formatCellValue = (value) => {
  if (value == null || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function FreeTastingPage() {
  const { isAllowed } = useUserType("admin");
  const { setToggle, toggle } = useDataContext();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiUrl = useMemo(
    () => `api/v1/admin/get-in-touch?page=${page}&limit=${limit}`,
    [page, limit]
  );

  const { data, isLoading, reFetch } = GetAPI(apiUrl);

  const rows =
    data?.data?.submissions ||
    data?.submissions ||
    data?.data?.data ||
    data?.data?.submissions?.data ||
    (Array.isArray(data) ? data : []);
  const pagination = data?.data?.pagination ?? {};

  const handleDeleteClick = (id) => {
    setDeleteModal({ visible: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal?.id) return;
    setDeleteLoading(true);
    try {
      const res = await DeleteAPI(`api/v1/admin/get-in-touch/${deleteModal.id}`);
      if (res?.data?.success || res?.data?.status === "success") {
        success_toaster("Tasting request deleted successfully");
        setDeleteModal({ visible: false, id: null });
        if (rows.length === 1 && page > 1) {
          setPage((prev) => Math.max(1, prev - 1));
        } else {
          reFetch();
        }
      } else {
        throw new Error(res?.data?.message || "Failed to delete request");
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tableData = useMemo(
    () =>
      rows.map((row) => ({
        id: row?.id ?? "-",
        name: formatCellValue(row?.name),
        email: formatCellValue(row?.email),
        phone: formatCellValue(row?.phone),
        company: formatCellValue(row?.company),
        teamSize: formatCellValue(row?.teamSize),
        preferredDate: row?.preferredDate
          ? dayjs(row.preferredDate).format("MM/DD/YYYY")
          : "-",
        notes: formatCellValue(row?.notes),
        createdAt: row?.createdAt
          ? dayjs(row.createdAt).format("MM/DD/YYYY hh:mm A")
          : "-",
        action: (
          <button
            onClick={() => handleDeleteClick(row?.id)}
            className="border border-[#EE4A4A] text-[#EE4A4A] rounded-md p-2 hover:bg-[#EE4A4A] hover:text-white duration-150"
            title="Delete request"
          >
            <MdDelete size={18} />
          </button>
        ),
      })),
    [rows]
  );

  const columns = [
    { field: "id", header: "ID", sort: true },
    { field: "name", header: "Name", sort: true },
    { field: "email", header: "Email" },
    { field: "phone", header: "Phone" },
    { field: "company", header: "Company" },
    { field: "teamSize", header: "Team Size" },
    { field: "preferredDate", header: "Preferred Date" },
    { field: "notes", header: "Notes" },
    { field: "createdAt", header: "Created At" },
    { field: "action", header: "Action" },
  ];

  if (!isAllowed || isLoading) return <Loader />;

  return (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p onClick={() => setToggle(!toggle)} className="cursor-pointer md:hidden">
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Tasting Requests</h2>
        </div>
      </div>

      <div className="space-y-6 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <MyDataTable
          columns={columns}
          data={tableData}
          placeholder="Search by ID, Name, Email, Phone, Company"
          search
          pagination
          serverPagination={{
            page: pagination?.currentPage ?? page,
            limit: pagination?.limit ?? limit,
            totalRecords: pagination?.total ?? 0,
            totalPages: pagination?.totalPages ?? 0,
            onPageChange: (newPage) => setPage(newPage),
            onLimitChange: (newLimit) => {
              setLimit(newLimit);
              setPage(1);
            },
          }}
          hide
        />
      </div>

      <Dialog
        header="Delete Tasting Request"
        visible={deleteModal.visible}
        className="w-[90%] max-w-[480px] font-nunito"
        onHide={() => setDeleteModal({ visible: false, id: null })}
      >
        <div className="space-y-4 py-3">
          <p className="text-gray-700">
            Are you sure you want to delete this tasting request? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModal({ visible: false, id: null })}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-4 py-2 rounded-md bg-[#EE4A4A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
