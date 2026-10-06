"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, MapPin, Wrench } from "lucide-react";
import TechMap from "@/components/TechMap";
import { Avatar, Chip, Drawer, PrioChip, SlaTimer, Stars, TechChip } from "@/components/ui";
import { scheduleOf, freeFrom, DAY0, DAY1 } from "@/components/schedule";
import { JOBS, recommend, SLA_MIN } from "@/data/ops";
import { NOW, TECHS, hhmm, techById } from "@/data/core";
import { inr } from "@/lib/format";
import { useApp } from "@/lib/store";

const SPAN = DAY1 - DAY0;
const pct = (m) => ((m - DAY0) / SPAN) * 100;

export default function Dispatch() {
  const { assigned, assign, notify } = useApp();
  const [branch] = useState("ranchi");
  const queue = useMemo(() => JOBS.filter((j) => j.bucket === "unassigned" && j.branch === branch).sort((a, b) => a.slaLeft - b.slaLeft), [branch]);
  const [selJob, setSelJob] = useState("JOB-2841");
  const [selTech, setSelTech] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [drag, setDrag] = useState(null);
  const [justDone, setJustDone] = useState(null);
  const open = queue.filter((j) => !assigned[j.id]);
  const job = JOBS.find((j) => j.id === selJob);
  const techs = useMemo(() => TECHS.filter((t) => t.branch === branch), [branch]);
  const recs = useMemo(() => (job ? recommend(job, TECHS) : []), [job]);
  const best = recs[0], closest = [...recs].filter((r) => r.avail === 0).sort((a, b) => a.d - b.d)[0], skilled = recs.find((r) => r !== best && r !== closest && r.skill === 100);
  const ghostT = techById(selTech) || best?.t;

  const doAssign = (t, j = job) => {
    assign(j.id, t.id); setJustDone({ job: j.id, tech: t.id }); setDrawer(false); const nx = open.find((x) => x.id !== j.id); setSelJob(nx ? nx.id : null);
    notify(`${j.id} assigned to ${t.name} · customer notified: “Your technician ${t.name} has been assigned.”`);
    setTimeout(() => setJustDone(null), 3500);
  };
  const lane = (t) => {
    const blocks = scheduleOf(t), mine = Object.entries(assigned).filter(([, id]) => id === t.id).map(([jid]) => JOBS.find((j) => j.id === jid));
    const start = freeFrom(t) + 18;
    return (
      <div key={t.id} className="lane" onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) { setSelJob(drag); const j = JOBS.find((x) => x.id === drag); setDrag(null); doAssign(t, j); } }} onClick={() => setSelTech(t.id)} style={{ background: selTech === t.id ? "var(--accent-soft)" : undefined }}>
        {blocks.map((b, i) => (
          <div key={i} className={`lane-blk ${b.kind === "travel" ? "travel" : b.state}`} style={{ left: `${pct(b.s)}%`, width: `${pct(b.e) - pct(b.s)}%` }} title={b.label}>{b.kind === "job" ? b.label : ""}</div>
        ))}
        {mine.map((j, i) => <div key={j.id} className={`lane-blk ${justDone?.job === j.id ? "ghost" : "next"}`} style={{ left: `${pct(start + i * 100)}%`, width: `${pct(DAY0 + 90) - pct(DAY0)}%`, outline: "1.5px solid var(--accent)" }}><Check size={11} style={{ marginRight: 3 }} />{j.customer.split(" ")[0]}</div>)}
        {job && !assigned[job.id] && ghostT?.id === t.id && <div className="lane-blk ghost" style={{ left: `${pct(Math.min(start, DAY1 - 90))}%`, width: `${pct(DAY0 + 90) - pct(DAY0)}%` }}>+ {job.customer.split(" ")[0]}</div>}
      </div>
    );
  };
  const hours = [];
  for (let h = 8; h <= 20; h += 2) hours.push(h);

  return (
    <div className="page flush" style={{ height: "calc(100vh - 56px)", display: "grid", gridTemplateRows: "auto 1fr", gap: 0 }}>
      <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--line)", background: "var(--panel)" }}>
        <div><h1 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.025em" }}>Dispatch Board</h1><div className="muted" style={{ fontSize: 12.5 }}><b style={{ color: "var(--ink)" }}>{open.length} jobs are unassigned, including {open.filter((j) => j.slaLeft < 60).length} that may breach SLA within the next hour.</b> Drag a job onto a technician — or use the smart match.</div></div>
        <span style={{ flex: 1 }} />
        <Chip tone="g" dot>{techs.filter((t) => t.status === "available").length} available</Chip><Chip tone="b" dot>{techs.filter((t) => t.status === "onjob").length} on job</Chip><Chip tone="a" dot>{techs.filter((t) => t.status === "travelling").length} travelling</Chip><Chip tone="r" dot>{techs.filter((t) => t.status === "delayed").length} delayed</Chip>
        <div className="seg"><button className="on">Ranchi</button><button onClick={() => notify("Branch switcher — demo focuses on Ranchi")}>Dhanbad</button><button onClick={() => notify("Branch switcher — demo focuses on Ranchi")}>Jamshedpur</button><button onClick={() => notify("Branch switcher — demo focuses on Ranchi")}>Patna</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "290px minmax(0,1fr) 380px", minHeight: 0 }}>
        {/* LEFT — unassigned */}
        <div style={{ borderRight: "1px solid var(--line)", overflowY: "auto", padding: 12, background: "var(--panel2)", display: "grid", gap: 8, alignContent: "start" }}>
          <div className="lbl" style={{ display: "flex", justifyContent: "space-between" }}><span>Unassigned · {open.length}</span><span>by SLA urgency</span></div>
          {open.map((j) => (
            <div key={j.id} draggable onDragStart={() => setDrag(j.id)} onDragEnd={() => setDrag(null)} className={`jobcard ${selJob === j.id ? "sel" : ""} ${j.slaLeft < 60 ? "crit" : ""}`} onClick={() => { setSelJob(j.id); setDrawer(true); }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><b style={{ fontSize: 13.5 }}>{j.customer}</b><span style={{ flex: 1 }} /><PrioChip p={j.prio} /></div>
              <div className="muted" style={{ fontSize: 12.5, margin: "3px 0 6px" }}>{j.issue}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 11.5, flexWrap: "wrap" }} className="faint"><span><MapPin size={11} style={{ display: "inline" }} /> {j.loc}</span><span><Wrench size={11} style={{ display: "inline" }} /> {j.skill}</span><span className="mono">{j.id}</span></div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}><SlaTimer left={j.slaLeft} total={j.sla} /><span style={{ flex: 1 }} /><span className="faint" style={{ fontSize: 11 }}>{inr(j.value)}</span></div>
            </div>
          ))}
          {!open.length && <div className="panel" style={{ padding: 20, textAlign: "center" }}><Check className="pos" /><div style={{ fontWeight: 600, marginTop: 4 }}>Queue clear</div><div className="muted">All requests have a technician.</div></div>}
          {Object.keys(assigned).length > 0 && <div className="lbl" style={{ marginTop: 6 }}>Assigned this session</div>}
          {Object.entries(assigned).map(([jid, tid]) => { const j = JOBS.find((x) => x.id === jid); return <div key={jid} className="jobcard flash" style={{ cursor: "default", borderColor: "var(--green)" }}><b>{j.customer}</b><div className="muted" style={{ fontSize: 12 }}>→ {techById(tid).name} · <Link className="link" href={`/jobs/${jid}`}>Open Job 360°</Link></div></div>; })}
        </div>

        {/* MIDDLE — recommendation + schedule */}
        <div style={{ overflowY: "auto", minWidth: 0 }}>
          {job && !assigned[job.id] && best && (
            <div style={{ padding: 14, borderBottom: "1px solid var(--line)" }}>
              <div style={{ marginBottom: 10 }}><span className="lbl">Smart technician match</span><div><b>{job.customer}</b> <span className="muted">· {job.issue} · needs {job.skill}</span></div></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(168px,1fr))", gap: 10 }}>
                {[[best, "Recommended", true], closest && closest !== best && [closest, "Closest available"], skilled && [skilled, "Alternative"]].filter(Boolean).map(([r, label, b]) => (
                  <div key={r.t.id} className={`rec ${b ? "best" : ""}`}>
                    <div style={{ marginBottom: 6 }}><Chip tone={b ? "g" : "n"}>{label}</Chip></div><div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><Avatar name={r.t.name} size={28} /><div style={{ minWidth: 0 }}><b>{r.t.name}</b><div className="faint" style={{ fontSize: 11 }}>{r.t.title}</div></div></div>
                    <dl className="kv" style={{ fontSize: 12 }}><dt>Skill match</dt><dd>{r.skill}%</dd><dt>Distance</dt><dd>{r.d} km</dd><dt>Available</dt><dd>{r.avail ? `in ${r.avail} min` : "Now"}</dd><dt>Rating</dt><dd>★ {r.t.rating}</dd><dt>First-time fix</dt><dd>{r.t.ftf}%</dd><dt>Workload</dt><dd>{r.load}</dd></dl>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}><button className={`btn sm ${b ? "pri" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => doAssign(r.t)}>Assign {r.t.name.split(" ")[0]}</button><button className="btn sm" onClick={() => setSelTech(r.t.id)}>Map</button></div>
                  </div>
                ))}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Ranked on skill (42%), distance (20%), availability (14%), first-time fix (14%) and rating (10%). {best.t.name.split(" ")[0]} fixes {best.t.ftf}% of jobs first visit — assigning him avoids an expected repeat visit costing ~₹1,400.</div>
            </div>
          )}
          {job && assigned[job.id] && <div className="insight g" style={{ margin: 14 }}><div><b>{job.id} assigned to {techById(assigned[job.id]).name}.</b> Customer notified on WhatsApp · SLA risk cleared. <Link className="link" href={`/jobs/${job.id}`}>Open Job 360° →</Link></div></div>}
          <div style={{ padding: "10px 14px 0" }} className="lbl">Technician schedule · Ranchi · {techs.length} technicians</div>
          <div style={{ display: "grid", gridTemplateColumns: "190px minmax(0,1fr)", marginTop: 6 }}>
            <div style={{ position: "sticky", left: 0 }} />
            <div style={{ position: "relative", height: 22, borderBottom: "1px solid var(--line)", margin: "0 14px 0 0" }}>{hours.map((h) => <span key={h} className="faint" style={{ position: "absolute", left: `${pct(h * 60)}%`, fontSize: 10.5, transform: "translateX(-50%)" }}>{h > 12 ? h - 12 : h}{h >= 12 ? "p" : "a"}</span>)}</div>
            <div>{techs.map((t) => (
              <div key={t.id} style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", borderBottom: "1px solid var(--line2)", cursor: "pointer", background: selTech === t.id ? "var(--accent-soft)" : undefined }} onClick={() => setSelTech(t.id)}>
                <i className={`dot ${{ available: "g", onjob: "b", travelling: "a", delayed: "r", offline: "n" }[t.status]}`} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 550, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div><div className="faint" style={{ fontSize: 10.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.skills[0]} · {t.jobsToday} jobs</div></div>
              </div>))}</div>
            <div style={{ position: "relative", margin: "0 14px 0 0" }}>
              {techs.map(lane)}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(NOW)}%`, width: 1.5, background: "var(--red)", pointerEvents: "none" }}><span style={{ position: "absolute", top: -2, left: 4, fontSize: 10, color: "var(--red)", fontWeight: 700 }}>NOW</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, padding: "10px 14px 20px", fontSize: 11, color: "var(--ink3)", flexWrap: "wrap" }}>{[["done", "Completed"], ["cur", "In progress"], ["late", "Overrun"], ["next", "Upcoming"], ["travel", "Travel"], ["ghost", "Proposed"]].map(([c, l]) => <span key={c} style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><i className={`lane-blk ${c}`} style={{ position: "static", width: 16, height: 10, padding: 0, display: "inline-block" }} />{l}</span>)}</div>
        </div>

        {/* RIGHT — map */}
        <div style={{ borderLeft: "1px solid var(--line)", position: "relative", minHeight: 0 }}>
          <TechMap techs={techs} jobs={open} selectedId={selTech} onSelect={setSelTech} selectedJob={job && !assigned[job.id] ? job.id : null} onSelectJob={(id) => { setSelJob(id); }} ghostTo={ghostT?.pos} fillParent showLegend={false} initialZoom={1.3} />
          {job && !assigned[job.id] && ghostT && <div className="map-legend" style={{ left: 10, bottom: 10 }}><b style={{ color: "var(--ink)" }}>{ghostT.name}</b> → {job.customer} · {recs.find((r) => r.t.id === ghostT.id)?.d ?? "—"} km</div>}
        </div>
      </div>
      <Drawer open={drawer && !!job && !assigned[job?.id]} onClose={() => setDrawer(false)} title={`Assign ${job?.id}`} sub={job && `${job.customer} · ${job.issue}`}>
        {job && <div style={{ display: "grid", gap: 10 }}>
          <div className="insight r" style={{ margin: 0 }}><div><b>{job.prio} · SLA {Math.max(0, job.slaLeft)} min left.</b> No technician assigned. {inr(job.value)} at stake.</div></div>
          {recs.slice(0, 4).map((r, i) => (
            <div key={r.t.id} className={`rec ${i === 0 ? "best" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r.t.name} /><div><b>{r.t.name}</b><div className="faint" style={{ fontSize: 11.5 }}>{r.t.title}</div></div><span style={{ flex: 1 }} /><TechChip s={r.t.status} /></div>
              <div className="metric" style={{ marginTop: 10, gridTemplateColumns: "repeat(3,1fr)" }}>{[["Skill match", `${r.skill}%`], ["Distance", `${r.d} km`], ["Available", r.avail ? `${r.avail} min` : "Now"], ["Rating", <Stars key="s" v={r.t.rating} />], ["First-time fix", `${r.t.ftf}%`], ["Workload", r.load]].map(([k, v]) => <div key={k}><div className="lbl">{k}</div><b>{v}</b></div>)}</div>
              <button className={`btn ${i === 0 ? "pri" : ""}`} style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => doAssign(r.t)}>Assign {r.t.name}{i === 0 ? " · Recommended" : ""} <ArrowRight size={13} /></button>
            </div>
          ))}
        </div>}
      </Drawer>
    </div>
  );
}
