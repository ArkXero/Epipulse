"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

interface Marker {
  id: string;
  location: [number, number];
  label?: string;
}

interface Arc {
  id: string;
  from: [number, number];
  to: [number, number];
  label?: string;
}

interface GlobeProps {
  markers?: Marker[];
  arcs?: Arc[];
  className?: string;
  style?: React.CSSProperties;
  markerColor?: [number, number, number];
  baseColor?: [number, number, number];
  arcColor?: [number, number, number];
  glowColor?: [number, number, number];
  dark?: number;
  mapBrightness?: number;
  markerSize?: number;
  markerElevation?: number;
  arcWidth?: number;
  arcHeight?: number;
  speed?: number;
  theta?: number;
  diffuse?: number;
  mapSamples?: number;
  showMarkerLabels?: boolean;
  showArcLabels?: boolean;
}

export function Globe({
  markers = [],
  arcs = [],
  className = "",
  style,
  markerColor = [0.902, 0.098, 0.098],
  baseColor = [0.08, 0.08, 0.08],
  arcColor = [0.902, 0.098, 0.098],
  glowColor = [0.95, 0.94, 0.92],
  dark = 0,
  mapBrightness = 9,
  markerSize = 0.03,
  markerElevation = 0.01,
  arcWidth = 0.6,
  arcHeight = 0.3,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 16000,
  showMarkerLabels = true,
  showArcLabels = true
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const velocity = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x;
      const deltaY = e.clientY - pointerInteracting.current.y;
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 };
      const now = Date.now();
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1);
        const maxVelocity = 0.15;
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)
          )
        };
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now };
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
      lastPointer.current = null;
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId = 0;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: width * dpr,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markers.map((m) => ({
          location: m.location,
          size: markerSize,
          id: m.id
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          id: a.id
        })),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.92
      });

      function animate() {
        if (!isPausedRef.current) {
          phi += speed;
          if (
            Math.abs(velocity.current.phi) > 0.0001 ||
            Math.abs(velocity.current.theta) > 0.0001
          ) {
            phiOffsetRef.current += velocity.current.phi;
            thetaOffsetRef.current += velocity.current.theta;
            velocity.current.phi *= 0.95;
            velocity.current.theta *= 0.95;
          }
          const thetaMin = -0.4;
          const thetaMax = 0.4;
          if (thetaOffsetRef.current < thetaMin) {
            thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1;
          } else if (thetaOffsetRef.current > thetaMax) {
            thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1;
          }
        }
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: theta + thetaOffsetRef.current + dragOffset.current.theta
        });
        animationId = requestAnimationFrame(animate);
      }

      animate();

      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1";
      });
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width && entries[0].contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [
    markers,
    arcs,
    markerColor,
    baseColor,
    arcColor,
    glowColor,
    dark,
    mapBrightness,
    markerSize,
    markerElevation,
    arcWidth,
    arcHeight,
    speed,
    theta,
    diffuse,
    mapSamples
  ]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        userSelect: "none",
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          touchAction: "none"
        }}
      />
      {showMarkerLabels
        ? markers
            .filter((marker) => marker.label)
            .map((marker) => (
              <span
                key={marker.id}
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-2 border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-white uppercase shadow-[0_8px_18px_rgba(10,10,10,0.16)] transition-[opacity,filter,transform] duration-300"
                style={anchorLabelStyle(`--cobe-${marker.id}`)}
              >
                {marker.label}
              </span>
            ))
        : null}
      {showArcLabels
        ? arcs
            .filter((arc) => arc.label)
            .map((arc) => (
              <span
                key={arc.id}
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-3 border border-line-hair bg-white/95 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-ink uppercase shadow-[0_8px_20px_rgba(10,10,10,0.10)] transition-[opacity,filter,transform] duration-300"
                style={anchorLabelStyle(`--cobe-arc-${arc.id}`)}
              >
                {arc.label}
              </span>
            ))
        : null}
    </div>
  );
}

function anchorLabelStyle(anchorName: string): CSSProperties {
  return {
    positionAnchor: anchorName,
    bottom: "anchor(top)",
    left: "anchor(center)",
    opacity: `var(${anchorName.replace("--cobe", "--cobe-visible")}, 0)`,
    filter: `blur(calc((1 - var(${anchorName.replace("--cobe", "--cobe-visible")}, 0)) * 8px))`
  } as CSSProperties;
}
