"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { avatarColor, cx, initials } from "@/lib/format";
import { TRIP_STATUS } from "@/data/fleet";
import { VSTATUS } from "@/data/ops";

export const Chip = ({ tone = "n", dot, children, className }) => (
  <span className={cx("chip", tone, className)}>{dot && <i className="dot" />}{children}</span>
);
export const TripChip = ({ s }) => { const [l, t] = TRIP_STATUS[s] || [s, "n"]; return <Chip tone={t} dot>{l}</Chip>; };
export const VehChip = ({ s, sub }) => {
  if (sub === "delayed") return <Chip tone="r" dot>Delayed</Chip>;
  if (sub === "risk") return <Chip tone="a" dot>At risk</Chip>;
  const [l, t] = VSTATUS[s] || [s, "n"]; return <Chip tone={t} dot>{l}</Chip>;
};
export const Avatar = ({ name, size = 28 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(name) }}>{initials(name)}</span>
);
export const Plate = ({ id, href }) => {
  const el = <span className="mono" style={{ fontWeight: 600, letterSpacing: "0.01em" }}>{id}</span>;
  return href === false ? el : <Link href={`/vehicles/${id}`} className="hover:underline">{el}</Link>;
};

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
export function useHash(defaultTab) {
  const [v, setV] = useState(defaultTab);
  return [v, setV];
}
export const Dot = ({ tone = "n", pulse }) => <i className={cx("dot", tone, pulse && "pulse")} />;
