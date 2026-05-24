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

const MAP_COLORS = {
  infected: "#bb6f5d",
  idle: "#3d7a7a",
  closed: "#857d72",
  ink: "#26221b",
  breach: "#bb6f5d"
};

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
    <div className="h-[430px] w-full overflow-hidden rounded-[10px] border border-[--color-hair] max-[760px]:h-[340px]">
      <MapContainer
        center={[city.lat, city.lng]}
        zoom={11}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-full w-full"
      >
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
                weight: selected ? 2.5 : breached ? 2 : 1.2
              }}
              eventHandlers={{
                click: () => onSelectNode(node.id)
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
                          : "var(--color-muted)"
                      }}
                    >
                      {formatNumber(hospitalized)} /{" "}
                      {formatNumber(node.hospitalCapacity)} beds
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
      padding: [32, 32],
      maxZoom: 12
    });
  }, [city.lat, city.lng, map, nodes]);

  return null;
}
