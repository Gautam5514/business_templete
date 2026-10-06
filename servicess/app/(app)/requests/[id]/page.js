"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { Camera, Phone } from "lucide-react";
import { Chip, Panel, PrioChip, SlaTimer, StatusChip, Person, PageHead, Mono } from "@/components/ui";
import { JOBS, jobsOf } from "@/data/ops";
import { assetById, techById, hhmm, NOW } from "@/data/core";
import { useApp } from "@/lib/store";

export default function RequestDetail({ params }) {
  const { id } = use(params);
  const { assigned } = useApp();
  const j = JOBS.find((x) => x.sr === id);
  if (!j) notFound();
  const t = techById(assigned[j.id] || j.tech), a = j.asset && assetById(j.asset);
  const hist = jobsOf(j.customer).filter((x) => x.id !== j.id).slice(0, 4);
  return (
    <div className="page">
      <PageHead title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="mono">{j.sr}</span><PrioChip p={j.prio} /><StatusChip s={assigned[j.id] ? "Technician Assigned" : j.status} /></span>} sub={`${j.customer} · ${j.service} · ${j.issue}`}>
        <Link href={`/jobs/${j.id}`} className="btn pri">Open Job 360° · {j.id}</Link>
        {!t && <Link href="/dispatch" className="btn">Assign in dispatch</Link>}
      </PageHead>
      <div className="grid g-main">
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Request">
            <div className="metric">
              {[["Customer", <Link key="c" className="link" href={`/customers/${j.cust.id}`}>{j.customer}</Link>], ["Service", j.service], ["Issue", j.issue], ["Priority", <PrioChip key="p" p={j.prio} />], ["SLA", j.sla >= 1440 ? "24 hours" : `${j.sla / 60} hours`], ["Requested", hhmm(j.req)], ["Source", j.source], ["Payment", j.pay], ["Location", `${j.loc}`]].map(([k, v]) => <div key={k}><div className="lbl">{k}</div><b>{v}</b></div>)}
            </div>
          </Panel>
          <div className="grid g2">
            <Panel title="Assigned technician">{t ? <><Person t={t} sub={t.title} /><dl className="kv" style={{ marginTop: 12 }}><dt>Rating</dt><dd>★ {t.rating}</dd><dt>First-time fix</dt><dd>{t.ftf}%</dd><dt>Jobs today</dt><dd>{t.jobsToday}</dd><dt>Status</dt><dd style={{ textTransform: "capitalize" }}>{t.status}</dd></dl></> : <div><b className="neg">No technician assigned</b><p className="muted" style={{ marginBottom: 0 }}>Required skill: {j.skill}. Open dispatch to see ranked matches.</p></div>}</Panel>
            <Panel title="Customer">
              <b>{j.cust.name}</b><div className="muted">{j.cust.contact}</div>
              <div style={{ margin: "10px 0" }}><a className="btn sm"><Phone size={12} /> {j.cust.phone}</a></div>
              <dl className="kv"><dt>Type</dt><dd>{j.cust.type}</dd><dt>Rating</dt><dd>★ {j.cust.rating}</dd><dt>Active AMCs</dt><dd>{j.cust.amcs}</dd></dl>
            </Panel>
          </div>
          <Panel title="Asset" actions={a && <Link href={`/assets/${a.id}`} className="link">Asset 360°</Link>}>
            {a ? <div className="metric">{[["Asset ID", a.id], ["Equipment", `${a.brand} ${a.model}`], ["Location", a.loc], ["Warranty", a.warranty], ["AMC", a.amc], ["Condition", a.cond]].map(([k, v]) => <div key={k}><div className="lbl">{k}</div><b>{v}</b></div>)}</div> : <span className="muted">No asset linked to this request.</span>}
          </Panel>
          <Panel title="Service history" sub={`${j.customer}`} tight>
            {hist.length ? hist.map((h) => <Link key={h.id} href={`/jobs/${h.id}`} className="feed-i"><Mono>{h.id}</Mono><span style={{ flex: 1 }}>{h.service}</span><StatusChip s={h.status} /></Link>) : <div style={{ padding: 14 }} className="muted">No earlier jobs today. See customer profile for full history.</div>}
          </Panel>
          <Panel title="Notes & photos">
            <div className="muted" style={{ marginBottom: 10 }}>Customer reports {j.issue.toLowerCase()}. Contact before arrival. {j.prio === "Emergency" && "Emergency: tenants affected, approval pre-authorised up to ₹40,000 under AMC."}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>{[1, 2, 3, 4].map((n) => <div key={n} className="drop" style={{ height: 74, display: "grid", placeItems: "center", color: "var(--ink3)", fontSize: 11 }}><div style={{ textAlign: "center" }}><Camera size={16} style={{ margin: "0 auto 2px" }} />{n < 3 ? "Customer photo" : "Add photo"}</div></div>)}</div>
          </Panel>
        </div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="SLA clock">
            {j.status === "Completed" ? <Chip tone="g">SLA met</Chip> : <div style={{ textAlign: "center", padding: "8px 0" }}><SlaTimer left={j.slaLeft} total={j.sla} big /><div className="faint" style={{ marginTop: 8, fontSize: 12 }}>Requested {hhmm(j.req)} · due {hhmm(j.req + j.sla)}</div></div>}
            {j.slaLeft < 60 && j.status !== "Completed" && <div className="insight r" style={{ margin: "12px 0 0" }}><div><b>Business impact:</b> breach in {Math.max(0, j.slaLeft)} min puts ₹{j.value.toLocaleString("en-IN")} job and AMC penalty clause at risk.</div></div>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
