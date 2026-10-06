"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, FileText, Monitor } from "lucide-react";
import TechMap from "@/components/TechMap";
import { Count, Kpis, Panel, Prog, Insight } from "@/components/ui";
import { Ring, LineChart, Bars, HBars } from "@/components/charts";
import { AlertFeed, MorningBrief } from "@/components/blocks";
import { TECHS } from "@/data/core";
import { AGING, HEALTH, KPI, MONTHS, SERIES, TODAY, JOBS, PROFIT } from "@/data/ops";
import { inr } from "@/lib/format";

export default function CommandCenter() {
  const [sel, setSel] = useState("T01");
  const [brief, setBrief] = useState(false);
  const techs = useMemo(() => TECHS.filter((t) => t.branch === "ranchi"), []);
  const open = useMemo(() => JOBS.filter((j) => j.branch === "ranchi" && j.bucket === "unassigned"), []);
  const money = (n) => <Count to={n} fmt={(x) => inr(x)} />;
  const pc = Math.round((TODAY.completed / TODAY.total) * 100);
  const byTop = [...TECHS].sort((a, b) => b.ftf - a.ftf).slice(0, 5);

  return (
    <div className="page">
      <div className="ph">
        <div className="grow">
          <div className="lbl" style={{ marginBottom: 4 }}>Tuesday, 06 October · 01:16 PM</div>
          <h1 style={{ fontSize: 28 }}>Good Afternoon, Vivek</h1>
          <p style={{ fontSize: 14 }}><b style={{ color: "var(--ink)" }}>386 jobs this week. 68 technicians in the field.</b> Here’s what needs attention.</p>
        </div>
        <button className="btn" onClick={() => setBrief(true)}><FileText size={14} /> Service brief</button>
        <Link href="/control-room" className="btn"><Monitor size={14} /> Control room</Link>
      </div>

      <Kpis cols={5} items={[
        { label: "Requests Today", value: <Count to={KPI.requests} />, hint: "6 unassigned · 2 SLA-critical" },
        { label: "Jobs Scheduled", value: <Count to={KPI.scheduled} />, hint: "of 86 requests" },
        { label: "Jobs Completed", value: <Count to={KPI.completed} />, hint: `${pc}% of today`, tone: "g" },
        { label: "Jobs Pending", value: <Count to={KPI.pending} />, hint: "14 in progress · 8 delayed · 6 unassigned", tone: "a" },
        { label: "Technicians Active", value: <Count to={KPI.active} />, hint: "8 available now · 3 absent" },
        { label: "First-Time Fix", value: <Count to={KPI.ftf} fmt={(x) => Math.round(x) + "%"} />, hint: "13% repeat visits ≈ ₹1.6L / month" },
        { label: "Revenue This Month", value: money(KPI.revenue), hint: "▲ 6.2% vs same point last month" },
        { label: "Collections", value: money(KPI.collections), hint: "82% of billed", tone: "g" },
        { label: "Outstanding", value: money(KPI.outstanding), hint: "₹4.2L overdue 30+ days", tone: "r" },
        { label: "Active AMCs", value: <Count to={KPI.amcs} />, hint: "7 expiring this month · ₹18.6L at stake" },
      ]} />

      <div className="grid" style={{ marginBottom: 14, gridTemplateColumns: "330px minmax(0,1fr)" }}>
        <Panel title="Service Health" sub="weighted across 7 signals">
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 14px" }}>
            <Ring value={HEALTH.score} size={176} stroke={12} label={<><Count to={89} /></>} sub="out of 100" tone="green" />
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {HEALTH.parts.map(([n, v]) => (
              <div key={n}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span className="muted">{n}</span><b>{v}</b></div>
                <Prog v={v} tone={v >= 88 ? "g" : v >= 82 ? "" : "a"} />
              </div>
            ))}
          </div>
          <div className="hr" />
          <p className="muted" style={{ margin: 0, fontSize: 12.5 }}><b style={{ color: "var(--ink)" }}>AI insight · </b>Collections score dropped because ₹4.2L of invoices are overdue by more than 30 days.</p>
        </Panel>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "230px minmax(0,1fr)", minWidth: 0 }}>
          <Panel title="Today’s Operations" sub="live">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Ring value={pc} size={150} stroke={11} label={`${pc}%`} sub="completed" tone="blue" />
            </div>
            <dl className="kv" style={{ fontSize: 13 }}>
              <dt>Jobs</dt><dd>{TODAY.total}</dd>
              <dt>Completed</dt><dd className="pos">{TODAY.completed}</dd>
              <dt>In progress</dt><dd>{TODAY.progress}</dd>
              <dt>Delayed</dt><dd className="warn">{TODAY.delayed}</dd>
              <dt>Unassigned</dt><dd className="neg">{TODAY.unassigned}</dd>
            </dl>
            <div className="hr" />
            <Link href="/dispatch" className="btn pri" style={{ width: "100%", justifyContent: "center" }}>Open dispatch board</Link>
          </Panel>
          <div style={{ position: "relative", minHeight: 470 }}>
            <TechMap techs={techs} jobs={open} selectedId={sel} onSelect={setSel} fillParent />
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5 }} className="chip k">Live technician map · Ranchi · 28 technicians</div>
            <Link href="/live-technicians" className="btn sm" style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>Open full map <ArrowUpRight size={13} /></Link>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", marginBottom: 14 }}>
        <Panel title="Needs your attention" sub="6 open · ranked by business impact" tight actions={<Link href="/activity" className="link">All alerts</Link>}>
          <AlertFeed />
        </Panel>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <Panel title="Where money is getting stuck">
            <div style={{ display: "grid", gap: 14 }}>
              {[
                ["₹84K", "of compressor jobs blocked by 0 stock at Ranchi", "/inventory", "r"],
                ["₹22.4K", "Gupta Office estimate awaiting approval 3 hours", "/estimates", "a"],
                ["₹4.2L", "invoices overdue 30+ days across 11 customers", "/receivables", "r"],
                ["₹4.8L", "City Hospital AMC renewal not yet started", "/amc/AMC-1790", "r"],
                ["₹1.6L/mo", "repeat-visit cost from 13% non-first-time fixes", "/reports", "a"],
              ].map(([a, b, h, t]) => (
                <Link key={a} href={h} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 10, alignItems: "baseline" }}>
                  <b className={t === "r" ? "neg" : "warn"} style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{a}</b><span className="muted">{b}</span>
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="Outstanding ageing" sub="₹ lakh · total ₹16.8L">
            <Bars data={AGING.map((a, i) => ({ k: a.k, v: +(a.v / 1e5).toFixed(1), color: i === 0 ? "grey" : i < 4 ? "amber" : "red" }))} height={150} fmt={(v) => v + "L"} />
          </Panel>
        </div>
      </div>

      <div className="grid g3">
        <Panel title="Revenue vs collections" sub="₹ lakh · 12 months"><LineChart labels={MONTHS} series={[{ name: "Revenue", data: SERIES.revenue, color: "ink" }, { name: "Collections", data: SERIES.collections, color: "green", dash: true }]} fmt={(v) => v} /></Panel>
        <Panel title="SLA performance" sub="% within SLA"><LineChart labels={MONTHS} series={[{ name: "Within SLA", data: SERIES.sla, color: "blue" }]} fmt={(v) => v + "%"} min={84} /></Panel>
        <Panel title="Top first-time-fix" sub="technicians" actions={<Link href="/technicians" className="link">Ranking</Link>}>
          <HBars items={byTop.map((t) => ({ k: t.name, v: t.ftf }))} fmt={(v) => v + "%"} tone="green" max={100} />
          <div className="hr" />
          <div className="lbl" style={{ marginBottom: 8 }}>Margin by service</div>
          <HBars items={PROFIT.service.slice(0, 4).map(([k, v]) => ({ k, v }))} fmt={(v) => v + "%"} max={50} />
        </Panel>
      </div>
      <MorningBrief open={brief} onClose={() => setBrief(false)} />
    </div>
  );
}
