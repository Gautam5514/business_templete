"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const ROLES = {
  owner: { label: "Owner / Managing Director", person: "Sanjay Agarwal", short: "Managing Director", nav: "all" },
  ops: { label: "Operations Head", person: "Vikram Sinha", short: "Operations Head", nav: ["command-center", "live-fleet", "trips", "bookings", "dispatch", "vehicles", "drivers", "routes", "hubs", "breakdowns", "pod", "activity", "assistant", "reports"] },
  fleet: { label: "Fleet Manager", person: "Anil Dubey", short: "Fleet Manager", nav: ["command-center", "live-fleet", "vehicles", "drivers", "fuel", "toll", "maintenance", "breakdowns", "vendors", "reports", "assistant"] },
  dispatch: { label: "Dispatch Manager", person: "Rakesh Jha", short: "Dispatch Manager", nav: ["command-center", "live-fleet", "trips", "bookings", "dispatch", "vehicles", "drivers", "routes", "assistant"] },
  hub: { label: "Hub Manager", person: "Santosh Rai", short: "Hub Manager · Ranchi", nav: ["hubs", "live-fleet", "trips", "pod", "vehicles", "drivers"] },
  drivermgr: { label: "Driver Manager", person: "Kavita Lal", short: "Driver Manager", nav: ["drivers", "trips", "expenses", "activity"] },
  accounts: { label: "Accounts Manager", person: "Meena Shah", short: "Accounts Manager", nav: ["invoices", "payments", "receivables", "expenses", "pod", "vendors", "customers", "reports", "fuel", "toll"] },
  maint: { label: "Maintenance Manager", person: "Imran Ansari", short: "Maintenance Manager", nav: ["maintenance", "breakdowns", "vehicles", "reports"] },
  crm: { label: "Customer Relationship Manager", person: "Neha Verma", short: "CRM", nav: ["customers", "bookings", "trips", "routes", "invoices", "receivables", "assistant"] },
  driver: { label: "Driver", person: "Sunil Yadav", short: "Driver · JH01DK4821", nav: [] },
  admin: { label: "Admin", person: "Tarun Kapoor", short: "System Admin", nav: ["settings", "activity"] },
};

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [theme, setThemeS] = useState("light");
  const [role, setRoleS] = useState("owner");
  const [collapsed, setCollapsed] = useState(false);
  const [overlay, setOverlay] = useState(null); // 'search' | 'quick' | 'notifs' | {type:'create', kind}
  const [toast, setToastS] = useState(null);

  // hydrate persisted preferences after mount (avoids SSR mismatch)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const t = localStorage.getItem("fleetops.theme"), r = localStorage.getItem("fleetops.role"), c = localStorage.getItem("fleetops.collapsed");
      const qp = new URLSearchParams(location.search).get("theme"); if (qp === "dark" || qp === "light") setThemeS(qp); else if (t) setThemeS(t); if (r && ROLES[r]) setRoleS(r); if (c) setCollapsed(c === "1");
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const setTheme = useCallback((t) => { setThemeS(t); try { localStorage.setItem("fleetops.theme", t); } catch {} }, []);
  const setRole = useCallback((r) => { setRoleS(r); try { localStorage.setItem("fleetops.role", r); } catch {} }, []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => { try { localStorage.setItem("fleetops.collapsed", c ? "0" : "1"); } catch {} return !c; }), []);
  const notify = useCallback((msg) => { setToastS(msg); setTimeout(() => setToastS(null), 2600); }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOverlay("search"); }
      if (e.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, role, setRole, collapsed, toggleCollapsed, overlay, setOverlay, toast, notify }), [theme, setTheme, role, setRole, collapsed, toggleCollapsed, overlay, toast, notify]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
