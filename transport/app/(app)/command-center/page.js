"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, FileText, Monitor } from "lucide-react";
import FleetMap from "@/components/FleetMap";
import { Count, Kpis, Panel, Prog } from "@/components/ui";
import { Ring, LineChart, Bars, HBars } from "@/components/charts";
import { AlertFeed, FleetStrip, MorningBrief } from "@/components/blocks";
import { VEHICLES } from "@/data/fleet";
import { AGING, COMPANY, MONTHS, SERIES, matchFleet } from "@/data/ops";
import { inr } from "@/lib/format";

export default function CommandCenter() {
  const [filter, setFilter] = useState(null);
  const [sel, setSel] = useState("JH01DK4821");
  const [brief, setBrief] = useState(false);
  const k = COMPANY.kpi;
  const vehicles = useMemo(() => (filter ? VEHICLES.filter((v) => matchFleet(v, filter)) : VEHICLES), [filter]);
  const top = [...VEHICLES].filter((v) => v.ownership !== "Attached").sort((a, b) => b.profit - a.profit);
  const money = (n) => <Count to={n} fmt={(x) => inr(x)} />;

  return (
    <div className="page">
      <div className="ph">
        <div className="grow">
          <div className="lbl" style={{ marginBottom: 4 }}>Tuesday, 06 October · 03:12 PM</div>
          <h1 style={{ fontSize: 28 }}>Good Afternoon, Sanjay</h1>
          <p style={{ fontSize: 14 }}><b style={{ color: "var(--ink)" }}>128 vehicles. 64 active trips.</b> Here’s what needs your attention right now.</p>
        </div>
        <button className="btn" onClick={() => setBrief(true)}><FileText size={14} /> Morning brief</button>
        <Link href="/control-room" className="btn"><Monitor size={14} /> Control room</Link>
      </div>

      <Kpis cols={5} items={[
        { label: "Active Trips", value: <Count to={64} />, hint: "7 delayed · 2 at risk" },
        { label: "Vehicles Running", value: <Count to={72} />, hint: "57 on time" },
        { label: "Vehicles Idle", value: <Count to={31} />, hint: "≈ ₹6.2L/day unused", tone: "a" },
        { label: "Under Maintenance", value: <Count to={11} />, hint: "6 due this week" },
        { label: "Freight In Transit", value: money(k.transit), hint: "across 64 trips" },
        { label: "Revenue This Month", value: money(k.revenue), hint: "▲ 4.1% vs last month" },
        { label: "Collections", value: money(k.collections), hint: "80% of billed", tone: "g" },
        { label: "Outstanding", value: money(k.outstanding), hint: "₹32.8L overdue", tone: "r" },
        { label: "Fuel Cost", value: money(k.fuel), hint: "18.7% of revenue" },
        { label: "Fleet Utilization", value: <Count to={78} fmt={(x) => Math.round(x) + "%"} />, hint: "target 82%" },
      ]} />

      <div className="grid g-main-l" style={{ marginBottom: 14, gridTemplateColumns: "330px minmax(0,1fr)" }}>
        <Panel title="Fleet Health" sub="weighted across 6 signals">
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 14px" }}>
            <Ring value={COMPANY.health.score} size={176} stroke={12} label={<Count to={84} />} sub="out of 100" tone="green" />
          </div>
          <div style={{ display: "grid", gap: 11 }}>
            {COMPANY.health.parts.map(([n, v]) => (
              <div key={n}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span className="muted">{n}</span><b>{v}</b></div>
                <Prog v={v} tone={v >= 85 ? "g" : v >= 78 ? "" : "a"} />
              </div>
            ))}
          </div>
          <div className="hr" />
          <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>Collections (76) is the weakest signal — <b style={{ color: "var(--ink)" }}>₹32.8L is overdue</b> and 17 PODs are holding back invoices.</p>
        </Panel>

        <div style={{ display: "grid", gap: 10, gridTemplateRows: "auto 1fr", minWidth: 0 }}>
          <FleetStrip active={filter} onPick={setFilter} />
          <div style={{ position: "relative", minHeight: 470 }}>
            <FleetMap vehicles={vehicles} selectedId={sel} onSelect={setSel} fillParent />
            <Link href="/live-fleet" className="btn sm" style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>Open full map <ArrowUpRight size={13} /></Link>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", marginBottom: 14 }}>
        <Panel title="Needs your attention" sub="6 open · ranked by money at risk" tight actions={<Link href="/activity" className="link">All alerts</Link>}>
          <AlertFeed />
        </Panel>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Where money is leaking">
            <div style={{ display: "grid", gap: 14 }}>
              {[
                ["₹18.4L", "invoicing blocked by 17 pending PODs", "/pod", "r"],
                ["₹6.2L/day", "unused earning capacity — 31 idle vehicles", "/vehicles", "a"],
                ["₹32.8L", "overdue from customers · 6 follow-ups open", "/receivables", "r"],
                ["₹3.18L", "avoidable empty-km cost on 5 backhaul-ready vehicles", "/routes", "a"],
                ["₹1.9L", "excess fuel from 5 mileage anomalies this month", "/fuel", "a"],
              ].map(([a, b, h, t]) => (
                <Link key={a} href={h} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 10, alignItems: "baseline" }}>
                  <b className={t === "r" ? "neg" : "warn"} style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{a}</b><span className="muted">{b}</span>
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="Collections" sub="receivable ageing">
            <Bars data={AGING.map((a, i) => ({ k: a.k, v: +(a.v / 1e5).toFixed(1), color: i === 0 ? "grey" : i < 3 ? "amber" : "red" }))} height={150} fmt={(v) => v + "L"} />
          </Panel>
        </div>
      </div>

      <div className="grid g3">
        <Panel title="Revenue vs cost" sub="₹ Cr · 12 months"><LineChart labels={MONTHS} series={[{ name: "Revenue", data: SERIES.revenue, color: "ink" }, { name: "Cost", data: SERIES.cost, color: "amber", dash: true }]} fmt={(v) => v.toFixed(2)} /></Panel>
        <Panel title="On-time delivery" sub="% of trips"><LineChart labels={MONTHS} series={[{ name: "On-time", data: SERIES.ontime, color: "green" }]} fmt={(v) => v + "%"} min={84} /></Panel>
        <Panel title="Most profitable vehicles" sub="last 30 days" actions={<Link href="/vehicles" className="link">Ranking</Link>}>
          <HBars items={top.slice(0, 5).map((v) => ({ k: v.id, v: v.profit }))} fmt={(v) => inr(v)} tone="green" />
          <div className="hr" />
          <div className="lbl" style={{ marginBottom: 8 }}>Lowest performers</div>
          <HBars items={[...top].slice(-3).reverse().map((v) => ({ k: v.id, v: v.profit }))} fmt={(v) => inr(v)} />
        </Panel>
      </div>
      <MorningBrief open={brief} onClose={() => setBrief(false)} />
    </div>
  );
}
