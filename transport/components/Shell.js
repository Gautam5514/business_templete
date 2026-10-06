"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, Bell, Briefcase, Building2, ChevronsLeft, ChevronsRight, ClipboardList, CreditCard, Fuel, Gauge, Handshake, Landmark, LayoutDashboard,
  Map, MapPinned, Moon, PanelLeft, Plus, Receipt, Route, Search, Settings, ShieldCheck, Sparkles, Sun, Truck, Users, Wallet, Wrench, FileCheck2, Boxes, BarChart3, Monitor, Smartphone, CircleDollarSign, Ticket, Radio,
} from "lucide-react";
import { ROLES, useApp } from "@/lib/store";
import { Avatar, Drawer, Modal, Chip } from "./ui";
import { NOTIFS } from "@/data/ops";
import { VEHICLES, TRIPS, DRIVERS, CUSTOMERS } from "@/data/fleet";
import { ROUTES, HUBS } from "@/data/geo";
import { INVOICES, BOOKINGS } from "@/data/ops";
import CreateModal, { QUICK } from "./Forms";
import { cx, inr } from "@/lib/format";

const NAV = [
  ["Control", [["command-center", "Command Center", LayoutDashboard], ["live-fleet", "Live Fleet", MapPinned, "72"], ["trips", "Trips", Route, "64"], ["bookings", "Bookings", ClipboardList, "9"], ["dispatch", "Dispatch", Boxes, "5"]]],
  ["Fleet", [["vehicles", "Vehicles", Truck], ["drivers", "Drivers", Users], ["customers", "Customers", Briefcase], ["routes", "Routes", Map], ["hubs", "Hubs", Building2]]],
  ["Costs", [["fuel", "Fuel", Fuel], ["expenses", "Expenses", Wallet], ["toll", "Toll & FASTag", Ticket], ["maintenance", "Maintenance", Wrench, "6"], ["breakdowns", "Breakdowns", AlertTriangle, "3", "r"]]],
  ["Money", [["pod", "POD", FileCheck2, "17", "r"], ["invoices", "Invoices", Receipt], ["payments", "Payments", CreditCard], ["receivables", "Receivables", Landmark], ["vendors", "Vendor Vehicles", Handshake]]],
  ["Insight", [["reports", "Reports", BarChart3], ["activity", "Activity", Activity], ["assistant", "AI Logistics Assistant", Sparkles], ["settings", "Settings", Settings]]],
];

