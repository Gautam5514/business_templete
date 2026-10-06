"use client";
import { Fragment } from "react";
import Link from "next/link";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Avatar, Chip, Panel, Prog, Stars, Tabs, TechChip, Mono, StatusChip, PrioChip } from "@/components/ui";
import { Bars, HBars, LineChart, Ring } from "@/components/charts";
import RoutePlan from "@/components/RoutePlan";
import DataTable from "@/components/table";
import { TECHS, techById, techScore, CUSTOMERS } from "@/data/core";
import { COMPLIANCE, FEEDBACK, JOBS, MONTHS } from "@/data/ops";
import { rng } from "@/lib/rng";
import { full, inr } from "@/lib/format";

const TABS = ["Performance", "Route & Travel", "Jobs", "Parts & Van Stock", "Revenue", "Feedback", "Skills & Certs", "Attendance"];
const SC = ["First-Time Fix", "On-Time Arrival", "Customer Rating", "Job Completion", "Documentation", "Upsell / Revenue"];
export default function Tech360({ params }) {
  const { id } = use(params);
  const t = techById(id);
  const [tab, setTab] = useState("Performance");
  if (!t) notFound();
  const score = techScore(t), r = rng(t.id.charCodeAt(2) * 9 + 3);
  const jobs = JOBS.filter((j) => j.tech === t.id);
  const trend = Array.from({ length: 12 }, (_, i) => Math.round(t.ftf - 6 + i * 0.5 + r.int(-2, 2)));
  const revTrend = Array.from({ length: 12 }, (_, i) => +(t.rev * (0.7 + i * 0.03 + r.range(-0.05, 0.06))).toFixed(1));
  const rank = [...TECHS].sort((a, b) => b.ftf - a.ftf).findIndex((x) => x.id === t.id) + 1;
  const van = [["Compressor", t.id === "T01" ? 1 : r.int(0, 2), ""], ["Capacitor", r.int(2, 8), ""], ["Gas (R410A)", r.int(2, 10), " kg"], ["Filter", r.int(6, 18), ""], ["Copper pipe", r.int(8, 28), " m"]];
  return (
    <div className="page">
      <div className="ph" style={{ alignItems: "flex-start" }}>
        <Avatar name={t.name} size={56} />
        <div className="grow"><div className="lbl" style={{ marginBottom: 2 }}>Technician 360° · {t.id}</div><h1 style={{ fontSize: 28 }}>{t.name}</h1><p style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><span>{t.title}</span><TechChip s={t.status} /><span className="faint">{t.branch[0].toUpperCase() + t.branch.slice(1)} branch · {t.exp} years experience</span></p></div>
        <Link href="/live-technicians" className="btn">Track live</Link>
      </div>
      <div className="kpis" style={{ gridTemplateColumns: "repeat(6, minmax(0,1fr))" }}>
        {[["Jobs this month", t.month[0]], ["Completed", t.month[1]], ["First-time fix", t.ftf + "%"], ["Customer rating", `★ ${t.rating}`], ["Revenue generated", `₹${t.rev}L`], ["Rank (first-time fix)", `#${rank} of 68`]].map(([l, v]) => <div key={l} className="kpi"><div className="lbl">{l}</div><div className="v">{v}</div></div>)}
      </div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Performance" && (
        <div className="grid" style={{ gridTemplateColumns: "340px minmax(0,1fr)" }}>
          <Panel title="Technician score" sub="weighted">
            <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 14px" }}><Ring value={score} size={170} stroke={12} label={score} sub="out of 100" tone={score >= 90 ? "green" : "ink"} /></div>
            <div style={{ display: "grid", gap: 10 }}>{SC.map((n, i) => <div key={n}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span className="muted">{n}</span><b>{t.score[i]}</b></div><Prog v={t.score[i]} tone={t.score[i] >= 90 ? "g" : t.score[i] >= 82 ? "" : "a"} /></div>)}</div>
          </Panel>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Panel title="First-time fix trend" sub="% · 12 months"><LineChart labels={MONTHS} series={[{ name: t.name.split(" ")[0], data: trend, color: "ink" }, { name: "Company", data: Array(12).fill(87).map((v, i) => v - 4 + Math.round(i / 3)), color: "amber", dash: true }]} fmt={(v) => v + "%"} min={70} /></Panel>
            <div className="grid g2">
              <Panel title="Productivity"><dl className="kv"><dt>Jobs / day</dt><dd>{(t.month[0] / 24).toFixed(1)}</dd><dt>Avg time on site</dt><dd>{58 + (t.id.charCodeAt(2) % 30)} min</dd><dt>Avg travel / job</dt><dd>{16 + (t.id.charCodeAt(1) % 10)} min</dd><dt>Utilisation</dt><dd>{78 + (t.id.charCodeAt(2) % 14)}%</dd><dt>Callbacks (30d)</dt><dd>{Math.round((100 - t.ftf) * t.month[0] / 100)}</dd></dl></Panel>
              <Panel title="Where to coach"><div className="muted">{t.score[4] < 85 ? <>Documentation is lowest at <b style={{ color: "var(--ink)" }}>{t.score[4]}</b> — photo uploads are missing on ~1 in 5 jobs. </> : <>Strongest area: <b style={{ color: "var(--ink)" }}>{SC[t.score.indexOf(Math.max(...t.score))]}</b>. </>}{t.ftf < 82 && <>First-time fix trails company average by {87 - t.ftf} pts — about {inr((87 - t.ftf) * 12000)}/month of repeat-visit cost.</>}</div></Panel>
            </div>
          </div>
        </div>
      )}
      {tab === "Route & Travel" && <RoutePlan t={t} />}
      {tab === "Jobs" && <DataTable title="Jobs" rows={jobs.length ? jobs : JOBS.slice(0, 6)} cols={[{ key: "id", label: "Job", render: (j) => <Mono href={`/jobs/${j.id}`}>{j.id}</Mono> }, { key: "customer", label: "Customer" }, { key: "service", label: "Service" }, { key: "prio", label: "Priority", render: (j) => <PrioChip p={j.prio} /> }, { key: "status", label: "Status", render: (j) => <StatusChip s={j.status} /> }, { key: "value", label: "Value", right: true, render: (j) => inr(j.value) }]} />}
      {tab === "Parts & Van Stock" && <div className="grid g2"><Panel title="Van stock" sub={`value ${full(t.van)}`}><dl className="kv">{van.map(([n, q, u]) => <Fragment key={n}><dt>{n}</dt><dd>{q}{u}</dd></Fragment>)}</dl></Panel><Panel title="Parts used this month"><HBars items={[["Capacitors", 18], ["Gas (kg)", 34], ["Filters", 22], ["PCB", 4], ["Compressor", 3]].map(([k, v]) => ({ k, v }))} /></Panel></div>}
      {tab === "Revenue" && <Panel title="Revenue generated" sub="₹ lakh · 12 months"><Bars data={MONTHS.map((m, i) => ({ k: m, v: revTrend[i] }))} height={190} fmt={(v) => v} highlight={11} /></Panel>}
      {tab === "Feedback" && <Panel title="Customer feedback" tight>{(FEEDBACK.filter((f) => f.tech === t.name).length ? FEEDBACK.filter((f) => f.tech === t.name) : FEEDBACK.slice(0, 3)).map((f, i) => <div key={i} className="feed-i" style={{ display: "block" }}><Stars v={f.overall} /> <b>{f.customer}</b><div className="muted">{f.comment}</div></div>)}</Panel>}
      {tab === "Skills & Certs" && <div className="grid g2"><Panel title="Skills">{t.skills.map((s) => <div key={s} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><b>{s}</b><span className="faint">Level {t.exp > 7 ? "Expert" : "Advanced"}</span></div><Prog v={t.exp > 7 ? 95 : 80} tone="g" /></div>)}</Panel><Panel title="Certifications" tight>{["Electrical licence (Jharkhand)", "Working-at-height", "OEM — Blue Star service certified", "First-aid & PPE safety"].map((c, i) => <div key={c} className="feed-i"><span style={{ flex: 1 }}>{c}</span><Chip tone={i === 1 && t.id === "T03" ? "a" : "g"}>{i === 1 && t.id === "T03" ? "Expires 14 Oct" : "Valid"}</Chip></div>)}</Panel></div>}
      {tab === "Attendance" && <Panel title="Attendance — October">{<div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>{Array.from({ length: 31 }, (_, i) => { const d = i + 1, wk = (d + 2) % 7, on = d <= 6; return <div key={d} className="vcard" style={{ padding: 8, textAlign: "center", opacity: d > 6 ? 0.4 : 1, cursor: "default" }}><div className="faint" style={{ fontSize: 10 }}>{d}</div><b className={wk === 6 ? "faint" : on ? "pos" : ""}>{wk === 6 ? "Off" : on ? "P" : "–"}</b></div>; })}</div>}</Panel>}
    </div>
  );
}
