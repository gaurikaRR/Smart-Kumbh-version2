import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CrowdZone, Facility, RouteCalculationResult } from '../types';
import { NAVIGATION_NODES } from '../data/kumbhData';

interface InteractiveMapProps {
  userLocation: [number, number];
  crowdZones: CrowdZone[];
  facilities: Facility[];
  selectedFacilityId: string | null;
  activeRoute: RouteCalculationResult | null;
  showCongestedRouteComparison: boolean;
  onSelectFacility: (facilityId: string) => void;
  onRecenter: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLocation,
  crowdZones,
  facilities,
  selectedFacilityId,
  activeRoute,
  onSelectFacility,
  onRecenter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const userMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const restrictedRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: userLocation,
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 19,
      minZoom: 14,
    });

    // High contrast dark basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    userMarkerGroupRef.current = L.layerGroup().addTo(map);
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    facilitiesLayerGroupRef.current = L.layerGroup().addTo(map);
    restrictedRouteLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerGroupRef.current) return;

    userMarkerGroupRef.current.clearLayers();

    const userIcon = L.divIcon({
      className: 'smart-kumbh-user-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="position: relative; width: 22px; height: 22px;">
            <span style="position: absolute; inset: 0; border-radius: 9999px; background-color: #3B82F6; opacity: 0.5;" class="animate-radar-pulse"></span>
            <span style="position: relative; display: block; width: 20px; height: 20px; border-radius: 9999px; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(37,99,235,0.5);"></span>
          </div>
          <div style="margin-top: 4px; background: #0F172A; color: #FFFFFF; border: 1px solid #334155; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
            You are here
          </div>
        </div>
      `,
      iconSize: [80, 52],
      iconAnchor: [40, 11],
    });

    const marker = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 });
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px;">
        <div style="font-size: 11px; font-weight: 500; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Your Current Location</div>
        <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em; margin-top: 2px;">Main Steps West Corridor</div>
        <div style="font-size: 11px; color: #38BDF8; font-variant-numeric: tabular-nums; margin-top: 4px;">${userLocation[0].toFixed(5)}° N, ${userLocation[1].toFixed(5)}° E</div>
        <div style="font-size: 12px; color: #E2E8F0; margin-top: 4px;">Sector 4 • Sangam Mela Ground</div>
      </div>
    `);

    userMarkerGroupRef.current.addLayer(marker);
  }, [userLocation]);

  // Update Crowd Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !zonesLayerGroupRef.current) return;

    zonesLayerGroupRef.current.clearLayers();

    crowdZones.forEach((zone) => {
      let fillColor = '#10B981';
      let strokeColor = '#059669';
      let badgeBg = 'rgba(16, 185, 129, 0.2)';
      let badgeText = '#6EE7B7';
      let label = 'Low Density';

      if (zone.status === 'amber') {
        fillColor = '#F59E0B';
        strokeColor = '#D97706';
        badgeBg = 'rgba(245, 158, 11, 0.2)';
        badgeText = '#FCD34D';
        label = 'Moderate Density';
      } else if (zone.status === 'red') {
        fillColor = '#EF4444';
        strokeColor = '#DC2626';
        badgeBg = 'rgba(239, 68, 68, 0.2)';
        badgeText = '#FCA5A5';
        label = 'Severe Congestion';
      }

      const polygon = L.polygon(zone.coordinates, {
        color: strokeColor,
        weight: 2,
        opacity: 0.85,
        fillColor: fillColor,
        fillOpacity: 0.22,
      });

      polygon.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${badgeText}; background: ${badgeBg}; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${strokeColor}50;">
              ${label}
            </span>
            <span style="font-size: 11px; color: #94A3B8; font-variant-numeric: tabular-nums;">${zone.lastUpdated}</span>
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em;">${zone.name}</div>
          <div style="font-size: 12px; color: #CBD5E1; margin-top: 3px;">${zone.densityLabel}</div>
          <div style="font-size: 12px; color: #FFFFFF; margin-top: 6px; font-weight: 500;">
            Est. Crowd: <span style="font-variant-numeric: tabular-nums;">${zone.estimatedPeople.toLocaleString()}</span> pilgrims
          </div>
          <div style="font-size: 12px; color: #E2E8F0; margin-top: 6px; padding: 6px 8px; background: #1E293B; border-radius: 8px; border-left: 3px solid ${strokeColor};">
            ${zone.advisory}
          </div>
        </div>
      `);

      zonesLayerGroupRef.current?.addLayer(polygon);

      // Center pill label
      const labelIcon = L.divIcon({
        className: 'zone-center-pill',
        html: `
          <div style="transform: translate(-50%, -50%); pointer-events: none; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
            <div style="display: inline-flex; align-items: center; gap: 4px; background: #111827; color: #F8FAFC; border: 1px solid rgba(51, 65, 85, 0.8); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background-color: ${strokeColor};"></span>
              ${zone.name}
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const centerMarker = L.marker(zone.center, { icon: labelIcon, interactive: false });
      zonesLayerGroupRef.current?.addLayer(centerMarker);
    });
  }, [crowdZones]);

  // Update Restricted Route B
  useEffect(() => {
    if (!mapInstanceRef.current || !restrictedRouteLayerGroupRef.current) return;

    restrictedRouteLayerGroupRef.current.clearLayers();

    const mainStepsCoord = NAVIGATION_NODES.find((n) => n.id === 'main_steps_entrance')!.coordinates;
    const pontoonChokeCoord = NAVIGATION_NODES.find((n) => n.id === 'pontoon_choke_point')!.coordinates;
    const pontoonDeckCoord = NAVIGATION_NODES.find((n) => n.id === 'pontoon_bridge_center')!.coordinates;
    const corridor2Coord = NAVIGATION_NODES.find((n) => n.id === 'east_corridor_2')!.coordinates;

    const restrictedPath = [mainStepsCoord, pontoonChokeCoord, pontoonDeckCoord, corridor2Coord];

    const restrictedPolyline = L.polyline(restrictedPath, {
      color: '#DC2626',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.85,
    });

    restrictedPolyline.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px;">
        <span style="display: inline-block; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(239, 68, 68, 0.4);">
          Route Closed
        </span>
        <div style="font-size: 13px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em; margin-top: 4px;">Route B: Pontoon Bridge 2</div>
        <div style="font-size: 12px; color: #F87171; margin-top: 2px;">
          Severe crowd bottleneck. Access closed to ensure pilgrim safety.
        </div>
        <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">
          Use the designated Safe East Corridor (Route A) instead.
        </div>
      </div>
    `);

    restrictedRouteLayerGroupRef.current.addLayer(restrictedPolyline);

    const closedBadgeIcon = L.divIcon({
      className: 'closed-badge-icon',
      html: `
        <div style="transform: translate(-50%, -50%); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="background: #DC2626; color: #FFFFFF; padding: 3px 8px; border-radius: 9999px; font-size: 9px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 6px rgba(220,38,38,0.4); border: 1px solid #FFFFFF;">
            Route Closed
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const midMarker = L.marker(pontoonDeckCoord, { icon: closedBadgeIcon });
    restrictedRouteLayerGroupRef.current.addLayer(midMarker);
  }, []);

  // Update Facility Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerGroupRef.current) return;

    facilitiesLayerGroupRef.current.clearLayers();

    facilities.forEach((facility) => {
      const isSelected = facility.id === selectedFacilityId;

      let pinColor = '#3B82F6';
      let tagBg = 'rgba(59, 130, 246, 0.2)';
      let tagText = '#93C5FD';
      let typeLabel = 'Help Desk';

      if (facility.type === 'medical') {
        pinColor = '#DC2626';
        tagBg = 'rgba(239, 68, 68, 0.2)';
        tagText = '#FCA5A5';
        typeLabel = 'Medical';
      } else if (facility.type === 'water') {
        pinColor = '#0891B2';
        tagBg = 'rgba(8, 145, 178, 0.2)';
        tagText = '#67E8F9';
        typeLabel = 'Water';
      } else if (facility.type === 'exit') {
        pinColor = '#059669';
        tagBg = 'rgba(16, 185, 129, 0.2)';
        tagText = '#6EE7B7';
        typeLabel = 'Exit';
      }

      const facilityIcon = L.divIcon({
        className: 'smart-kumbh-facility-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
            <div style="width: ${isSelected ? '28px' : '22px'}; height: ${isSelected ? '28px' : '22px'}; border-radius: 9999px; background: #0F172A; border: 2.5px solid ${isSelected ? '#FFFFFF' : pinColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: ${isSelected ? '#FFFFFF' : pinColor};"></div>
            </div>
            <div style="margin-top: 3px; background: #111827; color: #F8FAFC; border: 1px solid rgba(51, 65, 85, 0.8); padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 600; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
              ${facility.name}
            </div>
          </div>
        `,
        iconSize: [60, 42],
        iconAnchor: [30, 11],
      });

      const marker = L.marker(facility.coordinates, { icon: facilityIcon, zIndexOffset: isSelected ? 800 : 400 });

      marker.on('click', () => {
        onSelectFacility(facility.id);
      });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-width: 210px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${tagText}; background: ${tagBg}; padding: 2px 8px; border-radius: 9999px;">
              ${typeLabel}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #34D399;">
              ${facility.operationalStatus}
            </span>
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em; margin-top: 3px;">${facility.name}</div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 2px;">${facility.landmark}</div>
          <div style="font-size: 12px; color: #E2E8F0; margin-top: 6px; padding: 6px 8px; background: #1E293B; border-radius: 8px;">
            ${facility.details}
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #94A3B8;">Distance: <strong style="color: #FFFFFF; font-variant-numeric: tabular-nums;">${facility.distanceMeters} m</strong></span>
            <!-- Action Tier 2: Primary Safe Navigation Action -->
            <button
              id="btn-nav-${facility.id}"
              style="background: #FFFFFF; color: #020617; font-size: 11px; font-weight: 600; border: 1px solid #CBD5E1; padding: 4px 12px; border-radius: 9999px; cursor: pointer; transition: background 0.15s ease;"
            >
              Get Directions
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-nav-${facility.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectFacility(facility.id);
            marker.closePopup();
          };
        }
      });

      facilitiesLayerGroupRef.current?.addLayer(marker);
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  // Update Navigation Route
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerGroupRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    if (!activeRoute || activeRoute.path.length === 0) return;

    const routePolyline = L.polyline(activeRoute.path, {
      color: '#38BDF8',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });

    routePolyline.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px;">
        <span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #38BDF8; background: rgba(56, 189, 248, 0.2); padding: 2px 8px; border-radius: 9999px;">
          ${activeRoute.isSafeBypass ? 'Safe Corridor Bypass (Route A)' : 'Recommended Route'}
        </span>
        <div style="font-size: 14px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em; margin-top: 4px; font-variant-numeric: tabular-nums;">
          ${activeRoute.totalDistanceMeters} m • approx. ${activeRoute.estimatedMinutes} min walk
        </div>
        ${
          activeRoute.blockedZoneAvoided
            ? `<div style="font-size: 12px; color: #FCD34D; margin-top: 4px;">Bypassing heavy crowd congestion at Pontoon Bridge.</div>`
            : ''
        }
      </div>
    `);

    routeLayerGroupRef.current.addLayer(routePolyline);

    // Destination target pin
    const destCoord = activeRoute.path[activeRoute.path.length - 1];
    const destIcon = L.divIcon({
      className: 'dest-target-pin',
      html: `
        <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="width: 18px; height: 18px; border-radius: 9999px; background: #FFFFFF; border: 3px solid #0F172A; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
          <div style="margin-top: 2px; background: #FFFFFF; color: #020617; font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 9999px; white-space: nowrap;">
            Destination
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const destMarker = L.marker(destCoord, { icon: destIcon, zIndexOffset: 950 });
    routeLayerGroupRef.current.addLayer(destMarker);

    const bounds = L.latLngBounds(activeRoute.path);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
  }, [activeRoute]);

  const handleLocateMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userLocation, 17, { duration: 0.8 });
      onRecenter();
    }
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[580px] rounded-3xl overflow-hidden border border-olive-900/10 bg-olive-950 shadow-card">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Legend Pill (Top Left) */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-3.5 shadow-md max-w-xs text-xs font-sans">
        <div className="font-bold text-charcoal-900 tracking-tight mb-2 flex items-center justify-between">
          <span>Crowd Conditions</span>
          <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400">Live</span>
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-charcoal-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Green: Low crowd (North Gate, Rest Area)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span>Amber: Moderate (Main Steps 4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span>Red: Heavy congestion (River Bridge)</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 pt-1 border-t border-slate-700/60">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-red-500 shrink-0"></span>
            <span className="text-red-400 font-medium">Route B: Closed by Police</span>
          </div>
        </div>
      </div>

      {/* Secondary Action Tier: Floating HUD Dock Recenter Action */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleLocateMe}
          className="bg-white hover:bg-sand-100 text-charcoal-800 hover:text-olive-900 border border-stone-300 rounded-full px-4 py-2 text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200"
          title="Recenter to current location"
        >
          <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          <span>Locate Me</span>
        </button>
      </div>

      {/* Active Navigation Summary Bar (Bottom Left) */}
      {activeRoute && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl p-3.5 shadow-lg max-w-sm font-sans">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-white tracking-tight">
              {activeRoute.isSafeBypass ? 'Safe Corridor Active' : 'Shortest Route'}
            </span>
            <span className="font-medium text-blue-400 tabular-nums">
              {activeRoute.totalDistanceMeters} m • {activeRoute.estimatedMinutes} min
            </span>
          </div>
          {activeRoute.blockedZoneAvoided && (
            <p className="font-normal text-amber-300 text-xs mt-1">
              Rerouted away from Pontoon Bridge congestion.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
