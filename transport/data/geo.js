// Geography: cities, hubs, route library and projection helpers.
export const CITIES = {
  Ranchi: [85.33, 23.34], Ramgarh: [85.56, 23.63], Hazaribagh: [85.36, 23.99], Barhi: [85.41, 24.29],
  Gaya: [85.0, 24.8], "Bihar Sharif": [85.52, 25.2], Patna: [85.14, 25.59], Dhanbad: [86.43, 23.8],
  Bokaro: [86.15, 23.67], Jamshedpur: [86.2, 22.8], Kolkata: [88.36, 22.57], Durgapur: [87.31, 23.52],
  Asansol: [86.98, 23.68], Rourkela: [84.86, 22.26], Varanasi: [82.99, 25.32], Lucknow: [80.95, 26.85],
  Muzaffarpur: [85.39, 26.12], Sasaram: [84.03, 24.95], Kharagpur: [87.32, 22.34], Chaibasa: [85.81, 22.55],
  Purulia: [86.37, 23.33],
};

export const HUBS = [
  { id: "ranchi", name: "Ranchi", hq: true, present: 14, arriving: 8, departing: 17, pending: 11, staff: 23, turnaround: "1h 42m", gate: 94, parking: 71 },
  { id: "dhanbad", name: "Dhanbad", present: 9, arriving: 5, departing: 11, pending: 7, staff: 14, turnaround: "1h 58m", gate: 88, parking: 64 },
  { id: "jamshedpur", name: "Jamshedpur", present: 12, arriving: 6, departing: 14, pending: 9, staff: 18, turnaround: "1h 36m", gate: 91, parking: 69 },
  { id: "patna", name: "Patna", present: 11, arriving: 9, departing: 10, pending: 8, staff: 17, turnaround: "2h 12m", gate: 82, parking: 78 },
  { id: "kolkata", name: "Kolkata", present: 10, arriving: 7, departing: 12, pending: 10, staff: 21, turnaround: "2h 24m", gate: 79, parking: 84 },
  { id: "bokaro", name: "Bokaro", present: 6, arriving: 3, departing: 7, pending: 4, staff: 9, turnaround: "1h 29m", gate: 96, parking: 52 },
];

const proj = ([lon, lat]) => [(lon - 80) * 100, (27 - lat) * 100];
export const P = (city) => proj(CITIES[city]);

// Standard route library (waypoints are real corridor towns).
const R = (id, via, km, std, tolls, fuel, rev, cost, trips, delay, why) => ({
  id, from: via[0], to: via[via.length - 1], via, km, std, tolls, fuel, rev, cost, trips, delay, why,
  margin: ((rev - cost) / rev) * 100,
});
export const ROUTES = [
  R("R01", ["Ranchi", "Ramgarh", "Hazaribagh", "Barhi", "Gaya", "Bihar Sharif", "Patna"], 334, "7h 40m", 5, 78, 78000, 54000, 212, 12),
  R("R02", ["Patna", "Bihar Sharif", "Gaya", "Barhi", "Hazaribagh", "Ramgarh", "Ranchi"], 334, "7h 50m", 5, 79, 41000, 35260, 198, 14, "Low return load · higher toll · frequent empty kilometres"),
  R("R03", ["Jamshedpur", "Kharagpur", "Kolkata"], 276, "6h 10m", 3, 63, 59000, 38940, 184, 8),
  R("R04", ["Kolkata", "Kharagpur", "Jamshedpur"], 276, "6h 20m", 3, 64, 49000, 34300, 121, 9),
  R("R05", ["Jamshedpur", "Ranchi", "Ramgarh", "Hazaribagh", "Barhi", "Gaya", "Patna"], 495, "11h 20m", 6, 112, 96000, 68200, 96, 15),
  R("R06", ["Dhanbad", "Asansol", "Durgapur", "Kolkata"], 264, "6h 00m", 3, 60, 52000, 37960, 142, 10),
  R("R07", ["Bokaro", "Hazaribagh", "Barhi", "Gaya", "Patna"], 372, "8h 30m", 5, 85, 74000, 52500, 88, 13),
  R("R08", ["Ranchi", "Purulia", "Durgapur", "Kolkata"], 402, "9h 10m", 4, 91, 81000, 56700, 77, 11),
  R("R09", ["Ranchi", "Chaibasa", "Rourkela"], 196, "4h 40m", 1, 44, 36000, 25900, 64, 7),
  R("R10", ["Patna", "Sasaram", "Varanasi"], 248, "5h 40m", 3, 56, 47000, 33600, 71, 9),
  R("R11", ["Ranchi", "Ramgarh", "Bokaro", "Dhanbad"], 168, "4h 05m", 2, 38, 33000, 23300, 133, 6),
  R("R12", ["Dhanbad", "Barhi", "Gaya", "Patna"], 331, "7h 35m", 4, 76, 69000, 49000, 79, 12),
  R("R13", ["Patna", "Muzaffarpur"], 74, "2h 10m", 1, 17, 18500, 13700, 102, 5),
  R("R14", ["Patna", "Varanasi", "Lucknow"], 520, "11h 50m", 7, 118, 104000, 76400, 38, 17),
];
export const routeBy = (a, b) => ROUTES.find((r) => r.from === a && r.to === b) || ROUTES[0];
export const routeById = (id) => ROUTES.find((r) => r.id === id);

// Geometry along a route: returns [x,y] at fraction f (0..1) of path length.
export function pathPoints(route) { return route.via.map(P); }
export function pointAt(route, f) {
  const pts = pathPoints(route);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, f)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? d / seg[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, i];
    }
    d -= seg[i];
  }
  return pts[0];
}
export function nearestCity(x, y) {
  let best = null, bd = 1e9;
  for (const [n] of Object.entries(CITIES)) {
    const [cx, cy] = P(n); const d = Math.hypot(cx - x, cy - y);
    if (d < bd) { bd = d; best = n; }
  }
  return { name: best, km: Math.round(bd * 1.1) };
}
export const RISK_ZONES = [
  { name: "Bihar Sharif congestion", city: "Bihar Sharif", r: 26, note: "Heavy traffic · +35 min" },
  { name: "Barhi diversion", city: "Barhi", r: 22, note: "Road work · single lane" },
  { name: "Durgapur toll queue", city: "Durgapur", r: 18, note: "FASTag lane closed" },
];

export const STATES = [
  { n: "JHARKHAND", x: 460, y: 330 }, { n: "BIHAR", x: 520, y: 150 }, { n: "WEST BENGAL", x: 800, y: 440 },
  { n: "ODISHA", x: 400, y: 560 }, { n: "UTTAR PRADESH", x: 200, y: 90 },
];
