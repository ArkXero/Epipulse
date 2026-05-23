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
import styles from "./dashboard.module.css";

export function OutbreakMap({
  city,
  nodes,
  day,
  selectedNodeId,
  onSelectNode,
  resetSignal
}: {
  city: { name: string; lat: number; lng: number };
  nodes: SimNode[];
  day: SimulationDay;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  resetSignal: number;
}) {
  const maxInfected = Math.max(...day.nodes.map((node) => node.I), 1);

  return (
    <div className={styles.mapFrame}>
      <MapContainer
        center={[city.lat, city.lng]}
        zoom={11}
        scrollWheelZoom={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewSync city={city} nodes={nodes} resetSignal={resetSignal} />
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
                color: selected ? "#20211d" : "#b04d3f",
                fillColor: infected > 0 ? "#b04d3f" : "#3c647f",
                fillOpacity: infected > 0 ? 0.28 + intensity * 0.42 : 0.22,
                opacity: 0.9,
                weight: selected ? 3 : 2
              }}
              eventHandlers={{
                click: () => onSelectNode(node.id)
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div className={styles.mapTooltip}>
                  <strong>{node.name}</strong>
                  <span>{formatNumber(infected)} infectious</span>
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
  resetSignal
}: {
  city: { name: string; lat: number; lng: number };
  nodes: SimNode[];
  resetSignal: number;
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
  }, [city.lat, city.lng, map, nodes, resetSignal]);

  return null;
}
