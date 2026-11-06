# Frontend — Implementation Notes

## Stack
React + Vite + Tailwind CSS v4, React Router, TanStack Query, Recharts,
lucide-react icons.

## Structure
```
src/
  lib/
    api.js          Axios instance with token injection + 401 redirect
    auth.jsx        AuthProvider + useAuth (login/logout/me)
  components/
    ui.jsx          Button, Card, Input, Select, Badge, Spinner, EmptyState, PageHeader
    data.jsx        DataTable, StatusBadge, SearchInput
    modal.jsx       Modal, ConfirmDialog
  layout/
    Layout.jsx      Sidebar + topbar shell
  hooks/
    useOrganization.js   resolves org id via /organizations
  pages/
    Login.jsx
    Dashboard.jsx
    Companies.jsx
    Contacts.jsx
    Deals.jsx
    Tasks.jsx
    Campaigns.jsx
    Finance.jsx
    Reports.jsx
  App.jsx          routes + route guards
```

## Design
- Premium enterprise SaaS theme (Linear/HubSpot/Stripe-inspired).
- **Palette:** Primary Navy `#0B1F3A`, Primary Blue `#2563EB`, Light Blue `#EAF2FF`,
  Background `#F7F9FC`, Surface `#FFFFFF`, text `#172033` / `#64748B`, borders `#E5EAF1`.
- Inter font (Google Fonts) for professional typography.
- **Dark mode + light mode** — toggle in topbar; centralized CSS variables.
- Collapsible sidebar (desktop `w-64 ↔ w-16`, tooltips when collapsed) + grouped nav.
- Topbar: global search, Quick Add, notifications bell (unread badge), theme toggle,
  profile menu.
- Loading / empty / error states on all data views.
- Recharts charts (bar/area/pie) on dashboard + reports.
- Fully responsive (mobile, tablet, desktop).

## Pages
- **Login** — email/password, demo credentials pre-filled.
- **Dashboard** — KPI cards, leads-by-status, deals-by-stage, recent activity.
- **Companies / Contacts / Deals / Tasks / Campaigns** — CRUD with search + create modal.
- **Finance** — tabs for invoices, payments, expenses, revenue.
- **Reports** — bar charts (leads by status/source, deals by stage, revenue).

## Run
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```
Backend must be running on :8000 (frontend proxies `/api`).
