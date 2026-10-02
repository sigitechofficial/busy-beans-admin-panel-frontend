"use client";

import { useEffect, useState } from "react";
import Switch from "react-switch";
import GetAPI from "@/utilities/GetAPI";
import { PatchAPI } from "@/utilities/PatchAPI";
import ErrorHandler from "@/utilities/ErrorHandler";
import { success_toaster, error_toaster } from "@/utilities/Toaster";

const INPUT = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-theme";

/**
 * Who receives lead / enquiry emails (backend utils/emailRecipients.js):
 * developer copy, Busy Beans staff for "new lead" alerts, and a test recipient for staging that
 * receives every customer-facing lead email instead of the customer.
 */
export default function EmailRecipientsCard() {
  const { data, reFetch } = GetAPI("api/v1/admin/email-settings/recipients");
  const settings = data?.data;
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      developerCopyEmail: settings.developerCopyEmail || "",
      developerCopyEnabled: Boolean(settings.developerCopyEnabled),
      leadAlertTo: (settings.leadAlertTo || []).join(", "),
      customerTestRecipient: settings.customerTestRecipient || "",
    });
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await PatchAPI("api/v1/admin/email-settings/recipients", form, "", { suppressSuccessToast: true });
      if (res?.data?.status && res.data.status !== "success") {
        error_toaster(res.data.message || "Could not save recipients.");
      } else {
        success_toaster("Email recipients saved.");
        await reFetch();
      }
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-borderColor shadow-tableShadow text-sm text-gray-500">
        Loading email recipients…
      </div>
    );
  }
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-borderColor shadow-tableShadow space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800">Lead &amp; enquiry email recipients</h3>
        <p className="text-sm text-gray-500 mt-1">
          Applies to coffee machine leads (website, admin, Meta), quotations and get-in-touch / tasting enquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="rcpt-dev">Developer copy</label>
          <input id="rcpt-dev" type="email" className={INPUT} value={form.developerCopyEmail} onChange={set("developerCopyEmail")} placeholder="developer@example.com" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Switch
              onChange={(v) => setForm((f) => ({ ...f, developerCopyEnabled: v }))}
              checked={form.developerCopyEnabled}
              uncheckedIcon={false}
              checkedIcon={false}
              onColor="#86644c"
              onHandleColor="#fff"
              boxShadow="none"
              height={22}
              width={44}
            />
            {form.developerCopyEnabled ? "Copied on every lead, quotation and enquiry email" : "Off"}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="rcpt-alert">New lead alerts (Busy Beans staff)</label>
          <textarea id="rcpt-alert" rows={3} className={INPUT} value={form.leadAlertTo} onChange={set("leadAlertTo")} placeholder="sales@busybeancoffee.com, owner@busybeancoffee.com" />
          <p className="text-xs text-gray-500">
            Separate addresses with commas.
            {settings?.adminNotifyEmailFallback ? " Empty = the server's admin notification address." : " Empty = only the developer copy."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="rcpt-test">Test recipient (staging)</label>
          <input id="rcpt-test" type="email" className={INPUT} value={form.customerTestRecipient} onChange={set("customerTestRecipient")} placeholder="Leave empty on production" />
          <p className="text-xs text-gray-500">
            When set, customer emails (request received, quotation) go only to this address — never to the real customer.
          </p>
          {form.customerTestRecipient ? (
            <p className="text-xs font-medium text-amber-700">Test mode is on: customers do not receive these emails.</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-theme text-white text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save recipients"}
        </button>
      </div>
    </div>
  );
}
