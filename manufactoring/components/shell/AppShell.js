"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Bell, Boxes, Check, ChevronDown, ChevronsLeft, ChevronsRight, ClipboardCheck, ClipboardList, Cog, CreditCard, Eye, FileText, GitBranch, Factory, Gauge, History, LayoutDashboard, Lock, LogOut,
  Menu, Package, PackageCheck, Plus, Receipt, Search, Settings, ShoppingCart, ShieldCheck, Sparkles, Truck, Users, UserCog, Wallet, Wrench, BarChart3, Layers, Calendar, Landmark, Workflow, PackageOpen, Hammer, Building2, X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { OWNER_MODULES, ROLES } from "@/lib/roles";
import { cn, Btn, PageSkeleton, Pill } from "@/components/ui/ui";
import { AskPanel } from "./AskPanel";
import { QuickModals } from "./QuickModals";
import { search, connected } from "@/lib/search";

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "flow", label: "Factory Flow", href: "/flow", icon: Workflow, group: "Overview" },
  { key: "orders", label: "Sales Orders", href: "/orders", icon: ShoppingCart, group: "Plan" },
  { key: "planning", label: "Production Planning", href: "/planning", icon: Calendar, group: "Plan" },
  { key: "production", label: "Production Orders", href: "/production", icon: ClipboardList, group: "Make" },
  { key: "wip", label: "Work In Progress", href: "/wip", icon: Layers, group: "Make" },
  { key: "lines", label: "Production Lines", href: "/lines", icon: Factory, group: "Make" },
  { key: "quality", label: "Quality Control", href: "/quality", icon: ClipboardCheck, group: "Make" },
  { key: "packing", label: "Packing", href: "/packing", icon: PackageOpen, group: "Make" },
  { key: "raw-materials", label: "Raw Materials", href: "/raw-materials", icon: Boxes, group: "Material" },
  { key: "finished-goods", label: "Finished Goods", href: "/finished-goods", icon: PackageCheck, group: "Material" },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: Package, group: "Material" },
  { key: "purchase", label: "Purchase", href: "/purchase", icon: Receipt, group: "Material" },
  { key: "suppliers", label: "Suppliers", href: "/suppliers", icon: Building2, group: "Material" },
  { key: "machines", label: "Machines", href: "/machines", icon: Cog, group: "Assets" },
  { key: "maintenance", label: "Maintenance", href: "/maintenance", icon: Wrench, group: "Assets" },
  { key: "dispatch", label: "Dispatch", href: "/dispatch", icon: Truck, group: "Sell" },
  { key: "customers", label: "Customers", href: "/customers", icon: Users, group: "Sell" },
  { key: "invoices", label: "Invoices", href: "/invoices", icon: FileText, group: "Sell" },
  { key: "payments", label: "Payments", href: "/payments", icon: CreditCard, group: "Sell" },
  { key: "expenses", label: "Expenses", href: "/expenses", icon: Wallet, group: "Money" },
  { key: "finance", label: "Costing & Finance", href: "/finance", icon: Landmark, group: "Money" },
  { key: "employees", label: "Employees", href: "/employees", icon: UserCog, group: "Company" },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3, group: "Company" },
  { key: "logs", label: "Activity Logs", href: "/logs", icon: History, group: "Company" },
  { key: "assistant", label: "AI Factory Assistant", href: "/assistant", icon: Sparkles, group: "Assistant" },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings, group: "System" },
];
const moduleOf = (p) => p.split("/")[1] || "dashboard";

function Logo({ small }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0"><rect width="26" height="26" rx="5" fill="#1a1c1e" /><path d="M5 19V9l5 3V9l5 3V6h3v13z" fill="#fff" /><rect x="5" y="20.2" width="16" height="1.4" fill="#8fa3b5" /></svg>
      {!small && <div className="leading-tight"><div className="text-[14px] font-semibold tracking-[-0.01em]">FactoryFlow</div><div className="text-[11px] text-mute">Bharat MetalWorks</div></div>}
    </div>
  );
}

