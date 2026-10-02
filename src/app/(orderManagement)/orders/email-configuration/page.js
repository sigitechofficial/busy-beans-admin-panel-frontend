"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Switch from "react-switch";
import { CiMenuBurger } from "react-icons/ci";
import MyDataTable from "@/components/ui/MyDataTable";
import EmailRecipientsCard from "@/components/ui/EmailRecipientsCard";
import Loader from "@/components/ui/Loader";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import { useDataContext } from "@/utilities/DataContext";
import { useUserType } from "@/utilities/useUserType";
import ErrorHandler from "@/utilities/ErrorHandler";
import { error_toaster, success_toaster } from "@/utilities/Toaster";

function EmailSwitch({ checked, disabled, onChange }) {
  return (
    <Switch
      onChange={onChange}
      checked={!!checked}
      disabled={disabled}
      uncheckedIcon={false}
      checkedIcon={false}
      onColor="#86644c"
      onHandleColor="#fff"
      className="react-switch"
      boxShadow="none"
      height={22}
      width={44}
    />
  );
}

export default function EmailConfigurationPage() {
  const router = useRouter();
  const { isAllowed, isSubAdmin } = useUserType(["admin"]);
  const { setToggle, toggle } = useDataContext();
  const [tab, setTab] = useState("customer");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    if (isSubAdmin) router.replace("/");
  }, [isSubAdmin, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const settingsUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", tab);
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (searchDebounced.trim()) params.set("search", searchDebounced.trim());
    return `api/v1/admin/email-settings?${params.toString()}`;
  }, [tab, page, limit, searchDebounced]);

  const { data: catalogData } = GetAPI("api/v1/admin/email-settings/catalog");
  const { data, isLoading, reFetch } = GetAPI(settingsUrl);

  const FALLBACK_TABS = [
    { type: "customer", label: "Customers", hasPeople: true },
    { type: "partner", label: "Local Partners", hasPeople: true },
    { type: "supplier", label: "Suppliers", hasPeople: true },
    { type: "employee", label: "Employees", hasPeople: true },
    { type: "subAdmin", label: "Sub Admins", hasPeople: true },
    { type: "hq", label: "HQ Admin", hasPeople: false },
    { type: "lead", label: "Leads", hasPeople: false },
  ];
  const tabs = catalogData?.data?.tabs?.length
    ? catalogData.data.tabs
    : FALLBACK_TABS;
  const payload = data?.data || {};
  const emails = payload.emails || [];
  const typeDefaults = payload.typeDefaults || {};
  const recipients = payload.recipients || [];
  const pagination = payload.pagination || {};
  const defaultSupplierId = payload.defaultSupplierId || null;
  const currentTab = tabs.find((item) => item.type === tab) || tabs[0];
  const hasPeople = Boolean(currentTab?.hasPeople) && tab !== "customer";

  const patchSetting = async ({ recipientId, emailType, enabled }) => {
    const key = `${recipientId}:${emailType}`;
    setSavingKey(key);
    try {
      await PatchAPI(
        "api/v1/admin/email-settings",
        {
          recipientType: tab,
          recipientId,
          emailType,
          enabled,
        },
        "",
        { suppressSuccessToast: true },
      );
      await reFetch();
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setSavingKey("");
    }
  };

  const setDefaultSupplier = async (supplierId) => {
    setSavingKey(`default:${supplierId}`);
    try {
      await PatchAPI(
        "api/v1/admin/email-settings/default-supplier",
        { supplierId },
        "",
        { suppressSuccessToast: true },
      );
      success_toaster("Default supplier updated.");
      await reFetch();
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setSavingKey("");
    }
  };

  const peopleColumns = useMemo(() => {
    const cols = [
      {
        header: "Name",
        field: "name",
        minWidth: "160px",
      },
      {
        header: "Email",
        field: "email",
        minWidth: "200px",
      },
    ];
    if (tab === "customer") {
      cols.push({ header: "Company", field: "companyName", minWidth: "140px" });
    }
    if (tab === "employee") {
      cols.push({ header: "Employee of", field: "employeeOf", minWidth: "140px" });
    }
    emails.forEach((item) => {
      cols.push({
        header: item.label,
        field: item.key,
        minWidth: "140px",
        body: (row) => (
          <EmailSwitch
            checked={item.locked ? true : row.settings?.[item.key]}
            disabled={item.locked || savingKey === `${row.id}:${item.key}`}
            onChange={(enabled) => {
              if (item.locked) {
                error_toaster("Auth emails cannot be turned off.");
                return;
              }
              patchSetting({
                recipientId: row.id,
                emailType: item.key,
                enabled,
              });
            }}
          />
        ),
      });
    });
    if (tab === "supplier") {
      cols.push({
        header: "Default",
        field: "isDefaultSupplier",
        minWidth: "140px",
        body: (row) =>
          row.isDefaultSupplier || Number(defaultSupplierId) === Number(row.id) ? (
            <span className="text-sm font-medium text-theme">Default</span>
          ) : (
            <button
              type="button"
              className="text-sm underline text-theme"
              disabled={savingKey === `default:${row.id}`}
              onClick={() => setDefaultSupplier(row.id)}
            >
              Make default
            </button>
          ),
      });
    }
    return cols;
  }, [emails, tab, savingKey, defaultSupplierId]);

  if (!isAllowed || isSubAdmin) return <Loader />;

  return (
    <div className="w-full">
      <div className="w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] bg-white z-10 flex items-center justify-between h-[70px] 2xl:h-[94px] border-b px-6 2xl:px-12 fixed">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setToggle(!toggle)}
            className="cursor-pointer md:hidden"
          >
            <CiMenuBurger size={20} />
          </p>
          <h2 className="text-xl font-inter font-semibold">Email Configuration</h2>
        </div>
      </div>

      <div className="space-y-6 pb-6 pt-28 2xl:pt-32 px-6 2xl:px-12">
        <p className="text-gray-600 text-sm max-w-3xl">
          Turn emails on or off by recipient type. Per-customer switches live on
          each customer profile. Login and forgot-password OTPs stay on for
          every role.
        </p>

        <EmailRecipientsCard />

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                setTab(item.type);
                setSearch("");
                setSearchDebounced("");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg border text-sm ${
                tab === item.type
                  ? "bg-theme text-white border-theme"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-borderColor shadow-tableShadow space-y-4">
          <h3 className="font-semibold text-gray-800">Type defaults</h3>
          <p className="text-sm text-gray-500">
            These apply to everyone in this tab unless a person has an override.
            {tab === "customer"
              ? " Per-customer overrides are on the customer profile page."
              : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {emails.map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-3 border rounded-lg px-3 py-3"
              >
                <span className="text-sm text-gray-800">
                  {item.label}
                  {item.locked ? (
                    <span className="block text-xs text-gray-500">Always on</span>
                  ) : null}
                </span>
                <EmailSwitch
                  checked={item.locked ? true : typeDefaults[item.key] !== false}
                  disabled={item.locked || savingKey === `0:${item.key}`}
                  onChange={(enabled) => {
                    if (item.locked) {
                      error_toaster("Auth emails cannot be turned off.");
                      return;
                    }
                    patchSetting({
                      recipientId: 0,
                      emailType: item.key,
                      enabled,
                    });
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {hasPeople && (
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-borderColor shadow-tableShadow">
            {isLoading ? (
              <p className="text-center py-10 text-gray-500">Loading people...</p>
            ) : (
              <MyDataTable
                data={recipients}
                columns={peopleColumns}
                pagination
                search
                searchValue={search}
                onSearchChange={setSearch}
                placeholder="Search name or email"
                serverPagination={{
                  page: pagination.page ?? page,
                  limit: pagination.limit ?? limit,
                  totalRecords: pagination.total ?? 0,
                  totalPages:
                    Math.ceil((pagination.total || 0) / (pagination.limit || limit)) ||
                    0,
                  onPageChange: setPage,
                  onLimitChange: (nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  },
                }}
                dataKey="id"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
