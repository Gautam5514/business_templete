# FleetOps — Transport & Fleet Business Control OS

> Every vehicle. Every trip. Every rupee. Fully visible.

A showcase app for **Eastern Freight & Logistics Pvt. Ltd.** (fictional) — a transport owner running the whole
business (bookings → dispatch → trips → fuel → POD → invoices → collections → profitability) from one control room.

```bash
npm install
npm run dev      # http://localhost:3000
```

Default login: **Sanjay Agarwal — Managing Director**. Use the profile menu (bottom of the sidebar) to view as any of the 11 roles.
Append `?theme=dark` to any URL for dark mode (or use the toggle in the top bar). `⌘K` opens global search.

## Sales demo path
1. `/command-center` — fleet health, live map, 64 trips, alerts, "where money is leaking"
2. `/live-fleet` — click **JH01DK4821** for the vehicle card
3. `/trips/TRP-9824` — route progress, journey timeline, live trip P&L (₹85,500 revenue → ₹30,740 profit), risk engine
4. `/fuel` — mileage drop & anomaly detection
5. `/pod` — 17 PODs blocking ₹18.4L of invoicing
6. `/assistant` — "Which vehicles are losing money this month?"
7. `/dispatch` (drag a vehicle onto a load), `/vehicles/JH01DK4821` (vehicle P&L), `/control-room` (TV mode), `/mobile` (driver / hub / dispatcher / workshop)

## Structure
- `app/(app)/*` — modules inside the sidebar shell; `app/control-room`, `app/mobile` — standalone full-screen experiences
- `components/` — `Shell` (sidebar, search, notifications, quick create), `FleetMap` (SVG map with routes, hubs, risk zones, pan/zoom), `table` (sort / search / columns / views / export / expand), `charts`
- `data/` — one connected, seeded dataset (`geo` → `fleet` → `ops`): customers, drivers, vehicles, trips, invoices, PODs, fuel, toll, maintenance…
- `lib/` — formatters (₹ lakh/crore), role store, trip metrics/timeline/P&L, AI answer engine

All numbers are demo data; the headline figures follow the product brief (128 vehicles, 64 active trips, 72/8/6/31/11 fleet strip, ₹86.4L receivable, 17 PODs = ₹18.4L).
