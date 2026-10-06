export const NOW = new Date("2026-10-06T14:20:00");
export const TODAY = "Tuesday, 06 October 2026";
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const num = (n, dp = 0) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp });
/** value in rupees -> "₹18.4 Cr" / "₹72.4L" */
export function inr(n, dp = 1) {
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e7) return `${s}₹${(a / 1e7).toFixed(dp === 0 ? 0 : dp === 1 ? 1 : 2)} Cr`;
  if (a >= 1e5) return `${s}₹${(a / 1e5).toFixed(dp === 2 ? 2 : 1)}L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
}
export const cr = (n, dp = 1) => `₹${Number(n).toFixed(dp)} Cr`;
export const L = (n, dp = 1) => `₹${Number(n).toFixed(dp)}L`;
export const rs = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export const pct = (n, dp = 0) => `${Number(n).toFixed(dp)}%`;
export const fdate = (d, y = false) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${String(x.getDate()).padStart(2, "0")} ${M[x.getMonth()]}${y ? " " + x.getFullYear() : ""}`;
};
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
export const daysLeft = (end) => daysBetween(NOW, end);
export function exportCsv(name, cols, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.map((c) => esc(c.label)).join(","), ...rows.map((r) => cols.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = `${name}.csv`; a.click();
  URL.revokeObjectURL(url);
}
