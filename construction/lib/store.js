"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { APPROVALS, ACTIVITY, NOTIFS } from "@/data/core";
import { ROLES } from "./roles";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [roleKey, setRoleKey] = useState("owner");
  const [approvals, setApprovals] = useState(APPROVALS.map((a) => ({ ...a, state: "pending" })));
  const [activity, setActivity] = useState(ACTIVITY);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [toasts, setToasts] = useState([]);
  const [quick, setQuick] = useState(null); // null | "menu" | type
  const [searchOpen, setSearchOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askSeed, setAskSeed] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    try { const r = localStorage.getItem("sc-role"); if (r) setRoleKey(r); } catch {}
  }, []);
  const setTheme = useCallback((t) => { setThemeState(t); document.documentElement.dataset.theme = t; try { localStorage.setItem("sc-theme", t); } catch {} }, []);
  const setRole = useCallback((r) => { setRoleKey(r); try { localStorage.setItem("sc-role", r); } catch {} }, []);

  const toast = useCallback((text, tone = "good") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const log = useCallback((text, who = "Arjun Mehta", project) => {
    const d = new Date(); let h = d.getHours() % 12 || 12;
    setActivity((a) => [{ t: `${String(h).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`, icon: "ok", text, who, project, fresh: true }, ...a]);
  }, []);
  const decide = useCallback((id, state, comment) => {
    setApprovals((list) => list.map((a) => {
      if (a.id !== id) return a;
      const verb = { approved: "approved", rejected: "rejected", sent: "sent back" }[state];
      log(`${a.type} ${a.ref} ${verb}${comment ? ` — “${comment}”` : ""}.`, "Arjun Mehta", a.project);
      toast(`${a.ref} ${verb}`, state === "approved" ? "good" : state === "rejected" ? "bad" : "warn");
      return { ...a, state };
    }));
  }, [log, toast]);

  const role = ROLES.find((r) => r.key === roleKey) || ROLES[0];
  const value = useMemo(() => ({ theme, setTheme, role, setRole, approvals, decide, activity, log, notifs, setNotifs, toasts, toast, quick, setQuick, searchOpen, setSearchOpen, askOpen, setAskOpen, askSeed, setAskSeed }),
    [theme, setTheme, role, setRole, approvals, decide, activity, log, notifs, toasts, toast, quick, searchOpen, askOpen, askSeed]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
