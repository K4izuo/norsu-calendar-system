"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
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

export default function CampusMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative isolate z-0 h-full w-full overflow-hidden"
    />
  );
}
