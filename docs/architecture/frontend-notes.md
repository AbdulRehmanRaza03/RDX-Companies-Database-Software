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
- Light-blue / white / black professional SaaS theme (brand-50…900 blues, neutral
  ink scales).
- Collapsible sidebar (mobile drawer), topbar, responsive grid.
- Loading / empty / error states on all data views.
- Recharts bar charts for reports.

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
