import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import provincesData from "@/data/png-provinces.json";
import type { Well } from "@shared/schema";

type GeoFeature = {
  type: "Feature";
  properties: { name: string; iso: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

type GeoJson = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

const data = provincesData as GeoJson;

// PNG bounding box (approximate)
const BOUNDS = {
  minLon: 140.8,
  maxLon: 160.2,
  minLat: -11.7,
  maxLat: -0.5,
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 600;

// Equirectangular projection scaled to fit the viewbox
function project(lon: number, lat: number): [number, number] {
  const x =
    ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * VIEW_WIDTH;
  // Y axis is inverted in SVG
  const y =
    ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW_HEIGHT;
  return [x, y];
}

function ringToPath(ring: number[][]): string {
  return ring
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

function featureToPath(feature: GeoFeature): string {
  if (feature.geometry.type === "Polygon") {
    const polygon = feature.geometry.coordinates as number[][][];
    return polygon.map(ringToPath).join(" ");
  } else {
    const multiPolygon = feature.geometry.coordinates as number[][][][];
    return multiPolygon.flatMap((polygon) => polygon.map(ringToPath)).join(" ");
  }
}

function centroid(feature: GeoFeature): [number, number] {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);
  polygons.forEach((polygon) => {
    polygon[0].forEach(([lon, lat]) => {
      const [x, y] = project(lon, lat);
      sumX += x;
      sumY += y;
      count++;
    });
  });
  return [sumX / count, sumY / count];
}

interface PNGMapProps {
  wells: Well[];
}

export function PNGMap({ wells }: PNGMapProps) {
  const [, navigate] = useLocation();
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const provinceStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; danger: number; warning: number; safe: number }
    > = {};
    wells.forEach((w) => {
      if (!w.province) return;
      if (!stats[w.province]) {
        stats[w.province] = { total: 0, danger: 0, warning: 0, safe: 0 };
      }
      stats[w.province].total += 1;
      if (w.status === "danger") stats[w.province].danger += 1;
      else if (w.status === "warning") stats[w.province].warning += 1;
      else stats[w.province].safe += 1;
    });
    return stats;
  }, [wells]);

  function fillForProvince(name: string): string {
    const stat = provinceStats[name];
    if (!stat || stat.total === 0) return "hsl(var(--muted))";
    if (stat.danger > 0) return "hsl(var(--destructive) / 0.85)";
    if (stat.warning > 0) return "hsl(var(--warning) / 0.85)";
    return "hsl(var(--safe) / 0.7)";
  }

  function handleProvinceClick(name: string) {
    navigate(`/?province=${encodeURIComponent(name)}`);
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl"
        role="img"
        aria-label="Map of Papua New Guinea provinces"
      >
        {/* Subtle ocean grid */}
        <defs>
          <pattern id="oceanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/5"
            />
          </pattern>
        </defs>
        <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#oceanGrid)" />

        {/* Province polygons */}
        <g>
          {data.features.map((feature) => {
            const name = feature.properties.name;
            const path = featureToPath(feature);
            const isHovered = hoveredProvince === name;
            const stat = provinceStats[name];
            const hasWells = stat && stat.total > 0;

            return (
              <path
                key={name}
                d={path}
                fill={fillForProvince(name)}
                stroke={isHovered ? "hsl(var(--primary))" : "white"}
                strokeWidth={isHovered ? 2 : 0.7}
                className={`transition-all duration-150 ${
                  hasWells ? "cursor-pointer" : "cursor-default"
                }`}
                style={{
                  filter: isHovered ? "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" : "none",
                  opacity: hoveredProvince && !isHovered ? 0.7 : 1,
                }}
                onMouseEnter={() => setHoveredProvince(name)}
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() => hasWells && handleProvinceClick(name)}
                data-testid={`province-${name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <title>
                  {name}
                  {stat
                    ? ` — ${stat.total} well${stat.total > 1 ? "s" : ""} (${stat.danger} danger, ${stat.warning} warning, ${stat.safe} safe)`
                    : " — no wells registered"}
                </title>
              </path>
            );
          })}
        </g>

        {/* Well count badges on provinces with wells */}
        <g>
          {data.features.map((feature) => {
            const name = feature.properties.name;
            const stat = provinceStats[name];
            if (!stat || stat.total === 0) return null;
            const [cx, cy] = centroid(feature);
            return (
              <g key={`badge-${name}`} className="pointer-events-none">
                <circle
                  cx={cx}
                  cy={cy}
                  r={11}
                  fill="white"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-bold"
                  style={{ fontSize: "12px", fill: "hsl(var(--primary))" }}
                >
                  {stat.total}
                </text>
              </g>
            );
          })}
        </g>

        {/* Compass / North indicator */}
        <g transform={`translate(${VIEW_WIDTH - 70}, 50)`} className="pointer-events-none">
          <circle r={26} fill="white" stroke="hsl(var(--border))" strokeWidth={1} opacity={0.9} />
          <text textAnchor="middle" dominantBaseline="central" y={-8} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}>N</text>
          <polygon points="0,-2 -5,8 0,4 5,8" fill="hsl(var(--primary))" />
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--destructive) / 0.85)" }} />
          Danger detected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--warning) / 0.85)" }} />
          Warning
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--safe) / 0.7)" }} />
          All safe
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-muted border border-border" />
          No wells yet
        </span>
        <span className="ml-auto italic text-[11px]">
          Click any coloured province to view its wells
        </span>
      </div>
    </div>
  );
}
