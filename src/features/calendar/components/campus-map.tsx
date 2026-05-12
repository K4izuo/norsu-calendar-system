"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Asset } from "@/features/calendar/services/reservation-service";

const CAMPUS_CENTER: L.LatLngTuple = [9.3108, 123.3082];
const DEFAULT_ZOOM = 18;

const createDotIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  });

const createPinIcon = () =>
  L.divIcon({
    className: "",
    html: `<svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 10.5 12 24 12 24s12-13.5 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });

const getVenuePosition = (index: number, total: number): L.LatLngTuple => {
  if (total <= 1) return [CAMPUS_CENTER[0] + 0.0002, CAMPUS_CENTER[1] + 0.0002];
  const angle = (index / total) * 2 * Math.PI - Math.PI / 4;
  const radius = 0.00042;
  return [
    CAMPUS_CENTER[0] + radius * Math.cos(angle),
    CAMPUS_CENTER[1] + radius * Math.sin(angle),
  ];
};

export type VenueData = {
  asset: Asset;
  activeCount: number;
  pendingCount: number;
};

interface CampusMapProps {
  venues: VenueData[];
}

export default function CampusMap({ venues }: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clean up any stale Leaflet instance — handles React StrictMode double-mount
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    delete (el as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;

    const map = L.map(el, {
      center: CAMPUS_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Campus boundary circle
    L.circle(CAMPUS_CENTER, {
      radius: 100,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: "5 5",
    }).addTo(map);

    // Main campus pin
    L.marker(CAMPUS_CENTER, { icon: createPinIcon() })
      .bindPopup(
        `<div style="min-width:150px">
          <p style="font-weight:600;font-size:13px;margin:0">NORSU Campus</p>
          <p style="font-size:11px;color:#6b7280;margin:2px 0 0">Dumaguete City, Negros Oriental</p>
        </div>`,
      )
      .addTo(map);

    // Venue markers
    venues.forEach((venue, i) => {
      const pos = getVenuePosition(i, venues.length);
      const dotColor =
        venue.activeCount > 0 ? "#22c55e" :
          venue.pendingCount > 0 ? "#f59e0b" :
            "#94a3b8";

      const statusLine =
        venue.activeCount > 0
          ? `<p style="font-size:11px;color:#16a34a;margin:5px 0 0;font-weight:500">${venue.activeCount} active reservation${venue.activeCount !== 1 ? "s" : ""}</p>`
          : venue.pendingCount > 0
            ? `<p style="font-size:11px;color:#d97706;margin:5px 0 0;font-weight:500">${venue.pendingCount} pending</p>`
            : `<p style="font-size:11px;color:#9ca3af;margin:5px 0 0">No active reservations</p>`;

      L.marker(pos, { icon: createDotIcon(dotColor) })
        .bindPopup(
          `<div style="min-width:155px">
            <p style="font-weight:600;font-size:13px;margin:0">${venue.asset.asset_name}</p>
            <p style="font-size:11px;color:#6b7280;margin:2px 0 0">Capacity: ${venue.asset.capacity}</p>
            ${statusLine}
          </div>`,
        )
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [venues]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
