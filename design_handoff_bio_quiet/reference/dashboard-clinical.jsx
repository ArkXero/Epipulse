/* eslint-disable */
// DIRECTION 1 — Clinical Editorial
// References: Our World in Data, FT Visual & Data Journalism, Reuters Graphics.
// Cream surface, Newsreader serif + Inter, sequential muted palette,
// red reserved for "infected" and breach. Footnoted, annotated, calm.

const C1 = {
  surface: "#faf8f3",
  paper: "#ffffff",
  ink: "#1a1d24",
  body: "#2c3038",
  muted: "#6b6f78",
  faint: "#9aa0aa",
  rule: "#d8d4c8",
  hair: "#e8e4d8",
  S: "#b8c4d0",
  E: "#d8b15c",
  I: "#b8453a",
  R: "#87a489",
  D: "#1a1d24",
  alarm: "#b8453a",
};

function DirectionOne() {
  const { timeline, nodes, peak, PEAK_DAY, fmt, fmtInt, areaPath, linePath, xOf, project } = window.epi;
  const currentDay = PEAK_DAY;
  const today = timeline[currentDay];

  // -------- aggregate SEIR chart --------
  const CW = 940, CH = 360;
  const cp = { l: 56, r: 24, t: 28, b: 32 };
  const yMaxAgg = window.epi.TOTAL_POP;
  const yMaxInfected = Math.max(...timeline.map((d) => d.I)) * 1.05;

  const breachX = xOf(28, CW, cp);
  const peakXp = xOf(PEAK_DAY, CW, cp);

  // -------- map --------
  const MW = 940, MH = 380;

  return (
    <div style={{ background: C1.surface, color: C1.ink, fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, lineHeight: 1.5 }}>
      {/* topbar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: `1px solid ${C1.rule}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C1.ink, display: "grid", placeItems: "center", color: C1.surface, fontFamily: "Newsreader, Georgia, serif", fontWeight: 600, fontSize: 14, fontStyle: "italic" }}>e</div>
          <div style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>Epipulse</div>
          <div style={{ color: C1.muted, fontSize: 12, marginLeft: 8 }}>Outbreak simulation, deterministic SEIR</div>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 13, color: C1.body }}>
          <span>Overview</span>
          <span style={{ color: C1.ink, fontWeight: 500, borderBottom: `2px solid ${C1.ink}`, paddingBottom: 4 }}>Dashboard</span>
          <span>Advisor</span>
          <span style={{ color: C1.muted }}>Methods</span>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: C1.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: C1.R }}></span>
          MODEL · LIVE · DETERMINISTIC
        </div>
      </header>

      {/* Article-style hero */}
      <section style={{ padding: "44px 48px 32px", borderBottom: `1px solid ${C1.rule}`, display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 56 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.08em", color: C1.muted, textTransform: "uppercase", marginBottom: 14 }}>
            Scenario · Denver, Colorado · Winter respiratory virus · R<sub style={{ fontSize: 9 }}>0</sub> 2.2
          </div>
          <h1 style={{ fontFamily: "Newsreader, Georgia, serif", fontWeight: 500, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.018em", margin: 0, maxWidth: 720 }}>
            A novel respiratory virus reaches peak transmission on <em style={{ fontStyle: "italic", color: C1.I }}>day 42</em>, with hospital capacity breached at Denver Health on day 28.
          </h1>
          <p style={{ marginTop: 18, fontSize: 15.5, color: C1.body, maxWidth: 640, lineHeight: 1.55 }}>
            This is a deterministic projection. Move interventions on the right to see the same timeline recompute — there is no random sampling, no hidden parameter. Numbers shown reflect the network SEIR model on the day selected below.
          </p>
        </div>

        {/* Scenario panel — editorial card */}
        <aside style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: 24 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: C1.muted, textTransform: "uppercase" }}>Generate scenario</div>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label style={{ fontSize: 12, color: C1.muted }}>Preset</label>
            <select defaultValue="denver" style={{ padding: "9px 12px", border: `1px solid ${C1.rule}`, background: C1.surface, fontSize: 13, fontFamily: "inherit", color: C1.ink }}>
              <option>Denver, CO</option>
              <option>New York City</option>
              <option>DC-Maryland-Virginia</option>
              <option>Island resort</option>
            </select>
            <label style={{ fontSize: 12, color: C1.muted, marginTop: 6 }}>Prompt</label>
            <textarea defaultValue="A novel respiratory virus emerges in Denver in winter." style={{ padding: 12, border: `1px solid ${C1.rule}`, background: C1.surface, fontSize: 13, fontFamily: "inherit", color: C1.ink, minHeight: 64, resize: "none", lineHeight: 1.45 }} />
            <button style={{ marginTop: 4, padding: "11px 14px", background: C1.ink, color: C1.surface, border: "none", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
              <span>Run scenario</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>→</span>
            </button>
          </div>
        </aside>
      </section>

      {/* Summary numbers — quiet, no boxes */}
      <section style={{ padding: "32px 48px", borderBottom: `1px solid ${C1.rule}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 48 }}>
        {[
          { label: "Peak infectious", value: fmt(peak.I), detail: `Day ${PEAK_DAY} of 120`, accent: C1.I },
          { label: "Projected deaths", value: fmt(timeline[119].D), detail: "End of horizon", accent: C1.ink },
          { label: "Hospital breach", value: "Day 28", detail: "Denver Health Medical Center", accent: C1.alarm, alert: true },
          { label: "Population modelled", value: "293k", detail: "across 7 city nodes", accent: C1.ink },
        ].map((m, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, color: C1.muted, marginBottom: 10, letterSpacing: 0.1 }}>{m.label}</div>
            <div style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 40, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.02em", color: m.accent, fontVariantNumeric: "tabular-nums" }}>
              {m.value}
              {m.alert && <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600, color: C1.alarm, textTransform: "uppercase", letterSpacing: 0.1, verticalAlign: "middle" }}>· breach</span>}
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: C1.body }}>{m.detail}</div>
          </div>
        ))}
      </section>

      {/* Body: chart + side */}
      <section style={{ padding: "32px 48px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 40 }}>
        {/* MAIN COLUMN */}
        <div>
          {/* Chart card */}
          <article style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: "26px 28px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <h2 style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.012em", margin: 0 }}>
                Daily compartment counts, day 0 — 120
              </h2>
              <div style={{ fontSize: 12, color: C1.muted, fontFamily: "'IBM Plex Mono', monospace" }}>Showing day <span style={{ color: C1.ink, fontWeight: 600 }}>{currentDay}</span></div>
            </div>
            <div style={{ fontSize: 13, color: C1.muted, marginBottom: 18, maxWidth: 640 }}>
              Stacked areas show susceptible, exposed, infectious and recovered populations. Cumulative deaths are overlaid as a thin line.
            </div>

            {/* Color legend */}
            <div style={{ display: "flex", gap: 22, marginBottom: 14, fontSize: 12.5 }}>
              {[
                ["Susceptible", C1.S],
                ["Exposed", C1.E],
                ["Infectious", C1.I, true],
                ["Recovered", C1.R],
                ["Deaths", C1.D, false, true],
              ].map(([label, color, em, line], i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: em ? C1.I : C1.body, fontWeight: em ? 600 : 400 }}>
                  {line
                    ? <span style={{ width: 14, height: 2, background: color }}></span>
                    : <span style={{ width: 12, height: 12, background: color, borderRadius: 2 }}></span>}
                  {label}
                </span>
              ))}
            </div>

            <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
              {/* gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <line key={p} x1={cp.l} x2={CW - cp.r} y1={y} y2={y} stroke={C1.hair} />;
              })}
              {/* areas */}
              <path d={areaPath(timeline, "S", CW, CH, cp, yMaxAgg)} fill={C1.S} fillOpacity={0.55} stroke="none" />
              <path d={areaPath(timeline, "R", CW, CH, cp, yMaxAgg)} fill={C1.R} fillOpacity={0.5} stroke="none" />
              <path d={areaPath(timeline, "E", CW, CH, cp, yMaxAgg)} fill={C1.E} fillOpacity={0.5} stroke="none" />
              <path d={areaPath(timeline, "I", CW, CH, cp, yMaxAgg)} fill={C1.I} fillOpacity={0.85} stroke={C1.I} strokeWidth={1.2} />
              <path d={linePath(timeline, "D", CW, CH, cp, yMaxAgg)} fill="none" stroke={C1.ink} strokeWidth={1.6} strokeDasharray="3 3" />

              {/* annotation: hospital breach day */}
              <line x1={breachX} x2={breachX} y1={cp.t} y2={CH - cp.b} stroke={C1.alarm} strokeWidth={1} strokeDasharray="2 3" />
              <g transform={`translate(${breachX + 8}, ${cp.t + 18})`}>
                <text fontFamily="'IBM Plex Mono', monospace" fontSize={10} fill={C1.alarm} letterSpacing="0.06em">DAY 28</text>
                <text y={14} fontFamily="Inter, sans-serif" fontSize={11.5} fill={C1.ink}>Hospital capacity</text>
                <text y={28} fontFamily="Inter, sans-serif" fontSize={11.5} fill={C1.ink}>breached at Denver Health</text>
              </g>

              {/* annotation: peak */}
              <line x1={peakXp} x2={peakXp} y1={cp.t} y2={CH - cp.b} stroke={C1.ink} strokeWidth={0.6} />
              <g transform={`translate(${peakXp - 8}, ${cp.t + 10})`} textAnchor="end">
                <text fontFamily="Inter, sans-serif" fontSize={11.5} fill={C1.ink} fontStyle="italic">Peak day 42</text>
                <text y={14} fontFamily="'IBM Plex Mono', monospace" fontSize={10} fill={C1.muted}>{fmtInt(peak.I)} infectious</text>
              </g>

              {/* x axis */}
              {[0, 30, 60, 90, 120].map((t) => (
                <text key={t} x={xOf(Math.min(t, 119), CW, cp)} y={CH - cp.b + 16} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C1.muted} textAnchor="middle">Day {t}</text>
              ))}
              {/* y axis */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <text key={p} x={cp.l - 8} y={y + 3} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C1.muted} textAnchor="end">{fmt(p * yMaxAgg)}</text>;
              })}
            </svg>

            {/* playback */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C1.hair}`, display: "flex", alignItems: "center", gap: 14 }}>
              <button style={{ width: 34, height: 34, border: `1px solid ${C1.ink}`, background: C1.ink, color: C1.surface, cursor: "pointer", display: "grid", placeItems: "center" }}>▸</button>
              <div style={{ flex: 1, position: "relative", height: 8 }}>
                <div style={{ position: "absolute", inset: "3px 0", background: C1.hair, borderRadius: 99 }}></div>
                <div style={{ position: "absolute", inset: "3px auto 3px 0", width: `${(currentDay / 119) * 100}%`, background: C1.ink, borderRadius: 99 }}></div>
                <div style={{ position: "absolute", left: `${(currentDay / 119) * 100}%`, top: -2, width: 12, height: 12, borderRadius: 99, background: C1.I, border: `2px solid ${C1.paper}`, boxShadow: `0 0 0 1px ${C1.ink}` }}></div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C1.body, minWidth: 80, textAlign: "right" }}>Day {currentDay} / 119</div>
              <div style={{ display: "flex", gap: 0, border: `1px solid ${C1.rule}` }}>
                {[0.5, 1, 2, 4].map((s) => (
                  <button key={s} style={{ padding: "6px 10px", border: "none", borderRight: s === 4 ? "none" : `1px solid ${C1.rule}`, background: s === 1 ? C1.ink : "transparent", color: s === 1 ? C1.surface : C1.body, fontSize: 11.5, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>{s}×</button>
                ))}
              </div>
            </div>
          </article>

          {/* Map card */}
          <article style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: "26px 28px", marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.012em", margin: 0 }}>
                Where infection sits on day {currentDay}
              </h2>
              <div style={{ fontSize: 12, color: C1.muted }}>Denver metropolitan area · 7 nodes</div>
            </div>
            <div style={{ fontSize: 13, color: C1.muted, marginBottom: 16 }}>
              Circle area scales with current infectious population. Closed nodes are outlined; hospital-capacity breach is marked with a cross.
            </div>

            <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" style={{ display: "block", background: "#f1ede1" }}>
              {/* subtle grid */}
              <defs>
                <pattern id="c1grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e3dfd1" strokeWidth="0.6"/>
                </pattern>
              </defs>
              <rect width={MW} height={MH} fill="url(#c1grid)"/>
              {/* stylized I-25 + I-70 lines */}
              <path d="M 0 220 Q 300 200 500 240 T 940 230" stroke="#d9d3c1" strokeWidth="1.4" fill="none"/>
              <path d="M 480 0 Q 470 180 520 380" stroke="#d9d3c1" strokeWidth="1.4" fill="none"/>
              <text x={14} y={MH - 14} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C1.muted} letterSpacing="0.08em">DENVER METRO AREA</text>

              {nodes.map((n) => {
                const [cx, cy] = project(n.lat, n.lng, MW, MH, 60);
                const r = 8 + Math.sqrt(n.infected) / 5;
                return (
                  <g key={n.id}>
                    <circle cx={cx} cy={cy} r={r + 12} fill={C1.I} fillOpacity={0.08}></circle>
                    <circle cx={cx} cy={cy} r={r} fill={n.closed ? "transparent" : C1.I} fillOpacity={n.closed ? 0 : 0.7} stroke={C1.I} strokeWidth={n.closed ? 2 : 0} strokeDasharray={n.closed ? "3 2" : ""} />
                    {n.breached && <g stroke={C1.ink} strokeWidth={1.4}><line x1={cx - r - 3} x2={cx + r + 3} y1={cy - r - 3} y2={cy + r + 3} /><line x1={cx + r + 3} x2={cx - r - 3} y1={cy - r - 3} y2={cy + r + 3} /></g>}
                    <text x={cx} y={cy - r - 8} textAnchor="middle" fontSize={11} fontFamily="Inter, sans-serif" fontWeight={500} fill={C1.ink}>{n.short}</text>
                    <text x={cx} y={cy + r + 16} textAnchor="middle" fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C1.muted}>{fmt(n.infected)} inf.</text>
                  </g>
                );
              })}

              {/* legend */}
              <g transform={`translate(${MW - 220}, 24)`}>
                <rect width={200} height={84} fill="#fffefa" stroke={C1.rule}/>
                <text x={14} y={20} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C1.muted} letterSpacing="0.08em">CURRENT INFECTIOUS</text>
                <circle cx={26} cy={48} r={5} fill={C1.I} fillOpacity={0.7}/>
                <circle cx={62} cy={48} r={11} fill={C1.I} fillOpacity={0.7}/>
                <circle cx={108} cy={48} r={18} fill={C1.I} fillOpacity={0.7}/>
                <text x={14} y={74} fontSize={11} fill={C1.body}>500 · 5k · 25k people</text>
              </g>
            </svg>
          </article>

          {/* footnote */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C1.hair}`, display: "flex", gap: 32, fontSize: 11.5, color: C1.muted, fontFamily: "Inter, sans-serif" }}>
            <div><b style={{ color: C1.body, fontWeight: 600 }}>Source.</b> Epipulse network SEIR model, /lib/model. Audited against analytic SEIR solutions.</div>
            <div><b style={{ color: C1.body, fontWeight: 600 }}>Method.</b> 120-day deterministic projection over 7 city nodes. AI never touches dynamics.</div>
            <div><b style={{ color: C1.body, fontWeight: 600 }}>Note.</b> Hospital capacity treated as static.</div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <aside style={{ display: "grid", gap: 22, alignContent: "start" }}>
          {/* Interventions */}
          <section style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h3 style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>Interventions</h3>
              <button style={{ fontSize: 11.5, background: "none", border: "none", color: C1.muted, cursor: "pointer", textDecoration: "underline" }}>reset</button>
            </div>
            {[
              { label: "Transmission rate", value: "0.70×", desc: "Reduced contact, mask use.", pos: 38 },
              { label: "Isolation compliance", value: "55%", desc: "Share of infectious isolated.", pos: 55 },
              { label: "Travel restriction", value: "25%", desc: "Reduction in inter-node movement.", pos: 25 },
            ].map((s, i) => (
              <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? `1px solid ${C1.hair}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C1.ink, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                </div>
                <div style={{ position: "relative", height: 4, background: C1.hair, marginTop: 12, marginBottom: 8 }}>
                  <div style={{ position: "absolute", inset: 0, width: `${s.pos}%`, background: C1.ink }}></div>
                  <div style={{ position: "absolute", left: `${s.pos}%`, top: -4, width: 12, height: 12, borderRadius: 99, background: C1.surface, border: `1.5px solid ${C1.ink}` }}></div>
                </div>
                <div style={{ fontSize: 12, color: C1.muted, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
            ))}

            <div style={{ marginTop: 4, fontSize: 12, color: C1.muted, marginBottom: 10 }}>Node closures</div>
            <div style={{ display: "grid", gap: 4 }}>
              {nodes.map((n) => (
                <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", border: `1px solid ${n.closed ? C1.ink : C1.hair}`, background: n.closed ? C1.ink : "transparent", color: n.closed ? C1.surface : C1.body, fontSize: 12.5 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: 0.1, opacity: n.closed ? 1 : 0.7 }}>{n.closed ? "closed" : "open"}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Selected node */}
          <section style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: 22 }}>
            <div style={{ fontSize: 11.5, color: C1.muted, marginBottom: 4 }}>Selected node</div>
            <h3 style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 19, fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Denver Health Medical Center</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              {[
                ["Peak infected", "3,640", "Day 44"],
                ["Hospitalized", "164", "Day 42"],
                ["Deaths", "94", "End"],
              ].map(([l, v, d], i) => (
                <div key={i}>
                  <div style={{ fontSize: 10.5, color: C1.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 22, fontWeight: 500, color: C1.I, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                  <div style={{ fontSize: 11, color: C1.muted, marginTop: 4 }}>{d}</div>
                </div>
              ))}
            </div>
            <svg viewBox="0 0 320 80" width="100%" style={{ display: "block", marginTop: 16 }}>
              <line x1={0} x2={320} y1={40} y2={40} stroke={C1.hair}/>
              <path d={"M 0 70 " + timeline.map((d, i) => `L ${(i / 119) * 320} ${70 - (d.I * (0.08)) / 1000 * 70}`).join(" ")} fill="none" stroke={C1.I} strokeWidth={1.6}/>
              <line x1={(42/119)*320} x2={(42/119)*320} y1={0} y2={80} stroke={C1.ink} strokeDasharray="2 2" strokeWidth={0.8}/>
            </svg>
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#fbf3f1", border: `1px solid #ecd6d2`, fontSize: 12, color: C1.alarm, fontWeight: 500 }}>
              ⚠ Hospital capacity breached on day 28
            </div>
          </section>

          {/* Advisor note */}
          <section style={{ background: C1.paper, border: `1px solid ${C1.rule}`, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 19, fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Today's note</h3>
              <button style={{ fontSize: 11, padding: "5px 9px", border: `1px solid ${C1.rule}`, background: "transparent", cursor: "pointer", color: C1.body }}>Regenerate</button>
            </div>
            <p style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: 15.5, lineHeight: 1.55, margin: 0, color: C1.body, fontStyle: "italic" }}>
              "Day 42. Roughly <span style={{ color: C1.I, fontWeight: 600 }}>{fmt(peak.I)}</span> people are infectious across the Denver network — the model's projected peak. Denver Health crossed capacity two weeks ago; Capitol Hill and Cherry Creek carry the largest current burden. Holding transmission at 0.70× and pushing isolation past 70% would shorten the right tail by an estimated 11 days."
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: C1.muted, fontFamily: "Inter, sans-serif" }}>— Claude advisor, grounded in current simulation snapshot</div>
          </section>
        </aside>
      </section>
    </div>
  );
}

window.DirectionOne = DirectionOne;
