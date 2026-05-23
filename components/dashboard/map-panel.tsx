"use client";

import dynamic from "next/dynamic";
import type { SimNode, SimulationDay } from "@/lib/model";
import styles from "./dashboard.module.css";

const OutbreakMap = dynamic(
  () => import("./outbreak-map").then((mod) => mod.OutbreakMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading map</div>
  }
);

export function MapPanel({
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
  return (
    <OutbreakMap
      city={city}
      nodes={nodes}
      day={day}
      selectedNodeId={selectedNodeId}
      onSelectNode={onSelectNode}
    />
  );
}
