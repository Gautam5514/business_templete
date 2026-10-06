"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ALL = "all";
export const ROLES = {
  owner: { label: "Owner / Managing Director", person: "Vivek Sharma", short: "Managing Director", nav: ALL },
  ops: { label: "Operations Head", person: "Rajesh Prasad", short: "Operations Head", nav: ["command-center", "requests", "jobs", "dispatch", "live-technicians", "customers", "assets", "amc", "preventive", "technicians", "teams", "reports", "activity", "assistant"] },
  service: { label: "Service Manager", person: "Neeraj Tiwari", short: "Service Manager", nav: ["command-center", "requests", "jobs", "dispatch", "live-technicians", "customers", "assets", "technicians", "feedback", "assistant"] },
  dispatcher: { label: "Dispatcher", person: "Rakesh Jha", short: "Dispatcher", nav: ["dispatch", "live-technicians", "requests", "jobs", "technicians", "assistant"] },
  branch: { label: "Branch Manager", person: "Santosh Rai", short: "Branch Manager · Ranchi", nav: ["command-center", "requests", "jobs", "dispatch", "live-technicians", "technicians", "teams", "inventory", "reports"] },
  technician: { label: "Technician", person: "Rohit Kumar", short: "Technician · Ranchi", nav: [] },
  supervisor: { label: "Supervisor", person: "Anil Dubey", short: "Supervisor", nav: ["jobs", "live-technicians", "technicians", "estimates", "inventory", "feedback", "teams"] },
  inventory: { label: "Inventory Manager", person: "Imran Ansari", short: "Inventory Manager", nav: ["parts", "inventory", "reports", "activity"] },
  accounts: { label: "Accounts Manager", person: "Meena Shah", short: "Accounts Manager", nav: ["invoices", "payments", "receivables", "estimates", "customers", "reports"] },
  amc: { label: "AMC Manager", person: "Kavita Lal", short: "AMC Manager", nav: ["amc", "preventive", "customers", "assets", "reports", "assistant"] },
  support: { label: "Customer Support", person: "Neha Verma", short: "Customer Support", nav: ["requests", "jobs", "customers", "assets", "feedback", "activity", "assistant"] },
  admin: { label: "Admin", person: "Tarun Kapoor", short: "System Admin", nav: ["settings", "activity"] },
};

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [theme, setThemeS] = useState("light");
  const [role, setRoleS] = useState("owner");
  const [collapsed, setCollapsed] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [toast, setToastS] = useState(null);
  const [assigned, setAssigned] = useState({}); // jobId -> techId (dispatch demo)
  const [route, setRoute] = useState({}); // techId -> optimised?

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const t = localStorage.getItem("fielddesk.theme"), r = localStorage.getItem("fielddesk.role"), c = localStorage.getItem("fielddesk.collapsed");
      const qp = new URLSearchParams(location.search).get("theme");
      if (qp === "dark" || qp === "light") setThemeS(qp); else if (t) setThemeS(t);
      if (r && ROLES[r]) setRoleS(r); if (c) setCollapsed(c === "1");
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const setTheme = useCallback((t) => { setThemeS(t); try { localStorage.setItem("fielddesk.theme", t); } catch {} }, []);
  const setRole = useCallback((r) => { setRoleS(r); try { localStorage.setItem("fielddesk.role", r); } catch {} }, []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => { try { localStorage.setItem("fielddesk.collapsed", c ? "0" : "1"); } catch {} return !c; }), []);
  const notify = useCallback((msg) => { setToastS(msg); setTimeout(() => setToastS(null), 2800); }, []);
  const assign = useCallback((jobId, techId) => setAssigned((a) => ({ ...a, [jobId]: techId })), []);
  const optimise = useCallback((techId) => setRoute((a) => ({ ...a, [techId]: true })), []);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOverlay("search"); }
      if (e.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, role, setRole, collapsed, toggleCollapsed, overlay, setOverlay, toast, notify, assigned, assign, route, optimise }), [theme, setTheme, role, setRole, collapsed, toggleCollapsed, overlay, toast, notify, assigned, assign, route, optimise]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
