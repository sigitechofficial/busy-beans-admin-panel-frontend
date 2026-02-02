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
  - When “Add Item” modal opens, call **POST** `api/v1/admin/sales-rep-products-for-order-creation/${salesRepId}` with **no body** (undefined).
  - Use `res?.data?.products` as the primary source for the product list in the modal.
  - Show loader while fetching; show “No products to show” when list is empty; search and category filter via `getFilteredModalProducts()`.

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

*Summary generated from today’s session.*
