"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcw } from "lucide-react";
import type { SimNode, SimulationDay } from "@/lib/model";

const OutbreakMap = dynamic(
  () => import("./outbreak-map").then((mod) => mod.OutbreakMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[430px] w-full place-items-center overflow-hidden rounded-[10px] border border-[--color-hair] bg-[--color-paper-soft] text-[13px] text-[--color-muted] max-[760px]:h-[340px]">
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
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[--color-hair] bg-[--color-paper] px-3 text-[12.5px] font-medium text-[--color-body] transition-colors hover:bg-[--color-paper-soft] hover:text-[--color-ink]"
          aria-label="Reset map view"
          onClick={() => setResetSignal((value) => value + 1)}
        >
          <RotateCcw size={14} strokeWidth={2} />
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
