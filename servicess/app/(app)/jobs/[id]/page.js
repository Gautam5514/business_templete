"use client";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { Check, FastForward, MessageSquare, Play } from "lucide-react";
import { Chip, Panel, PrioChip, SlaTimer, StatusChip, Person, Mono, Avatar } from "@/components/ui";
import { JOBS, COMMS } from "@/data/ops";
import { assetById, techById, hhmm, NOW } from "@/data/core";
import { STEPS, STAGE_OF, stepTimes, stepDetail, costing } from "@/lib/journey";
import { full, inr, cx } from "@/lib/format";
import { useApp } from "@/lib/store";

const EST = { part: 18500, labour: 2800, gas: 3200, visit: 800, gst: 4554, total: 29854 };

export default function Job360({ params }) {
  const { id } = use(params);
  const { assigned, notify } = useApp();
  const j = JOBS.find((x) => x.id === id);
  if (!j) notFound();
  const tId = assigned[j.id] || j.tech, t = techById(tId), a = j.asset && assetById(j.asset);
  const base = assigned[j.id] ? 3 : STAGE_OF[j.status] ?? 2;
  const [stage, setStage] = useState(base);
  const [play, setPlay] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!play) return;
    timer.current = setInterval(() => setStage((s) => { if (s >= 14) { setPlay(false); return s; } return s + 1; }), 900);
    return () => clearInterval(timer.current);
  }, [play]);
  const times = stepTimes(j, !!assigned[j.id]);
  const cost = costing(j.id === "JOB-2841" ? { ...j, value: EST.total } : j);
  const status = stage >= 14 ? "Completed" : stage >= 9 ? "In Progress" : stage >= 7 ? "Approval Pending" : stage >= 6 ? "Diagnosis" : stage >= 5 ? "Arrived" : stage >= 4 ? "Technician En Route" : stage >= 3 ? "Technician Assigned" : j.status;
  const arrival = stage >= 5 ? hhmm(times[4]) : "—";
  const onSite = stage >= 5 ? Math.max(0, Math.round(Math.min(NOW + 30, times[Math.min(stage, 13)]) - times[4])) : 0;
  const done = stage >= 11;
  const hasEst = stage >= 7, approved = stage >= 8;
  const left = j.slaLeft;

  return (
    <div className="page">
      <div className="ph" style={{ alignItems: "flex-start" }}>
        <div className="grow">
          <div className="lbl" style={{ marginBottom: 4 }}>Job 360° · <Link href={`/requests/${j.sr}`} className="link">{j.sr}</Link></div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span className="mono">{j.id}</span><span style={{ fontWeight: 560 }}>{j.service === "Commercial AC Breakdown" ? j.service : `${j.service}`}</span></h1>
          <p style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}><StatusChip s={status} /> <PrioChip p={j.prio} /> <span>Customer <Link className="link" href={`/customers/${j.cust.id}`}>{j.customer}</Link></span>{a && <span>· Asset <Link className="link" href={`/assets/${a.id}`}>{a.brand} {a.model}</Link></span>}<span>· {a ? a.loc : j.loc}</span></p>
        </div>
        <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
          {j.status !== "Completed" && stage < 11 ? <div><div className="lbl" style={{ textAlign: "right", marginBottom: 3 }}>SLA remaining · {j.sla >= 1440 ? "24h" : `${j.sla / 60}h`}</div><SlaTimer left={left} total={j.sla} big /></div> : <Chip tone="g">SLA met</Chip>}
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn" disabled={stage >= 14} onClick={() => { setStage((s) => s + 1); notify(`Journey advanced → ${STEPS[Math.min(stage, 13)]}`); }}><FastForward size={13} /> Next step</button>
            <button className="btn pri" disabled={stage >= 14} onClick={() => setPlay(!play)}><Play size={13} /> {play ? "Pause" : "Play journey"}</button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14, padding: "14px 16px" }}>
        <div className="metric" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
          <div><div className="lbl">Technician</div>{t ? <Person t={t} /> : <b className="neg">Not assigned</b>}</div>
          <div><div className="lbl">Status</div><b>{status}</b></div>
          <div><div className="lbl">Arrival</div><b>{arrival}</b></div>
          <div><div className="lbl">Time on site</div><b>{stage >= 5 ? `${onSite} min` : "—"}</b></div>
          <div><div className="lbl">Estimated completion</div><b>{stage >= 3 ? hhmm(times[10]) : "after assignment"}</b></div>
        </div>
      </div>

      <div className="stepper" style={{ marginBottom: 14 }}>
        {STEPS.map((s, i) => <div key={s} className={i < stage ? "done" : i === stage ? "now" : ""}>{s}<small>{i < stage ? hhmm(times[i]) : i === stage ? "next" : ""}</small></div>)}
      </div>

      <div className="grid g-main">
        <div style={{ display: "grid", gap: 14, alignContent: "start", minWidth: 0 }}>
          <Panel title="Job journey" sub={`${Math.min(stage, 14)} of 14 events`}>
            <div className="tl">
              {STEPS.map((s, i) => (
                <div key={s} className={cx("tl-i", i < stage ? "done" : i === stage ? "now" : "todo", i === stage - 1 && play && "flash")}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><b style={{ fontWeight: 600 }}>{s}</b><span className="faint mono" style={{ fontSize: 11.5 }}>{i < stage ? hhmm(times[i]) : i === stage ? "up next" : ""}</span></div>
                  {i < stage && <div className="muted" style={{ fontSize: 12.5 }}>{stepDetail(i, j, t)}</div>}
                </div>
              ))}
            </div>
          </Panel>

          {stage >= 6 && (
            <Panel title="Diagnosis" sub={t ? `recorded by ${t.name}` : ""}>
              <div className="metric">{[["Issue found", "Compressor not starting"], ["Root cause", "Failed run capacitor → winding burnout"], ["Recommended repair", "Compressor replacement"], ["Parts required", "Compressor, capacitor, R410A"], ["Estimated time", "2h 10m"], ["Labour", "₹2,800"]].map(([k, v]) => <div key={k}><div className="lbl">{k}</div><b>{v}</b></div>)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>{["Nameplate", "Compressor", "Capacitor", "Gas pressure"].map((x) => <div key={x} className="drop" style={{ height: 62, display: "grid", placeItems: "center", fontSize: 11, color: "var(--ink3)" }}>{x}</div>)}</div>
            </Panel>
          )}

          {hasEst && (
            <Panel title="Estimate EST-4410" sub={approved ? "approved by customer" : "sent to customer"} actions={<Chip tone={approved ? "g" : "a"} dot>{approved ? "Approved" : "Awaiting approval"}</Chip>}>
              <div className="grid g2">
                <dl className="kv"><dt>Compressor (part)</dt><dd>{full(EST.part)}</dd><dt>Labour</dt><dd>{full(EST.labour)}</dd><dt>Gas refill</dt><dd>{full(EST.gas)}</dd><dt>Visit charge</dt><dd>{full(EST.visit)}</dd><dt>GST 18%</dt><dd>{full(EST.gst)}</dd><dt className="tot">Total</dt><dd className="tot">{full(EST.total)}</dd></dl>
                <div>
                  <div className="lbl">Digital approval</div>
                  {approved ? <div style={{ marginTop: 6 }}><div style={{ fontFamily: "cursive", fontSize: 26, color: "var(--accent)" }}>A. Khanna</div><div className="muted" style={{ fontSize: 12 }}>Approved ₹29,854 · {hhmm(times[7])} · iPhone 14 · Apex Mall FM</div></div> : <div className="muted" style={{ marginTop: 6 }}>Customer has the estimate on WhatsApp. Approve, reject or request a call.</div>}
                </div>
              </div>
            </Panel>
          )}

          {stage >= 10 && (
            <Panel title="Parts used" sub="auto-deducted from technician van stock" tight>
              <table className="tbl"><thead><tr><th>Part</th><th>Qty</th><th className="r">Cost</th><th className="r">Selling</th><th>Asset</th><th>Timestamp</th></tr></thead>
                <tbody>{[["Compressor assembly", 1, 14200, 18500], ["Run capacitor 45µF", 1, 180, 420], ["R410A gas (kg)", 2.4, 1870, 3200]].map(([p, q, c, s]) => <tr key={p}><td>{p}</td><td>{q}</td><td className="r">{full(c)}</td><td className="r">{full(s)}</td><td className="mono">{j.asset || "—"}</td><td>{hhmm(times[9])}</td></tr>)}</tbody></table>
            </Panel>
          )}

          {done && (
            <Panel title="Service report" actions={<button className="btn sm" onClick={() => notify("Service report PDF generated")}>Download PDF</button>}>
              <div className="metric">{[["Customer", j.customer], ["Asset", a ? `${a.id}` : "—"], ["Complaint", j.issue], ["Work performed", "Compressor replaced, gas recharged, test run 45 min"], ["Technician", t?.name], ["Recommendation", "Replace unit at next budget cycle"]].map(([k, v]) => <div key={k}><div className="lbl">{k}</div><b style={{ fontWeight: 550 }}>{v}</b></div>)}</div>
            </Panel>
          )}
        </div>

        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Customer">
            <b>{j.cust.name}</b><div className="muted">{j.cust.contact}</div>
            <dl className="kv" style={{ marginTop: 10 }}><dt>Phone</dt><dd>{j.cust.phone}</dd><dt>Customer since</dt><dd>{j.cust.since}</dd><dt>Lifetime revenue</dt><dd>{inr(j.cust.ltv)}</dd><dt>Outstanding</dt><dd className={j.cust.out ? "neg" : ""}>{inr(j.cust.out)}</dd></dl>
          </Panel>
          {a && (
            <Panel title="Asset" actions={<Link className="link" href={`/assets/${a.id}`}>360°</Link>}>
              <b>{a.brand} {a.model}</b><div className="muted">{a.id} · {a.loc}</div>
              <dl className="kv" style={{ marginTop: 10 }}><dt>Warranty</dt><dd>{a.warranty}</dd><dt>AMC</dt><dd>{a.amc}</dd><dt>Last service</dt><dd>{a.last}</dd><dt>Condition</dt><dd>{a.cond}</dd></dl>
              {a.repeat > 2 && <div className="insight r" style={{ margin: "12px 0 0" }}><div><b>{a.repeat} cooling complaints in 90 days.</b> ₹{a.cost.toLocaleString("en-IN")} spent — evaluate replacement.</div></div>}
            </Panel>
          )}
          <Panel title="Job costing" sub="gross profit">
            <dl className="kv">
              <dt>Visit charge</dt><dd>{full(cost.visit)}</dd><dt>Labour revenue</dt><dd>{full(cost.labour)}</dd><dt>Parts revenue</dt><dd>{full(cost.parts)}</dd><dt>Other revenue</dt><dd>{full(cost.other)}</dd>
              <dt className="tot">Revenue</dt><dd className="tot">{full(cost.rev)}</dd>
              <dt>Technician cost</dt><dd className="neg">−{full(cost.techCost)}</dd><dt>Parts cost</dt><dd className="neg">−{full(cost.partsCost)}</dd><dt>Travel cost</dt><dd className="neg">−{full(cost.travel)}</dd><dt>Discount</dt><dd className="neg">−{full(cost.discount)}</dd>
              <dt className="tot">Gross profit</dt><dd className={cx("tot", cost.profit > 0 ? "pos" : "neg")}>{full(cost.profit)} · {cost.margin.toFixed(1)}%</dd>
            </dl>
          </Panel>
          <Panel title="Invoice & payment">
            {stage >= 13 ? <><Chip tone={stage >= 14 ? "g" : "a"} dot>{stage >= 14 ? "Paid" : "Invoice sent"}</Chip><dl className="kv" style={{ marginTop: 10 }}><dt>Invoice</dt><dd className="mono">INV-26/{4181 + (parseInt(j.id.slice(4)) % 7)}</dd><dt>Total</dt><dd>{full(j.id === "JOB-2841" ? EST.total : j.value)}</dd><dt>Mode</dt><dd>{j.pay}</dd>{stage >= 14 && <><dt>Received</dt><dd>{hhmm(times[13])}</dd></>}</dl></> : <span className="muted">Invoice is generated automatically after customer sign-off.</span>}
          </Panel>
          <Panel title="Customer communication" tight>
            {COMMS.filter((c) => c.customer === j.customer).slice(0, 3).map((c, i) => <div key={i} className="feed-i" style={{ alignItems: "flex-start" }}><MessageSquare size={14} className="faint" style={{ marginTop: 2 }} /><div><div className="faint" style={{ fontSize: 11 }}>{c.ch} · {c.time}</div>{c.text}</div></div>)}
            {!COMMS.some((c) => c.customer === j.customer) && <div style={{ padding: 14 }} className="muted">Automated updates will appear as the job progresses.</div>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
