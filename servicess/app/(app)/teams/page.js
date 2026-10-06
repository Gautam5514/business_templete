"use client";
import { useState } from "react";
import { Chip, Insight, Kpis, PageHead, Panel, Prog, Tabs, Avatar } from "@/components/ui";
import { Bars, HBars } from "@/components/charts";
import RoutePlan from "@/components/RoutePlan";
import DataTable from "@/components/table";
import { BRANCHES, TECHS, techById } from "@/data/core";
import { TERRITORIES } from "@/data/ops";
import { inr, full } from "@/lib/format";

const TABS = ["Branches", "Territories", "Teams", "Route Planning"];
const SUP = [["Anil Dubey", "Ranchi Central", 11], ["Meena Oraon", "Ranchi East", 8], ["Ravi Munda", "Ranchi West", 9], ["Dinesh Prasad", "Dhanbad", 14], ["Santosh Mishra", "Jamshedpur", 14], ["Rakesh Thakur", "Patna", 12]];
export default function Teams() {
  const [tab, setTab] = useState("Branches");
  const [b, setB] = useState(BRANCHES[0]);
  return (
    <div className="page">
      <PageHead title="Teams & Territories" sub="4 branches · 6 service zones · 14 supervisors · 68 technicians." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Branches" && (<>
        <div className="vgrid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", marginBottom: 14 }}>
          {BRANCHES.map((x) => <div key={x.id} className={`vcard ${b.id === x.id ? "sel" : ""}`} onClick={() => setB(x)}><div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: 15 }}>{x.name}</b>{x.hq && <Chip tone="k">HQ</Chip>}</div><div className="faint" style={{ fontSize: 12 }}>{x.techs} technicians</div><div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}><span className="muted">SLA</span><b className={x.sla < 88 ? "neg" : ""}>{x.sla}%</b></div><Prog v={x.sla} tone={x.sla < 88 ? "r" : x.sla < 92 ? "a" : "g"} /></div>)}
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, letterSpacing: "-0.02em" }}>{b.name} Branch</h2>
        <Kpis cols={7} items={[{ label: "Technicians", value: b.techs }, { label: "Jobs today", value: b.jobsToday }, { label: "Completed", value: b.done, tone: "g" }, { label: "Revenue today", value: inr(b.revToday) }, { label: "SLA", value: b.sla + "%" }, { label: "First-time fix", value: b.ftf + "%" }, { label: "Outstanding", value: inr(b.outstanding), tone: "r" }]} />
        {b.sla < 88 && <Insight tone="r"><b>{b.name} has the lowest SLA at {b.sla}%</b> — response time is 58 min vs 34 min in Ranchi Central. 3 more technicians in Boring Road & Kankarbagh would recover ≈ 5 pts.</Insight>}
        <div className="grid g2"><Panel title="Technician status"><HBars items={["available", "onjob", "travelling", "delayed", "offline"].map((s) => ({ k: s, v: TECHS.filter((t) => t.branch === b.id && t.status === s).length, tone: { available: "green", onjob: "blue", travelling: "amber", delayed: "red", offline: "grey" }[s] }))} /></Panel><Panel title="Jobs by hour"><Bars data={[8, 9, 10, 11, 12, 13].map((h, i) => ({ k: `${h}`, v: Math.round(b.jobsToday / 6 * [0.7, 1.1, 1.3, 1.2, 0.9, 0.8][i]) }))} height={140} /></Panel></div>
      </>)}
      {tab === "Territories" && <DataTable title="Territories" rows={TERRITORIES} cols={[{ key: "zone", label: "Zone", render: (z) => <b>{z.zone}</b> }, { key: "branch", label: "Branch" }, { key: "jobs", label: "Jobs today", right: true }, { key: "techs", label: "Technicians", right: true }, { key: "resp", label: "Avg response", right: true, render: (z) => `${z.resp} min` }, { key: "rev", label: "Revenue (MTD)", right: true, render: (z) => inr(z.rev) }, { key: "sla", label: "SLA", right: true, render: (z) => <b className={z.sla < 88 ? "neg" : ""}>{z.sla}%</b> }]} />}
      {tab === "Teams" && <div className="grid g3">{SUP.map(([s, z, n]) => <Panel key={s} title={z} sub={`${n} technicians`}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Avatar name={s} /><div><b>{s}</b><div className="faint" style={{ fontSize: 11.5 }}>Supervisor</div></div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{TECHS.filter((t) => t.branch === (z.startsWith("Ranchi") ? "ranchi" : z.toLowerCase())).slice(0, 6).map((t) => <Chip key={t.id}>{t.name.split(" ")[0]}</Chip>)}</div></Panel>)}</div>}
      {tab === "Route Planning" && <RoutePlan t={techById("T01")} />}
    </div>
  );
}
