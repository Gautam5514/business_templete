# Distribution Control OS

**Track every order, every unit, every dispatch and every rupee.**

A showcase B2B control system for traditional distributors and wholesalers — built around a fictional company,
**BharatFlow Distribution Pvt. Ltd.** (₹18.6 Cr, 3 warehouses, 148 dealers, Ranchi · Dhanbad · Patna).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Login page → **Explore Demo** (or `raj@bharatflow.demo` / `demo123`). Signs in as *Rajesh Agarwal — Managing Director*.
All data is local, deterministic mock data — no backend or external service needed. State (orders, payments,
follow-ups…) is live while the tab is open and resets on reload.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Recharts · Lucide · Geist.

```
app/            routes — (app)/ holds every module behind the shared shell
components/     ui/ (table, charts, primitives) · shell/ · dashboard/ · orders/ · customers/
                inventory/ · dispatch/ · finance/ · company/ · reports/ · ai/
data/           seeded datasets (core, ops, misc) — deterministic, no randomness at render time
lib/            store (live state + actions), roles, AI answer engine, search, journey builder
types/
```

## The 5-minute demo story

1. **Dashboard** — "Instead of asking different employees, the owner gets the entire business here." (Needs Your Attention, Business Health, Order Pipeline)
2. **Sharma Hardware** (click the overdue alert → *View Customer*) — Customer 360°: credit, outstanding, timeline, follow-ups.
3. **ORD-1047** — 2,180 ordered → 2,150 packed & dispatched; the full Order Journey. Items / Dispatch / Invoice / Payments tabs.
4. **Shipment SHP-398** — vehicle JH01DK4821, route Ranchi → Ramgarh → **Bokaro** → Dhanbad, ETA 2 hr 18 min.
5. **Payment** — ₹7.31L invoice, ₹2L received, ₹5.31L pending. Click *Record payment* and watch it settle everywhere.
6. **Ask Your Business** (`⌘/` or the *Ask AI* button) — "Which customers haven't paid for more than 30 days?"

## Things to try

- `⌘K` global search — type **Sharma** (customer, orders, invoices, payments, dispatches)
- **Orders** → *Create Sales Order* — default Sharma order trips the credit-limit warning (exceeds by ₹1,24,000)
- Advance any order through *Approve → Allocate → Pack → Ready → Dispatch → In Transit → Deliver*; invoice, dispatch and shipment are created automatically
- Profile menu → **View as role** (Owner, Sales Manager/Executive, Warehouse, Accounts, Logistics, Admin) — sidebar and access change
- **Owner View** toggle (header) — simplifies the system to Health · Sales · Collections · Outstanding · Inventory · Orders · Alerts · Performance · AI
- *Simulate offline* in the profile menu · *Collapse* the sidebar · resize to phone width (bottom nav, card tables, filter sheet)

## Data notes

- Today in the demo is **Tue 06 Oct 2026**, FY 2026–27.
- Sharma Hardware's total outstanding is **₹10,06,200** = ₹5,31,200 (INV-2941, current) + ₹4,75,000 (INV-2874, 31 days overdue).
  That is what makes credit used ₹11,62,400 / available ₹3,37,600 reconcile.
- Premium Kitchen Sink 24×18: 1,420 physical across 3 warehouses; the "184 units, min 300" alert is the **Dhanbad** location.
