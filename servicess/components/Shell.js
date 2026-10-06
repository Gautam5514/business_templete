"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Bell, Boxes, Briefcase, Building2, CalendarClock, ChevronsLeft, ChevronsRight, ClipboardList, Cpu, CreditCard, FileText, Handshake, HardHat, Inbox, LayoutDashboard, Landmark,
  MapPinned, Moon, Plus, Receipt, Search, Settings, ShieldCheck, Smile, Sparkles, Sun, Users, Wrench, BarChart3, Monitor, Smartphone, Wallet, Package, Radar, Navigation, CircleDot,
} from "lucide-react";
import { ROLES, useApp } from "@/lib/store";
import { Avatar, Drawer, Modal, Chip } from "./ui";
import { NOTIFS, JOBS, AMCS, INVOICES, PARTS, ESTIMATES } from "@/data/ops";
import { CUSTOMERS, TECHS, ASSETS } from "@/data/core";
import CreateModal, { QUICK } from "./Forms";
import { cx, inr } from "@/lib/format";

const NAV = [
  ["Control", [["command-center", "Command Center", LayoutDashboard], ["requests", "Service Requests", Inbox, "86"], ["jobs", "Jobs", Briefcase, "28"], ["dispatch", "Dispatch Board", Radar, "6", "r"], ["live-technicians", "Live Technicians", MapPinned]]],
  ["Customers", [["customers", "Customers", Building2], ["assets", "Assets", Cpu], ["amc", "AMC Contracts", ShieldCheck, "7", "r"], ["preventive", "Preventive Visits", CalendarClock, "18"]]],
  ["Workforce", [["technicians", "Technicians", HardHat], ["teams", "Teams", Users]]],
  ["Stock", [["parts", "Spare Parts", Package], ["inventory", "Inventory", Boxes, "3", "r"]]],
  ["Money", [["estimates", "Estimates", FileText, "4"], ["invoices", "Invoices", Receipt], ["payments", "Payments", CreditCard], ["receivables", "Receivables", Landmark]]],
  ["Insight", [["feedback", "Feedback", Smile], ["reports", "Reports", BarChart3], ["activity", "Activity", Activity], ["assistant", "AI Service Assistant", Sparkles], ["settings", "Settings", Settings]]],
];

