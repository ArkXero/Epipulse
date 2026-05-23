"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <div className={styles.mapPanel}>
      <div className={styles.mapToolbar}>
        <button
          type="button"
          className={styles.mapResetButton}
          aria-label="Reset map view"
          onClick={() => setResetSignal((value) => value + 1)}
        >
          <RotateCcw size={16} strokeWidth={2} />
          Reset map
        </button>
      </div>
      <OutbreakMap
        city={city}
        nodes={nodes}
        day={day}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        resetSignal={resetSignal}
      />
    </div>
  );
}
