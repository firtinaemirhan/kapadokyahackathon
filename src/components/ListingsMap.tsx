import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "@/lib/sample-listings";
import { DEFAULT_BUYER } from "@/lib/sample-listings";
import { calculateRouteDistance } from "@/lib/api-client";

interface BuyerLocation {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  listings: Listing[];
  highlightId?: string;
  onSelect?: (id: string) => void;
  showRouteTo?: Listing | null;
  className?: string;
  fixedView?: { center: [number, number]; zoom: number };
  showBuyer?: boolean;
  buyerLocation?: BuyerLocation;
}

export function ListingsMap({
  listings,
  highlightId,
  onSelect,
  showRouteTo,
  className,
  fixedView,
  showBuyer = true,
  buyerLocation,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [routeState, setRouteState] = useState<{
    points: [number, number][];
    source: string;
    dynamic: boolean;
  } | null>(null);

  // Effective buyer position — prefer passed prop, fall back to DEFAULT_BUYER
  const buyer = buyerLocation ?? DEFAULT_BUYER;
  const buyerLabel = buyerLocation?.label ?? DEFAULT_BUYER.city;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [38.625, 34.636],
      zoom: 9,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers whenever listings, buyer, or highlight changes
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (showBuyer) {
      const buyerIcon = L.divIcon({
        className: "tortu-pin",
        html: `<div style="width:20px;height:20px;border-radius:4px;background:var(--cave);border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
        iconSize: [20, 20],
      });
      L.marker([buyer.lat, buyer.lng], { icon: buyerIcon })
        .bindPopup(`<b>Alıcı Konumu</b><br/>${buyerLabel}`)
        .addTo(layer);
    }

    listings.forEach((l) => {
      const isActive = l.id === highlightId;
      const icon = L.divIcon({
        className: "tortu-pin",
        html: `<div class="tortu-pin-dot" style="${isActive ? "transform:scale(1.4);" : ""}"></div>`,
        iconSize: [18, 18],
      });
      const marker = L.marker([l.lat, l.lng], { icon })
        .bindPopup(
          `<b>${l.title}</b><br/><span style="color:#666">${l.city} · ${l.tonnage} ton</span>`,
        )
        .addTo(layer);
      marker.on("click", () => onSelect?.(l.id));
    });

    if (!fixedView && listings.length) {
      const bounds = L.latLngBounds([
        ...(showBuyer ? ([[buyer.lat, buyer.lng]] as [number, number][]) : []),
        ...listings.map((l) => [l.lat, l.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (fixedView) {
      map.setView(fixedView.center, fixedView.zoom);
    }
  }, [listings, highlightId, onSelect, fixedView, showBuyer, buyer.lat, buyer.lng, buyerLabel]);

  // Route calculation — re-runs when buyer location or target listing changes
  useEffect(() => {
    let active = true;
    setRouteState(null);

    if (!showRouteTo) return;

    // Map "buyer" vehicle type to "truck" for routing purposes; ORS only knows road vehicles
    const routeMode =
      showRouteTo.vehicle === "buyer" || showRouteTo.vehicle === "van"
        ? "truck"
        : showRouteTo.vehicle;

    calculateRouteDistance({
      from: [buyer.lng, buyer.lat],
      to: [showRouteTo.lng, showRouteTo.lat],
      mode: routeMode,
      includeGeometry: true,
    })
      .then((route) => {
        if (!active) return;
        const points = route.routeGeometry?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [
          [buyer.lat, buyer.lng],
          [showRouteTo.lat, showRouteTo.lng],
        ];
        setRouteState({ points, source: route.source, dynamic: route.dynamic });
      })
      .catch(() => {
        if (!active) return;
        setRouteState({
          points: [
            [buyer.lat, buyer.lng],
            [showRouteTo.lat, showRouteTo.lng],
          ],
          source: "fallback",
          dynamic: false,
        });
      });

    return () => {
      active = false;
    };
  }, [showRouteTo, buyer.lat, buyer.lng]);

  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!showRouteTo) return;
    if (!routeState) return;

    const routeLine = L.polyline(routeState.points, {
      color: "oklch(0.54 0.14 145)",
      weight: 4,
      opacity: 0.86,
      dashArray: routeState.dynamic ? undefined : "8 8",
    }).addTo(layer);

    routeLine.bindPopup(
      routeState.dynamic ? `Gerçek yol rotası · ${routeState.source}` : "Tahmini rota",
    );

    if (map && routeState.dynamic) {
      map.fitBounds(routeLine.getBounds(), { padding: [36, 36], maxZoom: 11 });
    }
  }, [routeState, showRouteTo]);

  const mapClassName = className
    ? `relative z-0 isolate ${className}`
    : "relative z-0 isolate w-full h-full";

  return <div ref={containerRef} className={mapClassName} />;
}
