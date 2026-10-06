"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BarChart3, Bell, BookOpenCheck, Building2, Camera, CheckSquare, ChevronsLeft, ChevronsRight, ClipboardCheck, CreditCard, FileStack, FolderKanban, Gauge, HardHat, Hammer, Map as MapIcon, Menu, Moon, Monitor,
  Package, PackageSearch, Plus, Receipt, Search, Settings, ShieldCheck, ShoppingCart, Smartphone, Sparkles, Sun, Truck, Users, Video, Wallet, Warehouse, X, Banknote, ListChecks, CalendarRange, FileSignature, Lock, TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ROLES } from "@/lib/roles";
import { Avatar, Btn, cn } from "@/components/ui/ui";
import { NotificationsPanel, QuickCreate, SearchPalette, Toasts } from "./Overlays";
import { Assistant } from "@/components/ai/Assistant";

export const NAV = [
  { key: "command-center", label: "Command Center", href: "/command-center", icon: Gauge, g: "Overview" },
  { key: "map", label: "Site Map", href: "/map", icon: MapIcon, g: "Overview" },
  { key: "live-sites", label: "Live Sites", href: "/live-sites", icon: Video, g: "Overview" },
  { key: "projects", label: "Projects", href: "/projects", icon: Building2, g: "Projects" },
  { key: "planning", label: "Planning", href: "/planning", icon: CalendarRange, g: "Projects" },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare, g: "Projects" },
  { key: "boq", label: "BOQ & Budget", href: "/boq", icon: ListChecks, g: "Projects" },
  { key: "procurement", label: "Procurement", href: "/procurement", icon: ShoppingCart, g: "Supply" },
  { key: "materials", label: "Materials", href: "/materials", icon: PackageSearch, g: "Supply" },
  { key: "inventory", label: "Site Inventory", href: "/inventory", icon: Warehouse, g: "Supply" },
  { key: "contractors", label: "Contractors", href: "/contractors", icon: Hammer, g: "Execution" },
  { key: "labour", label: "Labour", href: "/labour", icon: Users, g: "Execution" },
  { key: "progress", label: "Daily Progress", href: "/progress", icon: BookOpenCheck, g: "Execution" },
  { key: "quality", label: "Quality", href: "/quality", icon: ClipboardCheck, g: "Execution" },
  { key: "safety", label: "Safety", href: "/safety", icon: ShieldCheck, g: "Execution" },
  { key: "equipment", label: "Equipment", href: "/equipment", icon: Truck, g: "Execution" },
  { key: "cash-flow", label: "Cash Flow", href: "/cash-flow", icon: TrendingUp, g: "Money" },
  { key: "expenses", label: "Expenses", href: "/expenses", icon: Wallet, g: "Money" },
  { key: "billing", label: "Client Billing", href: "/billing", icon: Receipt, g: "Money" },
  { key: "vendor-bills", label: "Vendor Bills", href: "/vendor-bills", icon: FileSignature, g: "Money" },
  { key: "payments", label: "Payments", href: "/payments", icon: Banknote, g: "Money" },
  { key: "approvals", label: "Approvals", href: "/approvals", icon: CreditCard, g: "Money" },
  { key: "documents", label: "Documents", href: "/documents", icon: FileStack, g: "Records" },
  { key: "photos", label: "Photos", href: "/photos", icon: Camera, g: "Records" },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3, g: "Records" },
  { key: "activity", label: "Activity", href: "/activity", icon: Activity, g: "Records" },
  { key: "assistant", label: "AI Project Assistant", href: "/assistant", icon: Sparkles, g: "Assistant" },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings, g: "System" },
];
const modOf = (p) => p.split("/")[1] || "command-center";

export function Logo({ small, dark }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
        <rect width="28" height="28" fill="#f5b301" />
        <path d="M5 23V12l5 3V9l5 3V5h3v18z" fill="#101315" />
        <rect x="5" y="23.4" width="18" height="1.6" fill="#101315" />
        <path d="M0 0h28v3H0z" fill="url(#hz)" opacity=".0" />
      </svg>
      {!small && <div className="leading-tight"><div className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: dark ? "#fff" : undefined }}>SiteControl</div><div className="text-[10.5px] uppercase tracking-[0.1em] text-[#8c98a2]">Vertex Buildcon</div></div>}
    </div>
  );
}

