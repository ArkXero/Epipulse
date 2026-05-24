/* eslint-disable */
// DIRECTION 2 — EOC Dark
// References: CDC Emergency Operations Center, JHU CSSE dashboard, Bloomberg Terminal.
// Deep navy ground, semantic cool→warm color scale, IBM Plex Sans + Mono.
// Dense, calm monitoring console. Red is reserved for breach/critical only.

const C2 = {
  bg: "#0a1322",
  surface: "#121d33",
  surfaceHi: "#172441",
  hair: "#1d2940",
  border: "#243352",
  text: "#dde4ef",
  body: "#aebbd0",
  muted: "#7a8aa5",
  faint: "#4d5b78",
  S: "#4a78b8",
  E: "#d6a93a",
  I: "#e3784a",
  R: "#5fb39a",
  D: "#b8c0d0",
  ok: "#5fb39a",
  warn: "#d6a93a",
  alarm: "#e84a3a",
  alarmDeep: "#5a1818",
};

function DirectionTwo() {
  const { timeline, nodes, peak, PEAK_DAY, fmt, fmtInt, areaPath, linePath, xOf, project } = window.epi;
  const currentDay = PEAK_DAY;
  const today = timeline[currentDay];
  const yMaxAgg = window.epi.TOTAL_POP;

  const CW = 920, CH = 320;
  const cp = { l: 52, r: 16, t: 24, b: 28 };
  const breachX = xOf(28, CW, cp);
  const peakXp = xOf(PEAK_DAY, CW, cp);

  const MW = 920, MH = 360;

  const ticker = `T+042D · INFECTIOUS ${fmt(peak.I)} · HOSP 1.6k · BREACH @ DENVER HEALTH (D28) · CLOSURE × 2 NODES · TRANS 0.70× · ISO 55% · TRAVEL 25% · NEXT DAY +14H`;

  return (
    <div style={{ background: C2.bg, color: C2.text, fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 13.5, lineHeight: 1.5 }}>
      {/* status bar */}
      <div style={{ background: C2.surface, borderBottom: `1px solid ${C2.border}`, padding: "8px 24px", display: "flex", alignItems: "center", gap: 18, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C2.body, letterSpacing: "0.04em" }}>
        <span style={{ color: C2.alarm, fontWeight: 600 }}>● EOC ACTIVE</span>
        <span style={{ color: C2.muted }}>SECTOR DENVER-CO</span>
        <span style={{ color: C2.muted }}>OP / EP-001</span>
        <span style={{ color: C2.muted }}>RUN ID 5f8a2c</span>
        <span style={{ flex: 1, color: C2.warn, overflow: "hidden", whiteSpace: "nowrap" }}>{ticker}</span>
        <span style={{ color: C2.ok }}>MODEL OK</span>
        <span style={{ color: C2.muted }}>15:42:08 UTC</span>
      </div>

      {/* main topbar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${C2.hair}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 30, height: 30, border: `1.5px solid ${C2.I}`, display: "grid", placeItems: "center", color: C2.I, fontWeight: 600, fontSize: 14 }}>E</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.04em" }}>EPIPULSE / OPERATIONS</div>
            <div style={{ fontSize: 11, color: C2.muted, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>Network SEIR · deterministic · 7 nodes</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {["OVERVIEW", "DASHBOARD", "ADVISOR", "NODES", "METHODS"].map((l, i) => (
            <span key={l} style={{ padding: "8px 14px", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: i === 1 ? C2.text : C2.muted, background: i === 1 ? C2.surface : "transparent", border: `1px solid ${i === 1 ? C2.border : "transparent"}`, borderBottom: i === 1 ? `2px solid ${C2.I}` : "1px solid transparent", cursor: "pointer" }}>{l}</span>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C2.body }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C2.ok }}></span>
            ENGINE / 47MS
          </div>
          <div style={{ padding: "5px 10px", background: C2.alarmDeep, color: C2.alarm, border: `1px solid ${C2.alarm}`, fontWeight: 600, letterSpacing: "0.08em" }}>HOSP BREACH</div>
        </div>
      </header>

      {/* command row: status pills + scenario */}
      <section style={{ padding: "20px 32px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 24, borderBottom: `1px solid ${C2.hair}` }}>
        <div>
          <div style={{ fontSize: 11, color: C2.muted, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", marginBottom: 12 }}>SCENARIO BRIEF · DAY {currentDay} OF 119</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em", color: C2.text, lineHeight: 1.2 }}>
            Winter respiratory outbreak · Denver, CO
          </h1>
          <div style={{ marginTop: 6, fontSize: 13.5, color: C2.body, maxWidth: 720, lineHeight: 1.55 }}>
            Peak transmission projected today at <span style={{ color: C2.I, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(peak.I)}</span> infectious. Hospital capacity was breached at <span style={{ color: C2.alarm, fontWeight: 600 }}>Denver Health</span> on D28, +1.4× over baseline load. Current interventions hold transmission to 0.70× of baseline.
          </div>
          {/* Status pills */}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { l: "TRANSMISSION", v: "0.70× ↓", t: "ok" },
              { l: "ISOLATION", v: "55%", t: "ok" },
              { l: "TRAVEL", v: "25%", t: "ok" },
              { l: "AIRPORT", v: "OPEN", t: "warn" },
              { l: "DENVER HEALTH", v: "BREACHED", t: "alarm" },
              { l: "UNION STATION", v: "CLOSED", t: "info" },
              { l: "AURARIA", v: "CLOSED", t: "info" },
            ].map((p, i) => {
              const m = p.t === "ok" ? C2.ok : p.t === "warn" ? C2.warn : p.t === "alarm" ? C2.alarm : C2.body;
              return (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px", border: `1px solid ${C2.border}`, background: C2.surface, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.06em" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: m }}></span>
                  <span style={{ color: C2.muted }}>{p.l}</span>
                  <span style={{ color: m, fontWeight: 600 }}>{p.v}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 16 }}>
          <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted, marginBottom: 10 }}>SCENARIO GENERATOR</div>
          <select defaultValue="denver" style={{ width: "100%", padding: "8px 10px", background: C2.bg, border: `1px solid ${C2.border}`, color: C2.text, fontSize: 12, fontFamily: "inherit", marginBottom: 8 }}>
            <option>denver · winter respiratory</option>
            <option>nyc · transit-linked outbreak</option>
            <option>dmv · regional spread</option>
            <option>island · limited capacity</option>
          </select>
          <textarea defaultValue="A novel respiratory virus emerges in Denver in winter." style={{ width: "100%", padding: 10, background: C2.bg, border: `1px solid ${C2.border}`, color: C2.text, fontSize: 12, fontFamily: "inherit", minHeight: 56, resize: "none", lineHeight: 1.4 }} />
          <button style={{ marginTop: 8, width: "100%", padding: "9px 12px", background: C2.I, color: "#0a0a0a", border: "none", fontSize: 11.5, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", cursor: "pointer" }}>RUN SCENARIO →</button>
        </div>
      </section>

      {/* metrics strip */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", borderBottom: `1px solid ${C2.hair}` }}>
        {[
          { l: "Day", v: "42", d: "of 119", c: C2.text },
          { l: "Infectious", v: fmt(peak.I), d: "↑ +840 vs D41", c: C2.I },
          { l: "Hospitalized", v: "1.6k", d: "1 node breached", c: C2.warn },
          { l: "Deaths (cum.)", v: fmt(today.D), d: "CFR 0.6%", c: C2.D },
          { l: "Recovered", v: fmt(today.R), d: "76% past wave", c: C2.R },
          { l: "Susceptible", v: fmt(today.S), d: "of 293k", c: C2.S },
        ].map((m, i) => (
          <div key={i} style={{ padding: "20px 22px", borderRight: i < 5 ? `1px solid ${C2.hair}` : "none" }}>
            <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted, marginBottom: 8 }}>{m.l.toUpperCase()}</div>
            <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", color: m.c, lineHeight: 1, fontVariantNumeric: "tabular-nums", fontFamily: "'IBM Plex Sans', sans-serif" }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C2.muted, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace" }}>{m.d}</div>
          </div>
        ))}
      </section>

      {/* main grid */}
      <section style={{ padding: 24, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 20 }}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* SEIR chart */}
          <article style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C2.hair}` }}>
              <div>
                <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted }}>AGGREGATE / SEIR-D</div>
                <h2 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600, letterSpacing: "0.02em", color: C2.text }}>NETWORK TRAJECTORY · 7 NODES · 120 DAYS</h2>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {["S", "E", "I", "R", "D"].map((k) => (
                  <span key={k} style={{ padding: "4px 10px", background: C2.bg, border: `1px solid ${C2.border}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: C2[k] }}>{k}</span>
                ))}
              </div>
            </div>

            <svg viewBox={`0 0 ${CW} ${CH}`} width="100%" style={{ display: "block" }}>
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <line key={p} x1={cp.l} x2={CW - cp.r} y1={y} y2={y} stroke={C2.hair} />;
              })}
              <path d={areaPath(timeline, "S", CW, CH, cp, yMaxAgg)} fill={C2.S} fillOpacity={0.32} stroke={C2.S} strokeWidth={0.6} strokeOpacity={0.6} />
              <path d={areaPath(timeline, "R", CW, CH, cp, yMaxAgg)} fill={C2.R} fillOpacity={0.32} stroke={C2.R} strokeWidth={0.6} strokeOpacity={0.6} />
              <path d={areaPath(timeline, "E", CW, CH, cp, yMaxAgg)} fill={C2.E} fillOpacity={0.32} stroke={C2.E} strokeWidth={0.6} strokeOpacity={0.6} />
              <path d={areaPath(timeline, "I", CW, CH, cp, yMaxAgg)} fill={C2.I} fillOpacity={0.55} stroke={C2.I} strokeWidth={1.2} />
              <path d={linePath(timeline, "D", CW, CH, cp, yMaxAgg)} fill="none" stroke={C2.D} strokeWidth={1.4} strokeDasharray="3 3" />

              {/* breach annotation */}
              <line x1={breachX} x2={breachX} y1={cp.t} y2={CH - cp.b} stroke={C2.alarm} strokeWidth={1} strokeDasharray="3 3" />
              <g transform={`translate(${breachX + 6}, ${cp.t + 4})`}>
                <rect x={0} y={0} width={146} height={36} fill={C2.alarmDeep} stroke={C2.alarm} strokeWidth={0.8}/>
                <text x={8} y={14} fontSize={9.5} fontFamily="'IBM Plex Mono', monospace" fill={C2.alarm} letterSpacing="0.08em">D28 · HOSP BREACH</text>
                <text x={8} y={28} fontSize={10.5} fontFamily="'IBM Plex Sans', sans-serif" fill={C2.text}>Denver Health</text>
              </g>

              {/* current day */}
              <line x1={peakXp} x2={peakXp} y1={cp.t} y2={CH - cp.b} stroke={C2.I} strokeWidth={1}/>
              <g transform={`translate(${peakXp + 6}, ${cp.t + 4})`}>
                <text fontSize={9.5} fontFamily="'IBM Plex Mono', monospace" fill={C2.I} letterSpacing="0.08em">D42 · CURRENT</text>
              </g>

              {[0, 30, 60, 90, 120].map((t) => (
                <text key={t} x={xOf(Math.min(t, 119), CW, cp)} y={CH - 8} fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={C2.muted} textAnchor="middle">{`D${t}`}</text>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const y = cp.t + (CH - cp.t - cp.b) * (1 - p);
                return <text key={p} x={cp.l - 8} y={y + 3} fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={C2.muted} textAnchor="end">{fmt(p * yMaxAgg)}</text>;
              })}
            </svg>

            {/* playback */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C2.hair}`, display: "flex", alignItems: "center", gap: 12 }}>
              <button style={{ width: 32, height: 32, background: C2.I, border: "none", color: "#0a0a0a", cursor: "pointer", display: "grid", placeItems: "center" }}>▸</button>
              <div style={{ flex: 1, position: "relative", height: 6 }}>
                <div style={{ position: "absolute", inset: "2px 0", background: C2.hair }}></div>
                <div style={{ position: "absolute", inset: "2px auto 2px 0", width: `${(currentDay / 119) * 100}%`, background: C2.I }}></div>
                <div style={{ position: "absolute", left: `${(currentDay / 119) * 100}%`, top: -3, width: 10, height: 12, background: C2.I, border: `1px solid ${C2.text}` }}></div>
                {/* tick marks */}
                {[28, 42, 65, 90].map((t) => (
                  <div key={t} style={{ position: "absolute", left: `${(t/119)*100}%`, top: -4, width: 1, height: 14, background: t === 28 ? C2.alarm : C2.muted }}></div>
                ))}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: C2.body, minWidth: 80, textAlign: "right" }}>D{currentDay} / 119</div>
              <div style={{ display: "flex", gap: 0, border: `1px solid ${C2.border}` }}>
                {[0.5, 1, 2, 4].map((s) => (
                  <button key={s} style={{ padding: "5px 9px", border: "none", borderRight: s === 4 ? "none" : `1px solid ${C2.border}`, background: s === 1 ? C2.border : "transparent", color: s === 1 ? C2.text : C2.body, fontSize: 10.5, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>{s}×</button>
                ))}
              </div>
            </div>
          </article>

          {/* map */}
          <article style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C2.hair}` }}>
              <div>
                <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted }}>GEO / NODE STATE · D42</div>
                <h2 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600, letterSpacing: "0.02em" }}>DENVER METRO · INFECTIOUS DENSITY</h2>
              </div>
              <div style={{ display: "flex", gap: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: C2.muted }}>
                <span><span style={{ color: C2.ok }}>●</span> OPEN</span>
                <span><span style={{ color: C2.D }}>●</span> CLOSED</span>
                <span><span style={{ color: C2.alarm }}>●</span> BREACHED</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" style={{ display: "block", background: C2.bg }}>
              <defs>
                <pattern id="c2grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke={C2.hair} strokeWidth="0.6"/>
                </pattern>
                <radialGradient id="c2glow">
                  <stop offset="0%" stopColor={C2.I} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={C2.I} stopOpacity={0}/>
                </radialGradient>
              </defs>
              <rect width={MW} height={MH} fill="url(#c2grid)"/>
              {/* coordinate ticks */}
              <text x={12} y={20} fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={C2.muted}>39.86°N</text>
              <text x={12} y={MH - 12} fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={C2.muted}>39.72°N</text>
              <text x={MW - 80} y={MH - 12} fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={C2.muted}>104.66°W</text>
              {/* mobility arcs */}
              {[
                ["denver-airport", "denver-downtown"],
                ["denver-downtown", "capitol-hill"],
                ["denver-downtown", "cherry-creek"],
                ["denver-airport", "denver-union-station"],
                ["denver-union-station", "auraria-campus"],
                ["denver-downtown", "denver-health"],
              ].map(([a, b], i) => {
                const A = nodes.find((n) => n.id === a);
                const B = nodes.find((n) => n.id === b);
                if (!A || !B) return null;
                const [ax, ay] = project(A.lat, A.lng, MW, MH, 70);
                const [bx, by] = project(B.lat, B.lng, MW, MH, 70);
                const closed = A.closed || B.closed;
                return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={closed ? C2.faint : C2.I} strokeWidth={closed ? 0.6 : 1.2} strokeDasharray={closed ? "2 3" : ""} strokeOpacity={closed ? 0.4 : 0.55}/>;
              })}
              {nodes.map((n) => {
                const [cx, cy] = project(n.lat, n.lng, MW, MH, 70);
                const r = 10 + Math.sqrt(n.infected) / 5;
                return (
                  <g key={n.id}>
                    <circle cx={cx} cy={cy} r={r + 18} fill="url(#c2glow)"/>
                    <circle cx={cx} cy={cy} r={r} fill={n.closed ? "transparent" : C2.I} fillOpacity={n.closed ? 0 : 0.75} stroke={n.breached ? C2.alarm : n.closed ? C2.D : C2.I} strokeWidth={n.breached ? 2.4 : n.closed ? 1.4 : 0.6} strokeDasharray={n.closed ? "3 2" : ""}/>
                    {n.breached && <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={C2.alarm} strokeWidth={0.8} strokeDasharray="2 3"/>}
                    <text x={cx} y={cy - r - 10} textAnchor="middle" fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" fill={C2.text} letterSpacing="0.04em">{n.short}</text>
                    <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize={10} fontFamily="'IBM Plex Mono', monospace" fill={n.breached ? C2.alarm : C2.body}>{fmt(n.infected)} I · {n.capacity ? `${fmt(n.hospitalized)}/${n.capacity} H` : "—"}</text>
                  </g>
                );
              })}
            </svg>
          </article>
        </div>

        {/* side panel */}
        <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {/* Interventions */}
          <section style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C2.hair}` }}>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted }}>INTERVENTIONS / LEVERS</div>
              <button style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", padding: "3px 7px", border: `1px solid ${C2.border}`, background: "transparent", color: C2.body, cursor: "pointer" }}>RESET</button>
            </div>
            {[
              { label: "TRANS", value: "0.70×", pos: 38, min: "0.15×", max: "1.8×" },
              { label: "ISO", value: "55%", pos: 55, min: "0%", max: "95%" },
              { label: "TRAVEL", value: "25%", pos: 25, min: "0%", max: "100%" },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                  <span style={{ color: C2.muted, letterSpacing: "0.06em" }}>{s.label}</span>
                  <span style={{ color: C2.I, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                </div>
                <div style={{ position: "relative", height: 18, background: C2.bg, border: `1px solid ${C2.hair}` }}>
                  <div style={{ position: "absolute", inset: 0, width: `${s.pos}%`, background: C2.I, opacity: 0.4 }}></div>
                  <div style={{ position: "absolute", left: `${s.pos}%`, top: 0, bottom: 0, width: 2, background: C2.I }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", color: C2.faint }}>
                  <span>{s.min}</span><span>{s.max}</span>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted, marginTop: 10, marginBottom: 8 }}>NODE STATE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {nodes.map((n) => (
                <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: n.closed ? C2.alarmDeep : C2.bg, border: `1px solid ${n.closed ? C2.alarm : C2.hair}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
                  <span style={{ color: n.closed ? C2.alarm : C2.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.short}</span>
                  <span style={{ color: n.closed ? C2.alarm : C2.ok, fontWeight: 600, letterSpacing: 0.08, marginLeft: 6 }}>{n.closed ? "× CLS" : "● OPN"}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Selected node */}
          <section style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C2.hair}` }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted }}>SELECTED · DENVER-HEALTH</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Denver Health Medical Center</div>
              </div>
              <div style={{ padding: "4px 8px", background: C2.alarmDeep, color: C2.alarm, border: `1px solid ${C2.alarm}`, fontSize: 10, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.1 }}>BREACHED</div>
            </div>

            {/* gauge: hospitalized vs capacity */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: C2.muted, marginBottom: 6 }}>
                <span>HOSP LOAD</span>
                <span><span style={{ color: C2.alarm, fontWeight: 600 }}>720</span> / 520 BEDS</span>
              </div>
              <div style={{ position: "relative", height: 10, background: C2.bg, border: `1px solid ${C2.hair}` }}>
                <div style={{ position: "absolute", inset: 0, width: "100%", background: C2.alarm, opacity: 0.55 }}></div>
                <div style={{ position: "absolute", inset: 0, width: "100%", borderRight: `2px dashed ${C2.text}`, opacity: 0.5 }}></div>
                <div style={{ position: "absolute", left: "72%", top: -3, bottom: -3, width: 1, background: C2.text, opacity: 0.7 }}></div>
              </div>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: C2.muted, marginTop: 4 }}>capacity ↑ · current load 1.38× capacity</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: `1px solid ${C2.hair}` }}>
              {[
                ["PEAK I", "3.6k", "D44"],
                ["HOSP", "164", "D42"],
                ["DEATHS", "94", "END"],
              ].map(([l, v, d], i) => (
                <div key={i} style={{ padding: "10px 12px", borderRight: i < 2 ? `1px solid ${C2.hair}` : "none" }}>
                  <div style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.1, color: C2.muted, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C2.I, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                  <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: C2.faint, marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </div>

            <svg viewBox="0 0 320 70" width="100%" style={{ marginTop: 12, display: "block" }}>
              <path d={"M 0 60 " + timeline.map((d, i) => `L ${(i / 119) * 320} ${60 - (d.I * 0.08) / 1000 * 50}`).join(" ")} fill={C2.I} fillOpacity={0.25} stroke="none"/>
              <path d={timeline.map((d, i) => `${i === 0 ? "M" : "L"} ${(i / 119) * 320} ${60 - (d.I * 0.08) / 1000 * 50}`).join(" ")} fill="none" stroke={C2.I} strokeWidth={1.4}/>
              <line x1={(28/119)*320} x2={(28/119)*320} y1={0} y2={70} stroke={C2.alarm} strokeWidth={0.8} strokeDasharray="2 2"/>
              <line x1={(42/119)*320} x2={(42/119)*320} y1={0} y2={70} stroke={C2.text} strokeWidth={0.6}/>
            </svg>
          </section>

          {/* Advisor */}
          <section style={{ background: C2.surface, border: `1px solid ${C2.border}`, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C2.hair}` }}>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: C2.muted }}>ADVISOR · INCIDENT NOTE</div>
              <button style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", padding: "4px 8px", border: `1px solid ${C2.I}`, background: "transparent", color: C2.I, cursor: "pointer", letterSpacing: 0.1 }}>REGEN ↻</button>
            </div>
            <div style={{ borderLeft: `2px solid ${C2.I}`, paddingLeft: 12, fontSize: 12.5, lineHeight: 1.55, color: C2.body }}>
              <p style={{ margin: 0 }}>
                D42 peak today: <span style={{ color: C2.I, fontWeight: 600 }}>{fmt(peak.I)}</span> infectious across network. Denver Health passed capacity on D28; current load 1.38× beds. Capitol Hill carries the largest active burden (28% of network I), Cherry Creek 19%.
              </p>
              <p style={{ margin: "10px 0 0" }}>
                <span style={{ color: C2.text, fontWeight: 600 }}>Suggested:</span> hold transmission ≤ 0.7×, raise isolation to 70%+. Estimated effect — right tail shortens by ~11 days, deaths −18%.
              </p>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: C2.faint, letterSpacing: 0.06 }}>CLAUDE · GROUNDED IN D42 SNAPSHOT · 1.4S</div>
          </section>
        </aside>
      </section>
    </div>
  );
}

window.DirectionTwo = DirectionTwo;