export default function Shell({ children }) {
  const { theme, setTheme, role, setRole, collapsed, toggleCollapsed, setOverlay } = useApp();
  const path = usePathname();
  const router = useRouter();
  const R = ROLES[role];
  const seg = path.split("/")[1];
  useEffect(() => { if (role === "technician") router.replace("/mobile"); }, [role, router]);
  const allowed = (k) => R.nav === "all" || R.nav.includes(k);
  const title = NAV.flatMap((g) => g[1]).find((n) => n[0] === seg)?.[1] || "FieldDesk";
  const [roleMenu, setRoleMenu] = useState(false);

  return (
    <div className={cx("app", collapsed && "collapsed")}>
      <aside className="side">
        <div className="side-brand">
          <div className="logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg></div>
          <div><b>FieldDesk</b><small>PRIMECARE SERVICE</small></div>
        </div>
        <div className="side-scroll">
          {NAV.map(([g, items]) => {
            const vis = items.filter((i) => allowed(i[0]));
            if (!vis.length) return null;
            return (
              <div key={g}>
                <div className="nav-group">{g}</div>
                {vis.map(([k, label, Icon, badge, bt]) => (
                  <Link key={k} href={`/${k}`} className={cx("nav-item", seg === k && "on")} title={label}>
                    <Icon size={16} /><span>{label}</span>{badge && <i className={cx("nav-badge", bt)} style={{ fontStyle: "normal" }}>{badge}</i>}
                  </Link>
                ))}
              </div>
            );
          })}
          <div className="nav-group">Screens</div>
          <Link href="/control-room" className="nav-item"><Monitor size={16} /><span>Control Room Mode</span></Link>
          <Link href="/mobile" className="nav-item"><Smartphone size={16} /><span>Technician Mobile App</span></Link>
          <Link href="/track/JOB-2818" className="nav-item"><Navigation size={16} /><span>Customer Tracking</span></Link>
        </div>
        <div className="side-foot" style={{ position: "relative" }}>
          <button onClick={() => setRoleMenu(!roleMenu)} style={{ display: "flex", gap: 9, alignItems: "center", background: "none", border: 0, color: "inherit", textAlign: "left", flex: 1, minWidth: 0 }}>
            <Avatar name={R.person} />
            <div className="role-t" style={{ minWidth: 0, display: collapsed ? "none" : "block" }}>
              <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>{R.person}</div>
              <div style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{R.short}</div>
            </div>
          </button>
          {roleMenu && (
            <div className="menu" style={{ bottom: 52, left: 8, width: 262, maxHeight: 400, overflow: "auto" }}>
              <Link href="/login" className="mi" style={{ display: "block", padding: "6px 9px", fontSize: 12.5, borderBottom: "1px solid var(--line2)", marginBottom: 4 }}>Sign out</Link>
              <div className="lbl" style={{ padding: "6px 9px" }}>View as role</div>
              {Object.entries(ROLES).map(([k, r]) => (
                <button key={k} className="mi" onClick={() => { setRole(k); setRoleMenu(false); if (k !== "technician") router.push("/" + (r.nav === "all" ? "command-center" : r.nav[0])); }} style={{ fontWeight: role === k ? 650 : 400 }}>
                  <Avatar name={r.person} size={20} />{r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="iconbtn" onClick={toggleCollapsed} aria-label="Toggle sidebar">{collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}</button>
          <div className="crumb">PrimeCare Service Solutions <span style={{ margin: "0 5px" }}>/</span><b>{title}</b></div>
          <div className="search" onClick={() => setOverlay("search")}><Search size={14} /><span>Search customer, job, technician, asset, AMC, invoice…</span><span className="kbd">⌘K</span></div>
          <span className="live-pill"><i className="dot g pulse" style={{ animation: "none" }} />Live · 01:16 PM IST</span>
          <button className="iconbtn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Theme">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="iconbtn" onClick={() => setOverlay("notifs")} aria-label="Notifications"><Bell size={16} /><i className="pip" /></button>
          <Link href="/assistant" className="btn"><Sparkles size={14} /> Ask FieldDesk</Link>
          <button className="btn pri" onClick={() => setOverlay("quick")}><Plus size={14} /> Create</button>
        </header>
        <main className="scroll">{children}</main>
      </div>
      <Overlays />
    </div>
  );
}

export function Overlays() {
  const { overlay, setOverlay, notify } = useApp();
  return (
    <>
      {overlay === "search" && <SearchPalette onClose={() => setOverlay(null)} />}
      <Modal open={overlay === "quick"} onClose={() => setOverlay(null)} title="Quick create">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(QUICK).map(([k, q]) => (
            <button key={k} className="vcard" style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "center" }} onClick={() => setOverlay({ type: "create", kind: k })}>
              <span className="iconbtn" style={{ flex: "none" }}><q.icon size={15} /></span>
              <div><b>{k}</b><div className="faint" style={{ fontSize: 11.5 }}>{q.hint}</div></div>
            </button>
          ))}
        </div>
      </Modal>
      {overlay?.type === "create" && <CreateModal kind={overlay.kind} onClose={() => setOverlay(null)} onDone={(m) => { setOverlay(null); notify(m); }} />}
      <Drawer open={overlay === "notifs"} onClose={() => setOverlay(null)} title="Notifications" sub="12 new · sorted by operational urgency">
        {NOTIFS.map((n, i) => (
          <div key={i} className="feed-i" style={{ padding: "11px 0" }}>
            <i className={cx("dot", n.tone)} style={{ marginTop: 5 }} />
            <div style={{ flex: 1 }}><Chip tone={n.tone}>{n.kind}</Chip><div style={{ marginTop: 4 }}>{n.text}</div></div>
            <span className="faint">{n.time}</span>
          </div>
        ))}
      </Drawer>
    </>
  );
}

function SearchPalette({ onClose }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const index = useMemo(() => [
    ...CUSTOMERS.map((c) => ({ g: "Customer", t: c.name, s: `${c.type} · ${c.branch}`, href: `/customers/${c.id}`, c })),
    ...JOBS.map((j) => ({ g: "Job", t: j.id, s: `${j.customer} · ${j.service}`, href: `/jobs/${j.id}` })),
    ...JOBS.map((j) => ({ g: "Service Request", t: j.sr, s: `${j.customer} · ${j.issue}`, href: `/requests/${j.sr}` })),
    ...TECHS.map((t) => ({ g: "Technician", t: t.name, s: t.title, href: `/technicians/${t.id}` })),
    ...ASSETS.map((a) => ({ g: "Asset", t: a.id, s: `${a.brand} ${a.model}`, href: `/assets/${a.id}` })),
    ...AMCS.map((a) => ({ g: "AMC", t: a.id, s: `${a.cust} · ${inr(a.value)}`, href: `/amc/${a.id}` })),
    ...INVOICES.slice(0, 40).map((i) => ({ g: "Invoice", t: i.id, s: `${i.customer} · ${inr(i.total)}`, href: "/invoices" })),
    ...ESTIMATES.map((e) => ({ g: "Estimate", t: e.id, s: `${e.customer} · ${inr(e.total)}`, href: "/estimates" })),
    ...[...new Set(PARTS.map((p) => p.name))].map((n) => ({ g: "Part", t: n, s: "Spare part", href: "/parts" })),
  ], []);
  const ql = q.toLowerCase();
  const res = q.length < 1 ? [] : index.filter((x) => (x.t + " " + x.s).toLowerCase().includes(ql)).slice(0, 30);
  const hit = CUSTOMERS.find((c) => ql.length > 2 && c.name.toLowerCase() === ql) || (res.find((x) => x.g === "Customer")?.c && ql.length > 3 ? res.find((x) => x.g === "Customer").c : null);
  const go = (h) => { onClose(); router.push(h); };
  const groups = [...new Set(res.map((r) => r.g))];
  const open = hit ? JOBS.filter((j) => j.customer === hit.name && j.status !== "Completed") : [];
  const hitAmc = hit ? AMCS.find((a) => a.cust === hit.name) : null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" style={{ top: "9vh", width: "min(700px,94vw)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <Search size={16} className="faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, job, technician, asset, AMC, invoice, part, estimate…" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--ink)", fontSize: 14 }} onKeyDown={(e) => e.key === "Enter" && res[0] && go(res[0].href)} />
          <span className="kbd">esc</span>
        </div>
        <div style={{ overflow: "auto", padding: 8 }}>
          {!q && <div style={{ padding: 14 }} className="faint">Try <b className="link" onClick={() => setQ("Apex Mall")}>Apex Mall</b>, <b className="link" onClick={() => setQ("JOB-2841")}>JOB-2841</b>, <b className="link" onClick={() => setQ("Rohit")}>Rohit</b> or <b className="link" onClick={() => setQ("compressor")}>compressor</b>.</div>}
          {hit && (
            <div className="panel" style={{ margin: "4px 4px 10px", background: "var(--panel2)" }}>
              <div className="panel-h"><h3>{hit.name}</h3><span className="sub">everything connected to this customer</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line2)" }}>
                {[["Customer profile", `${hit.type} · since ${hit.since}`, `/customers/${hit.id}`], ["Open jobs", open.length ? `${open.length} open · ${open[0].id}` : "None open", open[0] ? `/jobs/${open[0].id}` : `/customers/${hit.id}`], ["Assets", `${hit.assets} registered`, "/assets"], ["AMC", hitAmc ? `${hitAmc.id} · ${hitAmc.status}` : `${hit.amcs} active`, hitAmc ? `/amc/${hitAmc.id}` : "/amc"], ["Invoices", hit.out ? `${inr(hit.out)} outstanding` : "All paid", "/invoices"], ["Payments", "Last 30 days", "/payments"]].map(([a, b, h]) => (
                  <button key={a} className="mi" style={{ background: "var(--panel)", border: 0, padding: "10px 12px", textAlign: "left", display: "block", cursor: "pointer" }} onClick={() => go(h)}><div className="lbl">{a}</div><div style={{ fontWeight: 550, marginTop: 2 }}>{b}</div></button>
                ))}
              </div>
            </div>
          )}
          {groups.map((g) => (
            <div key={g}>
              <div className="lbl" style={{ padding: "8px 10px 4px" }}>{g}</div>
              {res.filter((r) => r.g === g).slice(0, 6).map((r, i) => (
                <button key={i} className="menu mi" style={{ position: "static", boxShadow: "none", border: 0, minWidth: 0, display: "flex", width: "100%", padding: "7px 10px", background: "none", cursor: "pointer" }} onClick={() => go(r.href)}>
                  <b className={/^(JOB|SR|AC|INV|AMC|EST)/.test(r.t) ? "mono" : ""}>{r.t}</b><span className="faint" style={{ marginLeft: 10 }}>{r.s}</span>
                </button>
              ))}
            </div>
          ))}
          {q && !res.length && <div style={{ padding: 20 }} className="faint">No results for “{q}”.</div>}
        </div>
      </div>
    </>
  );
}
