# 07 — `components/dashboard/outbreak-map.tsx`

## Goal
Switch from grayscale OpenStreetMap to a soft, color-aware basemap. Re-style the circle markers with the Bio Quiet palette. Improve tooltips. Logic (`MapViewSync`, `fitBounds`) stays.

## Replacement file

```tsx
"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { SimNode, SimulationDay } from "@/lib/model";
import { formatNumber } from "@/lib/format";

// Bio Quiet — node marker colors
const MAP_COLORS = {
  infected: "#bb6f5d",  // --color-i / --color-alarm
  idle:     "#3d7a7a",  // --color-accent (open node, no current infection)
  closed:   "#857d72",  // --color-muted
  ink:      "#26221b",  // selected ring
  breach:   "#bb6f5d",  // breach ring (matches infected)
};

export function OutbreakMap({
  city,
  nodes,
  day,
  selectedNodeId,
  onSelectNode,
}: {
  city: { name: string; lat: number; lng: number };
  nodes: SimNode[];
  day: SimulationDay;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const maxInfected = Math.max(...day.nodes.map((n) => n.I), 1);

  return (
    <div className="h-[430px] w-full overflow-hidden rounded-[10px] border border-[--color-hair] max-[760px]:h-[340px]">
      <MapContainer
        center={[city.lat, city.lng]}
        zoom={11}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-full w-full"
      >
        {/* Soft, color-aware basemap. CARTO Voyager is calm, low-saturation,
            and renders nicely on a warm off-white site. Attribution is required. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <MapViewSync city={city} nodes={nodes} />

        {nodes.map((node) => {
          const state = day.nodes.find((entry) => entry.nodeId === node.id);
          const infected = state?.I ?? 0;
          const hospitalized = state?.hospitalized ?? 0;
          const intensity = Math.min(1, infected / maxInfected);
          const radius = 8 + intensity * 22;
          const selected = selectedNodeId === node.id;
          const breached =
            node.hospitalCapacity > 0 &&
            hospitalized > node.hospitalCapacity * 0.85;

          // closed nodes use muted ring with low opacity fill
          // active nodes scale color from accent (no infection) to clay (lots)
          const isClosed = false; // map doesn't know about interventions; pass through if needed
          const fillColor = infected > 0 ? MAP_COLORS.infected : MAP_COLORS.idle;

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={selected ? radius + 3 : radius}
              pathOptions={{
                color: selected
                  ? MAP_COLORS.ink
                  : breached
                  ? MAP_COLORS.breach
                  : fillColor,
                fillColor,
                fillOpacity: infected > 0 ? 0.25 + intensity * 0.55 : 0.15,
                opacity: 1,
                weight: selected ? 2.5 : breached ? 2 : 1.2,
              }}
              eventHandlers={{
                click: () => onSelectNode(node.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -6]}
                opacity={1}
                className="epi-tooltip"
              >
                <div className="grid gap-0.5">
                  <strong className="block text-[12.5px] font-medium text-[--color-ink]">
                    {node.name}
                  </strong>
                  <span className="block text-[12px] tabular-nums text-[--color-body]">
                    {formatNumber(infected)} infectious
                  </span>
                  {node.hospitalCapacity > 0 ? (
                    <span
                      className="block text-[11.5px] tabular-nums"
                      style={{
                        color: breached
                          ? MAP_COLORS.breach
                          : "var(--color-muted)",
                      }}
                    >
                      {formatNumber(hospitalized)} / {node.hospitalCapacity} beds
                      {breached ? " · over capacity" : ""}
                    </span>
                  ) : null}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function MapViewSync({
  city,
  nodes,
}: {
  city: { name: string; lat: number; lng: number };
  nodes: SimNode[];
}) {
  const map = useMap();

  useEffect(() => {
    if (nodes.length < 2) {
      map.setView([city.lat, city.lng], 11, { animate: false });
      return;
    }
    const bounds = nodes.map(
      (node) => [node.lat, node.lng] as [number, number]
    );
    map.fitBounds(bounds, {
      animate: false,
      padding: [32, 32],
      maxZoom: 12,
    });
  }, [city.lat, city.lng, map, nodes]);

  return null;
}
```

## Companion CSS (add to `app/globals.css` if not already present from `03_globals.css`)

The new file already includes the `.leaflet-container`, `.leaflet-tile`, and `.leaflet-control-attribution` rules. Add the tooltip rule:

```css
.epi-tooltip.leaflet-tooltip {
  background: var(--color-paper) !important;
  border: 1px solid var(--color-hair) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 6px 18px rgba(38, 34, 27, 0.08) !important;
  padding: 8px 10px !important;
  font-family: var(--font-sans);
  color: var(--color-ink);
}
.epi-tooltip.leaflet-tooltip::before { display: none; } /* drop the arrow if too noisy */
```

## What changed vs. the old file

- Tile source: `tile.openstreetmap.org` → `basemaps.cartocdn.com/rastertiles/voyager`. CARTO Voyager is calm and reads well on warm off-white.
- `.leaflet-tile { filter: grayscale(1) ... }` rule **removed** from `globals.css`. Replaced with a gentle `saturate(0.85) brightness(1.02)` so the map sits in the page palette but still shows water/roads/parks.
- Marker stroke palette: `#0a0a0a` / `#e61919` → `MAP_COLORS.ink` / `MAP_COLORS.infected` (clay) / `MAP_COLORS.idle` (teal).
- Idle (zero-infection) nodes are **teal**, not red. Only nodes with infectious population become clay.
- Breach state: nodes with hospitalized > 85% capacity get a clay ring at `weight 2` even if they're not selected.
- Tooltip rebuilt with three lines (name / infectious / beds), tabular numbers, the breach line in clay only when actually breached.
- The container wrapper drops `border-2 border-ink` for `rounded-[10px] border border-[--color-hair]`.

## Notes for Claude Code

- Leaflet doesn't pick up CSS custom properties inside SVG `pathOptions` — keep `MAP_COLORS` as a JS constant.
- If `state?.hospitalized` isn't already on `SimulationDay['nodes'][n]`, check `lib/model/types.ts`. The existing `outbreak-map.tsx` only used `state.I`; if the breach calc needs a field the model doesn't expose at the node level, fall back to omitting the breach ring (don't fabricate the data).
- The CARTO subdomains `abcd` are required; without `subdomains`, only the first letter resolves and rate limits kick in.
- The tile URL uses `{r}` for retina; leave it — Leaflet will silently skip when not retina.