export default function Shell({ children }) {
  const { theme, setTheme, role, setRole, collapsed, toggleCollapsed, overlay, setOverlay } = useApp();
  const path = usePathname();
  const router = useRouter();
  const R = ROLES[role];
  const seg = path.split("/")[1];

  useEffect(() => { if (role === "driver") router.replace("/mobile"); }, [role, router]);
  const allowed = (k) => R.nav === "all" || R.nav.includes(k);

  const title = NAV.flatMap((g) => g[1]).find((n) => n[0] === seg)?.[1] || "FleetOps";
  const [roleMenu, setRoleMenu] = useState(false);

  return (
    <div className={cx("app", collapsed && "collapsed")}>
      <aside className="side">
        <div className="side-brand">
          <div className="logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17V7a1 1 0 0 1 1-1h10v11" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" fill="currentColor" /><circle cx="17" cy="18" r="2" fill="currentColor" /></svg></div>
          <div><b>FleetOps</b><small>EASTERN FREIGHT</small></div>
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
          <Link href="/mobile" className="nav-item"><Smartphone size={16} /><span>Driver &amp; Field Mobile</span></Link>
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
              <div className="lbl" style={{ padding: "6px 9px" }}>View as role</div>
              {Object.entries(ROLES).map(([k, r]) => (
                <button key={k} className="mi" onClick={() => { setRole(k); setRoleMenu(false); if (k !== "driver") router.push("/" + (r.nav === "all" ? "command-center" : r.nav[0])); }} style={{ fontWeight: role === k ? 650 : 400 }}>
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
          <div className="crumb">Eastern Freight &amp; Logistics <span style={{ margin: "0 5px" }}>/</span><b>{title}</b></div>
          <div className="search" onClick={() => setOverlay("search")}>
            <Search size={14} /><span>Search vehicle, trip, driver, customer, invoice…</span><span className="kbd">⌘K</span>
          </div>
          <span className="live-pill"><i className="dot g pulse" style={{ animation: "none" }} />Live · 03:12 PM IST</span>
          <button className="iconbtn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Theme">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="iconbtn" onClick={() => setOverlay("notifs")} aria-label="Notifications"><Bell size={16} /><i className="pip" /></button>
          <Link href="/assistant" className="btn"><Sparkles size={14} /> Ask FleetOps</Link>
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
  const router = useRouter();
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
      <Drawer open={overlay === "notifs"} onClose={() => setOverlay(null)} title="Notifications" sub="11 new · sorted by operational urgency">
        <div style={{ display: "grid", gap: 0 }}>
          {NOTIFS.map((n, i) => (
            <div key={i} className="feed-i" style={{ padding: "11px 0" }}>
              <i className={cx("dot", n.tone)} style={{ marginTop: 5 }} />
              <div style={{ flex: 1 }}><Chip tone={n.tone}>{n.kind}</Chip><div style={{ marginTop: 4 }}>{n.text}</div></div>
              <span className="faint">{n.time}</span>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
}

function SearchPalette({ onClose }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const inp = useRef(null);
  const index = useMemo(() => [
    ...VEHICLES.map((v) => ({ g: "Vehicle", t: v.id, s: `${v.model} · ${v.type}`, href: `/vehicles/${v.id}`, v })),
    ...TRIPS.slice(0, 200).map((t) => ({ g: "Trip", t: t.id, s: `${t.from} → ${t.to} · ${t.customer?.short}`, href: `/trips/${t.id}` })),
    ...DRIVERS.map((d) => ({ g: "Driver", t: d.name, s: d.vehicleId || "", href: `/drivers/${d.id}` })),
    ...CUSTOMERS.map((c) => ({ g: "Customer", t: c.name, s: c.industry, href: `/customers/${c.id}` })),
    ...INVOICES.map((i) => ({ g: "Invoice", t: i.id, s: `${i.route} · ${inr(i.total)}`, href: "/invoices" })),
    ...ROUTES.map((r) => ({ g: "Route", t: `${r.from} → ${r.to}`, s: `${r.km} km`, href: "/routes" })),
    ...HUBS.map((h) => ({ g: "Hub", t: `${h.name} Hub`, s: `${h.present} vehicles`, href: "/hubs" })),
    ...BOOKINGS.map((b) => ({ g: "Booking", t: b.id, s: `${b.from} → ${b.to}`, href: "/bookings" })),
    ...TRIPS.slice(0, 40).map((t) => ({ g: "POD", t: `POD · ${t.id}`, s: t.pod, href: "/pod" })),
  ], []);
  const res = q.length < 1 ? [] : index.filter((x) => (x.t + " " + x.s).toLowerCase().includes(q.toLowerCase())).slice(0, 24);
  const hit = res.find((x) => x.g === "Vehicle" && x.t.toLowerCase() === q.toLowerCase());
  const go = (h) => { onClose(); router.push(h); };
  const groups = [...new Set(res.map((r) => r.g))];
  const hv = hit?.v;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" style={{ top: "9vh", width: "min(680px,94vw)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <Search size={16} className="faint" />
          <input autoFocus ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vehicle, trip, driver, customer, invoice, POD, route, hub, expense, booking…" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--ink)", fontSize: 14 }} onKeyDown={(e) => e.key === "Enter" && res[0] && go(res[0].href)} />
          <span className="kbd">esc</span>
        </div>
        <div style={{ overflow: "auto", padding: 8 }}>
          {!q && <div style={{ padding: 14 }} className="faint">Try <b className="link" onClick={() => setQ("JH01DK4821")}>JH01DK4821</b>, <b className="link" onClick={() => setQ("TRP-9824")}>TRP-9824</b> or <b className="link" onClick={() => setQ("Sharma")}>Sharma</b>.</div>}
          {hv && (
            <div className="panel" style={{ margin: "4px 4px 10px", background: "var(--panel2)" }}>
              <div className="panel-h"><h3 className="mono">{hv.id}</h3><span className="sub">{hv.model} · everything connected to this vehicle</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--line2)" }}>
                {[["Vehicle Profile", `${hv.type} · ${hv.ownership}`, `/vehicles/${hv.id}`], ["Current Trip", hv.tripId || "No active trip", hv.tripId ? `/trips/${hv.tripId}` : `/vehicles/${hv.id}`], ["Driver", DRIVERS.find((d) => d.id === hv.driverId)?.name, `/drivers/${hv.driverId}`], ["Fuel Entries", "Last fill 2 days ago", "/fuel"], ["Maintenance", hv.nextKm < 0 ? `Overdue ${-hv.nextKm} km` : `Next in ${hv.nextKm} km`, "/maintenance"], ["Invoices", "Linked trips billed", "/invoices"]].map(([a, b, h]) => (
                  <button key={a} className="mi" style={{ background: "var(--panel)", border: 0, padding: "10px 12px", textAlign: "left", display: "block", cursor: "pointer" }} onClick={() => go(h)}><div className="lbl">{a}</div><div style={{ fontWeight: 550, marginTop: 2 }}>{b}</div></button>
                ))}
              </div>
            </div>
          )}
          {groups.map((g) => (
            <div key={g}>
              <div className="lbl" style={{ padding: "8px 10px 4px" }}>{g}</div>
              {res.filter((r) => r.g === g).map((r, i) => (
                <button key={i} className="menu mi" style={{ position: "static", boxShadow: "none", border: 0, minWidth: 0, display: "flex", width: "100%", padding: "7px 10px", background: "none", cursor: "pointer" }} onClick={() => go(r.href)}>
                  <b className={g === "Vehicle" || g === "Trip" ? "mono" : ""}>{r.t}</b><span className="faint" style={{ marginLeft: 10 }}>{r.s}</span>
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
