"use client";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Plate } from "@/components/ui";
import { TOLL } from "@/data/ops";
import { full } from "@/lib/format";

export default function Toll() {
  const flagged = TOLL.filter((t) => t.flag);
  return (
    <div className="page">
      <PageHead title="Toll & FASTag" sub="FASTag spend matched to trips — with duplicate-charge and route-deviation detection." />
      <Insight tone="r"><b>{flagged.length} unusual toll events</b> need review: one duplicate charge (₹780 recoverable), one amount mismatch, and one vehicle charged at a plaza that is not on its assigned route.</Insight>
      <Kpis items={[{ label: "Toll cost this month", value: "₹14.8L" }, { label: "Avg toll / trip", value: "₹4,860" }, { label: "Low FASTag balance", value: 6, tone: "a", hint: "< ₹1,000" }, { label: "Duplicate charges", value: 1, tone: "r" }, { label: "Mismatches", value: 2, tone: "r" }]} />
      <DataTable rows={TOLL} title="Toll" views={[{ name: "All" }, { name: "Flagged", count: flagged.length, filter: (t) => !!t.flag }, { name: "Low balance", filter: (t) => t.balance < 1000 }]}
        cols={[{ key: "date", label: "Date" }, { key: "time", label: "Time" }, { key: "vehicleId", label: "Vehicle", render: (t) => <Plate id={t.vehicleId} /> }, { key: "tripId", label: "Trip" }, { key: "plaza", label: "Toll Plaza" }, { key: "amount", label: "Amount", right: true, render: (t) => full(t.amount) }, { key: "balance", label: "FASTag Balance", right: true, render: (t) => <span className={t.balance < 1000 ? "neg" : ""}>{full(t.balance)}</span> }, { key: "flag", label: "Flag", render: (t) => (t.flag ? <Chip tone="r">{t.flag}</Chip> : <span className="faint">—</span>) }]} />
    </div>
  );
}
