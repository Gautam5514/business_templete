"use client";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ChevronRight, Inbox, SearchX, X } from "lucide-react";

export const cn = clsx;

/* ---------- semantic status ---------- */
export type Tone = "ok" | "warn" | "bad" | "info" | "neutral" | "accent";
const TONES: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  neutral: "bg-panel text-mute",
  accent: "bg-accent-soft text-accent-ink",
};
const MAP: Record<string, Tone> = {
  Paid: "ok", Delivered: "ok", Healthy: "ok", Excellent: "ok", Low: "ok", Restocked: "ok", Active: "ok", Completed: "ok", Platinum: "accent", Approved: "info",
  "Partially Paid": "info", Processing: "info", "Stock Allocated": "info", Packing: "info", Ready: "info", Dispatched: "info", "In Transit": "info", Loading: "info", Scheduled: "neutral",
  "Vehicle Assigned": "info", "Reached Hub": "info", "Out For Delivery": "info", Good: "ok", Gold: "warn", Silver: "neutral", New: "info",
  "Pending Approval": "warn", Draft: "neutral", Pending: "warn", Medium: "warn", Delayed: "warn", Partial: "warn", "Partial Stock": "warn", "Low Stock": "warn", Unpaid: "neutral", "Pending Packing": "neutral",
  "Partially Delivered": "warn", Overstock: "info",
  Overdue: "bad", Cancelled: "neutral", Critical: "bad", High: "bad", Issue: "bad", "Out of Stock": "bad", "At Risk": "bad", Risky: "bad",
  Available: "ok", Open: "info", Credit: "ok",
};
export const statusTone = (s: string): Tone => MAP[s] ?? "neutral";

export function Pill({ children, tone, dot = true, className }: { children: ReactNode; tone?: Tone; dot?: boolean; className?: string }) {
  const t = tone ?? (typeof children === "string" ? statusTone(children) : "neutral");
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] px-1.5 py-[2px] text-[11.5px] font-medium leading-4", TONES[t], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/* ---------- buttons ---------- */
type BtnProps = {
  children?: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "ink"; size?: "xs" | "sm" | "md"; icon?: ReactNode;
  href?: string; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; className?: string; type?: "button" | "submit"; title?: string;
};
export function Btn({ children, variant = "secondary", size = "md", icon, href, onClick, disabled, className, type = "button", title }: BtnProps) {
  const cls = cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] font-medium transition-colors select-none disabled:opacity-50",
    size === "xs" ? "h-6 px-2 text-[12px]" : size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13px]",
    variant === "primary" && "bg-accent text-white hover:bg-accent-ink shadow-[0_1px_0_rgba(0,0,0,.08)]",
    variant === "ink" && "bg-ink text-white hover:bg-black",
    variant === "secondary" && "border border-line-strong bg-surface text-ink hover:bg-panel",
    variant === "ghost" && "text-mute hover:bg-panel hover:text-ink",
    variant === "danger" && "border border-bad/30 bg-surface text-bad hover:bg-bad-soft",
    className,
  );
  if (href && !disabled) return <Link href={href} className={cls} title={title} onClick={onClick}>{icon}{children}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>{icon}{children}</button>;
}

/* ---------- layout ---------- */
export function PageHeader({ title, sub, actions, crumbs, meta }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; crumbs?: { label: string; href?: string }[]; meta?: ReactNode }) {
  return (
    <div className="mb-5">
      {crumbs && (
        <div className="mb-2 flex items-center gap-1 text-[12px] text-mute">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? <Link href={c.href} className="hover:text-ink hover:underline">{c.label}</Link> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRight size={12} className="text-faint" />}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.015em] text-ink">{title}</h1>
          {sub && <div className="mt-0.5 text-[13px] text-mute">{sub}</div>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, sub, action, children, className, pad = true, id }: { title?: ReactNode; sub?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean; id?: string }) {
  return (
    <section id={id} className={cn("rounded-[8px] border border-line bg-surface", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-semibold text-ink">{title}</h2>
            {sub && <p className="mt-px text-[12px] text-mute">{sub}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(pad && "p-4")}>{children}</div>
    </section>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: (T | { id: T; label: string; count?: number })[]; value: T; onChange: (t: T) => void; className?: string }) {
  return (
    <div className={cn("flex gap-0.5 overflow-x-auto border-b border-line", className)} role="tablist">
      {tabs.map((t) => {
        const id = typeof t === "string" ? t : t.id;
        const label = typeof t === "string" ? t : t.label;
        const count = typeof t === "string" ? undefined : t.count;
        const on = id === value;
        return (
          <button key={id} role="tab" aria-selected={on} onClick={() => onChange(id)} className={cn("relative -mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors", on ? "border-accent text-ink" : "border-transparent text-mute hover:text-ink")}>
            {label}
            {count !== undefined && <span className="num ml-1.5 rounded-[3px] bg-panel px-1 text-[11px] text-mute">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, size = "md" }: { options: T[]; value: T; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-[6px] border border-line-strong bg-panel p-0.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cn("rounded-[4px] font-medium transition-colors", size === "sm" ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1 text-[12.5px]", o === value ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-mute hover:text-ink")}>{o}</button>
      ))}
    </div>
  );
}

/* ---------- KPI ---------- */
export function Delta({ v, invert, suffix = "%" }: { v: number; invert?: boolean; suffix?: string }) {
  const good = invert ? v < 0 : v >= 0;
  return <span className={cn("num inline-flex items-center gap-0.5 text-[12px] font-medium", good ? "text-ok" : "text-bad")}>{v >= 0 ? "▲" : "▼"} {suffix === "" ? Math.abs(v).toFixed(0) : Math.abs(v).toFixed(1)}{suffix}</span>;
}

export function KV({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="label">{label}</div>
      <div className="mt-0.5 text-[13.5px] text-ink">{children}</div>
    </div>
  );
}

export function Progress({ value, max = 100, tone = "accent", className }: { value: number; max?: number; tone?: "accent" | "ok" | "warn" | "bad"; className?: string }) {
  const p = Math.min(100, Math.max(0, (value / max) * 100));
  const c = tone === "ok" ? "bg-ok" : tone === "warn" ? "bg-warn" : tone === "bad" ? "bg-bad" : "bg-accent";
  return <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-panel", className)}><div className={cn("h-full rounded-full", c)} style={{ width: `${p}%` }} /></div>;
}

/* ---------- form ---------- */
const inputCls = "h-8 w-full rounded-[6px] border border-line-strong bg-surface px-2.5 text-[13px] text-ink placeholder:text-faint hover:border-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:bg-panel";
export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[12px] font-medium text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-faint">{hint}</span>}
    </label>
  );
}
export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}
export function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn(inputCls, "pr-6", p.className)}>{children}</select>;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(inputCls, "h-auto py-2", p.className)} />;
}

