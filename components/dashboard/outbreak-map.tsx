"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import type { SimNode, SimulationDay } from "@/lib/model";
import { formatNumber } from "@/lib/format";

export function OutbreakMap({
  city,
  nodes,
  day,
  selectedNodeId,
  onSelectNode
}: {
  city: { name: string; lat: number; lng: number };
  nodes: SimNode[];
  day: SimulationDay;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  const maxInfected = Math.max(...day.nodes.map((node) => node.I), 1);

  return (
    <div className="h-[430px] w-full overflow-hidden border-2 border-ink max-[760px]:h-[340px]">
      <MapContainer
        center={[city.lat, city.lng]}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewSync city={city} nodes={nodes} />
        {nodes.map((node) => {
          const state = day.nodes.find((entry) => entry.nodeId === node.id);
          const infected = state?.I ?? 0;
          const intensity = Math.min(1, infected / maxInfected);
          const radius = 8 + intensity * 24;
          const selected = selectedNodeId === node.id;

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={selected ? radius + 4 : radius}
              pathOptions={{
                color: selected ? "#0a0a0a" : "#e61919",
                fillColor: infected > 0 ? "#e61919" : "#0a0a0a",
                fillOpacity: infected > 0 ? 0.3 + intensity * 0.55 : 0.18,
                opacity: 1,
                weight: selected ? 3 : 2
              }}
              eventHandlers={{
                click: () => onSelectNode(node.id)
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div className="grid gap-0.5 font-mono text-[11px] tracking-[0.04em]">
                  <strong className="block text-ink uppercase">{node.name}</strong>
                  <span className="block">{formatNumber(infected)} infectious</span>
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
  nodes
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

    const bounds = nodes.map((node) => [node.lat, node.lng] as [number, number]);
    map.fitBounds(bounds, {
      animate: false,
      padding: [28, 28],
      maxZoom: 12
    });
  }, [city.lat, city.lng, map, nodes]);

  return null;
}
