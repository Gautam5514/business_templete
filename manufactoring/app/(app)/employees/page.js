"use client";
import { Card, Kpi, PageHeader, Pill, Progress } from "@/components/ui/ui";
import { DataTable } from "@/components/ui/table";
import { BarsChart, C } from "@/components/ui/charts";
import { EMPLOYEES } from "@/data/masters";
import { num } from "@/lib/format";

export default function Employees() {
  const prod = EMPLOYEES.filter((e) => e.target > 0).map((e) => ({ ...e, eff: +((e.actual / e.target) * 100).toFixed(1) }));
  const all = EMPLOYEES.map((e) => ({ ...e, eff: e.target ? +((e.actual / e.target) * 100).toFixed(1) : null }));
  return (
    <div>
      <PageHeader title="Employees" sub="Shop-floor productivity, attendance and overtime — 118 employees across both plants." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5"><Kpi label="Headcount" value="118" /><Kpi label="Present today" value="109" sub="92.4%" /><Kpi label="Overtime today" value="26 h" /><Kpi label="Avg efficiency" value={`${(prod.reduce((s, e) => s + e.eff, 0) / prod.length).toFixed(1)}%`} /><Kpi label="Top performer" value="Vijay Kumar" sub="90.5% · 2.1% rejection" /></div>
      <Card className="mb-4" title="Output vs target — production staff today"><BarsChart data={prod.slice(0, 10).map((e) => ({ label: e.name.split(" ")[0], actual: e.actual, target: e.target }))} keys={[{ k: "actual", name: "Actual" }, { k: "target", name: "Target", type: "line", dash: "4 3" }]} height={220} /></Card>
      <DataTable rows={all} rowKey={(e) => e.id} pageSize={10} exportName="employees" searchPlaceholder="Search name, role, machine…"
        filters={[{ key: "p", label: "Plant", options: ["Ranchi", "Ramgarh"], match: (r, v) => r.plant === v }, { key: "d", label: "Department", options: ["Production", "Quality", "Maintenance", "Stores", "Dispatch", "Accounts", "Management", "Purchase"], match: (r, v) => r.dept === v }]}
        cols={[{ key: "name", header: "Employee", render: (e) => <div><div className="font-medium">{e.name}</div><div className="text-[11.5px] text-mute">{e.role}</div></div> }, { key: "plant", header: "Plant", muted: true }, { key: "shift", header: "Shift", muted: true }, { key: "att", header: "Attendance", render: (e) => <Pill tone={e.att === "Present" ? "ok" : e.att === "Absent" ? "bad" : "neutral"}>{e.att}</Pill> }, { key: "machine", header: "Assigned machine", muted: true }, { key: "target", header: "Target", align: "right", render: (e) => e.target ? num(e.target) : "—" }, { key: "actual", header: "Output", align: "right", render: (e) => e.target ? num(e.actual) : "—" }, { key: "eff", header: "Efficiency", align: "right", render: (e) => e.eff ? <div className="w-20 text-right"><span className={e.eff < 80 ? "text-warn" : ""}>{e.eff}%</span><Progress value={e.eff} tone={e.eff >= 88 ? "ok" : e.eff >= 75 ? "accent" : "warn"} className="mt-1" /></div> : "—" }, { key: "rej", header: "Rejection", align: "right", render: (e) => e.target ? <span className={e.rej > 3 ? "text-bad" : ""}>{e.rej}%</span> : "—" }, { key: "ot", header: "Overtime", align: "right", render: (e) => e.ot ? `${e.ot} h` : "—" }]} />
    </div>
  );
}
void C;
