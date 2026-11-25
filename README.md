# Stripe Payments Dashboard

A Stripe-inspired payments dashboard built for the Chargeblast front-end project. It uses 500 reproducible mock payments across seven currencies to demonstrate browsing, filtering, inspecting, and exporting transactions. The app runs on local fixtures without Stripe credentials or environment variables.

## Pages

| Route | Content |
| --- | --- |
| `/` | Opens the **Transactions → Payments** view with a filter bar, removable filter badges, a configurable payments table, and pagination. Each row links to its payment details. |
| `/payments/[id]` | Shows the payment amount, currency, status, and ID. The summary includes the customer, masked payment method, and creation time. The page also includes an event timeline, metadata, and a link back to payments. |
| `/payments/[id]` with an unknown ID | Shows a **Payment not found** screen with a link back to payments. |

The shared dashboard shell includes a responsive, collapsible sidebar. Transactions is the implemented sidebar section, and Payments is the implemented transaction tab. Payouts, Top-ups, Collected fees, Transfers, and All activity are placeholders. The header search, Help, Notifications, Settings, Create payments, and Analyze controls are also placeholders.

## Payments table

- Search by payment ID, customer email, or the last four digits of the payment method.
- Filter by date, status, payment method, or amount. Filters are stored in the URL and can be removed individually. Date ranges use UTC, and amount bounds apply in each payment’s original currency.
- Sort by amount, status, customer, payment ID, or creation date. Show or hide columns and use the pointer or arrow keys to resize and reorder them.
- Browse 25, 50, or 100 rows per page. Select rows on the current page to export them as CSV using the visible columns in their current order.
- Copy a payment ID, view a relative timestamp in a tooltip, or open a payment’s detail page.

## Technology stack

| Technology | How it’s used |
| --- | --- |
| Next.js 16 and React 19 | App Router, shared layout, dynamic payment routes, Suspense loading states, and interactive dashboard components. Turbopack handles development and production builds. |
| TypeScript | Typed payment records, filters, table columns, and component props. |
| Tailwind CSS 4 | Responsive layouts, container queries, and styling backed by CSS theme variables. |
| shadcn/ui and Base UI | Local UI components in the `base-nova` style, with Base UI primitives for interactive controls. |
| Lucide React | Icons for navigation, filters, table actions, and status indicators. |
| `next/font` | Loads Plus Jakarta Sans and Geist Mono from Google Fonts. |
| ESLint | Checks project code using the Next.js ESLint configuration. |

## shadcn/ui components

The project’s local UI components live in [`src/components/ui`](src/components/ui), with the registry style and aliases configured in [`components.json`](components.json).

| Component | Where it’s used |
| --- | --- |
| **Sidebar** | Shared dashboard navigation, collapse trigger, and main content inset. |
| **Sheet** | Mobile drawer used by the Sidebar. |
| **Tabs** | Transaction categories, including Payments. |
| **Table** | Payment column headers, data rows, caption, and empty states. |
| **Dropdown Menu** | Status and payment method filters, plus the Edit columns menu. |
| **Native Select** | Date presets and rows per page. |
| **Input** | Header search and payment search, date, and amount fields. |
| **Button** | Dashboard actions, table controls, pagination, and button-styled links. |
| **Badge** | Payment statuses and removable active filters. |
| **Tooltip** | Full payment IDs, relative creation times, and collapsed sidebar labels. |
| **Separator and Skeleton** | Supporting primitives in the Sidebar component. |

## Run locally

Use Node.js 20.9 or later and npm. Next.js needs access to Google Fonts when fetching the configured fonts.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

| Command | Purpose |
| --- | --- |
| `npm run lint` | Run ESLint. |
| `npx tsc --noEmit` | Check TypeScript types. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |

## Project structure

| Directory | Contents |
| --- | --- |
| [`src/app`](src/app) | Routes, root layout, and global styles. |
| [`src/components`](src/components) | Dashboard shell, transactions view, filters, table, and local UI primitives. |
| [`src/hooks`](src/hooks) | Payment column interactions and mobile viewport detection. |
| [`src/lib`](src/lib) | Filter parsing and validation, payment formatting, column definitions, and CSV export. |
| [`src/data`](src/data) | Mock payments, payment events, and metadata. |
| [`references`](references) | Chargeblast project brief and three design reference images. |
