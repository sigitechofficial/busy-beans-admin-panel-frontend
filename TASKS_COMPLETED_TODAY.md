# Tasks Completed Today

## 1. Leftbar (drawer) – open by default fix
- **Issue:** Drawer opened by default when logging in and navigating to dashboard.
- **Changes:** 
  - `ListHead.jsx`: On mobile nav link click, call `setToggle(false)` (was `setToggle(true)`).
  - `ListItems.jsx`: On sub-item link click, call `setToggle(false)` (was `setToggle(true)`).
  - `LayoutWrapper.jsx`: Added `ResetDrawerOnProtectedRoute` component that calls `setToggle(false)` in `useLayoutEffect` when on a protected route (so drawer is closed after login/navigation).

## 2. Leftbar – no glimpse on navigate
- **Issue:** Brief flash of leftbar before it closed when navigating to dashboard.
- **Changes:** 
  - `ResetDrawerOnProtectedRoute`: Switched from `useEffect` to `useLayoutEffect` so `setToggle(false)` runs before paint.
  - `Leftbar.jsx`: Added `pastFirstPaint` state and `mobileVisible = pastFirstPaint && toggle` so the drawer is hidden on first paint when it mounts.

## 3. Leftbar – open/close animation
- **Changes in `Leftbar.jsx`:**
  - Slide: `-translate-x-full` when closed, `translate-x-0` when open, with `transition-transform duration-300 ease-out`.
  - Backdrop when open on mobile: semi-transparent overlay, fade in/out, click to close.
  - Close button: `setToggle(false)`, `aria-label`, `cursor-pointer`.

## 4. Leftbar – mobile enhancements
- **Changes in `Leftbar.jsx`:**
  - `max-md:select-none`, `max-md:touch-pan-y` for touch behavior.
  - Close button: `focus-visible:ring-2` for accessibility.
  - Nav list: `space-y-2 md:space-y-1` for spacing.
  - Mobile header: `pt-[max(0.75rem,env(safe-area-inset-top))]` for notched devices.
- **`globals.css`:** `.leftbar-nav-scroll` with `-webkit-overflow-scrolling: touch` for smooth scroll on iOS.

## 5. Partner orders add-invoice – products from POST API
- **Page:** `/orders/partnerOrders/detail/[orderID]/add-invoice`
- **Changes:**
  - When "Add Item" modal opens, call **POST** `api/v1/admin/sales-rep-products-for-order-creation/${salesRepId}` with **no body** (undefined).
  - Use `res?.data?.products` as the primary source for the product list in the modal.
  - Show loader while fetching; show "No products to show" when list is empty; search and category filter via `getFilteredModalProducts()`.

## 6. Partner orders add-invoice – unit price and total
- **Issue:** API sends `price` as line total (e.g. 2 items = $40), not unit price.
- **Changes:**
  - When loading items from API: set `unit = price / qty` (unit price), store `qty` as number.
  - Added `getItemUnitPrice(item)` and use it for Unit $ column and Total $ column.
  - Unit $ = unit price; Total $ = unit price × qty.
  - Grand total and API payload: use `getItemUnitPrice` and send line total as `(qty * unit)` in `price` for product items.

## 7. Partner orders add-invoice – Qty input not updating
- **Issue:** Changing qty updated the total but the input value did not change.
- **Cause:** Table body was mapping over `data?.data?.order?.items` (raw API) instead of `items` (state).
- **Changes:**
  - Table body now uses `items.map(...)` so the qty input is bound to state.
  - Input value: `value={item.qty === "" || item.qty == null ? "" : String(item.qty)}`.
  - `setItems` from API only when `prev.length === 0` so user edits are not overwritten by refetch.
  - Qty input: `type="text"`, `inputMode="numeric"`, `pattern="[0-9]*"` for reliable typing.

## 8. Partner orders add-invoice – go back on Create Invoice success
- **Change:** On successful Create Invoice API response (`res?.data?.status === "success"`), after `reFetch()`, call `window.history.back()` so the user returns to the previous page (e.g. partner order detail).

---

## 9. Dashboard-2 responsiveness
- **Page:** `/dashboard-2`
- **Change:** "Welcome, Administrator" section made responsive for screens below 768px.

## 10. Auth screens responsiveness
- **Pages:** `/sign-in`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Change:** Applied responsive layout and styling for smaller screens.

## 11. Orders detail – Send Invoice (Resend Paid Invoice)
- **Page:** `/orders/detail/[orderID]`
- **Change:** "Resend Paid Invoice" now calls **POST** `api/v1/admin/order-management/email-helper` with the correct payload when `paymentStatus` is "done".

## 12. Create-invoice – Add Items modal UI and three-case order creation
- **Page:** `/create-invoice`
- **Changes:**
  - Add Items modal UI aligned with partner add-invoice (SKU, code, weight, wholesale price).
  - View mode: Admin vs Local Partner; partner selection modal.
  - Customer list: not-assigned for Admin, partner's customers for Local Partner.
  - Product source and Add Item modal: GET products for admin; POST `sales-rep-products-for-order-creation/{salesRepId}` for partner/self order.
  - Generate invoice endpoint and payload for: admin customer, partner + partner inventory, partner (self) order.
  - Form fields reset when user type or customer/partner toggle changes.
  - **Admin creating for partner / Partner self order:** unit price for new item = wholesale price.

## 13. Create-invoice – Partner self order details in drawer
- **Page:** `/create-invoice`
- **Changes:**
  - Order Details (product list, subtotal, shipping) in drawer now show for self order (`isSelfOrder`).
  - Default address pre-filled for self order; address validation relaxed.
  - Add Items modal for partner self order uses **POST** `api/v1/admin/sales-rep-products-for-order-creation/{userID}` (partner's own inventory).
  - Unit price for new item in partner view + self order = wholesale price.

## 14. Direct-invoices [invoiceId]/add-invoice – Add Items modal and product source
- **Page:** `/direct-invoices/[invoiceId]/add-invoice`
- **Changes:**
  - Add Items modal UI matches create-invoice (detailed product info, search/category filters, responsive dialog).
  - Local partner order (has `salesRepId`): modal fetches via **POST** `api/v1/admin/sales-rep-products-for-order-creation/{salesRepId}`.
  - Otherwise (admin customer): **GET** `api/v1/admin/product`.

## 15. Direct-invoices partner [partnerInvoiceId]/add-invoice – unit price and product source
- **Page:** `/direct-invoices/partner/[partnerInvoiceId]/add-invoice`
- **Changes:**
  - Unit price for items from API: `unit = price / qty`; API payload sends line total (qty × unit).
  - Add Items modal for partner direct invoice uses **POST** `api/v1/admin/sales-rep-products-for-order-creation/{salesRepId}` (logged-in partner's inventory).

---

*Summary updated Jan 30, 2025. Tasks 1–8 from earlier session; 9–15 completed today/yesterday.*
