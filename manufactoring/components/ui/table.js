"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Columns3, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { Btn, Empty, cn } from "./ui";
import { useStore } from "@/lib/store";

/** col: { key, header, render?, get?, align?, sortable?, defaultHidden?, width?, mobile?, muted? }  filter: { key, label, options, match } */
export function DataTable({
  rows, cols, rowKey, searchPlaceholder = "Search…", filters = [], pageSize = 10, selectable, bulkActions, expand, onRowClick,
  toolbar, defaultSort, empty, dense, exportName, maxH = "calc(100vh - 260px)", footer,
}) {
  const { toast } = useStore();
  const [q, setQ] = useState("");
  const [fv, setFv] = useState({});
  const [sort, setSort] = useState(defaultSort ?? null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(pageSize);
  const [hidden, setHidden] = useState(new Set(cols.filter((c) => c.defaultHidden).map((c) => c.key)));
  const [sel, setSel] = useState(new Set());
  const [open, setOpen] = useState(new Set());
  const [colMenu, setColMenu] = useState(false);
  const [fOpen, setFOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setColMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const valOf = (c, r) => (c.get ? c.get(r) : r[c.key] ?? "");
  const visible = cols.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let out = rows.filter((r) => filters.every((f) => !fv[f.key] || fv[f.key] === "All" || f.match(r, fv[f.key])));
    if (ql) out = out.filter((r) => cols.map((c) => String(valOf(c, r))).join(" ").toLowerCase().includes(ql));
    if (sort) {
      const c = cols.find((x) => x.key === sort.key);
      if (c) out = [...out].sort((a, b) => {
        const x = valOf(c, a), y = valOf(c, b);
        const d = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort.dir === "asc" ? d : -d;
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, fv, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * size, cur * size + size);
  const allOn = slice.length > 0 && slice.every((r) => sel.has(rowKey(r)));
  const anyFilter = q || Object.values(fv).some((v) => v && v !== "All");
  const clear = () => { setQ(""); setFv({}); setPage(0); };
  const selRows = rows.filter((r) => sel.has(rowKey(r)));

  const exportCsv = () => {
    const head = visible.map((c) => c.header).join(",");
    const body = filtered.map((r) => visible.map((c) => `"${String(valOf(c, r)).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${exportName ?? "export"}.csv`; a.click();
    toast(`Exported ${filtered.length} rows`, "ok", `${exportName ?? "export"}.csv`);
  };

  const cell = (c, r) => (c.render ? c.render(r) : <span>{String(valOf(c, r))}</span>);
  const colSpan = visible.length + (selectable ? 1 : 0) + (expand ? 1 : 0);

  return (
    <div className="min-w-0 rounded-[8px] border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2.5">
        <div className="relative min-w-[180px] flex-1 sm:max-w-[300px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={searchPlaceholder} className="h-8 w-full rounded-[6px] border border-line-strong bg-surface pl-8 pr-7 text-[13px] placeholder:text-faint hover:border-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15" />
          {q && <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink" aria-label="Clear"><X size={13} /></button>}
        </div>
        {filters.length > 0 && <Btn size="sm" variant="secondary" icon={<SlidersHorizontal size={14} />} className="md:hidden" onClick={() => setFOpen(!fOpen)}>Filters</Btn>}
        {filters.map((f) => (
          <label key={f.key} className={cn("relative", !fOpen && "hidden md:block")}>
            <span className="sr-only">{f.label}</span>
            <select value={fv[f.key] ?? "All"} onChange={(e) => { setFv({ ...fv, [f.key]: e.target.value }); setPage(0); }} className={cn("h-8 appearance-none rounded-[6px] border bg-surface pl-2.5 pr-7 text-[12.5px] hover:border-faint focus:border-accent focus:outline-none", fv[f.key] && fv[f.key] !== "All" ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong text-ink")}>
              <option value="All">{f.label}: All</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint" />
          </label>
        ))}
        {anyFilter && <button onClick={clear} className="text-[12.5px] text-mute underline-offset-2 hover:text-ink hover:underline">Clear</button>}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <div className="relative" ref={menuRef}>
            <Btn size="sm" variant="secondary" icon={<Columns3 size={14} />} onClick={() => setColMenu((v) => !v)}><span className="hidden sm:inline">Columns</span></Btn>
            {colMenu && (
              <div className="absolute right-0 z-30 mt-1 max-h-72 w-52 overflow-y-auto rounded-[8px] border border-line bg-surface p-1.5 shadow-xl">
                {cols.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12.5px] hover:bg-panel">
                    <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => { const n = new Set(hidden); n.has(c.key) ? n.delete(c.key) : n.add(c.key); setHidden(n); }} className="accent-[var(--accent)]" />
                    {c.header}
                  </label>
                ))}
              </div>
            )}
          </div>
          <Btn size="sm" variant="secondary" icon={<Download size={14} />} onClick={exportCsv}><span className="hidden sm:inline">Export</span></Btn>
        </div>
      </div>

      {selectable && sel.size > 0 && (
        <div className="flex items-center gap-3 border-b border-accent/20 bg-accent-soft px-3 py-2 text-[12.5px] text-accent-ink">
          <b>{sel.size}</b> selected
          <div className="ml-2 flex items-center gap-2">{bulkActions?.(selRows, () => setSel(new Set()))}</div>
          <button className="ml-auto underline" onClick={() => setSel(new Set())}>Clear selection</button>
        </div>
      )}

      <div className="hidden min-h-[120px] overflow-auto md:block" style={{ maxHeight: maxH }}>
        <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {selectable && <th className="w-9 border-b border-line bg-bg px-3 py-2"><input type="checkbox" checked={allOn} onChange={() => { const n = new Set(sel); slice.forEach((r) => (allOn ? n.delete(rowKey(r)) : n.add(rowKey(r)))); setSel(n); }} className="accent-[var(--accent)]" aria-label="Select all" /></th>}
              {expand && <th className="w-7 border-b border-line bg-bg" />}
              {visible.map((c) => {
                const on = sort?.key === c.key;
                const sortable = c.sortable !== false;
                return (
                  <th key={c.key} style={{ width: c.width }} className={cn("whitespace-nowrap border-b border-line bg-bg px-3 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-mute", c.align === "right" && "text-right")}>
                    {sortable ? (
                      <button onClick={() => setSort(on && sort.dir === "asc" ? { key: c.key, dir: "desc" } : on ? null : { key: c.key, dir: "asc" })} className={cn("inline-flex items-center gap-1 uppercase hover:text-ink", c.align === "right" && "flex-row-reverse", on && "text-ink")}>
                        {c.header}
                        {on ? (sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : null}
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => {
              const k = rowKey(r);
              const isOpen = open.has(k);
              return (
                <Fragment key={k}>
                  <tr onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn("group transition-colors hover:bg-bg", onRowClick && "cursor-pointer", sel.has(k) && "bg-accent-soft/50")}>
                    {selectable && <td className="border-b border-line px-3 py-0" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(k)} onChange={() => { const n = new Set(sel); n.has(k) ? n.delete(k) : n.add(k); setSel(n); }} className="accent-[var(--accent)]" aria-label="Select row" /></td>}
                    {expand && (
                      <td className="border-b border-line pl-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { const n = new Set(open); n.has(k) ? n.delete(k) : n.add(k); setOpen(n); }} className="rounded p-0.5 text-faint hover:bg-panel hover:text-ink" aria-label="Expand row"><ChevronRight size={14} className={cn("transition-transform", isOpen && "rotate-90")} /></button>
                      </td>
                    )}
                    {visible.map((c) => (
                      <td key={c.key} className={cn("whitespace-nowrap border-b border-line px-3 align-middle", dense ? "py-1.5" : "py-2.5", c.align === "right" && "num text-right", c.muted && "text-mute")}>{cell(c, r)}</td>
                    ))}
                  </tr>
                  {expand && isOpen && <tr><td colSpan={colSpan} className="border-b border-line bg-bg px-5 py-3">{expand(r)}</td></tr>}
                </Fragment>
              );
            })}
          </tbody>
          {footer && <tfoot className="sticky bottom-0">{footer}</tfoot>}
        </table>
        {slice.length === 0 && <Empty search={!!anyFilter} title={anyFilter ? "No results match your search" : empty?.title ?? "Nothing here yet"} body={anyFilter ? "Try a different keyword or clear the filters." : empty?.body} action={anyFilter ? <Btn size="sm" onClick={clear}>Clear filters</Btn> : undefined} />}
      </div>

      <div className="divide-y divide-line md:hidden">
        {slice.map((r) => {
          const mc = visible.filter((c) => c.mobile !== "hide");
          const [first, ...rest] = mc;
          return (
            <div key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className="space-y-2 p-3 active:bg-bg">
              <div className="text-[14px] font-medium">{first && cell(first, r)}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {rest.slice(0, 6).map((c) => <div key={c.key}><div className="label !text-[10px]">{c.header}</div><div className="text-[13px]">{cell(c, r)}</div></div>)}
              </div>
            </div>
          );
        })}
        {slice.length === 0 && <Empty search={!!anyFilter} title="No results" body="Try a different keyword or clear the filters." />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2 text-[12px] text-mute">
        <div className="num">{filtered.length === 0 ? "0 results" : `${cur * size + 1}–${Math.min(filtered.length, cur * size + size)} of ${filtered.length}`}{filtered.length !== rows.length && ` (filtered from ${rows.length})`}</div>
        <div className="flex items-center gap-2">
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="h-7 rounded border border-line-strong bg-surface px-1.5 text-[12px]" aria-label="Rows per page">
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <Btn size="xs" variant="secondary" disabled={cur === 0} onClick={() => setPage(cur - 1)} icon={<ChevronLeft size={13} />} title="Previous page" />
          <span className="num">{cur + 1} / {pages}</span>
          <Btn size="xs" variant="secondary" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} icon={<ChevronRight size={13} />} title="Next page" />
        </div>
      </div>
    </div>
  );
}