function SideNav({ collapsed, onNav }) {
  const path = usePathname();
  const { role, approvals } = useStore();
  const items = NAV.filter((n) => role.all || role.allow?.includes(n.key) || n.key === "assistant");
  const groups = [...new Set(items.map((i) => i.g))];
  const badge = (k) => (k === "approvals" ? approvals.filter((a) => a.state === "pending").length : k === "materials" ? 1 : 0);
  return (
    <nav className="scroll-thin flex-1 overflow-y-auto px-2 pb-4">
      {groups.map((g) => (
        <div key={g} className="mt-4 first:mt-1">
          {!collapsed ? <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5d6973]">{g}</div> : <div className="mx-2 my-2 h-px bg-[#232a2f]" />}
          {items.filter((i) => i.g === g).map((i) => {
            const on = modOf(path) === i.key;
            const b = badge(i.key);
            return (
              <Link key={i.key} href={i.href} onClick={onNav} title={collapsed ? i.label : undefined} className={cn("group relative mb-px flex items-center gap-2.5 rounded-[5px] px-2.5 py-[7px] text-[13px] font-medium transition-colors", on ? "bg-[#1c2226] text-white" : "text-[#9aa5ae] hover:bg-[#151a1d] hover:text-white", collapsed && "justify-center")}>
                {on && <span className="absolute -left-2 top-1.5 h-[calc(100%-12px)] w-[3px] bg-brand" />}
                <i.icon size={16} className={on ? "text-brand" : "text-[#66727d] group-hover:text-[#aab4bc]"} />
                {!collapsed && <span className="truncate">{i.label}</span>}
                {!collapsed && b > 0 && <span className={cn("num ml-auto rounded-[3px] px-1.5 text-[10.5px] font-semibold", i.key === "approvals" ? "bg-brand text-black" : "bg-[#232a2f] text-[#aab4bc]")}>{b}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function RoleMenu() {
  const { role, setRole } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-[6px] py-1 pl-1 pr-2 hover:bg-panel">
        <Avatar name={role.key === "owner" ? "Arjun Mehta" : role.person} size={28} />
        <span className="hidden text-left leading-tight md:block"><span className="block text-[12.5px] font-semibold">{role.person}</span><span className="block text-[11px] text-mute">{role.label}</span></span>
      </button>
      {open && (<>
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-11 z-[61] w-72 rounded-[10px] border border-line-strong bg-surface p-1.5 shadow-2xl">
          <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-faint">View as role</div>
          <div className="scroll-thin max-h-[60vh] overflow-y-auto">
            {ROLES.map((r) => (
              <button key={r.key} onClick={() => { setRole(r.key); setOpen(false); }} className={cn("flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left hover:bg-panel", role.key === r.key && "bg-panel")}>
                <Avatar name={r.person} size={22} /><span className="leading-tight"><span className="block text-[12.5px] font-medium">{r.label}</span><span className="block text-[11px] text-mute">{r.person}</span></span>
              </button>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}

export function AppShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const { theme, setTheme, notifs, setQuick, setSearchOpen, askOpen, setAskOpen, askSeed, role, setRole } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mob, setMob] = useState(false);
  const [bell, setBell] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { try { setCollapsed(localStorage.getItem("sc-collapsed") === "1"); } catch {} }, []);
  const mod = modOf(path);
  const allowed = role.all || role.allow?.includes(mod) || mod === "assistant" || mod === "projects";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn("hidden shrink-0 flex-col border-r border-[#1c2227] bg-nav transition-[width] duration-200 lg:flex", collapsed ? "w-[60px]" : "w-[236px]")}>
        <div className={cn("flex h-14 items-center", collapsed ? "justify-center" : "px-4")}><Logo small={collapsed} dark /></div>
        <SideNav collapsed={collapsed} />
        <div className="space-y-1 border-t border-[#1c2227] p-2">
          <Link href="/wallboard" className={cn("flex items-center gap-2.5 rounded-[5px] px-2.5 py-[7px] text-[12.5px] font-medium text-[#9aa5ae] hover:bg-[#151a1d] hover:text-white", collapsed && "justify-center")}><Monitor size={15} className="text-[#66727d]" />{!collapsed && "Executive Wallboard"}</Link>
          <Link href="/mobile" className={cn("flex items-center gap-2.5 rounded-[5px] px-2.5 py-[7px] text-[12.5px] font-medium text-[#9aa5ae] hover:bg-[#151a1d] hover:text-white", collapsed && "justify-center")}><Smartphone size={15} className="text-[#66727d]" />{!collapsed && "Site App (mobile)"}</Link>
          <button onClick={() => { setCollapsed(!collapsed); try { localStorage.setItem("sc-collapsed", collapsed ? "0" : "1"); } catch {} }} className={cn("flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-[7px] text-[12.5px] text-[#66727d] hover:text-white", collapsed && "justify-center")}>{collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /> Collapse</>}</button>
        </div>
      </aside>

      <AnimatePresence>
        {mob && (<>
          <motion.div className="fixed inset-0 z-[70] bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMob(false)} />
          <motion.aside className="fixed inset-y-0 left-0 z-[71] flex w-[260px] flex-col bg-nav lg:hidden" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ duration: 0.2 }}>
            <div className="flex h-14 items-center justify-between px-4"><Logo dark /><button onClick={() => setMob(false)} className="text-[#9aa5ae]"><X size={18} /></button></div>
            <SideNav onNav={() => setMob(false)} />
          </motion.aside>
        </>)}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-40 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 sm:px-5">
          <button className="rounded p-1.5 text-mute hover:bg-panel lg:hidden" onClick={() => setMob(true)}><Menu size={18} /></button>
          <button onClick={() => setSearchOpen(true)} className="flex h-9 w-full max-w-md items-center gap-2 rounded-[6px] border border-line-strong bg-panel px-3 text-left text-[13px] text-faint hover:border-faint">
            <Search size={14} /> <span className="flex-1 truncate">Search projects, POs, bills, drawings…</span><kbd className="hidden rounded border border-line-strong px-1.5 text-[10.5px] sm:block">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <Btn variant="accent" size="md" onClick={() => setQuick("menu")}><Plus size={14} /> <span className="hidden sm:inline">Create</span></Btn>
            <Btn size="md" onClick={() => setAskOpen(true)} className="hidden sm:inline-flex"><Sparkles size={14} className="text-accent" /> Ask</Btn>
            <div className="relative">
              <button onClick={() => setBell(!bell)} className="relative rounded-[6px] p-2 text-mute hover:bg-panel"><Bell size={17} />{notifs.length > 0 && <span className="num absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9.5px] font-bold text-white">{notifs.length}</span>}</button>
              <NotificationsPanel open={bell} onClose={() => setBell(false)} />
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-[6px] p-2 text-mute hover:bg-panel" title="Toggle dark mode">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <RoleMenu />
          </div>
        </header>
        {!role.all && (
          <div className="flex items-center justify-between bg-accent-soft px-5 py-1.5 text-[12px] text-accent-ink"><span>Viewing as <b>{role.label}</b> — navigation limited to this role’s modules.</span><button className="font-semibold underline" onClick={() => setRole("owner")}>Back to Owner</button></div>
        )}
        <main className="scroll-thin relative flex-1 overflow-y-auto">
          <motion.div key={path} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mx-auto max-w-[1480px] p-4 sm:p-6">
            {allowed ? children : (
              <div className="mx-auto mt-24 max-w-sm text-center"><Lock className="mx-auto text-faint" /><h2 className="mt-3 text-[16px] font-semibold">Not part of the {role.label} workspace</h2><p className="mt-1 text-mute">This module is hidden for this role.</p><Btn className="mt-4" variant="primary" onClick={() => setRole("owner")}>Switch to Owner view</Btn></div>
            )}
          </motion.div>
        </main>
      </div>

      <Drawer2 open={askOpen} onClose={() => setAskOpen(false)} seed={askSeed} />
      <SearchPalette /><QuickCreate /><Toasts />
    </div>
  );
}

function Drawer2({ open, onClose, seed }) {
  return (
    <AnimatePresence>
      {open && (<>
        <motion.div className="fixed inset-0 z-[80] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.aside className="fixed bottom-0 right-0 top-0 z-[81] flex w-[560px] max-w-full flex-col border-l border-line-strong bg-bg p-5 shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2 text-[13px] font-semibold"><Sparkles size={15} className="text-accent" /> Ask SiteControl</span><button onClick={onClose} className="rounded p-1 text-mute hover:bg-panel"><X size={16} /></button></div>
          <div className="min-h-0 flex-1"><Assistant key={seed || "x"} seed={seed} compact /></div>
        </motion.aside>
      </>)}
    </AnimatePresence>
  );
}
