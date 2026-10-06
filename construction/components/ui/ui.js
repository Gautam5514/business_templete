"use client";
import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useInView } from "framer-motion";
import clsx from "clsx";
import { Check, Info, X } from "lucide-react";

export const cn = clsx;

export const TONES = {
  good: { text: "text-good", bg: "bg-good-soft", dot: "bg-good", var: "var(--good)" },
  warn: { text: "text-warn", bg: "bg-warn-soft", dot: "bg-warn", var: "var(--warn)" },
  risk: { text: "text-risk", bg: "bg-risk-soft", dot: "bg-risk", var: "var(--risk)" },
  bad: { text: "text-bad", bg: "bg-bad-soft", dot: "bg-bad", var: "var(--bad)" },
  info: { text: "text-info", bg: "bg-info-soft", dot: "bg-info", var: "var(--info)" },
  accent: { text: "text-accent-ink", bg: "bg-accent-soft", dot: "bg-accent", var: "var(--accent)" },
  mute: { text: "text-mute", bg: "bg-panel", dot: "bg-faint", var: "var(--faint)" },
};
export const STATUS_TONE = {
  "On Track": "good", "Attention Required": "warn", "Cost Risk": "risk", Delayed: "bad", "Near Completion": "info",
  Passed: "good", Failed: "bad", Pending: "warn", Open: "warn", Closed: "good", Approved: "good", Rejected: "bad", Running: "good",
  Idle: "mute", Breakdown: "bad", Maintenance: "warn", Critical: "bad", High: "risk", Medium: "warn", Low: "mute", Overdue: "bad",
  Received: "good", "In Transit": "info", Delayed_: "bad", Paid: "good", Partial: "warn", Certified: "accent", Submitted: "info",
  Healthy: "good", Low_: "warn", Out: "bad", Active: "good", Completed: "good", "In Progress": "info", Upcoming: "mute", Done: "good", Blocked: "bad",
  Compliant: "good", Outdated: "bad", Current: "good", Draft: "mute", Issued: "info", "Sent Back": "warn",
};

export function Pill({ tone, children, dot = true, className }) {
  const t = TONES[tone || STATUS_TONE[children] || "mute"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] px-1.5 py-[2px] text-[11px] font-semibold uppercase tracking-[0.03em]", t.bg, t.text, className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}

export function Btn({ children, variant = "default", size = "md", className, ...p }) {
  const v = {
    default: "border border-line-strong bg-surface text-ink hover:bg-panel",
    primary: "bg-ink text-bg hover:opacity-90 border border-ink",
    accent: "bg-accent text-white hover:opacity-90 border border-accent",
    ghost: "text-mute hover:bg-panel hover:text-ink border border-transparent",
    danger: "border border-bad/40 text-bad hover:bg-bad-soft",
    good: "border border-good/40 text-good hover:bg-good-soft",
  }[variant];
  const s = { sm: "h-7 px-2.5 text-[12px]", md: "h-8 px-3 text-[12.5px]", lg: "h-10 px-4 text-[13.5px]" }[size];
  return (
    <button className={cn("inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] font-medium transition-colors disabled:opacity-50", v, s, className)} {...p}>
      {children}
    </button>
  );
}

export function Card({ title, sub, action, children, className, pad = true, hover, id }) {
  return (
    <section id={id} className={cn("rounded-[8px] border border-line bg-surface", hover && "lift", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold tracking-[-0.005em]">{title}</h3>
            {sub && <p className="mt-0.5 text-[12px] text-mute">{sub}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function PageHead({ title, sub, icon: Icon, actions, eyebrow }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">{eyebrow}</div>}
        <h1 className="flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.02em]">
          {Icon && <Icon size={20} className="text-mute" />}
          {title}
        </h1>
        {sub && <p className="mt-1 max-w-3xl text-[13px] text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Animated number */
export function Counter({ value, dp = 0, prefix = "", suffix = "", duration = 1.1, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, value, duration]);
  return <span ref={ref} className={cn("num", className)}>{prefix}{v.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp })}{suffix}</span>;
}

export function Bar({ value, max = 100, tone = "accent", h = 6, marker, className, track = true }) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden rounded-[2px]", track && "bg-panel", className)} style={{ height: h, boxShadow: track ? "inset 0 0 0 1px var(--line)" : undefined }}>
      <motion.div className="h-full rounded-[2px]" style={{ background: TONES[tone].var }} initial={{ width: 0 }} animate={{ width: inView ? `${w}%` : 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      {marker != null && <div className="absolute top-[-2px] h-[calc(100%+4px)] w-[2px] bg-ink" style={{ left: `${Math.min(100, (marker / max) * 100)}%` }} />}
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, tone = "accent", label, sub, children, segments, trackColor }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor || "var(--line)"} strokeWidth={stroke} />
        {segments ? (() => {
          let off = 0;
          return segments.map((s, i) => {
            const len = (s.value / 100) * c; const el = (
              <motion.circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TONES[s.tone].var} strokeWidth={stroke} strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-off}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12, duration: 0.5 }} />
            ); off += len; return el;
          });
        })() : (
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TONES[tone].var} strokeWidth={stroke} strokeLinecap="butt" strokeDasharray={c}
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: inView ? c * (1 - value / 100) : c }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children || (<>
          <div className="num font-semibold leading-none tracking-[-0.03em]" style={{ fontSize: size * 0.26 }}>{label ?? `${value}%`}</div>
          {sub && <div className="mt-1 text-[10.5px] uppercase tracking-[0.06em] text-faint">{sub}</div>}
        </>)}
      </div>
    </div>
  );
}

