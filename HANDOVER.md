# Busy Beans Admin Panel — Enterprise Handover Guide

**Product:** Busy Beans Coffee Admin & Partner Operations Platform  
**Repository:** `busy-beans-admin-panel`  
**Audience:** Engineers, QA, product owners, and operations staff taking ownership of this frontend  
**Last updated:** August 2026

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [What this platform is (and is not)](#2-what-this-platform-is-and-is-not)
3. [Tech stack](#3-tech-stack)
4. [Architecture overview](#4-architecture-overview)
5. [Environments & configuration](#5-environments--configuration)
6. [Authentication, roles & permissions](#6-authentication-roles--permissions)
7. [Feature catalog (by domain)](#7-feature-catalog-by-domain)
8. [Rationale — why features exist](#8-rationale--why-features-exist)
9. [Key user journeys](#9-key-user-journeys)
10. [Integrations](#10-integrations)
11. [Codebase map](#11-codebase-map)
12. [API & data conventions](#12-api--data-conventions)
13. [UI / design conventions](#13-ui--design-conventions)
14. [Local development](#14-local-development)
15. [Testing & QA checklist](#15-testing--qa-checklist)
16. [Operational runbooks](#16-operational-runbooks)
17. [Known gaps & tech debt](#17-known-gaps--tech-debt)
18. [Handover checklist](#18-handover-checklist)
19. [Glossary](#19-glossary)

---

## 1. Executive summary

Busy Beans is a **B2B coffee wholesale** business. This repository is the **web operations console** used by:

| Portal | Who uses it | Primary job |
|--------|-------------|-------------|
| **Admin** | Busy Beans HQ staff & employees | Run orders, customers, suppliers, invoices, QuickBooks sync, subscriptions, reports |
| **Sales Representative (Local Partner)** | Partner / sales-rep accounts | Manage their customers, create orders/quotations, wallet, Stripe Connect, partner reports |
| **Supplier** | Fulfillment partners | Acknowledge, dispatch, and ship assigned orders |

One Next.js codebase serves **three portals**. Navigation and allowed screens change based on `userType` and permission keys stored after login.

Business data lives on a separate REST backend (`api/v1/admin/...`). This app is a **thick SPA on Next.js App Router** — almost no business rules are enforced only in the UI; the backend is the system of record.

---

## 2. What this platform is (and is not)

### It is

- An authenticated admin / partner / supplier operations UI
- Order lifecycle management (customer + partner tracks)
- CRM for customers, local partners (sales reps), and suppliers
- Invoicing & PDF download flows
- QuickBooks Online sync surfaces
- Stripe Connect onboarding for partners/employees
- Machine subscription & leads CRM
- Reporting dashboards
- Push notification composition (Firebase Cloud Messaging)

### It is not

- The public customer storefront
- The primary backend API (see `BASE_URL` backends)
- A CMS (no Sanity or similar content system in this repo)
- A TypeScript codebase (JS/JSX)

---

## 3. Tech stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | **Next.js 16** (App Router) | `npm run dev` uses Turbopack |
| UI | **React 19** | Client-heavy `"use client"` pages |
| Styling | **Tailwind CSS 3.4** | Brand theme `#86644C` (`theme`) |
| Component libs | PrimeReact, react-select, react-icons, react-toastify | Tables, dialogs, selects, toasts |
| Forms | Formik + Yup | Schemas under `src/schema` |
| HTTP | Axios | Shared instance in `StatusErrorHandler.js` |
| Charts | react-chartjs-2 | Dashboard / reports |
| PDF | html2pdf.js | Invoice downloads |
| Maps | `@react-google-maps/api` | Address / geo UX |
| DnD | `@dnd-kit` | Leads Kanban |
| i18n | next-intl | Locales: `en`, `es` |
| Payments (client) | `@stripe/stripe-js` | Card + Connect |
| Notifications | Firebase FCM | Project `busybeancoffee` |
| Bot protection | Google reCAPTCHA | Sign-in + `/api/captcha` |

---

## 4. Architecture overview

```text
┌─────────────────────────────────────────────────────────┐
│  Browser (admin.busybeancoffee.com / stage / localhost) │
│  Next.js App Router + client pages                      │
│  LayoutWrapper → Header + Leftbar + ProtectedRoute      │
└───────────────────────────┬─────────────────────────────┘
                            │ Bearer JWT (localStorage)
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Busy Beans Backend (BASE_URL)                          │
│  api/v1/admin/*, qbo/*, Stripe-related endpoints        │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
         QuickBooks Online      Stripe / Stripe Connect
                │
                ▼
         Firebase (FCM), Google Maps, reCAPTCHA, GTM
```

### Portal routing model

- Folders like `(orderManagement)` are **route groups** — they organize code but **do not appear in the URL**.
- Example: `src/app/(orderManagement)/orders/page.js` → `/orders`
- Sales-rep UI lives under `/sales-representative/...`
- Supplier UI lives under `/supplier/...`

### Auth gate

Non-auth pages render inside `ProtectedRoute`. Without a valid token / login status / permissions, the user is redirected to sign-in.

---

## 5. Environments & configuration

**Source of truth:** `src/utilities/URL.js`

```js
const ENV = "production"; // "local" | "staging" | "production"
```

| Mode | Backend `BASE_URL` | Admin UI `RETURN_URL` |
|------|--------------------|------------------------|
| `local` | LAN backend (e.g. `http://192.168.x.x:8013/`) | Local `:3000` |
| `staging` | `https://testingbb.trimworldwide.com/` | `https://stageadmin.busybeancoffee.com/` |
| `production` | `https://backendbb.trimworldwide.com/` | `https://admin.busybeancoffee.com/` |
| `aws` (legacy block) | `https://backend.busybeancoffee.com/` | Amplify URL |

Also configured in the same file / related modules:

- `STRIPE_PUBLIC_KEY` (test vs live by ENV)
- `GOOGLE_API_KEY`
- `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY`
- Firebase client config (`src/utilities/firebase.js`)

### Switching environments

1. Change `ENV` in `URL.js`
2. Restart `npm run dev` / redeploy
3. Confirm Network tab calls hit the expected `BASE_URL`

> **Security note:** API keys and Stripe public keys are committed in client JS. Treat rotation and secret hygiene as an ops/security follow-up. Never commit private Stripe keys.

---

## 6. Authentication, roles & permissions

### Login personas

| UI tab / type | Stored `userType` | Login API (typical) |
|---------------|-------------------|---------------------|
| Admin | `admin` | `POST api/v1/admin/login` |
| Sales Rep | `salesRepresentative` | `POST api/v1/admin/login/sales-rep` |
| Supplier | `supplier` | `POST api/v1/admin/login/supplier` |

Related auth pages: `/sign-in`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-login-otp`.

### What is stored in the browser

After login (localStorage), commonly:

- `accessToken` — Bearer token for Axios
- `userType` — portal switch
- `permissions` — feature ACL
- `partnerType` — e.g. `direct-partner`, `dropship-partner`
- `isEmployee` / `employeeOf` — employee-of-admin vs employee-of-partner nuances
- Stripe Connect related fields where applicable
- FCM device token when notifications are enabled

### Permission model

- Helper: `hasPermission(featureKey)` in `src/utilities/Permission.js`
- Page guard: `useUserType(["admin", ...])`
- Permission strings usually follow `{resource}_{action}` e.g. `customer_view`, `orders_update`
- Special value `"all"` typically means unrestricted admin

**Example permission domains:** dashboard, orders, supplier, invoice, customer, selected-customer, local-partner, category, product, employees, country, charges, payment-pullout, report, quotation, account, wallet, subscription, machine, addon, leads-dashboard, quickbooks, quickbooks-invoices.

### Why this design

- One frontend supports HQ, partners, and suppliers without three separate apps.
- Backend still authorizes every mutating call; UI permissions mainly **hide/disable** unauthorized actions and reduce support errors.

---

## 7. Feature catalog (by domain)

### 7.1 Dashboard

| Path | Purpose |
|------|---------|
| `/`, `/dashboard-2` | Operational home — cards, charts, quick status |

**Rationale:** Give HQ / partners a single landing view of volume and health without opening every module.

---

### 7.2 Order management (core)

| Path | Purpose |
|------|---------|
| `/orders` | Customer order list / hub |
| `/orders/create` | Create customer order (admin) |
| `/orders/new-orders`, `/orders/upcoming-orders`, `/orders/acknowledged`, `/orders/assigned`, `/orders/dispatched`, `/orders/shipped`, `/orders/cancelled` | Lifecycle buckets |
| `/orders/detail/[orderID]` | Full order detail, tracking, deliver-to / invoice-to, shipping contact |
| `/orders/detail/[orderID]/edit` | Edit shipping/billing on order |
| `/orders/detail/[orderID]/add-invoice`, `.../invoice` | Invoice create / view / PDF |
| `/orders/partnerOrders/*` | Parallel lifecycle for partner orders |
| `/orders/emails`, `/orders/email-logs` | Order email tooling & audit |
| `/orders/delete-invoice` | Controlled invoice deletion utility |
| `/orders/pending-pullouts/[supplierID]` | Pullout-related order views |
| `/orders/quickbooks/customer`, `/orders/quickbooks/partner` | QBO sync queues (synced/unsynced invoices & payments) |

**Rationale:** Coffee wholesale fulfillment is stage-based (new → ship). Splitting lists by status reduces ops mistakes. Partner orders are a **separate track** because pricing, credit, and fulfillment rules differ from HQ customer orders.

**Notable behaviors:**

- Tracking number can be updated from order detail (validated length / charset).
- Deliver To can show **Shipping Contact** from `order.address.shippingContact` (fallback: customer addresses).
- Manual Sync on QuickBooks customer page calls lambda sync for unsynced paid payments; `partial-success` shows a **single warning toast** (interceptor success toast suppressed).

---

### 7.3 Customers (CRM)

| Path | Purpose |
|------|---------|
| `/customers` | Customer list |
| `/customers/add`, `/customers/edit/[userId]` | Create / update |
| `/customers/[userId]` | Customer profile (shipping/billing, shipping contact, orders, discounts) |
| `/active-clients`, `/inactive-clients` | Status filters |

**Sales-rep mirror:** `/sales-representative/.../customers*` (scoped to that partner’s book of business).

**Rationale:** Customers are the commercial unit of record — addresses, contacts, tax IDs, category discounts, and order history must be editable by HQ and (where permitted) partners.

**Update contract notes (customer edit):**

- PATCH `api/v1/admin/customer-update/{id}`
- Shipping payload key is **`addresses`** (not `address`) and must include address **`id`**
- `shippingContact` is sent inside **`addresses`**
- Detail page displays `customer.addresses[0].shippingContact`

---

### 7.4 Local partners (Sales Representatives) — admin CRM

| Path | Purpose |
|------|---------|
| `/sale-representative` | Partner list |
| `/sale-representative/add`, `/edit/...`, `/details/[userId]` | CRUD / profile |

**Rationale:** Local partners sell Busy Beans into their territories. HQ needs master data, credit limits, and assignment visibility separate from end customers.

---

### 7.5 Sales representative portal

| Area | Example paths | Purpose |
|------|---------------|---------|
| Customers | `/sales-representative/.../customers` | Partner-owned CRM |
| Orders | `.../create-order`, `.../upcoming-orders` | Sell & schedule |
| Quotation | `.../quotation` | Quotes before firm orders |
| Inventory | `.../inventory/stock` | What they can sell |
| Wallet | `.../wallet` | Partner balance / funds UX |
| Reports | `.../reports/*` | Partner performance |
| Stripe | `.../stripe-account-connected` | Connect onboarding result |

**Rationale:** Partners operate independently but must stay inside Busy Beans commercial rules (catalog, pricing, credit). A dedicated portal keeps admin complexity out of partner workflows.

---

### 7.6 Suppliers (admin + portal)

**Admin CRM**

| Path | Purpose |
|------|---------|
| `/suppliers`, `/suppliers/add`, `/suppliers/details/[userId]` | Supplier master data |
| `/active-supplier`, `/inactive-supplier` | Status filters |

**Supplier portal**

| Path | Purpose |
|------|---------|
| `/supplier/new-orders`, `assigned-orders`, `acknowledge-orders`, `dispatched-orders`, `shiped-orders`, `cancelled-orders` | Fulfillment queue |
| `/supplier/order-detail/[orderID]` | Fulfillment detail |
| `/supplier/partner/*` | Partner-order fulfillment variants |
| `/supplier/reports/*` | Supplier-facing reports |

**Rationale:** Decouple selling from warehouse/fulfillment. Suppliers only see work assigned to them, reducing data leakage and UI noise.

---

### 7.7 Invoicing

| Path | Purpose |
|------|---------|
| `/create-invoice`, `/create-invoice/add-items` | Standalone invoice builder |
| `/all-invoices`, `/invoices`, `/invoices/[userId]` | Invoice lists / per-customer |
| `/direct-invoices`, `/direct-invoices/...` | Direct invoice flows (incl. partner nested) |
| `/individual-invoices` | Individual invoice views |

**Rationale:** Not every billable event is a standard catalog order. Direct/individual invoices support ad-hoc commercial cases while still feeding accounting sync.

---

### 7.8 QuickBooks Online

| Path | Purpose |
|------|---------|
| `/Quickbooks` | Connection / auth entry |
| `/Quickbooks/clients` | Customer sync / import surfaces |
| `/Quickbooks/invoices` | Pullout-intent / invoice sync tooling |
| `/orders/quickbooks/customer` | Customer order invoice & payment sync queues + **Manual Sync** |
| `/orders/quickbooks/partner` | Partner order sync queues |

**Rationale:** Finance requires invoices/payments in QBO. The admin UI exposes **selective and bulk sync** so ops can recover failed syncs without engineering every time.

---

### 7.9 Pullouts & collections

| Path | Purpose |
|------|---------|
| `/pullouts` | Payment pullouts |
| `/add-cheque`, `/collection-history`, `/cheques-due-date` | Cheque collection (pages exist; nav may be partially commented) |
| `/add-disbursement`, `/disbursement-history` | Disbursements (similar nav note) |

**Rationale:** Wholesale often mixes card, invoice terms, and cheque pullouts. Dedicated modules track cash timing and reconciliation separately from order status.

---

### 7.10 Catalog, inventory, shipping, zones

| Domain | Paths | Purpose |
|--------|-------|---------|
| Categories | `/category`, `/sub-category` | Product taxonomy |
| Inventory | `/inventory/stock` (+ sales-rep mirror) | Stock visibility |
| Shipping charges | `/shipping-charges` | Weight/zone rate tables |
| Zones | `/countries` → state → city / territory | Geo hierarchy for coverage & shipping |

**Rationale:** Pricing and fulfillment depend on product hierarchy, available stock, and destination geography.

---

### 7.11 Machine subscriptions, addons & leads

| Path | Purpose |
|------|---------|
| `/subscription`, `/purchased`, `/addons`, `/add-ons` | Machine / subscription catalog & purchases |
| `/subscription-requests` | Pending subscription requests |
| `/leads`, `/leads/[id]` | Lead pipeline (Kanban, timeline, follow-ups) |

**Rationale:** Busy Beans also places/serves coffee machines. Subscriptions and lead CRM support hardware + recurring revenue, which is a different funnel from bag-coffee wholesale orders.

---

### 7.12 Reports

Admin hub: `/reports` plus specialized pages, including:

- Partner commission / credit limit / unpaid balances
- Products sale, product-wise sales summary
- Customers / direct-partner reports
- Sales by customer summary & details
- Pulled orders receivable

Partner and supplier portals expose **scoped** report subsets.

**Rationale:** Finance and sales leadership need aggregations that order lists cannot provide. Reports are read-mostly API consumers with filters/export.

---

### 7.13 Free tasting

| Path | Purpose |
|------|---------|
| `/free-tasting` | Inbound tasting / get-in-touch submissions |

**Capabilities:** searchable table, preferred-date attention states, notes popover with copy, email/phone action modal, confirm-delete, brand-aligned chips/icons.

**Rationale:** Marketing/sales capture tasting interest; ops need a triage inbox without mixing it into full customer CRM until converted.

---

### 7.14 Notifications

| Path | Purpose |
|------|---------|
| `/supplier-notifications`, `/clients-notifications`, `/notification-alerts` | Compose / manage push-style alerts |

**Rationale:** Operational messages (status changes, campaigns) need controlled broadcast to suppliers or clients via FCM.

---

### 7.15 Employees, roles & payouts

| Path | Purpose |
|------|---------|
| `/employee`, `/employee/[id]` | **Active** employee management UI |
| `/payouts` | Payout operations |
| `/employees`, `/add-general-employee`, `/add-sale-representative` | Older employee add flows (legacy) |
| `/all-employees`, `/add-new-employee`, `/all-roles-permissions` | Roles & permissions module (may coexist with newer Employees UI) |

**Rationale:** HQ staff need least-privilege access. Employees inherit feature matrices rather than sharing a single admin password. Stripe Connect may apply for payout-eligible staff.

---

### 7.16 Promotions & profile

| Path | Purpose |
|------|---------|
| `/promotions`, `/add-new-promotion` | Promotion management (nav may be commented) |
| `/profile` | Logged-in user profile |

---

## 8. Rationale — why features exist

| Business problem | Platform response |
|------------------|-------------------|
| Multi-party supply chain (HQ, partners, warehouses) | Three portals, one codebase, permission-gated nav |
| Orders must move through real warehouse stages | Status-partitioned order lists + detail actions |
| Partners sell under different commercial rules | Separate partner order track + partner portal |
| Accounting must match ops | QuickBooks sync queues + manual recovery tools |
| Partners/employees get paid via Stripe | Stripe Connect onboarding & payouts |
| Machines are a second product line | Subscriptions + leads Kanban |
| Territory-based shipping | Countries / states / cities / territories + shipping charges |
| Support & sales need tasting leads | Free-tasting inbox |
| Audit of customer emails | Order email logs |
| Reduce accidental deletes | Confirm modals (e.g. free-tasting delete) |
| Brand consistency in ops UI | Shared `theme` tokens (`#86644C`) across actions/chips |

---

## 9. Key user journeys

### A. Admin processes a customer order

1. Sign in as admin  
2. Open `/orders` or a status bucket  
3. Open `/orders/detail/[orderID]`  
4. Assign supplier / update tracking / generate invoice as permissions allow  
5. Sync invoice/payment to QBO from `/orders/quickbooks/customer` when needed  

### B. Partner creates an order for their customer

1. Sign in as sales representative  
2. Ensure customer exists under partner customers  
3. Create order / quotation from sales-rep order screens  
4. Track upcoming orders; use wallet/reports as needed  

### C. Supplier fulfills

1. Sign in as supplier  
2. Work through assigned → acknowledge → dispatch → shipped  
3. Use order detail for packing / shipping specifics  

### D. Update customer shipping contact

1. `/customers/edit/[id]` — set **Shipping Contact**  
2. Save → PATCH sends `addresses.shippingContact` + `addresses.id`  
3. Verify on `/customers/[id]` and on related order **Deliver To**  

### E. Recover unsynced paid customer payments (QBO)

1. `/orders/quickbooks/customer`  
2. Header **Manual Sync** → POST `api/v1/admin/lambda-function/sync-unsynced-paid-customer-payments`  
3. Expect one toast (`success` / `partial-success` warning / error)  

---

## 10. Integrations

| System | Where configured | How used |
|--------|------------------|----------|
| REST Backend | `URL.js` → `BASE_URL` | All business APIs |
| QuickBooks Online | QBO auth + sync pages | Invoice/payment/pullout sync |
| Stripe | `STRIPE_PUBLIC_KEY`, Connect APIs | Card payments & Connect accounts |
| Firebase FCM | `firebase.js` | Push notifications |
| Google Maps | `GOOGLE_API_KEY` | Maps / address UX |
| reCAPTCHA | Keys in `URL.js` + `/api/captcha` | Login abuse protection |
| Google Tag Manager | Root layout | Analytics (`GTM-NR8RKGGQ`) |
| next-intl | `next.config` / locales | `en` / `es` |

---

## 11. Codebase map

```text
src/
  app/                      # Next.js App Router pages (route groups)
    (auth)/
    (orderManagement)/
    (clientManagement)/
    (salesRepresentativePanel)/
    (supplierPanel)/
    (invoiceManagement)/
    (Quickbooks)/
    (machineSubscriptions)/
    (reportManagement)/
    (freeTasting)/
    ...
  components/               # Shared UI (tables, layout, leads, invoices, charts)
  utilities/                # API helpers, auth, permissions, URL, toasters, FCM
  schema/                   # Yup / form schemas
  locales/                  # i18n messages (if present)
```

### Critical utilities

| File | Role |
|------|------|
| `utilities/URL.js` | Environment endpoints & public keys |
| `utilities/StatusErrorHandler.js` | Axios instance, auth header, global toasts, session expiry |
| `utilities/GetAPI.js` / `PostAPI.js` / `PatchAPI.js` / `PutAPI.js` / `DeleteAPI.js` | CRUD wrappers |
| `utilities/ProtectedRoute.jsx` / `AuthCheck.js` | Client auth gate |
| `utilities/Permission.js` / `useUserType.js` | RBAC |
| `utilities/DataContext.js` | Layout drawer / shared UI state |
| `utilities/Toaster.js` | success / error / warning / info toasts |
| `utilities/trackingNumber.js` | Tracking validation helpers |
| `utilities/LeadsAPI.js` | Leads domain API helpers |

### Critical layout / nav

| File | Role |
|------|------|
| `components/wrapper/LayoutWrapper.jsx` | Shell |
| `components/ui/Header.jsx` | Top bar |
| `components/ui/Leftbar.jsx` | Role-based navigation (large, authoritative for “what’s live”) |
| `components/ui/MyDataTable.jsx` | Shared data table (search, sort, pagination, selection) |

---

## 12. API & data conventions

- Prefer **relative** paths with Axios `baseURL` (e.g. `api/v1/admin/...`), not hard-coded full production URLs in feature code.
- Auth: `Authorization: Bearer ${localStorage.accessToken}`
- Success toasts: response interceptor shows `message` for non-GET responses unless `suppressSuccessToast: true`
- Error toasts: error interceptor; avoid double-toasting in page `catch` when interceptor already handled HTTP errors
- Dates: commonly formatted with **dayjs** as `MM/DD/YYYY`
- Money display: prefer shared truncate helpers where introduced (2-decimal truncate, not banker’s round) for invoice/order consistency

### Common status shapes

- `"success"` — treat as success
- `"partial-success"` — mixed batch result; prefer **warning** toast once
- `"authentication-fail"` / “not logged in” — forced logout path in interceptor

---

## 13. UI / design conventions

- Brand primary: **`theme` = `#86644C`** (coffee brown); also `themeDark`, `themeGreen`, delete accent `#EE4A4A`
- Prefer existing button pattern: `bg-theme text-white border-theme hover:bg-white hover:text-theme`
- Tables: `MyDataTable` inside white card with `shadow-tableShadow`
- Fixed headers: `h-[70px] 2xl:h-[94px]` with title left, primary actions right
- Confirm destructive actions with PrimeReact `Dialog`
- Keep feature pages consistent with neighboring modules rather than inventing new visual systems

---

## 14. Local development

### Prerequisites

- Node.js compatible with Next 16
- Access to a backend (`local` or `staging`)
- Valid user accounts for admin / sales-rep / supplier as needed

### Setup

```bash
npm install
```

1. Set `ENV` in `src/utilities/URL.js` to `local` or `staging`
2. Start:

```bash
npm run dev
```

3. Open `http://localhost:3000`

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## 15. Testing & QA checklist

Use this as a smoke suite after deployments or major merges.

### Auth

- [ ] Admin / sales-rep / supplier login each land on correct nav
- [ ] Logout clears session; protected routes redirect
- [ ] OTP / forgot-password paths still reachable

### Orders

- [ ] Open customer order detail; Deliver To shows shipping contact when API provides it
- [ ] Update tracking number (validation + success toast once)
- [ ] Partner order detail still loads

### Customers

- [ ] Edit shipping address → payload uses `addresses` + `id` + `shippingContact`
- [ ] Detail page shows shipping contact

### QuickBooks

- [ ] Customer QBO page tabs load
- [ ] Selection sync invoice/payment disabled when nothing selected
- [ ] Manual Sync returns one toast for success / partial-success / failure

### Free tasting

- [ ] List loads; delete confirms; contact actions modal works

### Permissions

- [ ] Employee with limited permissions cannot see restricted Leftbar entries
- [ ] Unauthorized page guard behaves correctly

### Cross-browser / responsive

- [ ] Mobile drawer (Leftbar) opens/closes
- [ ] Tables remain usable on laptop widths

---

## 16. Operational runbooks

### Wrong API environment

**Symptom:** 404s, CORS, or unexpected empty data  
**Fix:** Check `ENV` in `URL.js`; hard refresh; confirm Network host matches intended backend

### Session expired loops

**Symptom:** Immediate redirect to sign-in  
**Fix:** Clear site localStorage; re-login; verify backend token validity

### Double toasts on POST/PATCH

**Cause:** Interceptor success toast + page-level error/success toast  
**Fix:** Use `{ suppressSuccessToast: true }` and handle status (`success` vs `partial-success`) in the page

### QBO sync failures

1. Check `/orders/quickbooks/customer` unsynced tabs  
2. Try selection sync, then Manual Sync  
3. Inspect API `results[]` for per-order failure messages  
4. Escalate backend/QBO credential issues if many invoice sync errors

### Customer address update rejected

Confirm payload shape:

```json
{
  "info": { "...": "..." },
  "addresses": {
    "id": 123,
    "shippingContact": "...",
    "addressLineOne": "...",
    "status": true
  },
  "billingAddress": { "...": "..." }
}
```

---

## 17. Known gaps & tech debt

1. **README historically boilerplate** — this handover + updated README are the product docs source of truth going forward.
2. **Secrets in client bundle** — public keys are expected; still review committed config and rotation process.
3. **Legacy modules** — collection, disbursement, promotions, older employee/roles routes may exist while Leftbar entries are commented; confirm with product before deleting.
4. **JS-only** — no TypeScript; API response shapes are informal — defend with optional chaining.
5. **Mixed patterns** — some pages use full URL hosts historically; new code should use relative `api/v1/...` paths.
6. **Nav is the live feature flag** — always verify `Leftbar.jsx` when asking “is this feature still shipped?”

---

## 18. Handover checklist

For the incoming owner:

- [ ] Can run app against staging and log in as admin, sales-rep, and supplier
- [ ] Knows how to switch `ENV` in `URL.js`
- [ ] Understands three-portal model and permission keys
- [ ] Can walk order lifecycle + invoice + QBO sync
- [ ] Knows customer `addresses` / `shippingContact` contract
- [ ] Knows where layout/nav/API helpers live
- [ ] Has backend / QBO / Stripe contact points for production incidents
- [ ] Has reviewed this document + `README.md`

---

## 19. Glossary

| Term | Meaning |
|------|---------|
| **Admin** | Busy Beans HQ operator |
| **Sales Representative / Local Partner** | Partner account selling into a territory |
| **Supplier** | Fulfillment partner |
| **Direct partner / Dropship partner** | Partner commercial subtypes (`partnerType`) |
| **Pullout** | Payment collection / remittance workflow |
| **QBO** | QuickBooks Online |
| **Direct invoice** | Invoice not solely driven by standard order pipeline |
| **Free tasting** | Inbound tasting interest submissions |
| **Shipping contact** | Contact name/number stored on shipping address |
| **Manual Sync** | Ops-triggered lambda sync for unsynced paid customer payments |

---

## Document ownership

| Role | Responsibility |
|------|----------------|
| Frontend maintainers | Keep this file updated when domains/routes/contracts change |
| Product | Validate rationale sections still match business process |
| QA | Extend smoke checklist per release |

For day-to-day setup commands, see [`README.md`](./README.md).
