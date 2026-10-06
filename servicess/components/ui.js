"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { avatarColor, cx, initials } from "@/lib/format";
import { STATUS, SLA_MIN } from "@/data/ops";
import { NOW, TECH_STATUS } from "@/data/core";

export const Chip = ({ tone = "n", dot, children, className }) => (
  <span className={cx("chip", tone, className)}>{dot && <i className="dot" />}{children}</span>
);
export const StatusChip = ({ s }) => <Chip tone={STATUS[s] || "n"} dot>{s}</Chip>;
export const PrioChip = ({ p }) => <Chip tone={{ Emergency: "r", High: "a", Normal: "n", AMC: "b" }[p]}>{p}</Chip>;
export const TechChip = ({ s }) => { const [l, t] = TECH_STATUS[s] || [s, "n"]; return <Chip tone={t} dot>{l}</Chip>; };
export const Avatar = ({ name, size = 28 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(name) }}>{initials(name)}</span>
);
export const Person = ({ t, href = true, sub }) => t ? (
  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
    <Avatar name={t.name} size={22} />
    {href ? <Link href={`/technicians/${t.id}`} className="hover:underline" style={{ fontWeight: 550 }}>{t.name}</Link> : <b style={{ fontWeight: 550 }}>{t.name}</b>}
    {sub && <span className="faint">{sub}</span>}
  </span>
) : <span className="neg" style={{ fontWeight: 550 }}>Unassigned</span>;

export function useCount(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / ms); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
export const Count = ({ to, fmt = (n) => Math.round(n).toLocaleString("en-IN") }) => <>{fmt(useCount(to))}</>;

// Live SLA countdown. leftMin = minutes remaining at "now". Ticks once per second.
export function useSla(leftMin) {
  const [s, setS] = useState(Math.round(leftMin * 60 + 42));
  useEffect(() => { const i = setInterval(() => setS((x) => x - 1), 1000); return () => clearInterval(i); }, []);
  return s;
}
export const fmtClock = (s) => { const n = Math.abs(s), h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), x = n % 60; return `${s < 0 ? "−" : ""}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`; };
export const slaRisk = (leftMin, total) => leftMin < 0 ? ["Breached", "r"] : leftMin < Math.min(60, total * 0.4) ? ["Critical", "r"] : leftMin < total * 0.5 ? ["At risk", "a"] : ["On track", "g"];
export function SlaTimer({ left, total, big }) {
  const s = useSla(left), [l, t] = slaRisk(s / 60, total);
  return <span className={cx("sla", t)} style={big ? { fontSize: 26, padding: "4px 12px" } : null}><i className={cx("dot", t, t === "r" && "pulse")} />{fmtClock(s)}<small>{l}</small></span>;
}
export const SlaCell = ({ j }) => {
  if (j.status === "Completed") return <Chip tone="g">Met</Chip>;
  const l = j.slaLeft, [lb, t] = slaRisk(l, j.sla);
  const txt = l < 0 ? `${Math.abs(l) >= 60 ? Math.floor(-l / 60) + "h " : ""}${-l % 60}m over` : l >= 600 ? `${Math.floor(l / 60)}h left` : `${Math.floor(l / 60) ? Math.floor(l / 60) + "h " : ""}${l % 60}m left`;
  return <span className={t === "g" ? "faint" : t === "a" ? "warn" : "neg"} style={{ fontWeight: t === "g" ? 400 : 600 }}>{txt}</span>;
};

export function PageHead({ title, sub, children }) {
  return (
    <div className="ph">
      <div className="grow"><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{children}</div>
    </div>
  );
}
export const Insight = ({ tone = "a", children }) => <div className={cx("insight", tone)}><div>{children}</div></div>;

export function Kpis({ items, onPick, active, cols }) {
  return (
    <div className="kpis" style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : null}>
      {items.map((k, i) => (
        <div key={i} className={cx("kpi", onPick && "click", active != null && active === k.key && "sel")} onClick={() => onPick?.(k.key)}>
          <div className="lbl">{k.label}</div>
          <div className="v" style={k.tone ? { color: `var(--${{ g: "green", r: "red", a: "amber" }[k.tone]})` } : null}>{k.value}</div>
          {k.hint && <div className="d">{k.hint}</div>}
        </div>
      ))}
    </div>
  );
}
export const Panel = ({ title, sub, actions, children, tight, style, className }) => (
  <section className={cx("panel", className)} style={style}>
    {(title || actions) && (
      <div className="panel-h"><h3>{title}</h3>{sub && <span className="sub">{sub}</span>}<span className="grow" />{actions}</div>
    )}
    <div className={cx("panel-b", tight && "tight")}>{children}</div>
  </section>
);
export function Tabs({ tabs, value, onChange }) {
  return <div className="tabs">{tabs.map((t) => <button key={t} className={value === t ? "on" : ""} onClick={() => onChange(t)}>{t}</button>)}</div>;
}
export const Seg = ({ options, value, onChange }) => (
  <div className="seg">{options.map((o) => <button key={o} className={value === o ? "on" : ""} onClick={() => onChange(o)}>{o}</button>)}</div>
);
export const Prog = ({ v, tone = "", max = 100 }) => <div className={cx("prog", tone)}><i style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></div>;
export const Score = ({ v }) => <b style={{ color: v >= 90 ? "var(--green)" : v >= 80 ? "var(--ink)" : "var(--amber)" }}>{v}</b>;

export function Drawer({ open, onClose, title, sub, children, wide, footer }) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className={cx("drawer", wide && "wide")}>
        <div className="panel-h" style={{ padding: "14px 16px" }}>
          <div className="grow"><h3 style={{ fontSize: 15 }}>{title}</h3>{sub && <div className="sub">{sub}</div>}</div>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>{children}</div>
        {footer && <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </aside>
    </>
  );
}
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="panel-h" style={{ padding: "14px 16px" }}><h3 className="grow" style={{ fontSize: 15 }}>{title}</h3><button className="iconbtn" onClick={onClose}><X size={16} /></button></div>
        <div style={{ overflowY: "auto", padding: 16 }}>{children}</div>
        {footer && <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </>
  );
}
export const Field = ({ label, children, span }) => <label className="field" style={span ? { gridColumn: `span ${span}` } : null}><span>{label}</span>{children}</label>;
export function useOutside(cb) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && cb();
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  });
  return ref;
}
export const Dot = ({ tone = "n", pulse }) => <i className={cx("dot", tone, pulse && "pulse")} />;
export const Stars = ({ v }) => <span style={{ color: "var(--amber)", fontWeight: 600 }}>★ <span style={{ color: "var(--ink)" }}>{Number(v).toFixed(1)}</span></span>;
export const Mono = ({ children, href }) => href ? <Link href={href} className="mono hover:underline" style={{ fontWeight: 600 }}>{children}</Link> : <span className="mono" style={{ fontWeight: 600 }}>{children}</span>;
