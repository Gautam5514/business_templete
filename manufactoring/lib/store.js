"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { WORK_ORDERS, ISSUES, QC, SALES_ORDERS } from "@/data/orders";
import { PRS, BREAKDOWNS, NOTIFS, LOGS, DISPATCHES } from "@/data/ops";
import { NOW } from "@/lib/format";

const Ctx = createContext(null);
let tid = 0;

export function StoreProvider({ children }) {
  const [role, setRole] = useState("owner");
  const [ownerMode, setOwnerMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [aiOpen, setAiOpenS] = useState(false);
  const [aiSeed, setAiSeed] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [wos, setWos] = useState(WORK_ORDERS);
  const [prs, setPrs] = useState(PRS);
  const [breakdowns, setBreakdowns] = useState(BREAKDOWNS);
  const [issues, setIssues] = useState(ISSUES);
  const [qcs, setQcs] = useState(QC);
  const [dispatches, setDispatches] = useState(DISPATCHES);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [logs, setLogs] = useState(LOGS);
  const [entries, setEntries] = useState([]);

  const toast = useCallback((msg, tone = "ok", sub) => {
    const id = ++tid;
    setToasts((t) => [...t, { id, msg, tone, sub }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const setAiOpen = useCallback((v, seed = "") => { setAiOpenS(v); if (v) setAiSeed(seed); }, []);
  const user = useMemo(() => ({ name: "Rakesh Agarwal", title: "Managing Director" }), []);

  const log = useCallback((action, ref, detail, who = "Rakesh Agarwal") => setLogs((l) => [{ ts: NOW.toISOString(), user: who, action, ref, detail }, ...l]), []);

  const addProduction = useCallback((e) => {
    const produced = Number(e.produced) || 0, accepted = Number(e.accepted) || 0, rejected = Number(e.rejected) || 0;
    setWos((ws) => ws.map((w) => w.id === e.wo ? { ...w, produced: w.produced + produced, accepted: w.accepted + accepted, rejected: w.rejected + rejected, remaining: Math.max(0, w.planned - (w.produced + produced)), progress: Math.min(100, Math.round(((w.produced + produced) / w.planned) * 100)), status: w.status === "Planned" || w.status === "Ready" ? "Running" : w.status } : w));
    setEntries((x) => [{ ...e, produced, accepted, rejected, ts: NOW.toISOString() }, ...x]);
    log("Production entry", e.wo, `Added ${produced} produced · ${accepted} accepted · ${rejected} rejected (${e.machine})`);
  }, [log]);
  const createPR = useCallback((p) => { const id = `PR-${1842 + prs.length - 6}`; setPrs((x) => [{ id, status: "Pending Approval", requestedBy: "Production Planning", date: "2026-10-06", suppliers: [], reason: "Created from MRP shortage", ...p }, ...x]); log("PR created", id, `${p.material} ${p.qty} ${p.unit}`); return id; }, [prs.length, log]);
  const addBreakdown = useCallback((b) => { const id = `BD-${414 + breakdowns.length - 5}`.replace("BD-", "BD-0"); setBreakdowns((x) => [{ id, status: "Open", reported: NOW.toISOString(), closed: null, root: "Pending", action: "—", parts: "—", down: 0, ...b }, ...x]); log("Breakdown reported", id, `${b.machine} — ${b.issue}`); setNotifs((n) => [{ id: id + "n", kind: "breakdown", title: `Machine breakdown — ${b.machine}`, body: b.issue, href: `/machines/${b.machine}`, time: "just now", unread: true }, ...n]); return id; }, [breakdowns.length, log]);
  const addIssue = useCallback((i) => { const id = `ISS-${7713 + issues.length - 8}`; setIssues((x) => [{ id, ts: NOW.toISOString(), by: "Sunil Yadav", wh: "Raw Material Warehouse", ...i, variance: i.actual - i.std, vpct: i.std ? ((i.actual - i.std) / i.std) * 100 : 0 }, ...x]); log("Material issued", id, `${i.actual} ${i.unit} ${i.material} → ${i.wo}`); return id; }, [issues.length, log]);
  const addQC = useCallback((q) => { const id = `QC-${1187 + qcs.length - 10}`; setQcs((x) => [{ id, status: "Completed", ts: NOW.toISOString(), ...q, rate: q.inspected ? (q.rejected / q.inspected) * 100 : 0 }, ...x]); log("QC completed", id, `${q.inspected} inspected · ${q.rejected} rejected`); return id; }, [qcs.length, log]);
  const addDispatch = useCallback((d) => { const id = `DSP-${8824 + dispatches.length - 8}`; setDispatches((x) => [{ id, status: "Dispatch Created", stage: 1, wh: "Dispatch Warehouse", transporter: "—", vehicle: "—", ...d }, ...x]); log("Dispatch created", id, d.customer); return id; }, [dispatches.length, log]);
  const readNotif = useCallback((id) => setNotifs((n) => n.map((x) => (!id || x.id === id ? { ...x, unread: false } : x))), []);

  const value = { sales: SALES_ORDERS, role, setRole, ownerMode, setOwnerMode, user, toasts, toast, dismissToast, aiOpen, setAiOpen, aiSeed, searchOpen, setSearchOpen, quick, openQuick: setQuick, closeQuick: () => setQuick(null),
    wos, prs, breakdowns, issues, qcs, dispatches, notifs, logs, entries, addProduction, createPR, addBreakdown, addIssue, addQC, addDispatch, readNotif, log };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx);
