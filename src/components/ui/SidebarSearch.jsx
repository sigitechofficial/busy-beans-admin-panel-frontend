"use client";

import { useLayoutEffect } from "react";
import { MdSearch } from "react-icons/md";
import { IoClose } from "react-icons/io5";

/**
 * Sidebar search. While a query is typed, Leftbar opens every section (EXPAND_ALL) so all menu
 * entries the user may see are rendered — permission checks stay exactly as they are — and
 * useSidebarNavFilter hides the entries that do not match. Entries are ListHead / ListItems
 * (marked with data-nav-head / data-nav-item + data-nav-title).
 */

/** Stand-in for Leftbar's `active` state during a search: every section reads as open. */
export const EXPAND_ALL = new Proxy(
  {},
  { get: (_, key) => ({ tab: typeof key === "string" ? key : "", status: true }) },
);

const HIDDEN = "data-nav-search-hidden";
const normalise = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

function hide(el) {
  if (el.style.display === "none") return;
  el.style.display = "none";
  el.setAttribute(HIDDEN, "");
}

/**
 * Show only matching entries: an item matches on its own name or its section's name; a section
 * heading stays when it matches or has a matching item. Runs after every render (before paint),
 * so entries that re-render (e.g. counts) stay filtered. Returns nothing; toggles `emptyRef`.
 */
export function useSidebarNavFilter(rootRef, query, emptyRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Undo the previous pass.
    root.querySelectorAll(`[${HIDDEN}]`).forEach((el) => {
      el.style.display = "";
      el.removeAttribute(HIDDEN);
    });
    const q = normalise(query);
    if (emptyRef?.current) emptyRef.current.hidden = true;
    if (!q) return;

    const entries = [...root.querySelectorAll("[data-nav-head], [data-nav-item]")];
    let head = null;
    let headMatches = false;
    let headHasMatch = false;
    let visible = 0;
    const closeHead = () => {
      if (head && !headMatches && !headHasMatch) hide(head);
    };
    for (const el of entries) {
      const title = normalise(el.getAttribute("data-nav-title"));
      if (el.hasAttribute("data-nav-head")) {
        closeHead();
        head = el;
        headMatches = title.includes(q);
        headHasMatch = false;
        if (headMatches) visible += 1;
        continue;
      }
      if (headMatches || title.includes(q)) {
        headHasMatch = true;
        visible += 1;
      } else {
        hide(el);
      }
    }
    closeHead();

    // Section wrappers left with nothing visible would still take up space.
    const wrappers = new Set(entries.filter((el) => el.hasAttribute("data-nav-item")).map((el) => el.parentElement));
    wrappers.forEach((w) => {
      if (!w || w === root) return;
      const shown = [...w.querySelectorAll("[data-nav-head], [data-nav-item]")].some((el) => el.style.display !== "none");
      if (!shown) hide(w);
    });

    if (emptyRef?.current) emptyRef.current.hidden = visible > 0;
  });
}

/** First visible menu link (Enter in the search box opens it). */
export function firstVisibleNavLink(root) {
  if (!root) return null;
  return [...root.querySelectorAll("[data-nav-head] a[href], a[data-nav-item][href]")].find((a) => {
    if (a.getAttribute("href") === "#") return false;
    for (let el = a; el && el !== root; el = el.parentElement) if (el.style.display === "none") return false;
    return true;
  });
}

export function SidebarSearchInput({ value, onChange, onEnter }) {
  return (
    <div className="px-3 pt-3 pb-1 md:px-2">
      <div className="relative">
        <MdSearch size={18} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onChange("");
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
          placeholder="Search menu…"
          aria-label="Search menu"
          data-testid="leftbar-search-input"
          className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-8 text-sm font-inter text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:bg-white [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear menu search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-200"
          >
            <IoClose size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
