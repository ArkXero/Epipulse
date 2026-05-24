/* eslint-disable */
// Shared mock SEIR data + chart utilities for all three dashboard directions.
// Uses Denver preset numbers (sum of node populations ≈ 293k, R0 ≈ 2.2).

(function () {
  const TOTAL_POP = 293000;
  const HORIZON = 120;
  const CFR = 0.006;
  const PEAK_DAY = 42;

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  const cumAttack = [];
  for (let t = 0; t < HORIZON; t++) {
    cumAttack.push(0.78 * sigmoid(0.14 * (t - PEAK_DAY)));
  }

  const timeline = [];
  for (let t = 0; t < HORIZON; t++) {
    const cumI = cumAttack[t] * TOTAL_POP;
    const past = t >= 7 ? cumAttack[t - 7] * TOTAL_POP : 0;
    const I = Math.max(0, cumI - past);
    const futureCum =
      t + 5 < HORIZON ? cumAttack[t + 5] * TOTAL_POP : cumI;
    const E = Math.max(0, (futureCum - cumI) * 0.85);
    const D = past * CFR;
    const R = past * (1 - CFR);
    const S = Math.max(0, TOTAL_POP - I - E - R - D);
    timeline.push({
      day: t,
      S,
      E,
      I,
      R,
      D,
      hospitalized: I * 0.045,
    });
  }

  const peak = timeline.reduce(
    (best, d) => (d.I > best.I ? d : best),
    timeline[0]
  );

  // Denver nodes (from the codebase preset) with realistic positions.
  const nodes = [
    {
      id: "denver-airport",
      name: "Denver International Airport",
      short: "DEN AIRPORT",
      type: "airport",
      lat: 39.8561,
      lng: -104.6737,
      population: 42000,
      capacity: 0,
      closed: false,
    },
    {
      id: "denver-downtown",
      name: "Downtown Denver",
      short: "DOWNTOWN",
      type: "downtown",
      lat: 39.7487,
      lng: -104.9959,
      population: 78000,
      capacity: 120,
      closed: false,
    },
    {
      id: "denver-union-station",
      name: "Union Station Transit Hub",
      short: "UNION STN",
      type: "transit",
      lat: 39.753,
      lng: -105.0,
      population: 31000,
      capacity: 0,
      closed: true,
    },
    {
      id: "denver-health",
      name: "Denver Health Medical Center",
      short: "DENVER HEALTH",
      type: "hospital",
      lat: 39.7279,
      lng: -104.9911,
      population: 21000,
      capacity: 520,
      closed: false,
    },
    {
      id: "auraria-campus",
      name: "Auraria Campus",
      short: "AURARIA",
      type: "school",
      lat: 39.7447,
      lng: -105.0059,
      population: 26000,
      capacity: 20,
      closed: true,
    },
    {
      id: "capitol-hill",
      name: "Capitol Hill Residential",
      short: "CAPITOL HILL",
      type: "residential",
      lat: 39.7338,
      lng: -104.9798,
      population: 56000,
      capacity: 40,
      closed: false,
    },
    {
      id: "cherry-creek",
      name: "Cherry Creek District",
      short: "CHERRY CRK",
      type: "downtown",
      lat: 39.7206,
      lng: -104.9588,
      population: 39000,
      capacity: 45,
      closed: false,
    },
  ];

  // Per-node infection share on day 42 (rough, plausible-looking)
  const nodeShareOnPeak = {
    "denver-airport": 0.12,
    "denver-downtown": 0.22,
    "denver-union-station": 0.06,
    "denver-health": 0.08,
    "auraria-campus": 0.05,
    "capitol-hill": 0.28,
    "cherry-creek": 0.19,
  };
  const peakI = peak.I;
  nodes.forEach((n) => {
    n.infected = Math.round(peakI * nodeShareOnPeak[n.id]);
    n.hospitalized = Math.round(n.infected * 0.045);
    n.intensity = Math.min(1, n.infected / (n.population * 0.25));
    n.breached =
      n.capacity > 0 && n.hospitalized > n.capacity * 0.85;
  });

  // ---------- chart helpers ----------
  function fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1000) return Math.round(n / 100) / 10 + "k";
    if (n >= 100) return String(Math.round(n));
    return String(Math.round(n * 10) / 10);
  }
  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }
  function fmtPct(n) {
    return (n * 100).toFixed(0) + "%";
  }

  // Returns an SVG path string for an area chart of timeline[key] vs. day.
  function areaPath(timeline, key, width, height, padding, yMax) {
    const W = width - padding.l - padding.r;
    const H = height - padding.t - padding.b;
    const x = (t) => padding.l + (t / (timeline.length - 1)) * W;
    const y = (v) => padding.t + H - (v / yMax) * H;
    const pts = timeline.map((d, i) => `${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`);
    return `M ${x(0).toFixed(1)},${(padding.t + H).toFixed(1)} L ${pts.join(" L ")} L ${x(timeline.length - 1).toFixed(1)},${(padding.t + H).toFixed(1)} Z`;
  }
  function linePath(timeline, key, width, height, padding, yMax) {
    const W = width - padding.l - padding.r;
    const H = height - padding.t - padding.b;
    const x = (t) => padding.l + (t / (timeline.length - 1)) * W;
    const y = (v) => padding.t + H - (v / yMax) * H;
    const pts = timeline.map((d, i) => `${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`);
    return `M ${pts.join(" L ")}`;
  }
  function xOf(t, width, padding) {
    const W = width - padding.l - padding.r;
    return padding.l + (t / (HORIZON - 1)) * W;
  }

  // Normalized node positions for our mini-map SVG (Denver bounding box)
  const bbox = {
    minLat: 39.72,
    maxLat: 39.86,
    minLng: -105.01,
    maxLng: -104.66,
  };
  function project(lat, lng, w, h, pad = 24) {
    const nx = (lng - bbox.minLng) / (bbox.maxLng - bbox.minLng);
    const ny = 1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat);
    return [pad + nx * (w - 2 * pad), pad + ny * (h - 2 * pad)];
  }

  window.epi = {
    TOTAL_POP,
    HORIZON,
    CFR,
    PEAK_DAY,
    timeline,
    peak,
    nodes,
    fmt,
    fmtInt,
    fmtPct,
    areaPath,
    linePath,
    xOf,
    project,
  };
})();