export function Spark({ data, w = 90, h = 28, tone = "accent", area = true }) {
  const mx = Math.max(...data), mn = Math.min(...data), rg = mx - mn || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 2 - ((d - mn) / rg) * (h - 4)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const col = TONES[tone].var;
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible">
      {area && <path d={`${d} L${w},${h} L0,${h} Z`} fill={col} opacity={0.12} />}
      <path d={d} fill="none" stroke={col} strokeWidth={1.5} />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r={2.2} fill={col} />
    </svg>
  );
}

export function Kpi({ label, value, sub, tone, icon: Icon, spark, className, hint }) {
  return (
    <div className={cn("rounded-[8px] border border-line bg-surface p-3.5", className)}>
      <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.06em] text-faint">
        <span className="flex items-center gap-1">{label}{hint && <Tip text={hint} />}</span>
        {Icon && <Icon size={14} />}
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className={cn("num text-[22px] font-semibold leading-none tracking-[-0.025em]", tone && TONES[tone].text)}>{value}</div>
        {spark && <Spark data={spark} tone={tone || "accent"} w={64} h={22} />}
      </div>
      {sub && <div className="mt-1.5 text-[12px] leading-snug text-mute">{sub}</div>}
    </div>
  );
}

export function Tip({ text }) {
  return (
    <span className="group relative inline-flex cursor-help">
      <Info size={12} className="text-faint" />
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 hidden w-56 -translate-x-1/2 rounded-[6px] border border-line-strong bg-ink px-2.5 py-1.5 text-[11.5px] font-normal normal-case leading-snug tracking-normal text-bg shadow-lg group-hover:block">{text}</span>
    </span>
  );
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn("scroll-thin flex gap-0.5 overflow-x-auto border-b border-line", className)}>
      {tabs.map((t) => {
        const k = t.key ?? t, on = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} className={cn("relative whitespace-nowrap px-3 py-2 text-[12.5px] font-medium transition-colors", on ? "text-ink" : "text-mute hover:text-ink")}>
            {t.label ?? t}
            {t.count != null && <span className="num ml-1.5 rounded-[3px] bg-panel px-1 text-[10.5px] text-mute">{t.count}</span>}
            {on && <motion.span layoutId={`tabline-${tabs.length}-${tabs[0].key ?? tabs[0]}`} className="absolute inset-x-1 -bottom-px h-[2px] bg-ink" />}
          </button>
        );
      })}
    </div>
  );
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-[6px] border border-line-strong bg-panel p-0.5">
      {options.map((o) => {
        const k = o.key ?? o, on = value === k;
        return <button key={k} onClick={() => onChange(k)} className={cn("flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[12px] font-medium", on ? "bg-surface text-ink shadow-[0_0_0_1px_var(--line)]" : "text-mute hover:text-ink")}>{o.icon && <o.icon size={13} />}{o.label ?? o}</button>;
      })}
    </div>
  );
}

