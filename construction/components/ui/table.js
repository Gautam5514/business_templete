"use client";
import { Fragment, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Columns3, Download, Search } from "lucide-react";
import { cn, Btn } from "./ui";
import { exportCsv } from "@/lib/format";

/**
 * Enterprise table: sticky header, sort, search, filters, column visibility, export, pagination, bulk select, expandable rows.
 * columns: [{key,label,render?,sort?(row)->value,align?,hidden?,csv?,w?}]
 */
export function DataTable({ columns, rows, searchKeys, filters = [], pageSize = 10, onRowClick, expand, selectable, exportName = "export", dense, toolbar, maxH, empty = "No records match." }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
  const [fv, setFv] = useState({});
  const [hid, setHid] = useState(() => new Set(columns.filter((c) => c.hidden).map((c) => c.key)));
  const [colMenu, setColMenu] = useState(false);
  const [sel, setSel] = useState(new Set());
  const [open, setOpen] = useState(new Set());

  const vis = columns.filter((c) => !hid.has(c.key));
  const data = useMemo(() => {
    let r = rows;
    if (q && searchKeys) r = r.filter((x) => searchKeys.some((k) => String(typeof k === "function" ? k(x) : x[k] ?? "").toLowerCase().includes(q.toLowerCase())));
    filters.forEach((f) => { const v = fv[f.key]; if (v && v !== "All") r = r.filter((x) => String(f.get ? f.get(x) : x[f.key]) === v); });
    if (sort) {
      const c = columns.find((x) => x.key === sort.key);
      const g = (x) => (c.sort ? c.sort(x) : x[c.key]);
      r = [...r].sort((a, b) => { const A = g(a), B = g(b); return (typeof A === "number" ? A - B : String(A).localeCompare(String(B))) * (sort.dir === "asc" ? 1 : -1); });
    }
    return r;
  }, [rows, q, fv, sort, columns, searchKeys, filters]);
  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = data.slice(cur * pageSize, cur * pageSize + pageSize);
  const toggleSort = (c) => setSort((s) => (s?.key === c.key ? (s.dir === "asc" ? { key: c.key, dir: "desc" } : null) : { key: c.key, dir: "asc" }));

  return (
    <div className="rounded-[8px] border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        {searchKeys && (
          <div className="relative">
            <Search size={13} className="absolute left-2 top-2.5 text-faint" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search…" className="h-8 w-48 rounded-[6px] border border-line-strong bg-surface pl-7 pr-2 text-[12.5px] outline-none focus:border-accent" />
          </div>
        )}
        {filters.map((f) => (
          <select key={f.key} value={fv[f.key] || "All"} onChange={(e) => { setFv({ ...fv, [f.key]: e.target.value }); setPage(0); }} className="h-8 rounded-[6px] border border-line-strong bg-surface px-2 text-[12.5px] text-mute outline-none">
            <option value="All">{f.label}: All</option>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
        {toolbar}
        <div className="ml-auto flex items-center gap-1.5">
          {sel.size > 0 && <span className="num text-[12px] text-accent-ink">{sel.size} selected</span>}
          <div className="relative">
            <Btn size="sm" onClick={() => setColMenu(!colMenu)}><Columns3 size={13} /> Columns</Btn>
            {colMenu && (
              <div className="absolute right-0 top-9 z-30 w-44 rounded-[6px] border border-line-strong bg-surface p-1.5 shadow-lg">
                {columns.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-[12.5px] hover:bg-panel">
                    <input type="checkbox" checked={!hid.has(c.key)} onChange={() => { const n = new Set(hid); n.has(c.key) ? n.delete(c.key) : n.add(c.key); setHid(n); }} /> {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <Btn size="sm" onClick={() => exportCsv(exportName, vis, data)}><Download size={13} /> Export</Btn>
        </div>
      </div>
      <div className={cn("scroll-thin overflow-auto", maxH)}>
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-panel">
            <tr className="border-b border-line">
              {expand && <th className="w-7" />}
              {selectable && <th className="w-8 pl-3"><input type="checkbox" checked={slice.length > 0 && slice.every((r, i) => sel.has(r.id ?? i))} onChange={(e) => setSel(e.target.checked ? new Set(slice.map((r, i) => r.id ?? i)) : new Set())} /></th>}
              {vis.map((c) => (
                <th key={c.key} style={{ width: c.w }} className={cn("whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-faint", c.align === "right" && "text-right")}>
                  <button onClick={() => toggleSort(c)} className={cn("inline-flex items-center gap-1 hover:text-ink", c.align === "right" && "flex-row-reverse")}>
                    {c.label}
                    {sort?.key === c.key ? (sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : <ChevronsUpDown size={11} className="opacity-40" />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && <tr><td colSpan={vis.length + 2} className="p-8 text-center text-mute">{empty}</td></tr>}
            {slice.map((r, i) => {
              const id = r.id ?? i; const isOpen = open.has(id);
              return (
                <Fragment key={id}>
                  <tr onClick={() => onRowClick?.(r)} className={cn("border-b border-line/70 transition-colors last:border-0 hover:bg-panel", onRowClick && "cursor-pointer", sel.has(id) && "bg-accent-soft/50")}>
                    {expand && <td className="pl-2"><button onClick={(e) => { e.stopPropagation(); const n = new Set(open); n.has(id) ? n.delete(id) : n.add(id); setOpen(n); }} className="rounded p-0.5 text-faint hover:bg-line"><ChevronDown size={14} className={cn("transition-transform", !isOpen && "-rotate-90")} /></button></td>}
                    {selectable && <td className="pl-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(id)} onChange={() => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); }} /></td>}
                    {vis.map((c) => <td key={c.key} className={cn("px-3 align-middle", dense ? "py-1.5" : "py-2.5", c.align === "right" && "num text-right", c.mono && "num")}>{c.render ? c.render(r) : r[c.key]}</td>)}
                  </tr>
                  {expand && isOpen && <tr className="border-b border-line bg-panel/60"><td colSpan={vis.length + 2} className="px-6 py-3">{expand(r)}</td></tr>}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length > pageSize && (
        <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[12px] text-mute">
          <span className="num">{cur * pageSize + 1}–{Math.min(data.length, cur * pageSize + pageSize)} of {data.length}</span>
          <div className="flex items-center gap-1">
            <Btn size="sm" variant="ghost" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft size={14} /></Btn>
            <span className="num px-1">{cur + 1} / {pages}</span>
            <Btn size="sm" variant="ghost" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight size={14} /></Btn>
          </div>
        </div>
      )}
    </div>
  );
}
