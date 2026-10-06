"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { Chip, Insight, Panel, Prog } from "@/components/ui";
import { AMCS } from "@/data/ops";
import { CUSTOMERS, ASSETS } from "@/data/core";
import { full, inr, amcTone } from "@/lib/format";

export default function AMCDetail({ params }) {
  const { id } = use(params);
  const a = AMCS.find((x) => x.id === id);
  if (!a) notFound();
  const c = CUSTOMERS.find((x) => x.name === a.cust);
  const parts = Math.round(a.cost * 0.34), tech = Math.round(a.cost * 0.5), travel = a.cost - parts - tech, profit = a.value - a.cost, m = (profit / a.value) * 100;
  const visits = Array.from({ length: a.incl }, (_, i) => ({ n: i + 1, done: i < a.used, date: i < a.used ? ["22 Jan", "20 Apr", "17 Jul", "12 Oct", "—", "—"][i] + " 2026" : i === a.used ? a.next : "Scheduled" }));
  const covered = ASSETS.filter((x) => x.custId === c?.id).slice(0, 6);
  return (
    <div className="page">
      <div className="ph" style={{ alignItems: "flex-start" }}>
        <div className="grow"><div className="lbl" style={{ marginBottom: 4 }}>AMC contract</div><h1 className="mono" style={{ fontSize: 28 }}>{a.id}</h1><p style={{ fontSize: 15 }}><Link className="link" href={`/customers/${c?.id}`}><b>{a.cust}</b></Link> · {a.scope}</p></div>
        <Chip tone={amcTone(a.status)} dot>{a.status}</Chip><button className="btn pri">Start renewal</button>
      </div>
      {a.renewal === "Not initiated" && <Insight tone="r"><b>{a.cust}’s {inr(a.value)} AMC expires in {a.days} days and renewal has not yet started.</b> Renewal probability is {a.prob}% — assign the AMC manager and send the quote today.</Insight>}
      <div className="kpis" style={{ gridTemplateColumns: "repeat(8, minmax(0,1fr))" }}>
        {[["Contract value", inr(a.value)], ["Coverage", a.assets === 42 ? "42 AC units" : `${a.assets} assets`], ["Start", a.start], ["Expiry", a.expiry], ["Visits included", a.incl], ["Completed", a.used], ["Next visit", a.next], ["SLA", a.sla]].map(([l, v]) => <div key={l} className="kpi"><div className="lbl">{l}</div><div className="v" style={{ fontSize: 17 }}>{v}</div></div>)}
      </div>
      <div className="grid g-main">
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Preventive visit schedule" sub={`${a.used} of ${a.incl} completed`}>
            <div className="stepper">{visits.map((v) => <div key={v.n} className={v.done ? "done" : v.n === a.used + 1 ? "now" : ""}>Visit {v.n}<small>{v.date}</small></div>)}</div>
            <div className="muted" style={{ marginTop: 10, fontSize: 12.5 }}>Each visit follows a 14-point checklist (filters, gas pressure, electrical, drainage). Issues found create linked jobs automatically; next visit is auto-scheduled on completion.</div>
          </Panel>
          <Panel title="Covered assets" sub={`${a.assets} total`} tight>{covered.map((x) => <Link key={x.id} href={`/assets/${x.id}`} className="feed-i"><b className="mono">{x.id}</b><span style={{ flex: 1 }}>{x.brand} {x.model} · {x.loc}</span><Chip tone={x.cond === "Good" ? "g" : "a"}>{x.cond}</Chip></Link>)}{!covered.length && <div style={{ padding: 14 }} className="muted">Asset list loads from customer registry.</div>}</Panel>
        </div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Contract profitability" sub={m < 10 ? "below target" : ""}>
            <dl className="kv"><dt>Contract revenue</dt><dd>{full(a.value)}</dd><dt>Visits used</dt><dd>{a.used} / {a.incl}</dd><dt>Parts cost</dt><dd className="neg">−{full(parts)}</dd><dt>Technician cost</dt><dd className="neg">−{full(tech)}</dd><dt>Travel cost</dt><dd className="neg">−{full(travel)}</dd><dt className="tot">Profit</dt><dd className={`tot ${profit > 0 ? "pos" : "neg"}`}>{full(profit)} · {m.toFixed(1)}%</dd></dl>
            {m < 10 && <div className="insight r" style={{ margin: "12px 0 0" }}><div><b>Low-margin contract.</b> Emergency callouts consume most of the margin — reprice at renewal.</div></div>}
          </Panel>
          <Panel title="Renewal"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span className="muted">Probability</span><b>{a.prob}%</b></div><Prog v={a.prob} tone={a.prob > 75 ? "g" : a.prob > 60 ? "a" : "r"} /><dl className="kv" style={{ marginTop: 12 }}><dt>Status</dt><dd>{a.renewal || "Not due"}</dd><dt>Days to expiry</dt><dd>{a.days}</dd></dl></Panel>
        </div>
      </div>
    </div>
  );
}
