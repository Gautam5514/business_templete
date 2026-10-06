"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Bell, Building2, Check, ChevronDown, ChevronsLeft, ChevronsRight, CircleDollarSign, ClipboardList, CreditCard, FileText, History, LayoutDashboard, Lock, LogOut, Menu,
  Package, Plus, Receipt, ScrollText, Search, Settings, ShoppingCart, Sparkles, Truck, Undo2, Users, UserCog, Warehouse, Wallet, Boxes, Route, BarChart3, WifiOff, X, Eye, ShieldCheck, Landmark,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { OWNER_MODULES, ROLES } from "@/lib/roles";
import { cn, Btn, PageSkeleton, Pill } from "@/components/ui/ui";
import { AskPanel } from "@/components/ai/AskPanel";
import { QuickModals } from "./QuickModals";
import { search } from "@/lib/search";

type Item = { key: string; label: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; group: string };
const NAV: Item[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "orders", label: "Sales Orders", href: "/orders", icon: ShoppingCart, group: "Sell" },
  { key: "customers", label: "Customers / Dealers", href: "/customers", icon: Users, group: "Sell" },
  { key: "products", label: "Products", href: "/products", icon: Package, group: "Stock" },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: Boxes, group: "Stock" },
  { key: "warehouses", label: "Warehouses", href: "/warehouses", icon: Warehouse, group: "Stock" },
  { key: "purchase", label: "Purchase", href: "/purchase", icon: ClipboardList, group: "Stock" },
  { key: "dispatch", label: "Dispatch", href: "/dispatch", icon: Truck, group: "Fulfil" },
  { key: "shipments", label: "Shipments", href: "/shipments", icon: Route, group: "Fulfil" },
  { key: "invoices", label: "Invoices", href: "/invoices", icon: FileText, group: "Money" },
  { key: "payments", label: "Payments", href: "/payments", icon: CreditCard, group: "Money" },
  { key: "receivables", label: "Receivables", href: "/receivables", icon: CircleDollarSign, group: "Money" },
  { key: "returns", label: "Returns", href: "/returns", icon: Undo2, group: "Money" },
  { key: "expenses", label: "Expenses", href: "/expenses", icon: Wallet, group: "Money" },
  { key: "employees", label: "Employees", href: "/employees", icon: UserCog, group: "Company" },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3, group: "Company" },
  { key: "logs", label: "Activity Logs", href: "/logs", icon: History, group: "Company" },
  { key: "assistant", label: "AI Business Assistant", href: "/assistant", icon: Sparkles, group: "Assistant" },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings, group: "System" },
];
const moduleOf = (p: string) => p.split("/")[1] || "dashboard";

function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0"><rect width="26" height="26" rx="6" fill="#1b1b19" /><path d="M7 8.5 13 5l6 3.5v7L13 19l-6-3.5z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 8.5 13 12l6-3.5M13 12v7" stroke="#8d92f5" strokeWidth="1.5" strokeLinejoin="round" fill="none" /></svg>
      {!small && <div className="leading-tight"><div className="text-[13.5px] font-semibold tracking-[-0.01em]">Distribution Control OS</div><div className="text-[11px] text-mute">BharatFlow Distribution</div></div>}
    </div>
  );
}

