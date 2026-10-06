"use client";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Panel, Plate } from "@/components/ui";
import { Bars } from "@/components/charts";
import { MAINTENANCE, MAINT_TYPES, MONTHS, SERIES } from "@/data/ops";
import { full, num } from "@/lib/format";

const tone = { Critical: "r", High: "a", Medium: "b", Low: "n" };
export default function Maintenance() {
  const days = ["Today", "Wed 07 Oct", "Thu 08 Oct", "Fri 09 Oct", "Sat 10 Oct", "Mon 12 Oct", "Tue 13 Oct"];
  return (
    <div className="page">
      <PageHead title="Maintenance" sub="Preventive schedules by odometer and date — so vehicles are serviced while idle, not after they break."><button className="btn pri">Schedule job</button></PageHead>
      <Insight tone="a"><b>JH01AB2245 is 620 km past its service</b> and is idle today — the cheapest window to service it. An unplanned breakdown on a loaded trip costs ≈ 4× more in downtime and customer impact.</Insight>
      <Kpis items={[{ label: "Vehicles due", value: 6, tone: "a", hint: "this week" }, { label: "Overdue", value: 2, tone: "r" }, { label: "Breakdowns this month", value: 9 }, { label: "Maintenance cost", value: "₹5.7L" }, { label: "Avg downtime", value: "3h 40m" }]} />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 360px", marginBottom: 14, alignItems: "start" }}>
        <Panel title="Service calendar" sub="next 7 working days">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8 }}>
            {days.map((d) => (
              <div key={d} style={{ border: "1px solid var(--line)", borderRadius: 8, minHeight: 150, padding: 8, background: d === "Today" ? "var(--accent-soft)" : "var(--panel2)" }}>
                <div className="lbl" style={{ marginBottom: 6 }}>{d}</div>
                {MAINTENANCE.filter((m) => m.date === d).slice(0, 4).map((m) => (
                  <div key={m.id} style={{ borderLeft: `3px solid var(--${{ r: "red", a: "amber", b: "blue", n: "grey" }[tone[m.priority]]})`, padding: "2px 6px", marginBottom: 5, fontSize: 11.5, background: "var(--panel)", borderRadius: 4 }}><b className="mono" style={{ fontSize: 11 }}>{m.vehicleId}</b><div className="faint">{m.type}</div></div>
                ))}
              </div>
            ))}
          </div>
        </Panel>
        <div style={{ display: "grid", gap: 14 }}>
          <Panel title="Maintenance cost" sub="₹ Lakh · 12 months"><Bars data={MONTHS.slice(-8).map((m, i) => ({ k: m, v: SERIES.maint.slice(-8)[i] }))} height={150} highlight={7} fmt={(v) => v} /></Panel>
          <Panel title="Job types"><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{MAINT_TYPES.map((t) => <Chip key={t}>{t}</Chip>)}</div></Panel>
        </div>
      </div>
      <DataTable rows={MAINTENANCE} title="Maintenance" views={[{ name: "All" }, { name: "Overdue / critical", filter: (m) => m.priority === "Critical" || m.priority === "High" }, { name: "Preventive", filter: (m) => m.type === "Preventive" || m.type === "Scheduled Service" }]}
        cols={[{ key: "date", label: "Date" }, { key: "vehicleId", label: "Vehicle", render: (m) => <Plate id={m.vehicleId} /> }, { key: "odo", label: "Odometer", right: true, render: (m) => num(m.odo) }, { key: "type", label: "Maintenance Type" }, { key: "priority", label: "Priority", render: (m) => <Chip tone={tone[m.priority]}>{m.priority}</Chip> }, { key: "shop", label: "Assigned Workshop" }, { key: "note", label: "Note" }, { key: "est", label: "Estimate", right: true, render: (m) => full(m.est) }]} />
    </div>
  );
}
