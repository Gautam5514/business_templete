"use client";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Columns3, Download, Search } from "lucide-react";
import { toCSV } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useOutside } from "./ui";

// Enterprise table: sticky header, sort, search, column visibility, saved views, pagination, CSV export, selection, expandable rows.
export default function DataTable({ rows, cols, views, searchKeys, pageSize = 14, expand, onRow, title, bare, maxH, initialView = 0, toolbar }) {
  const { notify } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
  const [hidden, setHidden] = useState(() => new Set(cols.filter((c) => c.hide).map((c) => c.key)));
  const [view, setView] = useState(initialView);
  const [sel, setSel] = useState(new Set());
  const [open, setOpen] = useState(new Set());
  const [menu, setMenu] = useState(false);
  const menuRef = useOutside(() => setMenu(false));

  const visible = cols.filter((c) => !hidden.has(c.key));
  const data = useMemo(() => {
    let r = views?.[view]?.filter ? rows.filter(views[view].filter) : rows;
    if (q) {
      const s = q.toLowerCase();
      r = r.filter((x) => (searchKeys || cols.map((c) => c.key)).some((k) => String(cols.find((c) => c.key === k)?.csv?.(x) ?? x[k] ?? "").toLowerCase().includes(s)));
    }
    if (sort) {
      const c = cols.find((c) => c.key === sort.k);
      const val = (x) => (c.sort ? c.sort(x) : x[c.key]);
      r = [...r].sort((a, b) => { const A = val(a), B = val(b); return (A > B ? 1 : A < B ? -1 : 0) * sort.d; });
    }
    return r;
  }, [rows, q, sort, view, views, cols, searchKeys]);
  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = data.slice(cur * pageSize, cur * pageSize + pageSize);
  const toggleSel = (i) => setSel((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const exportCsv = () => {
    const csv = toCSV(sel.size ? data.filter((_, i) => sel.has(rows.indexOf(data[i]))) : data, visible);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `${(title || "fielddesk").toLowerCase().replace(/\W+/g, "-")}.csv`; a.click();
    notify(`Exported ${data.length} rows`);
  };

  const body = (
    <>
      <div className="tbl-bar">
        {views && <div className="seg">{views.map((v, i) => <button key={v.name} className={view === i ? "on" : ""} onClick={() => { setView(i); setPage(0); }}>{v.name}{v.count != null ? ` ${v.count}` : ""}</button>)}</div>}
        {toolbar}
        <span style={{ flex: 1 }} />
        <div style={{ position: "relative", width: 210 }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: "var(--ink3)" }} />
          <input className="input" style={{ paddingLeft: 28, height: 30 }} placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        </div>
        <div ref={menuRef} style={{ position: "relative" }}>
          <button className="btn sm" onClick={() => setMenu(!menu)}><Columns3 size={13} /> Columns</button>
          {menu && (
            <div className="menu" style={{ right: 0, top: 32, maxHeight: 320, overflow: "auto" }}>
              {cols.map((c) => <label key={c.key}><input type="checkbox" checked={!hidden.has(c.key)} onChange={() => setHidden((h) => { const n = new Set(h); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n; })} />{c.label}</label>)}
            </div>
          )}
        </div>
        <button className="btn sm" onClick={exportCsv}><Download size={13} /> Export</button>
      </div>
      <div className="tbl-wrap" style={maxH ? { maxHeight: maxH } : null}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" checked={slice.length > 0 && slice.every((r) => sel.has(rows.indexOf(r)))} onChange={(e) => setSel(e.target.checked ? new Set(slice.map((r) => rows.indexOf(r))) : new Set())} /></th>
              {expand && <th style={{ width: 24 }} />}
              {visible.map((c) => (
                <th key={c.key} className={(c.sortable !== false ? "sortable " : "") + (c.right ? "r" : "")} onClick={() => c.sortable !== false && setSort((s) => (s?.k === c.key ? { k: c.key, d: -s.d } : { k: c.key, d: 1 }))}>
                  {c.label}{sort?.k === c.key && (sort.d === 1 ? <ChevronUp size={11} style={{ marginLeft: 3, display: "inline" }} /> : <ChevronDown size={11} style={{ marginLeft: 3, display: "inline" }} />)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => {
              const ri = rows.indexOf(r);
              return (
                <Row key={ri} sel={sel.has(ri)} onSel={() => toggleSel(ri)} open={open.has(ri)} expand={expand} onToggle={() => setOpen((s) => { const n = new Set(s); n.has(ri) ? n.delete(ri) : n.add(ri); return n; })} r={r} visible={visible} onRow={onRow} span={visible.length + 2} />
              );
            })}
            {!slice.length && <tr><td colSpan={visible.length + 2} style={{ textAlign: "center", padding: 28, color: "var(--ink3)" }}>No rows match this view.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="tbl-foot">
        <span>{data.length} rows{sel.size ? ` · ${sel.size} selected` : ""}</span>
        <span style={{ flex: 1 }} />
        <button className="btn sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Prev</button>
        <span>{cur + 1} / {pages}</span>
        <button className="btn sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
      </div>
    </>
  );
  return bare ? body : <div className="panel" style={{ overflow: "hidden" }}>{body}</div>;
}

function Row({ r, visible, sel, onSel, open, expand, onToggle, onRow, span }) {
  return (
    <>
      <tr className={sel ? "sel" : ""} style={onRow ? { cursor: "pointer" } : null} onClick={() => onRow?.(r)}>
        <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel} onChange={onSel} /></td>
        {expand && <td onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ cursor: "pointer", color: "var(--ink3)" }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>}
        {visible.map((c) => <td key={c.key} className={c.right ? "r" : ""} style={c.style}>{c.render ? c.render(r) : r[c.key]}</td>)}
      </tr>
      {open && expand && <tr><td colSpan={span + 1} style={{ background: "var(--panel2)", whiteSpace: "normal", padding: "12px 16px 14px 56px" }}>{expand(r)}</td></tr>}
    </>
  );
}
