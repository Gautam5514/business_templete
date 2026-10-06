"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import TechMap from "@/components/TechMap";
import { Avatar, Chip, Kpis, PageHead, PrioChip, TechChip, Prog } from "@/components/ui";
import { TECHS, SKILLS, LOCALITIES, hhmm, NOW, BRANCHES } from "@/data/core";
import { CURRENT, etaOf } from "@/data/ops";

const sel = (v, set, opts, label) => <select className="select" style={{ width: 150, height: 30 }} value={v} onChange={(e) => set(e.target.value)}><option value="">{label}</option>{opts.map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}</select>;

export default function LiveTechnicians() {
  const [branch, setBranch] = useState("ranchi"), [skill, setSkill] = useState(""), [status, setStatus] = useState(""), [prio, setPrio] = useState(""), [jobType, setJobType] = useState(""), [tech, setTech] = useState("");
  const [selId, setSel] = useState("T01");
  const all = useMemo(() => TECHS.filter((t) => t.branch === branch), [branch]);
  const list = all.filter((t) => (!skill || t.skills.includes(skill)) && (!status || t.status === status) && (!tech || t.id === tech) && (!prio || CURRENT[t.id]?.prio === prio) && (!jobType || (CURRENT[t.id]?.cat === jobType)));
  const st = (s) => all.filter((t) => t.status === s).length;
  const s = TECHS.find((t) => t.id === selId), cur = s && CURRENT[s.id], eta = s && etaOf(s);
  const route = useMemo(() => { if (!s || !cur?.pos) return null; return [s.pos, cur.pos, [Math.min(900, cur.pos[0] + 70), Math.max(60, cur.pos[1] - 60)]]; }, [s, cur]);
  return (
    <div className="page flush" style={{ height: "calc(100vh - 56px)", display: "grid", gridTemplateRows: "auto auto 1fr" }}>
      <div style={{ padding: "14px 18px 8px" }}><PageHead title="Live Technicians" sub="Where every technician is right now, what they’re working on and when they’ll be free." /></div>
      <div style={{ padding: "0 18px 10px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {sel(branch, (v) => { setBranch(v || "ranchi"); setSel(null); }, BRANCHES.map((b) => ({ v: b.id, l: b.name })), "Branch")}
        {sel(skill, setSkill, SKILLS, "Skill")}{sel(status, setStatus, [{ v: "available", l: "Available" }, { v: "onjob", l: "On job" }, { v: "travelling", l: "Travelling" }, { v: "delayed", l: "Delayed" }, { v: "offline", l: "Offline" }], "Status")}
        {sel(tech, setTech, all.map((t) => ({ v: t.id, l: t.name })), "Technician")}{sel(jobType, setJobType, ["AC", "CCTV", "RO", "Electrical", "Appliance", "Facility"], "Job type")}{sel(prio, setPrio, ["Emergency", "High", "Normal", "AMC"], "Priority")}
        <span style={{ flex: 1 }} />
        {[["g", "available", "Available"], ["b", "onjob", "On job"], ["a", "travelling", "Travelling"], ["r", "delayed", "Delayed"], ["n", "offline", "Offline"]].map(([t, k, l]) => <Chip key={k} tone={t} dot>{st(k)} {l}</Chip>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0,1fr)", minHeight: 0, borderTop: "1px solid var(--line)" }}>
        <div style={{ overflowY: "auto", borderRight: "1px solid var(--line)" }}>
          {list.map((t) => { const c = CURRENT[t.id]; return (
            <div key={t.id} className="feed-i" onClick={() => setSel(t.id)} style={{ background: selId === t.id ? "var(--accent-soft)" : undefined, alignItems: "center" }}>
              <Avatar name={t.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", gap: 6, alignItems: "center" }}><b>{t.name}</b><TechChip s={t.status} /></div><div className="faint" style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c ? `${c.customer} · ${c.service}` : `Free · near ${t.loc}`}</div></div>
              <div style={{ textAlign: "right", fontSize: 11.5 }}><b>{t.jobsToday}</b><div className="faint">jobs</div></div>
            </div>); })}
          {!list.length && <div style={{ padding: 20 }} className="muted">No technicians match these filters.</div>}
        </div>
        <div style={{ position: "relative", minHeight: 0 }}>
          <TechMap branch={branch} techs={list} jobs={[]} selectedId={selId} onSelect={setSel} route={route} fillParent cardAnchor={false} />
          {s && (
            <div className="panel" style={{ position: "absolute", top: 10, left: 10, zIndex: 7, width: 300, padding: 12, background: "color-mix(in srgb, var(--panel) 94%, transparent)", backdropFilter: "blur(6px)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Avatar name={s.name} size={34} /><div><b>{s.name}</b><div className="faint" style={{ fontSize: 11.5 }}>{s.title}</div></div></div>
              <dl className="kv" style={{ marginTop: 10, fontSize: 12 }}>
                <dt>Status</dt><dd><TechChip s={s.status} /></dd><dt>Location</dt><dd>{s.loc}</dd><dt>Assigned job</dt><dd>{cur?.id ? <Link className="link" href={`/jobs/${cur.id}`}>{cur.id}</Link> : cur?.service || "—"}</dd>
                <dt>Route</dt><dd>{cur ? `${s.loc} → ${cur.loc}` : "—"}</dd><dt>ETA / free at</dt><dd>{eta != null ? `${eta} min · ${hhmm(NOW + eta)}` : "Available now"}</dd><dt>Completed today</dt><dd>{Math.max(0, s.jobsToday - 1)} of {s.jobsToday}</dd>
              </dl>
              <Link href={`/technicians/${s.id}`} className="btn sm pri" style={{ marginTop: 10 }}>Technician 360°</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
