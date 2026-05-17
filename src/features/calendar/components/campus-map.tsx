"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import type { Feature, FeatureCollection, LineString } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

const CAMPUS_CENTER = { lat: 9.31196, lng: 123.30341 };
const DEFAULT_ZOOM = 17;
const OPENFREEMAP_BRIGHT_STYLE = "https://tiles.openfreemap.org/styles/bright";
const OFFICE_MARKER_COLOR = "#2563eb";

type Coordinate = [number, number];
type LucideIconNode = [
  tag: string,
  attrs: Record<string, string | number>,
][];
type OfficeIcon = "office" | "executive";

type OfficeMarker = {
  name: string;
  coordinates: Coordinate;
  icon: OfficeIcon;
};

export type ApprovalSegmentStatus = "completed" | "active" | "pending" | "declined";

export type ApprovalMapSegment = {
  fromStage: string;
  toStage: string;
  status: ApprovalSegmentStatus;
};

const OFFICE_ICON_NODE: LucideIconNode = [
  [
    "path",
    {
      d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
    },
  ],
  ["path", { d: "M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" }],
  ["path", { d: "M10 6h4" }],
  ["path", { d: "M10 10h4" }],
  ["path", { d: "M10 14h4" }],
  ["path", { d: "M10 18h4" }],
];

const EXECUTIVE_ICON_NODE: LucideIconNode = [
  ["line", { x1: "3", x2: "21", y1: "22", y2: "22" }],
  ["line", { x1: "6", x2: "6", y1: "18", y2: "11" }],
  ["line", { x1: "10", x2: "10", y1: "18", y2: "11" }],
  ["line", { x1: "14", x2: "14", y1: "18", y2: "11" }],
  ["line", { x1: "18", x2: "18", y1: "18", y2: "11" }],
  ["polygon", { points: "12 2 20 7 4 7" }],
];

const OFFICE_ICON_NODES: Record<OfficeIcon, LucideIconNode> = {
  office: OFFICE_ICON_NODE,
  executive: EXECUTIVE_ICON_NODE,
};

const OFFICE_MARKERS: OfficeMarker[] = [
  {
    name: "Dean's Office",
    // approximate — adjust coordinates to exact location
    coordinates: [123.30450, 9.31100],
    icon: "executive",
  },
  {
    name: "Student Director",
    coordinates: [123.30398850703229, 9.3113711420119],
    icon: "office",
  },
  {
    name: "Vice President for Academic Affairs",
    coordinates: [123.3041304, 9.3116859],
    icon: "office",
  },
  {
    name: "Vice President for Student Affairs and Services",
    coordinates: [123.303428, 9.312699],
    icon: "office",
  },
  {
    name: "Vice President for Administration and Finance",
    coordinates: [123.302958, 9.31228],
    icon: "office",
  },
  {
    name: "Vice President for Research, Development and Extension",
    coordinates: [123.3037066, 9.3124115],
    icon: "office",
  },
  {
    name: "Campus Director",
    coordinates: [123.302491, 9.312067],
    icon: "executive",
  },
  {
    name: "University President",
    coordinates: [123.3027185, 9.3115999],
    icon: "executive",
  },
];

// Maps normalized stage keys to their map coordinates [lng, lat].
const STAGE_COORDS: Record<string, Coordinate> = {
  dean: [123.30450, 9.31100],
  student_director: [123.30398850703229, 9.3113711420119],
  vpaa: [123.3041304, 9.3116859],
  vpsas: [123.303428, 9.312699],
  vpaf: [123.302958, 9.31228],
  vprde: [123.3037066, 9.3124115],
  campus_director: [123.302491, 9.312067],
  university_president: [123.3027185, 9.3115999],
};

const STATUS_COLORS: Record<ApprovalSegmentStatus, string> = {
  completed: "#16a34a",
  active: "#d97706",
  pending: "#9ca3af",
  declined: "#dc2626",
};

// Cycles through these dasharray frames to produce a flowing animation on the active segment.
const DASH_ANIM_SEQUENCE: number[][] = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
];

function normalizeStageKey(stage: string): string {
  return stage.toLowerCase().replace(/-/g, "_");
}

function buildGeoJSONFeatures(
  segments: ApprovalMapSegment[],
): FeatureCollection<LineString> {
  const features = segments
    .map((seg): Feature<LineString> | null => {
      const from = STAGE_COORDS[normalizeStageKey(seg.fromStage)];
      const to = STAGE_COORDS[normalizeStageKey(seg.toStage)];
      if (!from || !to) return null;
      return {
        type: "Feature",
        properties: { status: seg.status },
        geometry: { type: "LineString", coordinates: [from, to] },
      };
    })
    .filter((f): f is Feature<LineString> => f !== null);

  return { type: "FeatureCollection", features };
}

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const createSvgIcon = (icon: OfficeIcon) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", OFFICE_MARKER_COLOR);
  svg.setAttribute("stroke-width", "2.25");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("lucide");

  for (const [tag, attrs] of OFFICE_ICON_NODES[icon]) {
    const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attrs)) {
      child.setAttribute(name, String(value));
    }
    svg.appendChild(child);
  }

  return svg;
};