function SidebarBody({ collapsed, allowed, onNav }) {
  const path = usePathname();
  const { ownerMode, breakdowns, prs } = useStore();
  const items = NAV.filter((n) => allowed.includes(n.key));
  const groups = Array.from(new Set(items.map((i) => i.group)));
  const badge = (k) => (k === "maintenance" ? breakdowns.filter((b) => b.status !== "Closed").length : k === "purchase" ? prs.filter((p) => p.status === "Pending Approval").length : 0);
  return (
    <nav className="flex-1 overflow-y-auto px-2 pb-4">
      {ownerMode && !collapsed && <div className="mx-1 mb-2 flex items-center gap-1.5 rounded-[6px] bg-accent-soft px-2 py-1.5 text-[11.5px] font-medium text-accent-ink"><Eye size={12} /> Owner View — simplified</div>}
      {groups.map((g) => (
        <div key={g} className="mt-3 first:mt-1">
          {!collapsed && groups.length > 2 && <div className="px-2 pb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">{g}</div>}
          {collapsed && <div className="mx-2 my-1.5 h-px bg-line first:hidden" />}
          {items.filter((i) => i.group === g).map((i) => {
            const on = path === i.href || path.startsWith(i.href + "/");
            const b = badge(i.key);
            const Ico = i.icon;
            return (
              <Link key={i.key} href={i.href} onClick={onNav} title={collapsed ? i.label : undefined} className={cn("group relative mb-px flex items-center gap-2.5 rounded-[6px] px-2 py-[7px] text-[13px] font-medium transition-colors", on ? "bg-surface text-ink shadow-[0_0_0_1px_var(--line)]" : "text-mute hover:bg-panel hover:text-ink", collapsed && "justify-center")}>
                {on && <span className="absolute -left-2 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r bg-accent" />}
                <Ico size={16} className={cn(on ? "text-accent" : "text-faint group-hover:text-mute")} />
                {!collapsed && <span className="truncate">{i.label}</span>}
                {!collapsed && b > 0 && <span className="num ml-auto rounded-[4px] bg-panel px-1.5 text-[11px] text-mute">{b}</span>}
                {collapsed && b > 0 && <span className="absolute right-1.5 top-1 h-1.5 w-1.5 rounded-full bg-bad" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function useOutside(ref, fn, on) {
  useEffect(() => {
    if (!on) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) fn(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [on, ref, fn]);
}

function SearchPalette() {
  const s = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(0);
  const res = useMemo(() => search(q, s), [q, s]);
  const conn = useMemo(() => connected(q, s), [q, s]);
  const flat = useMemo(() => Object.values(res).flatMap((g) => g.slice(0, 4)), [res]);
  useEffect(() => { if (s.searchOpen) { setQ(""); setCur(0); } }, [s.searchOpen]);
  if (!s.searchOpen) return null;
  const go = (href) => { s.setSearchOpen(false); router.push(href); };
  const ask = () => { s.setSearchOpen(false); s.setAiOpen(true, q); };
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 p-3 pt-[8vh] backdrop-blur-[1px]" onMouseDown={(e) => e.target === e.currentTarget && s.setSearchOpen(false)}>
      <div className="slide-up w-full max-w-[640px] overflow-hidden rounded-[12px] border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-faint" />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setCur(0); }} placeholder="Search work orders, sales orders, products, batches, machines, suppliers…"
            onKeyDown={(e) => {
              if (e.key === "Escape") s.setSearchOpen(false);
              if (e.key === "ArrowDown") { e.preventDefault(); setCur((c) => Math.min(flat.length, c + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setCur((c) => Math.max(0, c - 1)); }
              if (e.key === "Enter") { if (cur === 0 && q.trim() && !conn) ask(); else if (flat[cur - 1]) go(flat[cur - 1].href); else if (conn) go(conn[0][2]); }
            }}
            className="h-12 flex-1 bg-transparent text-[14px] placeholder:text-faint focus:outline-none" />
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-[10.5px] text-faint">ESC</kbd>
        </div>
        <div className="max-h-[62vh] overflow-y-auto p-1.5">
          {conn && (
            <div className="m-1 rounded-[8px] border border-accent/20 bg-accent-soft/50 p-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-accent-ink"><GitBranch size={12} /> Connected records — full traceability</div>
              <div className="grid gap-1 sm:grid-cols-2">
                {conn.map(([k, v, href]) => (
                  <button key={k} onClick={() => go(href)} className="rounded-[6px] bg-surface px-2.5 py-1.5 text-left hover:bg-panel"><div className="text-[10.5px] uppercase tracking-[0.04em] text-faint">{k}</div><div className="truncate text-[13px] font-medium">{v}</div></button>
                ))}
              </div>
            </div>
          )}
          {q.trim() ? (
            <button onClick={ask} className={cn("flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[13px]", cur === 0 ? "bg-accent-soft" : "hover:bg-panel")}>
              <Sparkles size={15} className="text-accent" /><span>Ask Your Factory: <b>“{q}”</b></span><ArrowRight size={14} className="ml-auto text-faint" />
            </button>
          ) : (
            <div className="px-2.5 py-6 text-center text-[13px] text-mute">Start typing — try <button className="font-medium text-accent" onClick={() => setQ("WO-2841")}>“WO-2841”</button> or <button className="font-medium text-accent" onClick={() => setQ("SS304")}>“SS304”</button></div>
          )}
          {q.trim() && flat.length === 0 && !conn && <div className="px-3 py-6 text-center text-[13px] text-mute">No records match “{q}”. Press Enter to ask the assistant instead.</div>}
          {Object.entries(res).map(([g, hits]) => (
            <div key={g} className="mt-1.5">
              <div className="flex items-center justify-between px-2.5 pb-1 pt-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint"><span>{g}</span>{hits.length > 4 && <span>+{hits.length - 4} more</span>}</div>
              {hits.slice(0, 4).map((h) => {
                const idx = flat.indexOf(h) + 1;
                return (
                  <button key={h.href + h.title} onClick={() => go(h.href)} onMouseEnter={() => setCur(idx)} className={cn("flex w-full items-center justify-between gap-3 rounded-[6px] px-2.5 py-1.5 text-left", cur === idx ? "bg-accent-soft" : "hover:bg-panel")}>
                    <span className="min-w-0"><span className="block truncate text-[13px] font-medium">{h.title}</span><span className="block truncate text-[12px] text-mute">{h.sub}</span></span>
                    <ArrowRight size={13} className="shrink-0 text-faint" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  const { notifs, readNotif } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  const unread = notifs.filter((n) => n.unread).length;
  const tone = { shortage: "bg-bad", breakdown: "bg-bad", qc: "bg-bad", credit: "bg-bad", overdue: "bg-bad", delay: "bg-warn", maint: "bg-warn", purchase: "bg-warn", risk: "bg-warn", ready: "bg-ok" };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative flex h-8 w-8 items-center justify-center rounded-[6px] text-mute hover:bg-panel hover:text-ink" aria-label="Notifications">
        <Bell size={17} />
        {unread > 0 && <span className="num absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9.5px] font-semibold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="slide-up fixed inset-x-2 top-[52px] z-50 rounded-[10px] border border-line bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5"><div className="text-[13.5px] font-semibold">Notifications</div><button onClick={() => readNotif()} className="text-[12px] text-accent hover:underline">Mark all read</button></div>
          <div className="max-h-[60vh] divide-y divide-line overflow-y-auto">
            {notifs.map((n) => (
              <Link key={n.id} href={n.href} onClick={() => { readNotif(n.id); setOpen(false); }} className={cn("flex gap-2.5 px-3 py-2.5 hover:bg-bg", n.unread && "bg-accent-soft/40")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? tone[n.kind] ?? "bg-info" : "bg-line-strong")} />
                <div className="min-w-0"><div className="flex items-baseline justify-between gap-2"><span className="text-[13px] font-medium">{n.title}</span><span className="shrink-0 text-[11px] text-faint">{n.time}</span></div><div className="text-[12.5px] text-mute">{n.body}</div></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCreate() {
  const { openQuick } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  const opts = [["so", "Create Sales Order", ShoppingCart], ["wo", "Create Production Order", ClipboardList], ["issue", "Issue Material", Boxes], ["entry", "Enter Production", Gauge], ["qc", "Create QC Inspection", ClipboardCheck], ["bd", "Report Breakdown", Hammer], ["pr", "Create Purchase Requisition", Receipt], ["grn", "Receive Material", PackageOpen], ["dispatch", "Create Dispatch", Truck], ["pay", "Record Payment", CreditCard]];
  return (
    <div className="relative" ref={ref}>
      <Btn variant="primary" size="md" icon={<Plus size={15} />} onClick={() => setOpen(!open)}><span className="hidden sm:inline">Create</span></Btn>
      {open && (
        <div className="slide-up absolute right-0 z-50 mt-1.5 w-64 rounded-[8px] border border-line bg-surface p-1 shadow-2xl">
          {opts.map(([k, l, I]) => <button key={k} onClick={() => { setOpen(false); openQuick(k); }} className="flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-left text-[13px] hover:bg-panel"><I size={14} className="text-mute" />{l}</button>)}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { role, setRole, ownerMode, setOwnerMode } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false), open);
  const r = ROLES.find((x) => x.id === role);
  const initials = r.person.split(" ").map((x) => x[0]).join("");
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-[6px] py-1 pl-1 pr-1.5 hover:bg-panel">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">{initials}</span>
        <span className="hidden text-left leading-tight lg:block"><span className="block text-[12.5px] font-medium">{r.person}</span><span className="block text-[11px] text-mute">{r.title}</span></span>
        <ChevronDown size={13} className="hidden text-faint lg:block" />
      </button>
      {open && (
        <div className="slide-up absolute right-0 z-50 mt-1.5 max-h-[80vh] w-[310px] overflow-y-auto rounded-[10px] border border-line bg-surface p-1.5 shadow-2xl">
          <div className="px-2.5 py-2"><div className="text-[13.5px] font-semibold">{r.person}</div><div className="text-[12px] text-mute">{r.label}</div></div>
          <div className="my-1 h-px bg-line" />
          <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">View as role</div>
          {ROLES.map((x) => (
            <button key={x.id} onClick={() => { setRole(x.id); setOpen(false); router.push("/dashboard"); }} className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] hover:bg-panel">
              <span><span className="block">{x.label}</span><span className="block text-[11.5px] text-mute">{x.person}</span></span>
              {role === x.id && <Check size={14} className="text-accent" />}
            </button>
          ))}
          <div className="my-1 h-px bg-line" />
          <label className="flex cursor-pointer items-center justify-between rounded-[5px] px-2.5 py-2 text-[13px] hover:bg-panel">Owner View <input type="checkbox" checked={ownerMode} onChange={(e) => setOwnerMode(e.target.checked)} className="accent-[var(--accent)]" /></label>
          <div className="my-1 h-px bg-line" />
          <button onClick={() => router.push("/")} className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-2 text-[13px] text-mute hover:bg-panel hover:text-ink"><LogOut size={14} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }) {
  const path = usePathname();
  const s = useStore();
  const { role, ownerMode, setOwnerMode, toasts, dismissToast, aiOpen, setAiOpen, aiSeed, setSearchOpen } = s;
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { try { setCollapsed(localStorage.getItem("ff.collapsed") === "1"); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("ff.collapsed", collapsed ? "1" : "0"); } catch {} }, [collapsed]);
  useEffect(() => {
    setLoading(true); setDrawer(false);
    const t = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(t);
  }, [path]);
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setAiOpen(true); }
      if (e.key === "Escape") setAiOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setSearchOpen, setAiOpen]);

  const roleDef = ROLES.find((r) => r.id === role);
  const allowed = ownerMode ? roleDef.modules.filter((m) => OWNER_MODULES.includes(m)) : roleDef.modules;
  const mod = moduleOf(path);
  const permitted = roleDef.modules.includes(mod);
  const sup = role === "supervisor";

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className={cn("no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-bg transition-[width] duration-150 md:flex", collapsed ? "w-[56px]" : "w-[240px]")}>
        <div className={cn("flex h-[52px] items-center border-b border-line", collapsed ? "justify-center" : "px-3.5")}><Logo small={collapsed} /></div>
        <div className="pt-1" />
        <SidebarBody collapsed={collapsed} allowed={allowed} />
        <button onClick={() => setCollapsed(!collapsed)} className={cn("flex h-10 items-center gap-2 border-t border-line text-[12px] text-mute hover:bg-panel hover:text-ink", collapsed ? "justify-center" : "px-3.5")} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /> Collapse</>}
        </button>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-[70] md:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-black/35" />
          <aside className="slide-up absolute inset-y-0 left-0 flex w-[280px] flex-col bg-bg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-[52px] items-center justify-between border-b border-line px-3.5"><Logo /><button onClick={() => setDrawer(false)} className="text-mute"><X size={18} /></button></div>
            <SidebarBody collapsed={false} allowed={allowed} onNav={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-5">
          <button className="flex h-8 w-8 items-center justify-center rounded-[6px] text-mute hover:bg-panel md:hidden" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={18} /></button>
          <button onClick={() => setSearchOpen(true)} className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[6px] border border-line-strong bg-bg px-2.5 text-left text-[13px] text-faint hover:border-faint sm:max-w-[380px]">
            <Search size={14} /><span className="truncate">Search WO-2841, SS304, HP-03…</span><kbd className="num ml-auto hidden rounded border border-line-strong bg-surface px-1.5 text-[10.5px] text-mute sm:block">⌘K</kbd>
          </button>
          <button onClick={() => setAiOpen(true)} className="hidden h-8 items-center gap-1.5 rounded-[6px] border border-accent/25 bg-accent-soft px-2.5 text-[13px] font-medium text-accent-ink hover:bg-accent-soft/60 sm:flex"><Sparkles size={14} />Ask Your Factory</button>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-[6px] bg-panel px-2 py-1 text-[12px] text-mute xl:flex"><span className="live-dot h-1.5 w-1.5 rounded-full bg-ok" />Both plants · live</span>
            <button onClick={() => setOwnerMode(!ownerMode)} className={cn("hidden h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12.5px] font-medium sm:flex", ownerMode ? "border-accent bg-accent text-white" : "border-line-strong text-mute hover:bg-panel")} title="Owner View simplifies the system to what an owner needs">
              <Eye size={14} />Owner View
            </button>
            <QuickCreate />
            <Notifications />
            <UserMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-[1480px]">
            {loading ? <PageSkeleton /> : permitted ? children : (
              <div className="mx-auto mt-16 max-w-md text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-panel text-mute"><Lock size={18} /></div>
                <h2 className="text-[18px] font-semibold">Access restricted</h2>
                <p className="mt-1 text-[13px] text-mute">Your role ({roleDef.label}) doesn&apos;t include this module. Switch role from the profile menu to continue.</p>
                <div className="mt-4 flex justify-center gap-2"><Btn href="/dashboard">Back to dashboard</Btn><Btn variant="secondary" onClick={() => s.setRole("owner")} icon={<ShieldCheck size={14} />}>Switch to Owner</Btn></div>
              </div>
            )}
          </div>
        </main>

        <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface md:hidden">
          {(sup
            ? [["/lines?tab=entry", "Entry", Gauge], ["/raw-materials?tab=issue", "Issue", Boxes], ["/quality", "QC", ClipboardCheck], ["/maintenance?tab=breakdowns", "Breakdown", Hammer]]
            : [["/dashboard", "Home", LayoutDashboard], ["/lines?tab=entry", "Entry", Gauge], ["/quality", "QC", ClipboardCheck], ["/maintenance?tab=breakdowns", "Breakdown", Hammer]]
          ).map(([h, l, I]) => <Link key={l} href={h} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium", path === h.split("?")[0] ? "text-accent" : "text-mute")}><I size={19} />{l}</Link>)}
          <button onClick={() => setAiOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium text-mute"><Sparkles size={19} />Ask</button>
        </nav>
      </div>

      {aiOpen && (
        <div className="fixed inset-0 z-[85]" onMouseDown={(e) => e.target === e.currentTarget && setAiOpen(false)}>
          <div className="absolute inset-0 bg-black/25" />
          <aside className="slide-up absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-line bg-bg shadow-2xl">
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-line bg-surface px-4"><div className="flex items-center gap-2 text-[14px] font-semibold"><Sparkles size={16} className="text-accent" />Ask Your Factory<Pill tone="accent" dot={false}>Live data</Pill></div><button onClick={() => setAiOpen(false)} className="rounded p-1 text-mute hover:bg-panel" aria-label="Close"><X size={17} /></button></div>
            <div className="min-h-0 flex-1"><AskPanel seed={aiSeed} onNavigate={() => setAiOpen(false)} /></div>
          </aside>
        </div>
      )}

      <SearchPalette />
      <QuickModals />

      <div className="pointer-events-none fixed bottom-20 right-3 z-[100] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 md:bottom-5 md:right-5" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="slide-up pointer-events-auto flex items-start gap-2.5 rounded-[8px] border border-line bg-ink px-3 py-2.5 text-white shadow-2xl">
            <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", t.tone === "ok" ? "bg-ok" : t.tone === "bad" ? "bg-bad" : "bg-info")}>{t.tone === "bad" ? <X size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />}</span>
            <div className="min-w-0 flex-1"><div className="text-[13px] font-medium">{t.msg}</div>{t.sub && <div className="text-[12px] text-white/65">{t.sub}</div>}</div>
            <button onClick={() => dismissToast(t.id)} className="text-white/50 hover:text-white" aria-label="Dismiss"><X size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
