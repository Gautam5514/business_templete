// FieldDesk demo data — PrimeCare Service Solutions Pvt. Ltd.
// Core entities: branches, localities, technicians, customers, assets.
import { rng } from "@/lib/rng";

export const NOW = 13 * 60 + 16; // 01:16 PM, Tuesday 06 October 2026
export const hhmm = (m) => { const h = Math.floor(m / 60) % 24, mm = Math.round(m % 60); return `${String(((h + 11) % 12) + 1).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
export const KM = 0.0345; // map unit → km

export const COMPANY = {
  name: "PrimeCare Service Solutions Pvt. Ltd.", short: "PrimeCare", hq: "Ranchi, Jharkhand",
  turnover: "₹12.8 Cr", technicians: 68, supervisors: 14, coordinators: 22, customers: 8400, amcs: 1200, monthlyJobs: 1600, skus: 420,
};

export const BRANCHES = [
  { id: "ranchi", name: "Ranchi", hq: true, techs: 28, jobsToday: 42, done: 31, revToday: 284000, sla: 93, ftf: 89, outstanding: 460000, zone: ["Ranchi Central", "Ranchi East", "Ranchi West"] },
  { id: "dhanbad", name: "Dhanbad", techs: 14, jobsToday: 16, done: 11, revToday: 118000, sla: 90, ftf: 86, outstanding: 380000, zone: ["Dhanbad"] },
  { id: "jamshedpur", name: "Jamshedpur", techs: 14, jobsToday: 17, done: 10, revToday: 126000, sla: 91, ftf: 87, outstanding: 410000, zone: ["Jamshedpur"] },
  { id: "patna", name: "Patna", techs: 12, jobsToday: 11, done: 6, revToday: 84000, sla: 86, ftf: 84, outstanding: 430000, zone: ["Patna"] },
];
export const branchById = (id) => BRANCHES.find((b) => b.id === id);

// ---------- localities (map space 1000 × 620) ----------
const ring = (names, seed, cx = 500, cy = 310) => {
  const r = rng(seed);
  return Object.fromEntries(names.map((n, i) => { const a = (i / names.length) * Math.PI * 2 + r.range(-0.2, 0.2), rad = i % 3 === 0 ? r.range(60, 120) : r.range(190, 330); return [n, [Math.round(cx + Math.cos(a) * rad * 1.45), Math.round(cy + Math.sin(a) * rad * 0.82)]]; }));
};
export const LOCALITIES = {
  ranchi: { Lalpur: [430, 300], Morabadi: [560, 250], Harmu: [330, 380], Doranda: [350, 290], "Kanke Road": [300, 170], Bariatu: [440, 150], Hinoo: [250, 330], Argora: [250, 255], Namkum: [650, 440], "Ratu Road": [520, 90], Dhurwa: [190, 440], Kokar: [520, 360], "Booty More": [640, 150], "Piska More": [790, 300], Ormanjhi: [860, 470], Tupudana: [450, 500] },
  dhanbad: ring(["Bank More", "Hirapur", "Saraidhela", "Jharia", "Bartand", "Katras", "Govindpur", "Hirak Road", "Dhaiya", "Bekarbandh"], 11),
  jamshedpur: ring(["Bistupur", "Sakchi", "Sonari", "Telco", "Adityapur", "Kadma", "Mango", "Golmuri", "Baridih", "Jugsalai"], 12),
  patna: ring(["Boring Road", "Kankarbagh", "Patliputra", "Rajendra Nagar", "Danapur", "Kurji", "Bailey Road", "Gandhi Maidan", "Phulwari", "Ashiana"], 13),
};
export const localityPos = (branch, loc, jitter = 0) => { const p = LOCALITIES[branch][loc] || [500, 300]; if (!jitter) return p; const r = rng([...loc].reduce((a, c) => a + c.charCodeAt(0), 0) + jitter); return [p[0] + r.int(-26, 26), p[1] + r.int(-22, 22)]; };
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) * KM;

// ---------- technicians ----------
export const SKILLS = ["Commercial AC", "Residential AC", "CCTV", "RO / Water", "Electrical", "Appliance", "Facility"];
const FEATURED = [
  { id: "T01", name: "Rohit Kumar", title: "Commercial AC Specialist", skills: ["Commercial AC", "Residential AC"], exp: 8, status: "delayed", loc: "Morabadi", pos: [560, 250], jobsToday: 5, rating: 4.8, ftf: 92, completion: 94, month: [112, 106], rev: 8.4, score: [92, 95, 96, 94, 89, 88], van: 48200 },
  { id: "T02", name: "Amit Singh", title: "AC & Electrical Technician", skills: ["Commercial AC", "Electrical"], exp: 6, status: "available", loc: "Doranda", pos: [349, 322], jobsToday: 3, rating: 4.5, ftf: 81, completion: 90, month: [98, 88], rev: 5.9, score: [81, 86, 90, 90, 84, 79], van: 31800 },
  { id: "T03", name: "Vikas Yadav", title: "CCTV Installation Lead", skills: ["CCTV", "Electrical"], exp: 7, status: "onjob", loc: "Bariatu", pos: [452, 163], jobsToday: 4, rating: 4.7, ftf: 90, completion: 95, month: [88, 84], rev: 6.7, score: [90, 92, 94, 95, 91, 86], van: 36400 },
  { id: "T04", name: "Manoj Sharma", title: "RO & Water Purifier Expert", skills: ["RO / Water", "Appliance"], exp: 9, status: "travelling", loc: "Harmu", pos: [338, 372], jobsToday: 6, rating: 4.6, ftf: 88, completion: 93, month: [124, 116], rev: 4.1, score: [88, 90, 92, 93, 86, 82], van: 22600 },
  { id: "T05", name: "Arun Verma", title: "Residential AC Technician", skills: ["Residential AC", "Appliance"], exp: 5, status: "onjob", loc: "Kokar", pos: [530, 352], jobsToday: 5, rating: 4.4, ftf: 84, completion: 89, month: [104, 93], rev: 4.9, score: [84, 82, 86, 89, 78, 80], van: 27300 },
  { id: "T06", name: "Pankaj Kumar", title: "Electrical Maintenance Lead", skills: ["Electrical", "Facility"], exp: 11, status: "onjob", loc: "Doranda", pos: [356, 296], jobsToday: 2, rating: 4.7, ftf: 91, completion: 96, month: [76, 74], rev: 5.6, score: [91, 94, 93, 96, 92, 84], van: 29900 },
  { id: "T07", name: "Ravi Sinha", title: "Facility Maintenance Supervisor", skills: ["Facility", "Electrical"], exp: 12, status: "offline", loc: "Ratu Road", pos: [522, 98], jobsToday: 0, rating: 4.6, ftf: 87, completion: 92, month: [64, 60], rev: 3.8, score: [87, 88, 92, 92, 90, 76], van: 18400 },
  { id: "T08", name: "Suresh Mahto", title: "Appliance Repair Technician", skills: ["Appliance", "RO / Water"], exp: 4, status: "onjob", loc: "Argora", pos: [244, 262], jobsToday: 4, rating: 4.3, ftf: 79, completion: 87, month: [92, 80], rev: 3.2, score: [79, 80, 84, 86, 74, 72], van: 19700 },
];
const FIRST = ["Sanjay", "Deepak", "Rajesh", "Anil", "Sunil", "Mukesh", "Dinesh", "Naveen", "Ajay", "Santosh", "Rakesh", "Umesh", "Bablu", "Gopal", "Kamlesh", "Nitish", "Prakash", "Sandeep", "Vijay", "Abhishek", "Rahul", "Md.", "Ashok", "Lalan", "Chandan", "Satyam", "Rajiv", "Tarun", "Imran", "Faizal"];
const LAST = ["Prasad", "Oraon", "Munda", "Tiwari", "Mishra", "Paswan", "Ansari", "Gupta", "Thakur", "Soren", "Mahto", "Jha", "Roy", "Das", "Pandey", "Kerketta", "Lakra", "Rai", "Shaw", "Ali"];
const TITLES = { "Commercial AC": "Commercial AC Technician", "Residential AC": "Residential AC Technician", CCTV: "CCTV Technician", "RO / Water": "RO Service Technician", Electrical: "Electrician", Appliance: "Appliance Technician", Facility: "Facility Technician" };

export const TECHS = (() => {
  const r = rng(101);
  const quota = r.shuffle([...Array(8 - 1).fill("available"), ...Array(28 - 4).fill("onjob"), ...Array(10 - 1).fill("travelling"), ...Array(6 - 1).fill("delayed"), ...Array(16 - 1).fill("offline")]);
  const perBranch = { ranchi: 28 - FEATURED.length, dhanbad: 14, jamshedpur: 14, patna: 12 };
  const out = FEATURED.map((f) => ({ ...f, branch: "ranchi" }));
  let n = 9, qi = 0;
  for (const [b, count] of Object.entries(perBranch)) {
    const locs = Object.keys(LOCALITIES[b]);
    for (let i = 0; i < count; i++, n++) {
      const sk = r.pick(SKILLS), sk2 = r.pick(SKILLS), name = `${r.pick(FIRST)} ${r.pick(LAST)}`;
      const loc = r.pick(locs), status = quota[qi++ % quota.length];
      const ftf = r.int(74, 89), rating = +(r.range(4.0, 4.6)).toFixed(1), month = r.int(60, 125);
      out.push({ id: `T${String(n).padStart(2, "0")}`, name, branch: b, title: TITLES[sk], skills: sk === sk2 ? [sk] : [sk, sk2], exp: r.int(2, 14), status, loc, pos: localityPos(b, loc, n), jobsToday: status === "offline" ? 0 : r.int(1, 6), rating, ftf, completion: r.int(84, 97), month: [month, Math.round(month * r.range(0.86, 0.97))], rev: +r.range(2.1, 7.4).toFixed(1), score: [ftf, r.int(78, 96), Math.round(rating * 19.6), r.int(84, 97), r.int(70, 94), r.int(68, 92)], van: r.int(12, 44) * 1000 });
    }
  }
  return out;
})();
export const techById = (id) => TECHS.find((t) => t.id === id);
export const techScore = (t) => Math.round(t.score.reduce((a, b) => a + b, 0) / 6 + (t.id === "T01" ? 1.7 : 0));
export const TECH_STATUS = { available: ["Available", "g", "Green"], onjob: ["On job", "b"], travelling: ["Travelling", "a"], delayed: ["Delayed / emergency", "r"], offline: ["Offline", "n"] };

// ---------- customers ----------
const NAMED = [
  { id: "C001", name: "Apex Mall", short: "Apex Mall", type: "Commercial", branch: "ranchi", loc: "Lalpur", since: 2021, locations: 3, assets: 82, amcs: 4, ltv: 2860000, out: 184000, rating: 4.6, seg: ["Enterprise", "AMC Customer", "High Value"], contact: "Mr. Anil Khanna · Facility Head", phone: "+91 98350 11204" },
  { id: "C002", name: "City Hospital", short: "City Hospital", type: "Institution", branch: "ranchi", loc: "Harmu", since: 2019, locations: 2, assets: 164, amcs: 5, ltv: 7420000, out: 312000, rating: 4.7, seg: ["Enterprise", "AMC Customer", "High Value"], contact: "Dr. R. K. Singh · Administrator", phone: "+91 98310 44521" },
  { id: "C003", name: "Sharma Residence", short: "Sharma Res.", type: "Residential", branch: "ranchi", loc: "Morabadi", since: 2022, locations: 1, assets: 6, amcs: 1, ltv: 142000, out: 0, rating: 4.4, seg: ["Residential", "AMC Customer"], contact: "Mrs. Neelam Sharma", phone: "+91 94311 80922" },
  { id: "C004", name: "Ranchi Business Centre", short: "RBC", type: "Commercial", branch: "ranchi", loc: "Lalpur", since: 2020, locations: 1, assets: 38, amcs: 2, ltv: 1840000, out: 96000, rating: 4.3, seg: ["Enterprise", "AMC Customer"], contact: "Mr. Sudhir Jain", phone: "+91 99340 20817" },
  { id: "C005", name: "Eastern Public School", short: "Eastern Public School", type: "Institution", branch: "ranchi", loc: "Kanke Road", since: 2020, locations: 2, assets: 74, amcs: 2, ltv: 1560000, out: 224000, rating: 4.5, seg: ["AMC Customer", "Payment Risk"], contact: "Principal Office", phone: "+91 97720 63318" },
  { id: "C006", name: "Bihar Retail Group", short: "Bihar Retail", type: "Enterprise", branch: "patna", loc: "Boring Road", since: 2021, locations: 9, assets: 212, amcs: 6, ltv: 9120000, out: 418000, rating: 4.2, seg: ["Enterprise", "AMC Customer", "High Value"], contact: "Mr. Alok Verma · Regional Ops", phone: "+91 98350 77120" },
  { id: "C007", name: "Metro Office Park", short: "Metro Office Park", type: "Commercial", branch: "jamshedpur", loc: "Sakchi", since: 2023, locations: 1, assets: 56, amcs: 2, ltv: 1210000, out: 68000, rating: 4.5, seg: ["AMC Customer"], contact: "Ms. Pooja Das · Estate Manager", phone: "+91 90311 29904" },
  { id: "C008", name: "Royal Residency", short: "Royal Residency", type: "Residential", branch: "dhanbad", loc: "Bank More", since: 2022, locations: 1, assets: 48, amcs: 1, ltv: 880000, out: 142000, rating: 4.1, seg: ["At Risk", "AMC Customer"], contact: "RWA Secretary", phone: "+91 96080 55143" },
  { id: "C009", name: "Gupta Office", short: "Gupta Office", type: "Commercial", branch: "ranchi", loc: "Doranda", since: 2023, locations: 1, assets: 12, amcs: 0, ltv: 184000, out: 41000, rating: 4.2, seg: ["Payment Risk"], contact: "Mr. Piyush Gupta", phone: "+91 98350 90112" },
  { id: "C010", name: "Hotel Capital Residency", short: "Hotel Capital", type: "Commercial", branch: "ranchi", loc: "Lalpur", since: 2022, locations: 1, assets: 44, amcs: 1, ltv: 960000, out: 22000, rating: 4.3, seg: ["Enterprise", "AMC Customer"], contact: "Mr. Rakesh Bose · GM", phone: "+91 98350 31207" },
  { id: "C011", name: "Maa Ganga Clinic", short: "Maa Ganga Clinic", type: "Institution", branch: "ranchi", loc: "Harmu", since: 2023, locations: 1, assets: 14, amcs: 1, ltv: 262000, out: 0, rating: 4.6, seg: ["AMC Customer"], contact: "Dr. Sharmila Devi", phone: "+91 94311 55820" },
  { id: "C012", name: "Orchid Diagnostics", short: "Orchid Diagnostics", type: "Commercial", branch: "ranchi", loc: "Kanke Road", since: 2022, locations: 2, assets: 26, amcs: 1, ltv: 740000, out: 0, rating: 4.7, seg: ["Enterprise", "AMC Customer"], contact: "Mr. Vikas Anand", phone: "+91 99340 71122" },
  { id: "C013", name: "Radhey Showroom", short: "Radhey Showroom", type: "Commercial", branch: "ranchi", loc: "Bariatu", since: 2024, locations: 1, assets: 18, amcs: 1, ltv: 318000, out: 41200, rating: 4.4, seg: ["AMC Customer"], contact: "Mr. Radhey Lal", phone: "+91 97720 40981" },
  { id: "C014", name: "Sai Nursing Home", short: "Sai Nursing Home", type: "Institution", branch: "ranchi", loc: "Argora", since: 2021, locations: 1, assets: 31, amcs: 1, ltv: 698000, out: 54000, rating: 4.2, seg: ["AMC Customer", "Payment Risk"], contact: "Admin Office", phone: "+91 98310 66742" },
];
const POOL_A = ["Shree", "Maa", "Ganga", "Radhey", "Om", "Sai", "Kailash", "Jharkhand", "Bokaro", "Hindustan", "Capital", "Orchid", "Ashoka", "Lotus", "Tata Nagar", "Magadh", "Rajdhani", "Sunrise"];
const POOL_B = [["Diagnostics", "Commercial"], ["Cinema", "Commercial"], ["Hotel", "Commercial"], ["Bakery", "Commercial"], ["Apartments", "Residential"], ["Clinic", "Institution"], ["Coaching Centre", "Institution"], ["Showroom", "Commercial"], ["Nursing Home", "Institution"], ["Warehouse", "Commercial"], ["Tower", "Commercial"], ["Enclave", "Residential"], ["Motors", "Commercial"], ["Traders", "Commercial"], ["Villa", "Residential"]];
export const CUSTOMERS = (() => {
  const r = rng(303);
  const out = [...NAMED];
  const bs = ["ranchi", "ranchi", "ranchi", "dhanbad", "jamshedpur", "patna"];
  for (let i = 0; i < 44; i++) {
    const [b2, type] = r.pick(POOL_B), name = `${r.pick(POOL_A)} ${b2}`, branch = r.pick(bs);
    if (out.some((c) => c.name === name)) continue;
    const ltv = r.int(40, 1400) * 1000, o = r.chance(0.45) ? r.int(8, 190) * 1000 : 0;
    const amcs = type === "Residential" ? r.int(0, 1) : r.int(0, 3);
    const seg = [type === "Residential" ? "Residential" : "Enterprise"]; if (amcs) seg.push("AMC Customer"); if (ltv > 900000) seg.push("High Value"); if (o > 120000) seg.push("Payment Risk"); if (r.chance(0.12)) seg.push("At Risk"); if (r.chance(0.08)) seg.push("Inactive");
    out.push({ id: `C${String(20 + i).padStart(3, "0")}`, name, short: name, type, branch, loc: r.pick(Object.keys(LOCALITIES[branch])), since: r.int(2018, 2025), locations: type === "Residential" ? 1 : r.int(1, 4), assets: type === "Residential" ? r.int(2, 9) : r.int(8, 70), amcs, ltv, out: o, rating: +r.range(3.8, 4.8).toFixed(1), seg, contact: "Front desk", phone: `+91 9${r.int(100, 999)}${r.int(10000, 99999)}` });
  }
  return out;
})();
export const custById = (id) => CUSTOMERS.find((c) => c.id === id);
export const custByName = (n) => CUSTOMERS.find((c) => c.name === n || c.short === n);

// ---------- assets ----------
const ASSET_KINDS = [
  { type: "AC", cat: "AC", items: [["Blue Star", "Cassette AC 5 Ton"], ["Daikin", "Split AC 1.5 Ton"], ["Voltas", "Split AC 2 Ton"], ["Blue Star", "Ductable AC 8 Ton"], ["Carrier", "Split AC 1.5 Ton"]], pref: "AC" },
  { type: "RO", cat: "RO", items: [["Kent", "RO Supreme"], ["AO Smith", "Z9 Commercial RO"]], pref: "RO" },
  { type: "CCTV Camera", cat: "CCTV", items: [["Hikvision", "DS-2CD 4MP Dome"], ["CP Plus", "Bullet 5MP"]], pref: "CAM" },
  { type: "DVR", cat: "CCTV", items: [["CP Plus", "32-Ch DVR"], ["Hikvision", "16-Ch NVR"]], pref: "DVR" },
  { type: "Geyser", cat: "Appliance", items: [["AO Smith", "HSE-SHS 25L"], ["Racold", "Eterno 15L"]], pref: "GY" },
  { type: "Refrigerator", cat: "Appliance", items: [["Voltage", "Walk-in Chiller"], ["Godrej", "Double Door 320L"]], pref: "RF" },
  { type: "Electrical Panel", cat: "Electrical", items: [["Schneider", "LT Panel 400A"], ["L&T", "MCC Panel"]], pref: "EP" },
  { type: "Generator", cat: "Electrical", items: [["Cummins", "62.5 kVA DG"], ["Kirloskar", "125 kVA DG"]], pref: "DG" },
  { type: "UPS", cat: "Electrical", items: [["Luminous", "10 kVA UPS"], ["APC", "Smart-UPS 6 kVA"]], pref: "UPS" },
];
const COND = ["Good", "Good", "Good", "Fair", "Fair", "Needs attention", "Critical"];
const dstr = (y, m, d) => `${String(d).padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`;
export const ASSETS = (() => {
  const r = rng(404);
  const out = [{ id: "AC-28941", custId: "C001", loc: "Food Court — Floor 2", type: "AC", cat: "AC", brand: "Blue Star", model: "Cassette AC 5 Ton", capacity: "5 Ton", serial: "BS5C-23-114892", installed: "12 Mar 2023", warranty: "Expired", amc: "Active", amcId: "AMC-1802", last: "18 Sep 2026", next: "18 Dec 2026", cond: "Needs attention", repeat: 4, cost: 28400 }];
  const targets = ["C001", "C001", "C001", "C001", "C001", "C002", "C002", "C002", "C002", "C002", "C002", "C003", "C003", "C004", "C004", "C004", "C005", "C005", "C006", "C006", "C006", "C007", "C007", "C008", "C008"];
  let n = 28942;
  const pool = [...targets, ...CUSTOMERS.slice(9, 40).flatMap((c) => [c.id, c.id, c.id])];
  pool.forEach((cid) => {
    const c = custById(cid), k = c.type === "Residential" ? r.pick(ASSET_KINDS.slice(0, 6)) : r.pick(ASSET_KINDS), [brand, model] = r.pick(k.items), y = r.int(2019, 2025);
    const wExp = y <= 2023, hasAmc = c.amcs > 0 && r.chance(0.75);
    out.push({ id: `${k.pref}-${n++}`, custId: cid, loc: r.pick(["Ground Floor", "Floor 1", "Floor 2", "Server Room", "Lobby", "Main Office", "Roof", "Basement", "Block B", "Reception"]), type: k.type, cat: k.cat, brand, model, capacity: model.match(/\d+(\.\d+)? ?(Ton|kVA|L|A|Ch)/)?.[0] || "—", serial: `${brand.slice(0, 2).toUpperCase()}${y % 100}-${r.int(100000, 999999)}`, installed: dstr(y, r.int(1, 12), r.int(1, 28)), warranty: wExp ? "Expired" : `Till ${dstr(y + 2, r.int(1, 12), 15)}`, amc: hasAmc ? "Active" : "None", amcId: hasAmc ? `AMC-${r.int(1700, 1830)}` : null, last: dstr(2026, r.int(6, 9), r.int(1, 28)), next: dstr(r.chance(0.8) ? 2026 : 2027, r.int(10, 12), r.int(1, 28)), cond: r.pick(COND), repeat: r.chance(0.12) ? r.int(2, 4) : 0, cost: r.int(0, 38) * 1000 });
  });
  return out;
})();
export const assetById = (id) => ASSETS.find((a) => a.id === id);
export const assetsOf = (cid) => ASSETS.filter((a) => a.custId === cid);