const createOfficeMarkerElement = ({ icon, name }: OfficeMarker) => {
  const marker = document.createElement("div");
  marker.style.width = "34px";
  marker.style.height = "34px";
  marker.style.display = "flex";
  marker.style.alignItems = "center";
  marker.style.justifyContent = "center";
  marker.style.borderRadius = "9999px";
  marker.style.border = `2px solid ${OFFICE_MARKER_COLOR}`;
  marker.style.backgroundColor = "white";
  marker.style.boxShadow = "0 8px 18px rgba(15, 23, 42, 0.22)";
  marker.style.cursor = "pointer";
  marker.setAttribute("title", name);
  marker.setAttribute("aria-label", name);

  marker.appendChild(createSvgIcon(icon));

  return marker;
};

export default function CampusMap({
  approvalSegments = [],
}: {
  approvalSegments?: ApprovalMapSegment[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mapLoadedRef = useRef(false);
  // Holds the latest segments so the map `load` handler can read the current value.
  const segmentsRef = useRef(approvalSegments);

  useEffect(() => {
    segmentsRef.current = approvalSegments;
  }, [approvalSegments]);

  // Update the GeoJSON source whenever the segments prop changes after the map has loaded.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    const source = map.getSource("approval-path") as GeoJSONSource | undefined;
    source?.setData(buildGeoJSONFeatures(approvalSegments));
  }, [approvalSegments]);

  // Initialise the map once on mount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    mapRef.current?.remove();

    const map = new maplibregl.Map({
      container: el,
      style: OPENFREEMAP_BRIGHT_STYLE,
      center: [CAMPUS_CENTER.lng, CAMPUS_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      attributionControl: {
        compact: true,
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
      "top-left",
    );

    map.scrollZoom.disable();
    mapRef.current = map;

    OFFICE_MARKERS.forEach((office) => {
      new maplibregl.Marker({
        element: createOfficeMarkerElement(office),
        anchor: "bottom",
      })
        .setLngLat(office.coordinates)
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(
            `<div style="min-width:170px">
              <p style="font-weight:600;font-size:13px;margin:0;color:#111827">${escapeHtml(office.name)}</p>
            </div>`,
          ),
        )
        .addTo(map);
    });

    map.on("load", () => {
      mapLoadedRef.current = true;

      map.addSource("approval-path", {
        type: "geojson",
        data: buildGeoJSONFeatures(segmentsRef.current),
      });

      // Solid coloured lines for completed, active, and declined segments.
      map.addLayer({
        id: "approval-line-solid",
        type: "line",
        source: "approval-path",
        filter: [
          "in",
          ["get", "status"],
          ["literal", ["completed", "active", "declined"]],
        ],
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "completed",
            STATUS_COLORS.completed,
            "active",
            STATUS_COLORS.active,
            "declined",
            STATUS_COLORS.declined,
            STATUS_COLORS.pending,
          ],
          "line-width": 2.5,
          "line-opacity": 0.9,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // Dashed grey lines for segments not yet reached.
      map.addLayer({
        id: "approval-line-pending",
        type: "line",
        source: "approval-path",
        filter: ["==", ["get", "status"], "pending"],
        paint: {
          "line-color": STATUS_COLORS.pending,
          "line-width": 1.5,
          "line-opacity": 0.45,
          "line-dasharray": [3, 3],
        },
        layout: { "line-cap": "butt", "line-join": "round" },
      });

      // White animated dashes overlaid on the active segment to show flow direction.
      map.addLayer({
        id: "approval-line-active",
        type: "line",
        source: "approval-path",
        filter: ["==", ["get", "status"], "active"],
        paint: {
          "line-color": "#ffffff",
          "line-width": 2.5,
          "line-opacity": 0.75,
          "line-dasharray": DASH_ANIM_SEQUENCE[0],
        },
        layout: { "line-cap": "butt", "line-join": "round" },
      });

      // Arrow symbols placed along each non-pending line to show direction of travel.
      map.addLayer({
        id: "approval-arrows",
        type: "symbol",
        source: "approval-path",
        filter: ["!=", ["get", "status"], "pending"],
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 80,
          "text-field": "▶",
          "text-size": 10,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
          "text-keep-upright": false,
        },
        paint: {
          "text-color": [
            "match",
            ["get", "status"],
            "completed",
            STATUS_COLORS.completed,
            "active",
            "#ffffff",
            "declined",
            STATUS_COLORS.declined,
            STATUS_COLORS.pending,
          ],
          "text-opacity": 0.9,
        },
      });

      // Animate the active segment by cycling through dasharray frames.
      let step = 0;
      const animate = (timestamp: number) => {
        const newStep =
          Math.floor((timestamp / 50) % DASH_ANIM_SEQUENCE.length);
        if (newStep !== step) {
          step = newStep;
          map.setPaintProperty(
            "approval-line-active",
            "line-dasharray",
            DASH_ANIM_SEQUENCE[step],
          );
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    });

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative isolate z-0 h-full w-full overflow-hidden"
    />
  );
}
