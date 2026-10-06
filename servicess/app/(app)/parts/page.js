"use client";
import { Fragment } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import DataTable from "@/components/table";
import { Chip, Insight, Kpis, PageHead, Tabs, Panel, Mono } from "@/components/ui";
import { HBars } from "@/components/charts";
import { PARTS, PART_KPI, JOBS } from "@/data/ops";
import { TECHS } from "@/data/core";
import { inr, full } from "@/lib/format";

const partTone = (s) => ({ OK: "g", Low: "a", "Out of stock": "r" }[s]);
export default function Parts() {
  const [tab, setTab] = useState("Catalogue");
  const cols = useMemo(() => [
    { key: "name", label: "Part", render: (p) => <span style={{ fontWeight: 560 }}>{p.name}</span> }, { key: "sku", label: "SKU", style: { fontFamily: "var(--font-geist-mono)" } }, { key: "cat", label: "Category" }, { key: "branch", label: "Branch" },
    { key: "avail", label: "Available", right: true }, { key: "res", label: "Reserved", right: true }, { key: "withT", label: "With technicians", right: true }, { key: "reorder", label: "Reorder level", right: true },
    { key: "buy", label: "Purchase", right: true, render: (p) => full(p.buy) }, { key: "sell", label: "Selling", right: true, render: (p) => full(p.sell) },
    { key: "status", label: "Status", render: (p) => <Chip tone={partTone(p.status)} dot>{p.status}</Chip> },
  ], []);
  const views = [{ name: "All", count: PARTS.length }, { name: "Low stock", filter: (p) => p.status === "Low" }, { name: "Out of stock", filter: (p) => p.status === "Out of stock" }, ...["Ranchi", "Dhanbad", "Jamshedpur", "Patna"].map((b) => ({ name: b, filter: (p) => p.branch === b })), ...["AC", "CCTV", "RO", "Electrical", "Appliance"].map((c) => ({ name: c, filter: (p) => p.cat === c }))];
  return (
    <div className="page">
      <PageHead title="Spare Parts" sub="420 SKUs across four branches, technician vans and reserved stock." />
      <Insight tone="r"><b>Compressor stock is unavailable at Ranchi branch and is currently blocking 3 jobs worth ₹84,000.</b> 2 units are in transit from Dhanbad (TR-3318, ETA 3:40 PM). <Link className="link" href="/inventory">Open inventory →</Link></Insight>
      <Kpis cols={6} items={[{ label: "Inventory value", value: inr(PART_KPI.value) }, { label: "Low stock", value: PART_KPI.low, tone: "a" }, { label: "Out of stock", value: PART_KPI.out, tone: "r" }, { label: "With technicians", value: PART_KPI.withTech, hint: "units in vans" }, { label: "Branch stock", value: "3,904", hint: "units" }, { label: "Reserved", value: PART_KPI.reserved, hint: "for scheduled jobs" }]} />
      <Tabs tabs={["Catalogue", "Technician van stock", "Part usage"]} value={tab} onChange={setTab} />
      {tab === "Catalogue" && <DataTable title="Spare parts" rows={PARTS} cols={cols} views={views} searchKeys={["name", "sku", "cat", "branch"]} pageSize={15} />}
      {tab === "Technician van stock" && <div className="grid g3">{TECHS.slice(0, 8).map((t) => <Panel key={t.id} title={t.name} sub={`van stock ${full(t.van)}`}><dl className="kv">{[["Compressor", t.id === "T01" ? 1 : t.id === "T02" ? 0 : 1], ["Capacitor", 3 + (t.id.charCodeAt(2) % 5)], ["Gas", `${t.id === "T01" ? 8 : 4 + (t.id.charCodeAt(2) % 6)} kg`], ["Filter", 8 + (t.id.charCodeAt(2) % 8)], ["Copper pipe", `${12 + (t.id.charCodeAt(1) % 14)} m`]].map(([a, b]) => <Fragment key={a}><dt>{a}</dt><dd>{b}</dd></Fragment>)}</dl></Panel>)}</div>}
      {tab === "Part usage" && <Panel title="Recent part usage" sub="auto-deducted from inventory" tight><table className="tbl"><thead><tr><th>Time</th><th>Job</th><th>Customer</th><th>Asset</th><th>Part</th><th>Qty</th><th className="r">Cost</th><th className="r">Selling</th><th>Technician</th></tr></thead><tbody>{[["12:28 PM", "JOB-2790", "Orchid Diagnostics", "AC-27102", "AC PCB Universal", 1, 1400, 2600, "Amit Singh"], ["11:50 AM", "JOB-2781", "Maa Ganga Clinic", "RO-28010", "RO Membrane 75 GPD", 1, 1100, 1850, "Manoj Sharma"], ["11:05 AM", "JOB-2778", "Sharma Residence", "AC-28100", "R410A Gas (kg)", 2.1, 780, 1150, "Rohit Kumar"], ["10:30 AM", "JOB-2771", "Metro Office Park", "CAM-28332", "Hikvision 4MP Camera", 2, 2200, 3400, "Vikas Yadav"], ["09:48 AM", "JOB-2765", "Radhey Showroom", "AC-28944", "AC Capacitor 35µF", 1, 180, 420, "Arun Verma"]].map((r) => <tr key={r[1]}><td>{r[0]}</td><td><Mono href={`/jobs/${r[1]}`}>{r[1]}</Mono></td><td>{r[2]}</td><td className="mono">{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td className="r">{full(r[6] * r[5])}</td><td className="r">{full(r[7] * r[5])}</td><td>{r[8]}</td></tr>)}</tbody></table></Panel>}
    </div>
  );
}
