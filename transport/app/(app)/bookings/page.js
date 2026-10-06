"use client";
import DataTable from "@/components/table";
import { Chip, Insight, PageHead } from "@/components/ui";
import { BOOKINGS, PIPE } from "@/data/ops";
import { customerById } from "@/data/fleet";
import { full, inr } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function Bookings() {
  const { setOverlay } = useApp();
  const counts = PIPE.map((_, i) => BOOKINGS.filter((b) => b.stage === i).length);
  const needsRate = BOOKINGS.filter((b) => b.stage <= 1);
  return (
    <div className="page">
      <PageHead title="Bookings" sub="Customer booking to invoice — one pipeline, no WhatsApp chasing."><button className="btn pri" onClick={() => setOverlay({ type: "create", kind: "New Booking" })}>New booking</button></PageHead>
      <Insight tone="a"><b>{needsRate.length} bookings are waiting on rate approval or vehicle planning</b> — {inr(needsRate.reduce((a, b) => a + b.freight, 0))} of freight not yet committed. Bookings unassigned for over 4 hours lose to competitors.</Insight>
      <div className="kpis" style={{ gridTemplateColumns: `repeat(${PIPE.length},1fr)` }}>
        {PIPE.map((s, i) => <div key={s} className="kpi" style={{ position: "relative" }}><div className="lbl">{i + 1}. {s}</div><div className="v">{counts[i]}</div><div className="d">{inr(BOOKINGS.filter((b) => b.stage === i).reduce((a, b) => a + b.freight, 0))}</div></div>)}
      </div>
      <DataTable rows={BOOKINGS} title="Bookings" views={[{ name: "All" }, { name: "Needs action", filter: (b) => b.stage <= 2 }, { name: "In motion", filter: (b) => b.stage >= 3 && b.stage <= 5 }, { name: "Billing", filter: (b) => b.stage >= 6 }]}
        cols={[{ key: "id", label: "Booking", render: (b) => <b className="mono">{b.id}</b> }, { key: "customer", label: "Customer", render: (b) => customerById(b.customerId).short, csv: (b) => customerById(b.customerId).short }, { key: "r", label: "Route", render: (b) => `${b.from} → ${b.to}`, sort: (b) => b.from }, { key: "vehicleType", label: "Vehicle Type" }, { key: "material", label: "Material" }, { key: "weight", label: "Weight", right: true, render: (b) => b.weight + " MT" }, { key: "pickup", label: "Pickup" }, { key: "rateType", label: "Rate Type" }, { key: "freight", label: "Freight", right: true, render: (b) => full(b.freight) },
          { key: "stage", label: "Stage", render: (b) => <Chip tone={b.stage <= 1 ? "a" : b.stage >= 6 ? "g" : "b"} dot>{PIPE[b.stage]}</Chip>, sort: (b) => b.stage }]} />
    </div>
  );
}
