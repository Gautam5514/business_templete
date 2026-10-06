"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Chip, Insight, Kpis, PageHead, Panel, Seg } from "@/components/ui";
import { CUSTOMERS, TECHS } from "@/data/core";
import { AMCS } from "@/data/ops";
import { rng } from "@/lib/rng";
import { cx } from "@/lib/format";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REM = [["AMC visit due", "18 visits this week", "b", "/preventive"], ["Filter replacement due", "126 RO & AC filters in 30 days", "a", "/assets"], ["Warranty expiry", "212 assets expire within 30 days", "a", "/assets"], ["Next preventive service", "Auto-scheduled for 640 assets", "n", "/preventive"], ["Contract renewal", "7 contracts expire this month", "r", "/amc"]];

export default function Preventive() {
  const [mode, setMode] = useState("Month");
  const [day, setDay] = useState(6);
  const ev = useMemo(() => {
    const r = rng(77), out = {};
    for (let d = 1; d <= 31; d++) {
      const wk = (d + 2) % 7; // Oct 1 2026 = Thursday → index 3
      const n = wk >= 5 ? r.int(0, 1) : r.int(1, 4);
      out[d] = Array.from({ length: n }, () => { const c = r.pick(CUSTOMERS.filter((x) => x.amcs)), t = r.pick(TECHS.filter((t) => t.branch === c.branch)); return { c: c.name, t: t.name, assets: r.int(2, 24), br: c.branch, p: r.pick(["Normal", "Normal", "High"]), time: `${r.pick(["09:00", "10:30", "11:30", "14:00", "15:30"])}` }; });
    }
    AMCS.slice(0, 8).forEach((a) => { const d = parseInt(a.next); if (d && d <= 31 && a.next.includes("Oct")) out[d].unshift({ c: a.cust, t: "Assigned", assets: a.assets, br: "ranchi", p: "High", time: "10:00", amc: a.id }); });
    return out;
  }, []);
  const blank = 3; // Mon-Wed before Thu 1st
  const cells = [...Array(blank).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const week = [5, 6, 7, 8, 9, 10, 11];
  const tone = (p, d) => d < 6 ? "g" : p === "High" ? "a" : "";
  const list = (d) => ev[d] || [];
  return (
    <div className="page">
      <PageHead title="Preventive Visits" sub="October 2026 · AMC and scheduled maintenance across all branches.">
        <Seg options={["Day", "Week", "Month"]} value={mode} onChange={setMode} />
      </PageHead>
      <Insight><b>18 AMC visits are due this week and 5 are already overdue.</b> City Hospital’s 18 Oct visit covers 42 AC units — book 4 technicians.</Insight>
      <Kpis items={[{ label: "Visits this month", value: Object.values(ev).flat().length }, { label: "Due this week", value: 18, tone: "a" }, { label: "Overdue", value: 5, tone: "r" }, { label: "Completed (MTD)", value: 41, tone: "g" }, { label: "Completion rate", value: "94%" }]} />
      <div className="grid g-main">
        <div>
          {mode === "Month" && <div className="cal">{DOW.map((d) => <div key={d} className="hd">{d}</div>)}{cells.map((d, i) => d == null ? <div key={i} className="dim" /> : (
            <div key={i} className={cx(d === 6 && "today")} style={{ cursor: "pointer" }} onClick={() => { setDay(d); setMode("Day"); }}>
              <b style={{ fontSize: 12 }}>{d}</b>{list(d).slice(0, 3).map((e, k) => <span key={k} className={cx("cal-ev", tone(e.p, d))}>{e.time} {e.c}</span>)}{list(d).length > 3 && <span className="faint" style={{ fontSize: 10.5 }}>+{list(d).length - 3} more</span>}
            </div>))}</div>}
          {mode === "Week" && <div className="cal">{week.map((d, i) => <div key={d} className="hd">{DOW[i]} {d}</div>)}{week.map((d) => <div key={d} className={cx(d === 6 && "today")} style={{ minHeight: 360 }}>{list(d).map((e, k) => <span key={k} className={cx("cal-ev", tone(e.p, d))} style={{ whiteSpace: "normal", padding: "5px 6px" }}><b>{e.time}</b> {e.c}<br />{e.t} · {e.assets} assets</span>)}</div>)}</div>}
          {mode === "Day" && <Panel title={`${day} Oct 2026 · ${list(day).length} visits`} sub={DOW[(day + 2) % 7]} tight>
            <table className="tbl"><thead><tr><th>Time</th><th>Customer</th><th>Technician</th><th>Assets</th><th>Branch</th><th>Priority</th></tr></thead><tbody>{list(day).map((e, k) => <tr key={k}><td className="mono">{e.time}</td><td style={{ fontWeight: 560 }}>{e.c}{e.amc && <> · <Link className="link" href={`/amc/${e.amc}`}>{e.amc}</Link></>}</td><td>{e.t}</td><td>{e.assets}</td><td style={{ textTransform: "capitalize" }}>{e.br}</td><td><Chip tone={e.p === "High" ? "a" : "n"}>{e.p}</Chip></td></tr>)}{!list(day).length && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center" }} className="faint">No visits scheduled.</td></tr>}</tbody></table></Panel>}
        </div>
        <Panel title="Auto-service reminders" sub="system-generated" tight>
          {REM.map(([t, s, tn, h]) => <Link key={t} href={h} className="feed-i"><Bell size={14} className="faint" style={{ marginTop: 2 }} /><div style={{ flex: 1 }}><b style={{ fontWeight: 600 }}>{t}</b><div className="muted" style={{ fontSize: 12.5 }}>{s}</div></div><Chip tone={tn}>flagged</Chip></Link>)}
        </Panel>
      </div>
    </div>
  );
}
