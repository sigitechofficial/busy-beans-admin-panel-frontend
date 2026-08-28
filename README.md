# Busy Beans Admin Panel

Enterprise web console for **Busy Beans Coffee** wholesale operations — used by HQ admins, local partners (sales representatives), and suppliers.

For full product documentation (every domain, rationale, journeys, runbooks), see:

**→ [`HANDOVER.md`](./HANDOVER.md)** (enterprise handover guide)

---

## What this app does

| Portal | URL area | Users |
|--------|----------|--------|
| Admin | `/orders`, `/customers`, `/suppliers`, `/Quickbooks`, `/reports`, … | Busy Beans HQ & employees |
| Sales Representative | `/sales-representative/...` | Local partners |
| Supplier | `/supplier/...` | Fulfillment partners |

Core capabilities:

- Order lifecycle (customer + partner tracks), invoicing, tracking
- Customer / partner / supplier CRM
- QuickBooks Online sync & recovery tools
- Stripe Connect (partners / payouts)
- Machine subscriptions & leads CRM
- Inventory, categories, shipping charges, geo zones
- Reports, notifications (FCM), free-tasting inbox
- Role-based permissions

This frontend talks to the Busy Beans REST API (`BASE_URL` in `src/utilities/URL.js`). The backend is the system of record.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS** (brand theme `#86644C`)
- **PrimeReact**, Axios, Formik/Yup, dayjs, react-toastify
- Integrations: QuickBooks Online, Stripe, Firebase FCM, Google Maps, reCAPTCHA, next-intl (`en` / `es`)

---

## Getting started

### Prerequisites

- Node.js compatible with Next.js 16
- Backend access (local LAN API or staging)
- Test accounts for the portal(s) you need

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment switch

Edit `src/utilities/URL.js`:

```js
const ENV = "staging"; // "local" | "staging" | "production"
```

| ENV | Backend | Admin UI |
|-----|---------|----------|
| `local` | LAN host in `URL.js` | localhost |
| `staging` | `https://testingbb.trimworldwide.com/` | `https://stageadmin.busybeancoffee.com/` |
| `production` | `https://backendbb.trimworldwide.com/` | `https://admin.busybeancoffee.com/` |

Restart the dev server after changing `ENV`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## Project structure (high level)

```text
src/app/           # Pages by domain (Next.js route groups)
src/components/    # Shared UI (layout, tables, invoices, leads, charts)
src/utilities/     # API clients, auth, permissions, ENV, toasters
src/schema/        # Form validation schemas
HANDOVER.md        # Full feature catalog + rationale + runbooks
```

Route groups like `(orderManagement)` **do not** appear in the URL  
(`src/app/(orderManagement)/orders/page.js` → `/orders`).

---

## Auth model (short)

1. Sign in at `/sign-in` as **admin**, **sales-rep**, or **supplier**
2. JWT stored in `localStorage` (`accessToken`)
3. `ProtectedRoute` guards app pages
4. `userType` + `permissions` drive Leftbar and page access

Details: [HANDOVER.md § Authentication](./HANDOVER.md#6-authentication-roles--permissions).

---

## Feature map (quick links)

| Domain | Start here | Docs |
|--------|------------|------|
| Orders | `/orders` | [§ 7.2](./HANDOVER.md#72-order-management-core) |
| Customers | `/customers` | [§ 7.3](./HANDOVER.md#73-customers-crm) |
| Partners (admin) | `/sale-representative` | [§ 7.4](./HANDOVER.md#74-local-partners-sales-representatives--admin-crm) |
| Partner portal | `/sales-representative/...` | [§ 7.5](./HANDOVER.md#75-sales-representative-portal) |
| Suppliers | `/suppliers`, `/supplier/...` | [§ 7.6](./HANDOVER.md#76-suppliers-admin--portal) |
| Invoices | `/all-invoices`, `/create-invoice` | [§ 7.7](./HANDOVER.md#77-invoicing) |
| QuickBooks | `/Quickbooks`, `/orders/quickbooks/customer` | [§ 7.8](./HANDOVER.md#78-quickbooks-online) |
| Subscriptions / Leads | `/subscription`, `/leads` | [§ 7.11](./HANDOVER.md#711-machine-subscriptions-addons--leads) |
| Reports | `/reports` | [§ 7.12](./HANDOVER.md#712-reports) |
| Free tasting | `/free-tasting` | [§ 7.13](./HANDOVER.md#713-free-tasting) |

---

## Conventions for contributors

- Prefer relative API paths (`api/v1/admin/...`) so `BASE_URL` controls the host
- Reuse `PostAPI` / `GetAPI` / `PatchAPI` / `DeleteAPI`
- Avoid double toasts: interceptor already toasts many non-GET successes; use `suppressSuccessToast` when handling `partial-success` yourself
- Match existing brand classes (`bg-theme`, `border-theme`, delete `#EE4A4A`)
- Confirm destructive actions with a dialog
- Check `components/ui/Leftbar.jsx` before assuming a legacy page is still “live” in nav

---

## Documentation index

| Document | Contents |
|----------|----------|
| **[HANDOVER.md](./HANDOVER.md)** | Full platform handover: architecture, every feature + rationale, journeys, integrations, QA, runbooks, glossary |
| **README.md** (this file) | Setup, env switch, structure, quick feature map |
| `TASKS_COMPLETED_TODAY.md` | Informal engineering change log (not product docs) |

---

## Support / ownership

- **Frontend:** this repository  
- **Backend / QBO / Stripe server config:** Busy Beans API team (separate from this repo)  
- **Product process questions:** use rationale sections in `HANDOVER.md` as the starting baseline, then confirm with product for process changes
