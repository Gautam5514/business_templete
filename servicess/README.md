# FieldDesk — Field Service Business Control OS

Demo app for **PrimeCare Service Solutions Pvt. Ltd.** (AC, CCTV, RO, electrical, appliance and facility service across Ranchi, Dhanbad, Jamshedpur and Patna).

> Every customer. Every job. Every technician. Fully under control.

```bash
npm install
npm run dev   # http://localhost:3000
```

All data is deterministic demo data in `data/` (seeded RNG, no backend). Demo state (assignments, route optimisation, theme, role) lives in `lib/store.js`.

## Sales demo path
1. **Command Center** — 86 requests, 52 technicians active, 6 unassigned, ₹16.8L outstanding.
2. **Dispatch Board** — open JOB-2841 (Apex Mall, emergency), assign the recommended technician (Rohit Kumar) or drag the job onto a lane.
3. **Job 360°** (`/jobs/JOB-2841`) — press *Play journey* to walk request → diagnosis → estimate → parts → sign-off → invoice → payment.
4. **Customer 360°** (`/customers/C001`) → **Asset 360°** (`/assets/AC-28941`) — repeat-failure insight.
5. **Ask FieldDesk** — "Which jobs need attention right now?"

Other screens: Control Room (`/control-room`), Technician mobile app (`/mobile`), customer tracking (`/track/JOB-2818`), dark mode and role switcher (sidebar footer), ⌘K global search, Create menu.
