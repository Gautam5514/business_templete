"use client";
import Link from "next/link";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import DataTable from "@/components/table";
import { Chip, Insight, Panel, PrioChip, StatusChip, Tabs, Stars, Mono, Prog } from "@/components/ui";
import { Bars } from "@/components/charts";
import { custById, assetsOf } from "@/data/core";
import { AMCS, COMMS, DOCS, FEEDBACK, INVOICES, JOBS, PAYMENTS } from "@/data/ops";
import { historyOf } from "@/lib/history";
import { inr, full } from "@/lib/format";

const TABS = ["Overview", "Service Requests", "Jobs", "Assets", "AMC", "Invoices", "Payments", "Documents", "Feedback", "Activity"];
export default function Customer360({ params }) {
  const { id } = use(params);
  const c = custById(id);
  const [tab, setTab] = useState("Overview");
  if (!c) notFound();
  const hist = historyOf(c), assets = assetsOf(c.id), amcs = AMCS.filter((a) => a.cust === c.name), jobs = JOBS.filter((j) => j.customer === c.name);
  const invs = INVOICES.filter((i) => i.customer === c.name).slice(0, 8), pays = PAYMENTS.filter((p) => p.customer === c.name);
  const rep = assets.filter((a) => a.repeat >= 3);
  const fb = FEEDBACK.filter((f) => f.customer === c.name);
  return (
    <div className="page">
      <div className="ph" style={{ alignItems: "flex-start" }}>
        <div className="grow"><div className="lbl" style={{ marginBottom: 4 }}>Customer 360° · {c.id}</div><h1 style={{ fontSize: 28 }}>{c.name}</h1><p style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>{c.seg.map((s) => <Chip key={s} tone={s.includes("Risk") ? "r" : s === "High Value" ? "g" : "n"}>{s}</Chip>)}<span className="muted">{c.contact}</span></p></div>
        <a className="btn"><Phone size={13} /> {c.phone}</a><Link className="btn pri" href="/dispatch">New service request</Link>
      </div>
      <div className="kpis" style={{ gridTemplateColumns: "repeat(8, minmax(0,1fr))" }}>
        {[["Type", c.type], ["Customer since", c.since], ["Locations", c.locations], ["Active assets", c.assets], ["Active AMCs", c.amcs], ["Lifetime revenue", inr(c.ltv)], ["Outstanding", c.out ? inr(c.out) : "₹0"], ["Customer rating", `★ ${c.rating}`]].map(([l, v]) => <div key={l} className="kpi"><div className="lbl">{l}</div><div className="v" style={{ fontSize: 19, color: l === "Outstanding" && c.out ? "var(--red)" : undefined }}>{v}</div></div>)}
      </div>
      {rep.length > 0 && <Insight tone="r"><b>{rep[0].id} has had {rep[0].repeat} complaints in 90 days.</b> <Link className="link" href={`/assets/${rep[0].id}`}>Review asset →</Link></Insight>}
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="grid g-main">
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Panel title="Service history" sub={`${hist.length} recent events`}>
              <div className="tl">{hist.map((h, i) => <div key={i} className={`tl-i ${h.s === "Completed" ? "done" : "now"}`}><div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><b className="mono" style={{ width: 52 }}>{h.d}</b><span style={{ fontWeight: 560 }}>{h.t}</span><span className="faint">—</span><Link href={`/jobs/${h.j}`} className="link">{h.j}</Link><Chip tone={h.s === "Completed" ? "g" : "b"}>{h.s}</Chip></div></div>)}</div>
            </Panel>
            <Panel title="Where they call us" sub="issues by category · last 12 months">
              <Bars data={[["AC", 34], ["Electrical", 12], ["CCTV", 9], ["RO", 6], ["Facility", 5]].map(([k, v]) => ({ k, v, color: k === "AC" ? "ink" : "blue" }))} height={140} />
            </Panel>
          </div>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Panel title="Financial position"><dl className="kv"><dt>Lifetime revenue</dt><dd>{full(c.ltv)}</dd><dt>AMC value</dt><dd>{inr(amcs.reduce((a, m) => a + m.value, 0))}</dd><dt>Parts revenue</dt><dd>{inr(c.ltv * 0.27)}</dd><dt>Outstanding</dt><dd className={c.out ? "neg" : ""}>{full(c.out)}</dd><dt>Est. profitability</dt><dd>{(32 + (c.id.charCodeAt(3) % 9)).toFixed(0)}%</dd></dl></Panel>
            <Panel title="Open work" tight>{jobs.filter((j) => j.status !== "Completed").map((j) => <Link key={j.id} href={`/jobs/${j.id}`} className="feed-i"><Mono>{j.id}</Mono><span style={{ flex: 1 }}>{j.service}</span><StatusChip s={j.status} /></Link>)}{!jobs.some((j) => j.status !== "Completed") && <div style={{ padding: 14 }} className="muted">No open jobs.</div>}</Panel>
            <Panel title="Communication" tight>{COMMS.filter((x) => x.customer === c.name).slice(0, 3).map((x, i) => <div key={i} className="feed-i" style={{ display: "block" }}><div className="faint" style={{ fontSize: 11 }}>{x.ch} · {x.time}</div>{x.text}</div>)}{!COMMS.some((x) => x.customer === c.name) && <div style={{ padding: 14 }} className="muted">Automated reminders are on.</div>}</Panel>
          </div>
        </div>
      )}
      {(tab === "Service Requests" || tab === "Jobs") && <DataTable title={tab} rows={jobs.length ? jobs : JOBS.slice(0, 5)} cols={[{ key: "id", label: "Job", render: (j) => <Mono href={`/jobs/${j.id}`}>{j.id}</Mono> }, { key: "sr", label: "Request" }, { key: "service", label: "Service" }, { key: "prio", label: "Priority", render: (j) => <PrioChip p={j.prio} /> }, { key: "status", label: "Status", render: (j) => <StatusChip s={j.status} /> }, { key: "value", label: "Value", right: true, render: (j) => inr(j.value) }]} />}
      {tab === "Assets" && <DataTable title="Assets" rows={assets} cols={[{ key: "id", label: "Asset", render: (a) => <Mono href={`/assets/${a.id}`}>{a.id}</Mono> }, { key: "type", label: "Type" }, { key: "brand", label: "Brand" }, { key: "model", label: "Model" }, { key: "loc", label: "Location" }, { key: "warranty", label: "Warranty" }, { key: "next", label: "Next service" }, { key: "cond", label: "Condition", render: (a) => <Chip tone={a.cond === "Good" ? "g" : a.cond === "Fair" ? "n" : "r"}>{a.cond}</Chip> }]} />}
      {tab === "AMC" && <div className="grid g2">{amcs.length ? amcs.map((a) => <Panel key={a.id} title={a.id} sub={a.scope} actions={<Link href={`/amc/${a.id}`} className="link">Open</Link>}><dl className="kv"><dt>Value</dt><dd>{inr(a.value)}</dd><dt>Visits</dt><dd>{a.used}/{a.incl}</dd><dt>Expiry</dt><dd>{a.expiry}</dd></dl><div style={{ marginTop: 10 }}><Prog v={a.used} max={a.incl} /></div></Panel>) : <Panel title="No AMC"><span className="muted">No active AMC. Upsell opportunity.</span></Panel>}</div>}
      {tab === "Invoices" && <DataTable title="Invoices" rows={invs.length ? invs : INVOICES.slice(0, 5)} cols={[{ key: "id", label: "Invoice", render: (i) => <Mono>{i.id}</Mono> }, { key: "job", label: "Job" }, { key: "total", label: "Total", right: true, render: (i) => inr(i.total) }, { key: "balance", label: "Balance", right: true, render: (i) => inr(i.balance) }, { key: "due", label: "Due" }, { key: "status", label: "Status", render: (i) => <Chip tone={i.status === "Paid" ? "g" : i.status === "Overdue" ? "r" : "a"}>{i.status}</Chip> }]} />}
      {tab === "Payments" && <Panel title="Payments" tight>{(pays.length ? pays : PAYMENTS.slice(0, 3)).map((p) => <div key={p.id} className="feed-i"><Mono>{p.id}</Mono><span style={{ flex: 1 }}>{p.mode} · {p.ref}</span><b>{full(p.amount)}</b><span className="faint">{p.time}</span></div>)}</Panel>}
      {tab === "Documents" && <Panel title="Documents" tight>{DOCS.slice(0, 6).map((d) => <div key={d.name} className="feed-i"><span style={{ flex: 1 }}><b style={{ fontWeight: 560 }}>{d.name}</b></span><Chip>{d.type}</Chip><span className="faint">{d.date}</span></div>)}</Panel>}
      {tab === "Feedback" && <Panel title="Feedback" tight>{(fb.length ? fb : FEEDBACK.slice(0, 2)).map((f, i) => <div key={i} className="feed-i" style={{ display: "block" }}><Stars v={f.overall} /> <span className="muted">· {f.tech}</span><div>{f.comment}</div></div>)}</Panel>}
      {tab === "Activity" && <Panel title="Activity" tight>{hist.map((h, i) => <div key={i} className="feed-i"><b className="mono" style={{ width: 52 }}>{h.d}</b><span style={{ flex: 1 }}>{h.t}</span><span className="faint">{h.j}</span></div>)}</Panel>}
    </div>
  );
}
