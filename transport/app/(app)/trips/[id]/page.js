"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, Camera, Check, FileText, Phone, Share2 } from "lucide-react";
import FleetMap from "@/components/FleetMap";
import { Avatar, Chip, Panel, Plate, Prog, TripChip } from "@/components/ui";
import { tripById, fmtMin, VEHICLES } from "@/data/fleet";
import { metrics, pnl, riskFor, timeline, waypoints } from "@/lib/tripmeta";
import { full, inr, pct } from "@/lib/format";

export default function TripDetail() {
  const { id } = useParams();
  const t = tripById(id);
  const [grow, setGrow] = useState(0);
  useEffect(() => { const x = setTimeout(() => setGrow(1), 120); return () => clearTimeout(x); }, [id]);
  if (!t) return <div className="page"><h1>Trip not found</h1><Link href="/trips" className="link">Back to trips</Link></div>;

  const m = metrics(t), P = pnl(t), tl = timeline(t), wp = waypoints(t), risk = riskFor(t);
  const profit = P.revenue - P.totalCost, margin = (profit / P.revenue) * 100;
  const doneCount = tl.filter((e) => e.state === "done").length;
  const curIdx = wp.reduce((a, w, i) => (w.km <= m.covered ? i : a), 0);
  const v = t.vehicle;
  const live = ["transit", "delayed", "breakdown", "ofd", "loading", "dispatched", "athub"].includes(t.status);
  const nextWp = wp[curIdx + 1];
  const riskTone = risk.level === "High" ? "r" : risk.level === "Medium" ? "a" : "g";

  return (
    <div className="page">
      <Link href="/trips" className="faint" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 10 }}><ArrowLeft size={13} /> All trips</Link>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h1 className="mono" style={{ margin: 0, fontSize: 30, letterSpacing: "-0.03em" }}>{t.id}</h1>
            <TripChip s={t.status} />{t.delay > 20 && <Chip tone="r">+{t.delay} min</Chip>}<Chip tone={riskTone}>{risk.level} risk</Chip>
          </div>
          <div style={{ fontSize: 16, marginTop: 4 }}><b>{t.from}</b> <span className="faint">→</span> <b>{t.to}</b> <span className="faint" style={{ marginLeft: 10 }}>{t.km} km · {t.load} MT {t.material}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><Phone size={14} /> Call driver</button><button className="btn"><Share2 size={14} /> Share live link</button><button className="btn pri"><FileText size={14} /> Trip sheet</button>
        </div>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
        {[["Distance covered", `${m.covered} km`], ["Remaining", `${m.remaining} km`], ["Average speed", `${m.avg} km/h`], ["Fuel consumed", `${m.fuelL} L`], ["Current mileage", `${m.mileage} km/L`, m.mileage < v.mileage - 0.15 ? "a" : null], ["Profit so far", full(m.sofar), "g", `projected ${full(profit)}`], ["Delay", m.delay ? `+${m.delay} min` : "On time", m.delay > 20 ? "r" : "g"]].map(([l, val, tone, hint]) => (
          <div key={l} className="kpi"><div className="lbl">{l}</div><div className="v" style={tone ? { color: `var(--${{ a: "amber", r: "red", g: "green" }[tone]})` } : null}>{val}</div>{hint && <div className="d">{hint}</div>}</div>
        ))}
      </div>

      {/* route progress */}
      <Panel title="Route progress" sub={`${t.customer.short} · ETA ${fmtMin(t.etaMin)}`} style={{ marginBottom: 14 }}
        actions={nextWp && <span className="muted" style={{ fontSize: 12 }}>Next: <b>{nextWp.name}</b> in {nextWp.km - m.covered} km</span>}>
        <div style={{ position: "relative", padding: "14px 4px 4px" }}>
          <div style={{ position: "absolute", left: `${50 / wp.length}%`, right: `${50 / wp.length}%`, top: 27, height: 2, background: "var(--line)" }} />
          <div style={{ position: "absolute", left: `${50 / wp.length}%`, top: 27, height: 2, background: "var(--green)", width: `${grow * ((curIdx + (nextWp ? (m.covered - wp[curIdx].km) / (nextWp.km - wp[curIdx].km) : 0)) / (wp.length - 1)) * (100 - 100 / wp.length)}%`, transition: "width 1.4s cubic-bezier(.2,.8,.2,1)" }} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${wp.length},1fr)`, position: "relative" }}>
            {wp.map((w, i) => {
              const done = i < curIdx || (i === curIdx && m.covered >= w.km && t.progress >= 1), cur = i === curIdx && t.progress < 1;
              return (
                <div key={w.name} style={{ textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", margin: "0 auto", display: "grid", placeItems: "center", background: cur ? "var(--accent)" : done || i < curIdx ? "var(--green)" : "var(--panel)", border: `2px solid ${cur ? "var(--accent)" : i < curIdx || done ? "var(--green)" : "var(--line)"}`, color: "#fff", boxShadow: cur ? "0 0 0 5px var(--accent-soft)" : "none" }}>
                    {i < curIdx || done ? <Check size={14} /> : cur ? <i style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} /> : null}
                  </div>
                  <div style={{ fontWeight: cur ? 650 : 500, marginTop: 7, fontSize: 13 }}>{w.name}{cur && <span style={{ color: "var(--accent)" }}> ● now</span>}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{w.km} km</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "var(--line2)", border: "1px solid var(--line2)", borderRadius: 8, overflow: "hidden", marginTop: 16 }}>
          {[["Distance left", `${m.remaining} km`], ["ETA", fmtMin(t.etaMin)], ["Delay", m.delay ? `+${m.delay} min` : "None"], ["Upcoming toll", nextWp ? `${nextWp.name} Toll · ₹${[560, 780, 960][curIdx % 3]}` : "—"], ["Upcoming hub", `${t.to} Hub · gate ready`]].map(([a, b]) => (
            <div key={a} style={{ background: "var(--panel)", padding: "9px 12px" }}><div className="lbl">{a}</div><div style={{ fontWeight: 600, marginTop: 2 }}>{b}</div></div>
          ))}
        </div>
      </Panel>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 380px", alignItems: "start" }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ position: "relative", height: 330 }}>
            <FleetMap vehicles={[v]} selectedId={null} fillParent fitRoute={t.route} cardAnchor={false} showAllRoutes={false} focusRoute={t.route} />
          </div>
          <Panel title="Journey timeline" sub={`${doneCount} of ${tl.length} milestones`} actions={<span className="chip g">live</span>}>
            <div className="tl" style={{ position: "relative" }}>
              <div className="tl-fill" style={{ height: grow ? `${Math.max(0, (doneCount - 1) / (tl.length - 1)) * 94}%` : 0 }} />
              {tl.map((e, i) => (
                <div key={i} className={`tl-i ${e.state}`}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <b style={{ fontSize: 13 }}>{e.label}</b>
                    <span className="faint">{e.state === "todo" ? "expected " : ""}{e.time}</span>
                    {e.doc && e.state !== "todo" && <span className="chip n" style={{ marginLeft: "auto" }}><Camera size={11} /> {e.doc}</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{e.note}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{e.loc} · {e.who}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <Panel title="Trip P&L" sub="live · updates as expenses post">
            <dl className="kv">
              <dt>Freight</dt><dd>{full(P.freight)}</dd><dt>Other charges</dt><dd>{full(P.other)}</dd>
              <dt className="tot">Total revenue</dt><dd className="tot">{full(P.revenue)}</dd>
            </dl>
            <div className="lbl" style={{ margin: "14px 0 6px" }}>Expenses</div>
            <dl className="kv">
              {Object.entries(P.cost).map(([k, val]) => <Fragment key={k}><dt>{k}</dt><dd>{full(val)}</dd></Fragment>)}
              <dt className="tot">Total cost</dt><dd className="tot">{full(P.totalCost)}</dd>
            </dl>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "var(--green-soft)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div><div className="lbl">Estimated profit</div><div className="big pos">{full(profit)}</div></div>
              <div style={{ textAlign: "right" }}><div className="lbl">Margin</div><div className="big pos" style={{ fontSize: 22 }}>{pct(margin, 1)}</div></div>
            </div>
            <div className="faint" style={{ marginTop: 8, fontSize: 12 }}>Route average margin on {t.from} → {t.to}: {pct(t.route.margin, 1)}</div>
          </Panel>

          <Panel title="Trip risk engine" actions={<Chip tone={riskTone}>{risk.level}</Chip>}>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 6 }}>{risk.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            <div className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span className="muted">ETA buffer</span><b>{risk.buffer}</b></div>
            <Prog v={risk.level === "High" ? 85 : risk.level === "Medium" ? 52 : 18} tone={risk.level === "High" ? "r" : risk.level === "Medium" ? "a" : "g"} />
          </Panel>

          <Panel title="Vehicle & driver">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Avatar name={t.driver.name} size={36} /><div><Link href={`/drivers/${t.driver.id}`} className="link"><b>{t.driver.name}</b></Link><div className="faint">{t.driver.exp} yrs · rating {t.driver.rating} · {t.driver.ontime}% on time</div></div></div>
            <div className="hr" />
            <dl className="kv">
              <dt>Vehicle</dt><dd><Plate id={v.id} /></dd><dt>Model</dt><dd>{v.model}</dd><dt>Type</dt><dd>{v.type}</dd>
              <dt>Customer</dt><dd><Link className="link" href={`/customers/${t.customerId}`}>{t.customer.short}</Link></dd>
              <dt>Freight</dt><dd>{full(t.freight)}</dd><dt>POD</dt><dd>{t.pod}</dd>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
