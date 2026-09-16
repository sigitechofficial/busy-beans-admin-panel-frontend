"use client";

import { useMemo, useState } from "react";
import Switch from "react-switch";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { error_toaster } from "@/utilities/Toaster";

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

export default function CustomerTransactionalEmails({ customerId }) {
  const [savingKey, setSavingKey] = useState("");
  const settingsUrl = useMemo(
    () =>
      `api/v1/admin/email-settings?type=customer&recipientId=${customerId}&page=1&limit=1`,
    [customerId],
  );
  const { data, reFetch } = GetAPI(settingsUrl);

  const payload = data?.data || {};
  const emails = payload.emails || [];
  const typeDefaults = payload.typeDefaults || {};
  const person = payload.recipients?.[0];

  const patchSetting = async (emailType, enabled) => {
    setSavingKey(emailType);
    try {
      await PatchAPI(
        "api/v1/admin/email-settings",
        {
          recipientType: "customer",
          recipientId: Number(customerId),
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

  if (!emails.length) return null;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Override for this customer only. Defaults for all customers are on Email
        Configuration. Login OTPs stay on.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {emails.map((item) => {
          const typeDefault = typeDefaults[item.key] !== false;
          const checked = item.locked
            ? true
            : person?.settings?.[item.key] !== false;
          const isOverride =
            !item.locked &&
            person?.settings?.[item.key] !== undefined &&
            person.settings[item.key] !== typeDefault;
          return (
            <label
              key={item.key}
              className="flex items-center justify-between gap-3 border rounded-lg px-3 py-3"
            >
              <span className="text-sm text-gray-800">
                {item.label}
                {item.locked ? (
                  <span className="block text-xs text-gray-500">Always on</span>
                ) : isOverride ? (
                  <span className="block text-xs text-theme">
                    Override (all-customers default is {typeDefault ? "on" : "off"})
                  </span>
                ) : (
                  <span className="block text-xs text-gray-500">
                    Matches all-customers default
                  </span>
                )}
              </span>
              <EmailSwitch
                checked={checked}
                disabled={item.locked || savingKey === item.key}
                onChange={(enabled) => {
                  if (item.locked) {
                    error_toaster("Auth emails cannot be turned off.");
                    return;
                  }
                  patchSetting(item.key, enabled);
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
