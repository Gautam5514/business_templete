import { PROJECTS, CLIENTS, PEOPLE } from "@/data/core";
import { MATERIALS, POS, CONTRACTORS, CBILLS, DRAWINGS, TASKS, EQUIPMENT, FOLDERS, VENDOR_BILLS, PHOTOS, WORKERS } from "@/data/ops";

const SUPPLIERS = ["JSW Authorized Distributor", "Tata Steel Partner", "UltraTech Cement Dealer", "Kajaria Distribution", "Astral Pipes Distributor", "Asian Paints Dealer"];
const pn = (id) => PROJECTS.find((p) => p.id === id)?.name;
const INDEX = [
  ...PROJECTS.map((p) => ({ type: "Project", label: p.name, sub: `${p.type} · ${p.city}`, href: `/projects/${p.id}`, p: p.id })),
  ...MATERIALS.filter((m) => m.p).map((m) => ({ type: "Material", label: m.name, sub: pn(m.p), href: `/materials`, p: m.p })),
  ...POS.map((x) => ({ type: "PO", label: `${x.id} · ${x.material}`, sub: `${x.supplier} · ${pn(x.p)}`, href: `/procurement`, p: x.p })),
  ...CONTRACTORS.map((c) => ({ type: "Contractor", label: c.name, sub: `${c.trade} · ${pn(c.p)}`, href: `/contractors`, p: c.p })),
  ...CBILLS.map((b) => ({ type: "Bill", label: `${b.id} · ${b.contractor}`, sub: pn(b.p), href: `/vendor-bills`, p: b.p })),
  ...VENDOR_BILLS.map((b) => ({ type: "Bill", label: `${b.id} · ${b.vendor}`, sub: pn(b.p), href: `/vendor-bills`, p: b.p })),
  ...DRAWINGS.map((d) => ({ type: "Drawing", label: `${d.no} ${d.rev} · ${d.title}`, sub: pn(d.p), href: `/documents`, p: d.p })),
  ...FOLDERS.map(([f]) => ({ type: "Document", label: f, sub: "Folder", href: `/documents` })),
  ...TASKS.map((t) => ({ type: "Task", label: t.title, sub: `${t.id} · ${pn(t.p)}`, href: `/tasks`, p: t.p })),
  ...Object.values(PEOPLE).map((e) => ({ type: "Employee", label: e.name, sub: e.role, href: `/labour` })),
  ...WORKERS.map((w) => ({ type: "Employee", label: w.name, sub: `${w.skill} · ${pn(w.p)}`, href: `/labour`, p: w.p })),
  ...SUPPLIERS.map((s) => ({ type: "Supplier", label: s, sub: "Supplier", href: `/procurement` })),
  ...CLIENTS.map((c) => ({ type: "Client", label: c, sub: "Client", href: `/billing` })),
  ...EQUIPMENT.map((e) => ({ type: "Equipment", label: e.name, sub: pn(e.p), href: `/equipment`, p: e.p })),
  ...PHOTOS.map((x) => ({ type: "Photo", label: `${x.loc} ${x.floor} · ${x.act}`, sub: `${x.date} · ${pn(x.p)}`, href: `/photos`, p: x.p })),
];
export function search(q) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const proj = PROJECTS.find((p) => p.name.toLowerCase().includes(s) || p.id.includes(s));
  const hit = INDEX.filter((i) => `${i.label} ${i.sub}`.toLowerCase().includes(s) || (proj && i.p === proj.id));
  const groups = {};
  hit.forEach((h) => { (groups[h.type] ||= []).push(h); });
  const order = ["Project", "Bill", "PO", "Material", "Drawing", "Photo", "Contractor", "Task", "Equipment", "Employee", "Supplier", "Client", "Document"];
  return order.filter((t) => groups[t]).map((t) => ({ type: t, items: groups[t].slice(0, 4), more: Math.max(0, groups[t].length - 4) }));
}
