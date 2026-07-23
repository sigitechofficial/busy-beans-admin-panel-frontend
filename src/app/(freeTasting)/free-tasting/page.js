"use client";

import { useCallback, useMemo, useState } from "react";
import Loader from "@/components/ui/Loader";
import MyDataTable from "@/components/ui/MyDataTable";
import GetAPI from "@/utilities/GetAPI";
import { DeleteAPI } from "@/utilities/DeleteAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster } from "@/utilities/Toaster";
import { useDataContext } from "@/utilities/DataContext";
import { useUserType } from "@/utilities/useUserType";
import { CiMenuBurger } from "react-icons/ci";
import { MdDelete, MdEmail, MdPhone, MdOutlineMoreHoriz } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Dialog } from "primereact/dialog";
import dayjs from "dayjs";
import ClampedTextTooltip from "@/components/ui/ClampedTextTooltip";

const isBlankValue = (value) => {
  if (value == null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return true;
  }
  return false;
};

const BlankChip = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200/90">
    <span className="h-1.5 w-1.5 rounded-full bg-slate-400/80" aria-hidden />
    N/A
  </span>
);

/** Shared table body text — keeps ID, Name, Company, dates, etc. aligned */
const cellTextClass = "text-[13px] font-medium leading-5 text-themeDark";

const CellText = ({ children, className = "", title }) => (
  <span className={`${cellTextClass} ${className}`.trim()} title={title}>
    {children}
  </span>
);

/** Capitalize the first letter of each word (e.g. john doe → John Doe) */
const capitalizeWords = (value) => {
  if (isBlankValue(value)) return value;
  return String(value)
    .trim()
    .split(/\s+/)
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word,
    )
    .join(" ");
};

const formatCellValue = (value, { capitalize = false } = {}) => {
  if (isBlankValue(value)) return <BlankChip />;
  if (typeof value === "object") {
    return <CellText>{JSON.stringify(value)}</CellText>;
  }
  const text = capitalize ? capitalizeWords(value) : String(value).trim();
  return <CellText title={text}>{text}</CellText>;
};

const formatSearchValue = (value) => {
  if (isBlankValue(value)) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/** Ensure phone display/dial value starts with + */
const formatPhoneWithPlus = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  return `+${raw.replace(/^\+/, "")}`;
};

/** Digits only for tel/whatsapp links */
const phoneDigitsForLink = (value) => {
  const withPlus = formatPhoneWithPlus(value);
  return withPlus.replace(/[^\d+]/g, "");
};

const iconBtnClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-theme/25 bg-white text-theme hover:border-theme hover:bg-theme/10 hover:text-themeDark transition-colors duration-150";

const ContactValueCell = ({ value, type, name, onOpenActions }) => {
  if (isBlankValue(value)) return <BlankChip />;

  const display =
    type === "phone" ? formatPhoneWithPlus(value) : String(value).trim();

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`truncate ${cellTextClass}`}>{display}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenActions?.({ type, value: display, name });
        }}
        className={iconBtnClass}
        title="Actions"
        aria-label={`${type === "email" ? "Email" : "Phone"} actions`}
      >
        <MdOutlineMoreHoriz size={18} />
      </button>
    </div>
  );
};