export function Drawer({ open, onClose, title, sub, children, width = 480, footer }) {
  useEffect(() => {
    if (!open) return;
    const f = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed bottom-0 right-0 top-0 z-[81] flex max-w-full flex-col border-l border-line-strong bg-surface shadow-2xl" style={{ width }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
              <div><h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>{sub && <p className="mt-0.5 text-[12px] text-mute">{sub}</p>}</div>
              <button onClick={onClose} className="rounded-[6px] p-1 text-mute hover:bg-panel"><X size={16} /></button>
            </header>
            <div className="scroll-thin flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children, width = 520, footer }) {
  useEffect(() => {
    if (!open) return;
    const f = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 pt-[8vh]">
          <motion.div className="fixed inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="relative w-full rounded-[10px] border border-line-strong bg-surface shadow-2xl" style={{ maxWidth: width }} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}>
            <header className="flex items-center justify-between border-b border-line px-5 py-3"><h2 className="text-[15px] font-semibold">{title}</h2><button onClick={onClose} className="rounded p-1 text-mute hover:bg-panel"><X size={16} /></button></header>
            <div className="p-5">{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Horizontal/vertical process flow with a highlighted "current" step */
export function Flow({ steps, current = -1, vertical, compact }) {
  return (
    <ol className={cn("flex", vertical ? "flex-col" : "scroll-thin items-stretch overflow-x-auto pb-1")}>
      {steps.map((s, i) => {
        const st = typeof s === "string" ? { label: s } : s;
        const done = i < current, on = i === current;
        return (
          <li key={i} className={cn("relative flex", vertical ? "pb-3.5 pl-6" : "min-w-[108px] flex-1 flex-col pr-2 pt-5")}>
            {vertical ? <span className="absolute bottom-0 left-[7px] top-4 w-px bg-line" /> : <span className={cn("absolute left-0 right-0 top-[7px] h-px", done ? "bg-ink" : "bg-line-strong")} />}
            <span className={cn("absolute z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border text-[8px]", vertical ? "left-0 top-0.5" : "left-0 top-0", done ? "border-ink bg-ink text-bg" : on ? "border-accent bg-surface ring-4 ring-accent/20" : "border-line-strong bg-surface")}>
              {done ? <Check size={9} strokeWidth={3} /> : on ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
            </span>
            <div className={cn("text-[12px] font-medium leading-tight", on ? "text-ink" : done ? "text-ink" : "text-mute")}>{st.label}</div>
            {!compact && st.meta && <div className="mt-0.5 text-[11px] text-faint">{st.meta}</div>}
          </li>
        );
      })}
    </ol>
  );
}

export function Avatar({ name, size = 24 }) {
  const ini = name.split(" ").map((x) => x[0]).slice(0, 2).join("");
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${h} 38% 42%)` }}>{ini}</span>;
}

export const Field = ({ label, children, className }) => (
  <label className={cn("block", className)}><span className="mb-1 block text-[11.5px] font-medium text-mute">{label}</span>{children}</label>
);
export const inputCls = "h-8 w-full rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20";
export const Kv = ({ k, v, className }) => (
  <div className={cn("flex items-baseline justify-between gap-3 border-b border-line/70 py-1.5 last:border-0", className)}><span className="text-[12px] text-mute">{k}</span><span className="num text-right text-[12.5px] font-medium">{v}</span></div>
);
export const Empty = ({ children = "Nothing to show for this project yet." }) => <div className="rounded-[8px] border border-dashed border-line-strong p-8 text-center text-[13px] text-mute">{children}</div>;
export const Insight = ({ children, title = "AI insight", tone = "accent" }) => (
  <div className={cn("flex gap-2.5 rounded-[6px] border px-3 py-2.5 text-[12.5px] leading-snug", tone === "bad" ? "border-bad/30 bg-bad-soft" : tone === "warn" ? "border-warn/30 bg-warn-soft" : "border-accent/25 bg-accent-soft")}>
    <span className="mt-px shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-accent-ink">{title}</span>
    <span className="text-ink">{children}</span>
  </div>
);