function SidebarBody({ collapsed, allowed, onNav }: { collapsed: boolean; allowed: string[]; onNav?: () => void }) {
  const path = usePathname();
  const { orders, ownerMode, invoices } = useStore();
  const items = NAV.filter((n) => allowed.includes(n.key));
  const groups = Array.from(new Set(items.map((i) => i.group)));
  const pending = orders.filter((o) => o.status === "Pending Approval").length;
  const overdue = invoices.filter((i) => i.status === "Overdue").length;
  const badge = (k: string) => (k === "orders" && pending ? pending : k === "receivables" && overdue ? overdue : 0);
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

function useOutside(ref: React.RefObject<HTMLElement | null>, fn: () => void, on: boolean) {
  useEffect(() => {
    if (!on) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) fn(); };
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
  const flat = useMemo(() => Object.values(res).flatMap((g) => g.slice(0, 4)), [res]);
  useEffect(() => { if (s.searchOpen) { setQ(""); setCur(0); } }, [s.searchOpen]);
  if (!s.searchOpen) return null;
  const go = (href: string) => { s.setSearchOpen(false); router.push(href); };
  const ask = () => { s.setSearchOpen(false); s.setAiOpen(true, q); };
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 p-3 pt-[10vh] backdrop-blur-[1px]" onMouseDown={(e) => e.target === e.currentTarget && s.setSearchOpen(false)}>
      <div className="slide-up w-full max-w-[620px] overflow-hidden rounded-[12px] border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-faint" />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setCur(0); }} placeholder="Search customers, orders, products, invoices, payments, dispatches, employees…"
            onKeyDown={(e) => {
              if (e.key === "Escape") s.setSearchOpen(false);
              if (e.key === "ArrowDown") { e.preventDefault(); setCur((c) => Math.min(flat.length, c + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setCur((c) => Math.max(0, c - 1)); }
              if (e.key === "Enter") { if (cur === 0 && q.trim()) ask(); else if (flat[cur - 1]) go(flat[cur - 1].href); }
            }}
            className="h-12 flex-1 bg-transparent text-[14px] placeholder:text-faint focus:outline-none" />
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-[10.5px] text-faint">ESC</kbd>
        </div>
        <div className="max-h-[56vh] overflow-y-auto p-1.5">
          {q.trim() ? (
            <button onClick={ask} className={cn("flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[13px]", cur === 0 ? "bg-accent-soft" : "hover:bg-panel")}>
              <Sparkles size={15} className="text-accent" /><span>Ask Your Business: <b>“{q}”</b></span><ArrowRight size={14} className="ml-auto text-faint" />
            </button>
          ) : (
            <div className="px-2.5 py-6 text-center text-[13px] text-mute">Start typing — try <button className="font-medium text-accent" onClick={() => setQ("Sharma")}>“Sharma”</button></div>
          )}
          {q.trim() && flat.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-mute">No records match “{q}”. Press Enter to ask the assistant instead.</div>}
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
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const unread = notifs.filter((n) => n.unread).length;
  const tone: Record<string, string> = { overdue: "bg-bad", credit: "bg-bad", stock: "bg-warn", delay: "bg-warn", approval: "bg-info", return: "bg-info", large: "bg-ok", po: "bg-ok" };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative flex h-8 w-8 items-center justify-center rounded-[6px] text-mute hover:bg-panel hover:text-ink" aria-label="Notifications">
        <Bell size={17} />
        {unread > 0 && <span className="num absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9.5px] font-semibold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="slide-up fixed inset-x-2 top-[52px] z-50 rounded-[10px] border border-line bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[390px]">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5"><div className="text-[13.5px] font-semibold">Notifications</div><button onClick={() => readNotif()} className="text-[12px] text-accent hover:underline">Mark all read</button></div>
          <div className="max-h-[60vh] divide-y divide-line overflow-y-auto">
            {notifs.map((n) => (
              <Link key={n.id} href={n.href} onClick={() => { readNotif(n.id); setOpen(false); }} className={cn("flex gap-2.5 px-3 py-2.5 hover:bg-bg", n.unread && "bg-accent-soft/30")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? tone[n.kind] : "bg-line-strong")} />
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
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const opts: [string, string, React.ReactNode][] = [
    ["order", "New Order", <ShoppingCart key="a" size={14} />], ["customer", "New Customer", <Users key="b" size={14} />], ["payment", "Record Payment", <CreditCard key="c" size={14} />],
    ["dispatch", "Create Dispatch", <Truck key="d" size={14} />], ["expense", "Add Expense", <Receipt key="e" size={14} />], ["po", "Create Purchase Order", <ClipboardList key="f" size={14} />], ["transfer", "Stock Transfer", <Boxes key="g" size={14} />],
  ];
  return (
    <div className="relative" ref={ref}>
      <Btn variant="primary" size="md" icon={<Plus size={15} />} onClick={() => setOpen(!open)}><span className="hidden sm:inline">Quick Create</span></Btn>
      {open && (
        <div className="slide-up absolute right-0 z-50 mt-1.5 w-56 rounded-[8px] border border-line bg-surface p-1 shadow-2xl">
          {opts.map(([k, l, i]) => <button key={k} onClick={() => { setOpen(false); openQuick(k); }} className="flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-left text-[13px] hover:bg-panel"><span className="text-mute">{i}</span>{l}</button>)}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { role, setRole, user, ownerMode, setOwnerMode, offline, setOffline } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  const initials = user.name.split(" ").map((x) => x[0]).join("");
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-[6px] py-1 pl-1 pr-1.5 hover:bg-panel">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">{initials}</span>
        <span className="hidden text-left leading-tight lg:block"><span className="block text-[12.5px] font-medium">{user.name}</span><span className="block text-[11px] text-mute">{user.title}</span></span>
        <ChevronDown size={13} className="hidden text-faint lg:block" />
      </button>
      {open && (
        <div className="slide-up absolute right-0 z-50 mt-1.5 w-[300px] rounded-[10px] border border-line bg-surface p-1.5 shadow-2xl">
          <div className="px-2.5 py-2"><div className="text-[13.5px] font-semibold">{user.name}</div><div className="text-[12px] text-mute">{user.title} · raj@bharatflow.demo</div></div>
          <div className="my-1 h-px bg-line" />
          <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-faint">View as role</div>
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => { setRole(r.id); setOpen(false); router.push("/dashboard"); }} className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-left text-[13px] hover:bg-panel">
              <span><span className="block">{r.label}</span><span className="block text-[11.5px] text-mute">{r.person}</span></span>
              {role === r.id && <Check size={14} className="text-accent" />}
            </button>
          ))}
          <div className="my-1 h-px bg-line" />
          <label className="flex cursor-pointer items-center justify-between rounded-[5px] px-2.5 py-2 text-[13px] hover:bg-panel">Owner View <input type="checkbox" checked={ownerMode} onChange={(e) => setOwnerMode(e.target.checked)} className="accent-[var(--accent)]" /></label>
          <label className="flex cursor-pointer items-center justify-between rounded-[5px] px-2.5 py-2 text-[13px] hover:bg-panel">Simulate offline <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} className="accent-[var(--accent)]" /></label>
          <div className="my-1 h-px bg-line" />
          <button onClick={() => router.push("/")} className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-2 text-[13px] text-mute hover:bg-panel hover:text-ink"><LogOut size={14} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const s = useStore();
  const { role, ownerMode, setOwnerMode, warehouse, setWarehouse, offline, toasts, dismissToast, aiOpen, setAiOpen, aiSeed, setSearchOpen } = s;
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whOpen, setWhOpen] = useState(false);
  const whRef = useRef<HTMLDivElement>(null);
  useOutside(whRef, () => setWhOpen(false), whOpen);

  useEffect(() => { try { setCollapsed(localStorage.getItem("dcos.collapsed") === "1"); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("dcos.collapsed", collapsed ? "1" : "0"); } catch {} }, [collapsed]);
  useEffect(() => {
    setLoading(true); setDrawer(false);
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, [path]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setAiOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setSearchOpen, setAiOpen]);

  useEffect(() => {
    if (!aiOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setAiOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aiOpen, setAiOpen]);

  const roleDef = ROLES.find((r) => r.id === role)!;
  const allowed = ownerMode ? roleDef.modules.filter((m) => OWNER_MODULES.includes(m)) : roleDef.modules;
  const mod = moduleOf(path);
  const permitted = allowed.includes(mod) || (ownerMode && roleDef.modules.includes(mod));
  const whs = [{ id: "ALL", name: "All warehouses" }, { id: "RNC", name: "Ranchi Central" }, { id: "DHN", name: "Dhanbad" }, { id: "PAT", name: "Patna" }];

  return (
    <div className="flex min-h-screen bg-bg">
      {/* desktop sidebar */}
      <aside className={cn("no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-bg transition-[width] duration-150 md:flex", collapsed ? "w-[56px]" : "w-[236px]")}>
        <div className={cn("flex h-[52px] items-center border-b border-line", collapsed ? "justify-center" : "px-3.5")}><Logo small={collapsed} /></div>
        <div className="pt-1" />
        <SidebarBody collapsed={collapsed} allowed={allowed} />
        <button onClick={() => setCollapsed(!collapsed)} className={cn("flex h-10 items-center gap-2 border-t border-line text-[12px] text-mute hover:bg-panel hover:text-ink", collapsed ? "justify-center" : "px-3.5")} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /> Collapse</>}
        </button>
      </aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[70] md:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-black/35" />
          <aside className="slide-up absolute inset-y-0 left-0 flex w-[270px] flex-col bg-bg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-[52px] items-center justify-between border-b border-line px-3.5"><Logo /><button onClick={() => setDrawer(false)} className="text-mute"><X size={18} /></button></div>
            <SidebarBody collapsed={false} allowed={allowed} onNav={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur sm:px-5">
          <button className="flex h-8 w-8 items-center justify-center rounded-[6px] text-mute hover:bg-panel md:hidden" onClick={() => setDrawer(true)} aria-label="Menu"><Menu size={18} /></button>
          <button onClick={() => setSearchOpen(true)} className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[6px] border border-line-strong bg-bg px-2.5 text-left text-[13px] text-faint hover:border-faint sm:max-w-[380px]">
            <Search size={14} /><span className="truncate">Search anything…</span><kbd className="num ml-auto hidden rounded border border-line-strong bg-surface px-1.5 text-[10.5px] text-mute sm:block">⌘K</kbd>
          </button>
          <button onClick={() => setAiOpen(true)} className="hidden h-8 items-center gap-1.5 rounded-[6px] border border-accent/25 bg-accent-soft px-2.5 text-[13px] font-medium text-accent-ink hover:bg-accent-soft/60 sm:flex"><Sparkles size={14} />Ask AI</button>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="relative hidden lg:block" ref={whRef}>
              <button onClick={() => setWhOpen(!whOpen)} className="flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[12.5px] text-mute hover:bg-panel hover:text-ink"><Building2 size={14} />{whs.find((w) => w.id === warehouse)?.name}<ChevronDown size={12} /></button>
              {whOpen && <div className="slide-up absolute right-0 z-50 mt-1 w-48 rounded-[8px] border border-line bg-surface p-1 shadow-2xl">{whs.map((w) => <button key={w.id} onClick={() => { setWarehouse(w.id); setWhOpen(false); s.toast(`Warehouse view: ${w.name}`, "info"); }} className="flex w-full items-center justify-between rounded-[5px] px-2.5 py-1.5 text-[13px] hover:bg-panel">{w.name}{warehouse === w.id && <Check size={13} className="text-accent" />}</button>)}</div>}
            </div>
            <span className="hidden items-center gap-1.5 rounded-[6px] bg-panel px-2 py-1 text-[12px] text-mute xl:flex"><Landmark size={13} />FY 2026–27</span>
            <button onClick={() => setOwnerMode(!ownerMode)} className={cn("hidden h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12.5px] font-medium sm:flex", ownerMode ? "border-accent bg-accent text-white" : "border-line-strong text-mute hover:bg-panel")} title="Owner View simplifies the system to what an owner needs">
              <Eye size={14} />Owner View
            </button>
            <QuickCreate />
            <Notifications />
            <UserMenu />
          </div>
        </header>

        {offline && <div className="flex items-center justify-center gap-2 bg-warn-soft px-3 py-1.5 text-[12.5px] font-medium text-warn"><WifiOff size={14} />You&apos;re offline — changes are saved on this device and will sync when you reconnect.</div>}

        <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-[1480px]">
            {loading ? <PageSkeleton /> : permitted ? children : (
              <div className="mx-auto mt-16 max-w-md text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-panel text-mute"><Lock size={18} /></div>
                <h2 className="text-[18px] font-semibold">Access restricted</h2>
                <p className="mt-1 text-[13px] text-mute">Your role ({roleDef.label}) doesn&apos;t include this module. Ask an Admin to update permissions, or switch role from the profile menu.</p>
                <div className="mt-4 flex justify-center gap-2"><Btn href="/dashboard">Back to dashboard</Btn><Btn variant="secondary" onClick={() => s.setRole("owner")} icon={<ShieldCheck size={14} />}>Switch to Owner</Btn></div>
              </div>
            )}
          </div>
        </main>

        {/* mobile bottom nav */}
        <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface md:hidden">
          {[["dashboard", "/dashboard", "Home", LayoutDashboard], ["orders", "/orders", "Orders", ShoppingCart], ["customers", "/customers", "Dealers", Users], ["receivables", "/receivables", "Dues", CircleDollarSign]].map(([k, h, l, I]) => {
            const Ico = I as typeof LayoutDashboard;
            const on = path.startsWith(h as string);
            return <Link key={k as string} href={h as string} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium", on ? "text-accent" : "text-mute")}><Ico size={19} />{l as string}</Link>;
          })}
          <button onClick={() => setAiOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium text-mute"><Sparkles size={19} />Ask AI</button>
        </nav>
      </div>

      {/* AI drawer */}
      {aiOpen && (
        <div className="fixed inset-0 z-[85]" onMouseDown={(e) => e.target === e.currentTarget && setAiOpen(false)}>
          <div className="absolute inset-0 bg-black/25" />
          <aside className="slide-up absolute inset-y-0 right-0 flex w-full max-w-[470px] flex-col border-l border-line bg-bg shadow-2xl">
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-line bg-surface px-4"><div className="flex items-center gap-2 text-[14px] font-semibold"><Sparkles size={16} className="text-accent" />Ask Your Business<Pill tone="accent" dot={false}>Live data</Pill></div><button onClick={() => setAiOpen(false)} className="rounded p-1 text-mute hover:bg-panel" aria-label="Close"><X size={17} /></button></div>
            <div className="min-h-0 flex-1"><AskPanel seed={aiSeed} onNavigate={() => setAiOpen(false)} /></div>
          </aside>
        </div>
      )}

      <SearchPalette />
      <QuickModals />

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-20 right-3 z-[100] flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 md:bottom-5 md:right-5" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="slide-up pointer-events-auto flex items-start gap-2.5 rounded-[8px] border border-line bg-ink px-3 py-2.5 text-white shadow-2xl">
            <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", t.tone === "ok" ? "bg-ok" : t.tone === "bad" ? "bg-bad" : "bg-info")}>{t.tone === "bad" ? <X size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />}</span>
            <div className="min-w-0 flex-1"><div className="text-[13px] font-medium">{t.msg}</div>{t.sub && <div className="text-[12px] text-white/65">{t.sub}</div>}</div>
            <button onClick={() => dismissToast(t.id)} className="text-white/50 hover:text-white" aria-label="Dismiss"><X size={13} /></button>
          </div>
        ))}
      </div>
      <ScrollText className="hidden" />
    </div>
  );
}