const ContactActionsModal = ({ open, onClose, type, value, name }) => {
  const [copied, setCopied] = useState(false);

  if (!type || !value) return null;

  const isEmail = type === "email";
  const displayValue = isEmail ? String(value).trim() : formatPhoneWithPlus(value);
  const linkPhone = !isEmail ? phoneDigitsForLink(value) : "";
  const whatsappNumber = linkPhone.replace(/\D/g, "");
  const displayName =
    name && name !== "-"
      ? String(name)
          .trim()
          .split(/\s+/)
          .map((w) =>
            w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w,
          )
          .join(" ")
      : "Contact";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const copyClass = copied
    ? "border-themeGreen/30 bg-themeLightGreen text-themeGreen"
    : "border-theme/20 bg-white text-themeDark hover:border-theme/40 hover:bg-theme/5";

  const actions = isEmail
    ? [
        {
          key: "copy",
          label: copied ? "Copied" : "Copy email",
          desc: "Copy address to clipboard",
          icon: copied ? <FiCheck size={18} /> : <FiCopy size={18} />,
          className: copyClass,
          onClick: handleCopy,
        },
        {
          key: "email",
          label: "Send email",
          desc: "Open in your email app",
          icon: <MdEmail size={18} />,
          className:
            "border-theme/25 bg-theme/10 text-theme hover:border-theme/40 hover:bg-theme/15",
          onClick: () => {
            window.location.href = `mailto:${displayValue}`;
            onClose();
          },
        },
      ]
    : [
        {
          key: "copy",
          label: copied ? "Copied" : "Copy number",
          desc: "Copy phone to clipboard",
          icon: copied ? <FiCheck size={18} /> : <FiCopy size={18} />,
          className: copyClass,
          onClick: handleCopy,
        },
        {
          key: "call",
          label: "Call",
          desc: "Start a phone call",
          icon: <MdPhone size={18} />,
          className:
            "border-theme/25 bg-goldenDark text-themeDark hover:border-theme/40 hover:bg-theme/10",
          onClick: () => {
            window.location.href = `tel:${linkPhone}`;
            onClose();
          },
        },
        {
          key: "whatsapp",
          label: "WhatsApp",
          desc: "Chat on WhatsApp",
          icon: <FaWhatsapp size={18} />,
          className:
            "border-themeGreen/30 bg-themeLightGreen text-themeGreen hover:border-themeGreen/50 hover:bg-[#21965322]",
          onClick: () => {
            window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer");
            onClose();
          },
        },
      ];

  return (
    <Dialog
      visible={open}
      onHide={() => {
        setCopied(false);
        onClose();
      }}
      dismissableMask
      className="font-nunito w-[92vw] max-w-md"
      header={
        <div className="pr-6">
          <p className="text-lg font-bold text-themeDark">
            {isEmail ? "Email actions" : "Phone actions"}
          </p>
          <p className="mt-0.5 text-sm font-medium text-theme truncate">
            {displayName}
          </p>
        </div>
      }
    >
      <div className="space-y-4 pt-1 pb-1">
        <div className="rounded-xl border border-theme/20 bg-theme/5 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-theme/70">
            {isEmail ? "Email" : "Phone"}
          </p>
          <p className="mt-1 break-all text-sm font-semibold text-themeDark">
            {displayValue}
          </p>
        </div>

        <div className="grid gap-2.5">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${action.className}`}
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm ring-1 ring-black/5">
                {action.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{action.label}</span>
                <span className="block text-xs opacity-70">{action.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

const TeamSizeChip = ({ value }) => {
  if (isBlankValue(value)) return <BlankChip />;

  const text = String(value).trim();

  return (
    <span
      title={text}
      className="inline-flex max-w-[7.5rem] items-center justify-center rounded-full bg-theme/10 px-2.5 py-1 text-[13px] font-medium text-theme ring-1 ring-inset ring-theme/25"
    >
      <span className="block max-w-full truncate">{text}</span>
    </span>
  );
};

const getPreferredDateStatus = (preferredDate) => {
  const preferred = dayjs(preferredDate).startOf("day");
  const today = dayjs().startOf("day");
  if (!preferred.isValid()) return null;

  const diff = preferred.diff(today, "day");
  if (diff < 0) return "passed";
  if (diff === 0) return "today";
  return "upcoming";
};

const PreferredDateCell = ({ preferredDate }) => {
  if (isBlankValue(preferredDate)) return <BlankChip />;

  const preferred = dayjs(preferredDate);
  if (!preferred.isValid()) return <BlankChip />;

  const status = getPreferredDateStatus(preferredDate);

  const statusMeta = {
    passed: {
      emoji: "😬",
      attentionClass: "text-[#EE4A4A]",
      attentionText:
        "Oops — this date already waved goodbye. A polite nudge to the client would be lovely!",
    },
    today: {
      emoji: "☕",
      attentionClass: "text-theme",
      attentionText:
        "Today’s the day! A friendly hello to the client would make their coffee dreams come true.",
    },
    upcoming: {
      emoji: "🙂",
      attentionClass: "text-theme/70",
      attentionText:
        "No rush — this one’s still warming up. Keep it on your radar for later.",
    },
  }[status];

  return (
    <div className="flex flex-col gap-1 min-w-[9.5rem]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cellTextClass}>
          {preferred.format("MM/DD/YYYY")}
        </span>
        {statusMeta && (
          <span className="text-sm leading-none" title={status} aria-label={status}>
            {statusMeta.emoji}
          </span>
        )}
      </div>
      {statusMeta && (
        <p className={`text-[11px] font-medium leading-snug ${statusMeta.attentionClass}`}>
          {statusMeta.attentionText}
        </p>
      )}
    </div>
  );
};

export default function FreeTastingPage() {
  const { isAllowed } = useUserType("admin");
  const { setToggle, toggle } = useDataContext();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    id: null,
    name: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    value: "",
    name: "",
  });

  const openContactActions = useCallback(({ type, value, name }) => {
    setActionModal({
      open: true,
      type,
      value: value || "",
      name: name || "",
    });
  }, []);

  const closeContactActions = useCallback(() => {
    setActionModal({ open: false, type: null, value: "", name: "" });
  }, []);

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

  const handleDeleteClick = useCallback((id, name = "") => {
    setDeleteModal({ visible: true, id, name: name || "" });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteModal?.id) return;
    setDeleteLoading(true);
    try {
      const res = await DeleteAPI(`api/v1/admin/get-in-touch/${deleteModal.id}`);
      if (res?.data?.success || res?.data?.status === "success") {
        success_toaster("Tasting request deleted successfully");
        setDeleteModal({ visible: false, id: null, name: "" });
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
      rows.map((row) => {
        const notesText = formatSearchValue(row?.notes);
        const phoneDisplay = isBlankValue(row?.phone)
          ? ""
          : formatPhoneWithPlus(row?.phone);
        return {
          id:
            row?.id != null && row?.id !== "" ? (
              <CellText>{String(row.id)}</CellText>
            ) : (
              <BlankChip />
            ),
          name: formatCellValue(row?.name, { capitalize: true }),
          email: (
            <ContactValueCell
              type="email"
              value={row?.email}
              name={row?.name}
              onOpenActions={openContactActions}
            />
          ),
          phone: (
            <ContactValueCell
              type="phone"
              value={row?.phone}
              name={row?.name}
              onOpenActions={openContactActions}
            />
          ),
          company: formatCellValue(row?.company, { capitalize: true }),
          teamSize: <TeamSizeChip value={row?.teamSize} />,
          _teamSizeText: formatSearchValue(row?.teamSize),
          preferredDate: (
            <PreferredDateCell preferredDate={row?.preferredDate} />
          ),
          _preferredDateText: row?.preferredDate
            ? dayjs(row.preferredDate).format("MM/DD/YYYY")
            : "",
          notes: notesText ? (
            <ClampedTextTooltip
              text={notesText}
              title={capitalizeWords(row?.name) || "Note"}
              lines={2}
              maxWidth="100%"
            />
          ) : (
            <BlankChip />
          ),
          _nameText: formatSearchValue(row?.name),
          _emailText: formatSearchValue(row?.email),
          _phoneText: phoneDisplay,
          _companyText: formatSearchValue(row?.company),
          _notesText: notesText,
          createdAt: row?.createdAt ? (
            <CellText>
              {dayjs(row.createdAt).format("MM/DD/YYYY hh:mm A")}
            </CellText>
          ) : (
            <BlankChip />
          ),
          action: (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row?.id, row?.name);
              }}
              className="border border-[#EE4A4A] text-[#EE4A4A] rounded-md p-2 hover:bg-[#EE4A4A] hover:text-white duration-150"
              title="Delete request"
            >
              <MdDelete size={18} />
            </button>
          ),
        };
      }),
    [rows, openContactActions, handleDeleteClick]
  );

  const columns = [
    { field: "id", header: "ID", sort: true, minWidth: "8rem" },
    { field: "name", header: "Name", sort: true },
    { field: "email", header: "Email", minWidth: "14rem" },
    { field: "phone", header: "Phone", minWidth: "14rem" },
    { field: "company", header: "Company" },
    { field: "teamSize", header: "Team Size" },
    { field: "preferredDate", header: "Preferred Date", minWidth: "18rem" },
    { field: "notes", header: "Notes", minWidth: "12rem" },
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

      <ContactActionsModal
        open={actionModal.open}
        onClose={closeContactActions}
        type={actionModal.type}
        value={actionModal.value}
        name={actionModal.name}
      />

      <Dialog
        header={
          <div>
            <p className="text-lg font-bold text-themeDark">Confirm delete</p>
            <p className="mt-0.5 text-sm font-medium text-theme">
              This can’t be undone
            </p>
          </div>
        }
        visible={deleteModal.visible}
        className="font-nunito w-[92vw] max-w-md"
        dismissableMask={!deleteLoading}
        onHide={() => {
          if (deleteLoading) return;
          setDeleteModal({ visible: false, id: null, name: "" });
        }}
      >
        <div className="space-y-4 pt-1 pb-1">
          <div className="rounded-xl border border-[#EE4A4A]/25 bg-[#EE4A4A14] px-3.5 py-3">
            <p className="text-sm text-themeDark leading-relaxed">
              Are you sure you want to delete
              {deleteModal.name ? (
                <>
                  {" "}
                  <span className="font-semibold text-themeDark">
                    {String(deleteModal.name)
                      .trim()
                      .split(/\s+/)
                      .map((w) =>
                        w
                          ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                          : w,
                      )
                      .join(" ")}
                  </span>
                  ’s
                </>
              ) : (
                " this"
              )}{" "}
              tasting request?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setDeleteModal({ visible: false, id: null, name: "" })
              }
              disabled={deleteLoading}
              className="rounded-lg border border-theme/30 px-4 py-2.5 text-sm font-medium text-theme hover:bg-theme/5 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="rounded-lg bg-[#EE4A4A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
