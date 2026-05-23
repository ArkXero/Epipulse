"use client";

import dynamic from "next/dynamic";
import type { SimNode, SimulationDay } from "@/lib/model";

const OutbreakMap = dynamic(
  () => import("./outbreak-map").then((mod) => mod.OutbreakMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[430px] w-full place-items-center overflow-hidden border-2 border-ink bg-paper-soft font-mono text-[11px] tracking-[0.12em] text-muted uppercase max-[760px]:h-[340px]">
        Loading map
      </div>
    )
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
