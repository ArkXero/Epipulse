/* eslint-disable */
// DIRECTION 3 — Bio Quiet
// References: Stripe Atlas, Linear's research surface, modern lab/biotech sites,
// Observable notebooks. Warm off-white, Inter only, single muted teal accent.
// Restrained, chart-first, lots of whitespace.

const C3 = {
  bg: "#f5f2ea",
  paper: "#fbfaf5",
  ink: "#26221b",
  body: "#4d4740",
  muted: "#857d72",
  faint: "#b8b1a4",
  hair: "#e6e0d2",
  rule: "#d8d2c2",
  accent: "#3d7a7a",
  accentSoft: "#e3ece8",
  S: "#c9c4b6",
  E: "#d3b07a",
  I: "#bb6f5d",
  R: "#6a9a90",
  D: "#3a342c",
  alarm: "#bb6f5d",
  alarmSoft: "#f3e0da",
  ok: "#6a9a90",
};

function DirectionThree() {
  const { timeline, nodes, peak, PEAK_DAY, fmt, fmtInt, areaPath, linePath, xOf, project } = window.epi;
  const currentDay = PEAK_DAY;
  const today = timeline[currentDay];
  const yMaxAgg = window.epi.TOTAL_POP;

  const CW = 920, CH = 380;
  const cp = { l: 48, r: 24, t: 32, b: 36 };
  const breachX = xOf(28, CW, cp);
  const peakXp = xOf(PEAK_DAY, CW, cp);

  const MW = 920, MH = 380;

  return (
    <div style={{ background: C3.bg, color: C3.ink, fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, lineHeight: 1.55, fontFeatureSettings: '"ss01", "cv11"' }}>
      {/* top */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 56px", borderBottom: `1px solid ${C3.hair}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* mark: simple pulse wave */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx={14} cy={14} r={13} fill={C3.accentSoft}/>
            <path d="M 4 14 L 10 14 L 12 9 L 16 19 L 18 14 L 24 14" fill="none" stroke={C3.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>Epipulse</div>
        </div>
        <nav style={{ display: "flex", gap: 30, fontSize: 13.5, color: C3.body }}>
          <span>Scenarios</span>
          <span style={{ color: C3.ink, fontWeight: 500 }}>Dashboard</span>
          <span>Advisor</span>
          <span>Methods</span>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 12, color: C3.muted, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C3.accent }}></span>
            Model running
          </div>
          <button style={{ padding: "8px 14px", background: C3.ink, color: C3.bg, border: "none", borderRadius: 6, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Open advisor</button>
        </div>
      </header>

      {/* hero — sentence-cased, lots of room */}
      <section style={{ padding: "56px 56px 40px", borderBottom: `1px solid ${C3.hair}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: 60, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 12.5, color: C3.accent, marginBottom: 16, fontWeight: 500, letterSpacing: 0.04 }}>Denver, Colorado &nbsp;·&nbsp; Day {currentDay} of 120</div>
            <h1 style={{ margin: 0, fontSize: 42, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, maxWidth: 760 }}>
              A respiratory virus is peaking across the Denver network today.
            </h1>
            <p style={{ marginTop: 18, fontSize: 16, color: C3.body, lineHeight: 1.6, maxWidth: 600 }}>
              The model projects {fmt(peak.I)} people infectious right now, with hospital capacity breached at Denver Health two weeks ago. Use the controls to test how interventions reshape the next 78 days.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
              <button style={{ padding: "10px 18px", background: C3.accent, color: "#fff", border: "none", borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", fontWeight: 500, cursor: "pointer" }}>Run scenario</button>
              <button style={{ padding: "10px 18px", background: "transparent", color: C3.ink, border: `1px solid ${C3.rule}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>Reset to baseline</button>
            </div>
          </div>

          <aside>
            <div style={{ fontSize: 11.5, color: C3.muted, marginBottom: 8, fontWeight: 500 }}>Scenario</div>
            <div style={{ background: C3.paper, border: `1px solid ${C3.hair}`, borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {["Denver", "NYC", "DMV", "Island"].map((p, i) => (
                  <span key={p} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: i === 0 ? C3.accent : "transparent", color: i === 0 ? "#fff" : C3.body, border: i === 0 ? "none" : `1px solid ${C3.rule}`, cursor: "pointer" }}>{p}</span>
                ))}
              </div>
              <textarea defaultValue="A novel respiratory virus emerges in Denver in winter." style={{ width: "100%", padding: 12, border: `1px solid ${C3.hair}`, borderRadius: 8, background: C3.bg, fontSize: 13.5, fontFamily: "inherit", color: C3.ink, minHeight: 70, resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 11.5, color: C3.muted }}>
                <span>R₀ 2.2 · 7 nodes · 120 days</span>
                <span style={{ color: C3.accent, cursor: "pointer", fontWeight: 500 }}>Regenerate →</span>
              </div>
            </div>
          </aside>
        </div>

        {/* summary numbers — quiet, in a row with thin separators */}
        <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: `1px solid ${C3.hair}` }}>
          {[
            { l: "Peak infectious", v: fmt(peak.I), d: "today, day 42" },
            { l: "Projected deaths", v: fmt(timeline[119].D), d: "end of horizon" },
            { l: "Hospital breach", v: "Day 28", d: "Denver Health · 14d ago", alarm: true },
            { l: "Recovered", v: fmt(today.R), d: "76% past wave" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "22px 24px 0", borderRight: i < 3 ? `1px solid ${C3.hair}` : "none" }}>
              <div style={{ fontSize: 12.5, color: C3.muted, marginBottom: 14 }}>{m.l}</div>
              <div style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, color: m.alarm ? C3.alarm : C3.ink, fontVariantNumeric: "tabular-nums" }}>{m.v}</div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: C3.body }}>
                {m.alarm && <span style={{ color: C3.alarm, marginRight: 4 }}>●</span>}
                {m.d}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* body grid */}
      <section style={{ padding: "40px 56px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 40 }}>
        <div style={{ display: "grid", gap: 32 }}>
          {/* SEIR */}
          <article style={{ background: C3.paper, border: `1px solid ${C3.hair}`, borderRadius: 12, padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em" }}>Daily compartments</h2>
              <div style={{ fontSize: 12, color: C3.muted }}>Susceptible · Exposed · Infectious · Recovered · Deaths</div>
            </div>
            <div style={{ fontSize: 13, color: C3.muted, marginBottom: 22 }}>120-day deterministic projection over Denver's 7 city nodes.</div>

            <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
              {/* gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <line key={p} x1={cp.l} x2={CW - cp.r} y1={y} y2={y} stroke={C3.hair} />;
              })}
              <path d={areaPath(timeline, "S", CW, CH, cp, yMaxAgg)} fill={C3.S} fillOpacity={0.45} stroke="none"/>
              <path d={areaPath(timeline, "R", CW, CH, cp, yMaxAgg)} fill={C3.R} fillOpacity={0.35} stroke="none"/>
              <path d={areaPath(timeline, "E", CW, CH, cp, yMaxAgg)} fill={C3.E} fillOpacity={0.4} stroke="none"/>
              <path d={areaPath(timeline, "I", CW, CH, cp, yMaxAgg)} fill={C3.I} fillOpacity={0.7} stroke={C3.I} strokeWidth={1.2}/>
              <path d={linePath(timeline, "D", CW, CH, cp, yMaxAgg)} fill="none" stroke={C3.D} strokeWidth={1.4}/>

              {/* breach */}
              <line x1={breachX} x2={breachX} y1={cp.t + 80} y2={CH - cp.b} stroke={C3.alarm} strokeWidth={1} strokeDasharray="3 3"/>
              <circle cx={breachX} cy={cp.t + 78} r={4} fill={C3.alarm}/>
              <g transform={`translate(${breachX + 10}, ${cp.t + 60})`}>
                <text fontSize={11} fill={C3.alarm} fontWeight={500}>Hospital breach</text>
                <text y={14} fontSize={11.5} fill={C3.body}>Denver Health · Day 28</text>
              </g>

              {/* peak */}
              <circle cx={peakXp} cy={cp.t + (CH - cp.t - cp.b) * (1 - peak.I / yMaxAgg)} r={4} fill={C3.I}/>
              <g transform={`translate(${peakXp - 8}, ${cp.t + (CH - cp.t - cp.b) * (1 - peak.I / yMaxAgg) - 14})`} textAnchor="end">
                <text fontSize={11} fill={C3.I} fontWeight={500}>Peak {fmt(peak.I)}</text>
                <text y={14} fontSize={11.5} fill={C3.muted}>today</text>
              </g>

              {[0, 30, 60, 90, 120].map((t) => (
                <text key={t} x={xOf(Math.min(t, 119), CW, cp)} y={CH - cp.b + 18} fontSize={11.5} fill={C3.muted} textAnchor="middle">Day {t}</text>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <text key={p} x={cp.l - 8} y={y + 4} fontSize={11.5} fill={C3.muted} textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(p * yMaxAgg)}</text>;
              })}
            </svg>

            {/* playback */}
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14 }}>
              <button style={{ width: 36, height: 36, borderRadius: 99, background: C3.accent, border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>▸</button>
              <div style={{ flex: 1, position: "relative", height: 6 }}>
                <div style={{ position: "absolute", inset: "2px 0", background: C3.hair, borderRadius: 99 }}></div>
                <div style={{ position: "absolute", inset: "2px auto 2px 0", width: `${(currentDay / 119) * 100}%`, background: C3.accent, borderRadius: 99 }}></div>
                <div style={{ position: "absolute", left: `${(currentDay / 119) * 100}%`, top: -4, width: 14, height: 14, borderRadius: 99, background: "#fff", border: `2px solid ${C3.accent}`, boxShadow: `0 1px 3px rgba(0,0,0,0.08)` }}></div>
              </div>
              <div style={{ fontSize: 13, color: C3.body, minWidth: 86, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>Day {currentDay} / 119</div>
              <div style={{ display: "flex", gap: 4, padding: 3, background: C3.bg, borderRadius: 99, border: `1px solid ${C3.hair}` }}>
                {[0.5, 1, 2, 4].map((s) => (
                  <button key={s} style={{ padding: "4px 10px", border: "none", borderRadius: 99, background: s === 1 ? C3.ink : "transparent", color: s === 1 ? C3.bg : C3.body, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", fontVariantNumeric: "tabular-nums" }}>{s}×</button>
                ))}
              </div>
            </div>
          </article>

          {/* MAP */}
          <article style={{ background: C3.paper, border: `1px solid ${C3.hair}`, borderRadius: 12, padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em" }}>Denver network, day {currentDay}</h2>
              <div style={{ fontSize: 12, color: C3.muted }}>Circle area: infectious population</div>
            </div>
            <div style={{ fontSize: 13, color: C3.muted, marginBottom: 22 }}>Mobility shown between major nodes. Closed nodes appear dimmed; breached capacity marked in clay.</div>

            <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" style={{ display: "block", background: "#efeadd", borderRadius: 10 }}>
              <defs>
                <pattern id="c3grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e2dbc8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width={MW} height={MH} fill="url(#c3grid)"/>
              {/* mobility lines */}
              {[
                ["denver-airport", "denver-downtown"],
                ["denver-downtown", "capitol-hill"],
                ["denver-downtown", "cherry-creek"],
                ["denver-airport", "denver-union-station"],
                ["denver-union-station", "auraria-campus"],
                ["denver-downtown", "denver-health"],
                ["capitol-hill", "cherry-creek"],
              ].map(([a, b], i) => {
                const A = nodes.find((n) => n.id === a);
                const B = nodes.find((n) => n.id === b);
                const [ax, ay] = project(A.lat, A.lng, MW, MH, 80);
                const [bx, by] = project(B.lat, B.lng, MW, MH, 80);
                const dim = A.closed || B.closed;
                return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={dim ? C3.faint : C3.accent} strokeWidth={dim ? 0.8 : 1.2} strokeDasharray={dim ? "3 3" : ""} strokeOpacity={dim ? 0.3 : 0.35}/>;
              })}
              {nodes.map((n) => {
                const [cx, cy] = project(n.lat, n.lng, MW, MH, 80);
                const r = 8 + Math.sqrt(n.infected) / 5;
                return (
                  <g key={n.id}>
                    <circle cx={cx} cy={cy} r={r + 14} fill={n.breached ? C3.alarm : C3.accent} fillOpacity={n.breached ? 0.08 : 0.06}/>
                    <circle cx={cx} cy={cy} r={r} fill={n.closed ? "transparent" : (n.breached ? C3.alarm : C3.I)} fillOpacity={n.closed ? 0 : 0.75} stroke={n.closed ? C3.faint : (n.breached ? C3.alarm : C3.I)} strokeWidth={n.closed ? 1.4 : 0.6} strokeDasharray={n.closed ? "3 2" : ""}/>
                    <text x={cx} y={cy - r - 10} textAnchor="middle" fontSize={11.5} fontWeight={500} fill={C3.ink}>{n.short.replace(/\bSTN\b/, "Stn").replace(/CRK/, "Cr.").replace("DEN AIRPORT", "DIA")}</text>
                    <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize={11} fill={C3.muted} style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(n.infected)} inf.</text>
                  </g>
                );
              })}
              {/* legend */}
              <g transform={`translate(${24}, ${MH - 64})`}>
                <text fontSize={11} fill={C3.muted}>Infectious today</text>
                <g transform="translate(0, 16)">
                  <circle cx={6} cy={10} r={5} fill={C3.I} fillOpacity={0.75}/>
                  <circle cx={32} cy={10} r={10} fill={C3.I} fillOpacity={0.75}/>
                  <circle cx={68} cy={10} r={16} fill={C3.I} fillOpacity={0.75}/>
                  <text x={96} y={14} fontSize={11} fill={C3.body}>500 / 5k / 25k</text>
                </g>
              </g>
            </svg>
          </article>
        </div>

        {/* SIDE */}
        <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
          {/* Interventions */}
          <section style={{ background: C3.paper, border: `1px solid ${C3.hair}`, borderRadius: 12, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Interventions</h3>
              <button style={{ fontSize: 12, background: "none", border: "none", color: C3.accent, cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
            </div>
            {[
              { label: "Transmission rate", value: "0.70×", desc: "How aggressively infections spread per contact", pos: 38 },
              { label: "Isolation compliance", value: "55%", desc: "Share of infectious people who stay home", pos: 55 },
              { label: "Travel restriction", value: "25%", desc: "Reduction in mobility between nodes", pos: 25 },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C3.accent, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                </div>
                <div style={{ position: "relative", height: 4, background: C3.hair, borderRadius: 99, marginTop: 12, marginBottom: 8 }}>
                  <div style={{ position: "absolute", inset: 0, width: `${s.pos}%`, background: C3.accent, borderRadius: 99 }}></div>
                  <div style={{ position: "absolute", left: `${s.pos}%`, top: -5, width: 14, height: 14, borderRadius: 99, background: "#fff", border: `2px solid ${C3.accent}`, boxShadow: `0 1px 3px rgba(0,0,0,0.06)` }}></div>
                </div>
                <div style={{ fontSize: 12, color: C3.muted, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: 6, fontSize: 12.5, color: C3.muted, marginBottom: 10 }}>Node closures</div>
            <div style={{ display: "grid", gap: 6 }}>
              {nodes.map((n) => (
                <button key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", border: `1px solid ${n.closed ? C3.ink : C3.hair}`, borderRadius: 8, background: n.closed ? C3.ink : "transparent", color: n.closed ? C3.bg : C3.body, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                  <span style={{ fontSize: 11, opacity: n.closed ? 0.85 : 0.55, marginLeft: 8 }}>{n.closed ? "closed" : "open"}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Node detail */}
          <section style={{ background: C3.paper, border: `1px solid ${C3.hair}`, borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 12, color: C3.muted, marginBottom: 4 }}>Selected node</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Denver Health Medical Center</h3>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, padding: "3px 10px", background: C3.alarmSoft, color: C3.alarm, borderRadius: 99, fontSize: 11.5, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C3.alarm }}></span>
              Capacity breached on day 28
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
              {[
                ["Peak", "3.6k", "infected, D44"],
                ["Hosp.", "720", "+38% over beds"],
                ["Deaths", "94", "end of horizon"],
              ].map(([l, v, d], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11.5, color: C3.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: C3.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                  <div style={{ fontSize: 11, color: C3.muted, marginTop: 4 }}>{d}</div>
                </div>
              ))}
            </div>

            <svg viewBox="0 0 320 80" width="100%" style={{ display: "block", marginTop: 18 }}>
              <line x1={0} x2={320} y1={50} y2={50} stroke={C3.hair}/>
              <path d={"M 0 70 " + timeline.map((d, i) => `L ${(i / 119) * 320} ${70 - (d.I * 0.08) / 1000 * 60}`).join(" ")} fill={C3.I} fillOpacity={0.18} stroke="none"/>
              <path d={timeline.map((d, i) => `${i === 0 ? "M" : "L"} ${(i / 119) * 320} ${70 - (d.I * 0.08) / 1000 * 60}`).join(" ")} fill="none" stroke={C3.I} strokeWidth={1.6}/>
              {/* capacity reference */}
              <line x1={0} x2={320} y1={36} y2={36} stroke={C3.alarm} strokeDasharray="3 3" strokeWidth={0.8}/>
              <text x={320} y={32} fontSize={10} fill={C3.alarm} textAnchor="end">capacity</text>
              <line x1={(42/119)*320} x2={(42/119)*320} y1={0} y2={80} stroke={C3.accent} strokeWidth={0.8}/>
            </svg>
          </section>

          {/* Advisor */}
          <section style={{ background: C3.accentSoft, border: `1px solid ${C3.accent}33`, borderRadius: 12, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" fill="none" stroke={C3.accent} strokeWidth="1.4"/>
                  <circle cx="8" cy="8" r="2.5" fill={C3.accent}/>
                </svg>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Today's note</h3>
              </div>
              <button style={{ fontSize: 12, padding: "4px 10px", border: "none", background: "transparent", color: C3.accent, cursor: "pointer", fontFamily: "inherit" }}>Regenerate</button>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: C3.body }}>
              The Denver network is at peak today — roughly <span style={{ color: C3.accent, fontWeight: 600 }}>{fmt(peak.I)}</span> people are infectious. Denver Health passed capacity 14 days ago; Capitol Hill and Cherry Creek now carry most of the active burden. Raising isolation past 70% would shorten the right tail by an estimated <span style={{ color: C3.accent, fontWeight: 600 }}>11 days</span>.
            </p>
            <div style={{ marginTop: 14, fontSize: 11.5, color: C3.muted }}>Claude advisor · grounded in day 42 snapshot</div>
          </section>
        </aside>
      </section>
    </div>
  );
}

window.DirectionThree = DirectionThree;