/* ---------- overlays ---------- */
export function Modal({ open, onClose, title, sub, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 backdrop-blur-[1px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="slide-up flex max-h-[92vh] w-full flex-col rounded-t-[12px] border border-line bg-surface shadow-2xl sm:rounded-[10px]" style={{ maxWidth: width }} role="dialog" aria-modal>
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h3 className="text-[15px] font-semibold">{title}</h3>
            {sub && <p className="mt-0.5 text-[12.5px] text-mute">{sub}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-mute hover:bg-panel hover:text-ink" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-bg px-4 py-3 sm:rounded-b-[10px]">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={440} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn></>}>
      <div className="text-[13.5px] text-mute">{body}</div>
    </Modal>
  );
}

/* ---------- states ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}
export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div><Skeleton className="h-6 w-56" /><Skeleton className="mt-2 h-4 w-80" /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)}</div>
      <Skeleton className="h-[320px]" />
    </div>
  );
}
export function Empty({ title, body, action, search }: { title: string; body?: string; action?: ReactNode; search?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-panel p-3 text-faint">{search ? <SearchX size={20} /> : <Inbox size={20} />}</div>
      <div className="text-[14px] font-semibold text-ink">{title}</div>
      {body && <p className="mt-1 max-w-sm text-[13px] text-mute">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function ErrorState({ title = "Something went wrong", body = "We couldn't load this view. Check your connection and try again.", onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[8px] border border-bad/25 bg-bad-soft/40 px-6 py-12 text-center">
      <AlertTriangle size={22} className="mb-2 text-bad" />
      <div className="text-[14px] font-semibold">{title}</div>
      <p className="mt-1 max-w-sm text-[13px] text-mute">{body}</p>
      {onRetry && <Btn className="mt-4" onClick={onRetry}>Retry</Btn>}
    </div>
  );
}

/* ---------- timeline ---------- */
export type Step = { label: string; done?: boolean; current?: boolean; ts?: string; who?: string; where?: string; note?: string; href?: string };
export function Timeline({ steps, compact }: { steps: Step[]; compact?: boolean }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className={cn("absolute left-[9px] top-5 h-[calc(100%-12px)] w-px", s.done ? "bg-ok/40" : "bg-line-strong")} />}
            <span className={cn("relative z-10 mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border", s.done ? "border-ok bg-ok text-white" : s.current ? "border-accent bg-surface" : "border-line-strong bg-surface")}>
              {s.done ? <Check size={11} strokeWidth={3} /> : s.current ? <span className="live-dot h-2 w-2 rounded-full bg-accent" /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className={cn("text-[13.5px] font-medium", !s.done && !s.current && "text-faint")}>
                  {s.href ? <Link href={s.href} className="hover:underline">{s.label}</Link> : s.label}
                  {s.current && <Pill tone="info" className="ml-2" dot={false}>Current</Pill>}
                </span>
                {s.ts && <span className="num text-[12px] text-mute">{s.ts}</span>}
              </div>
              {(s.who || s.where || s.note) && !compact && (
                <div className="mt-0.5 text-[12px] text-mute">
                  {[s.who, s.where].filter(Boolean).join(" · ")}
                  {s.note && <div className="mt-0.5 text-faint">{s.note}</div>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Stepper({ stages, current }: { stages: string[]; current: number }) {
  return (
    <div className="flex items-center overflow-x-auto pb-1">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <span className={cn("flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[10px] font-semibold", i < current ? "border-ok bg-ok text-white" : i === current ? "border-accent bg-accent text-white" : "border-line-strong bg-surface text-faint")}>
              {i < current ? <Check size={10} strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("whitespace-nowrap text-[12px]", i === current ? "font-semibold text-ink" : i < current ? "text-mute" : "text-faint")}>{s}</span>
          </div>
          {i < stages.length - 1 && <span className={cn("mx-2 h-px w-5 shrink-0", i < current ? "bg-ok/50" : "bg-line-strong")} />}
        </div>
      ))}
    </div>
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
