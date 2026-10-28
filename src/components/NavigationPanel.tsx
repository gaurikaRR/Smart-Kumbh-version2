import React from 'react';
import type { RouteCalculationResult } from '../types';
import { getGoogleMapsNavigationUrl } from '../utils/googleMaps';

interface NavigationPanelProps {
  destinations: { id: string; label: string; category: string; distanceMeters: number; coordinates?: [number, number] }[];
  selectedDestinationId: string;
  activeRoute: RouteCalculationResult | null;
  avoidCongestion: boolean;
  userLocation: [number, number];
  onSelectDestination: (destId: string) => void;
  onToggleAvoidCongestion: () => void;
  onClearRoute: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destinations,
  selectedDestinationId,
  activeRoute,
  avoidCongestion,
  userLocation,
  onSelectDestination,
  onToggleAvoidCongestion,
  onClearRoute,
}) => {
  const selectedDest = destinations.find((d) => d.id === selectedDestinationId);
  const destCoords = activeRoute && activeRoute.path.length > 0 ? activeRoute.path[activeRoute.path.length - 1] : selectedDest?.coordinates;
  const googleMapsUrl = destCoords ? getGoogleMapsNavigationUrl(userLocation, destCoords, 'walking') : null;

  return (
    <div className="bg-[#242D23] border border-[#2D382B] rounded-xl p-5 sm:p-6 shadow-card flex flex-col gap-4 font-sans transition-all duration-200">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between border-b border-[#2D382B] pb-3">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#D4A373] block mb-0.5">
            Navigation Assistant
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight font-heading">
            Find Safest Pathway
          </h2>
        </div>
        {activeRoute && (
          <button
            onClick={onClearRoute}
            className="bg-[#1C241B] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Clear Route
          </button>
        )}
      </div>

      {/* Destination Selector: Card Container */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destination-select" className="font-medium text-[#9EABA0] text-xs flex items-center justify-between">
          <span>Choose Target Camp, Ghat, or Facility</span>
          <span className="text-[11px] text-[#728570]">Safe corridor routing</span>
        </label>
        <div className="relative">
          <select
            id="destination-select"
            value={selectedDestinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            className="w-full bg-[#1C241B] text-[#E2E8F0] border border-[#2D382B] hover:border-[#3D4A3C] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs font-sans focus:outline-none transition-colors cursor-pointer appearance-none font-medium pr-8"
          >
            <option value="" className="text-[#728570]">Select a destination...</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="text-[#E2E8F0] bg-[#1C241B]">
                {d.label} ({d.distanceMeters} m away)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9EABA0]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Congestion Avoidance Toggle Card */}
      <div className="bg-[#1C241B] border border-[#2D382B] rounded-lg p-3.5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]"></span>
            Dynamic Congestion Bypass
          </div>
          <div className="text-[#9EABA0] text-[11px] mt-0.5 leading-relaxed">
            Reroutes around closed Pontoon Bridge 2 via East Steps Safe Corridor.
          </div>
        </div>
        <button
          onClick={onToggleAvoidCongestion}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-[#2D382B] transition-colors duration-200 ease-in-out focus:outline-none ${
            avoidCongestion ? 'bg-[#D4A373]' : 'bg-[#141B13]'
          }`}
          role="switch"
          aria-checked={avoidCongestion}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0F130E] shadow-sm transition duration-200 ease-in-out ${
              avoidCongestion ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Route Calculation Details */}
      {activeRoute ? (
        <div className="border border-[#2D382B] rounded-lg p-3.5 bg-[#1C241B] flex flex-col gap-3 shadow-sm">
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-2.5 text-left">
            <div className="bg-[#242D23] p-3 rounded-lg border border-[#2D382B]">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9EABA0] block">
                Total Distance
              </span>
              <span className="text-lg font-bold text-white tracking-tight tabular-nums font-heading">
                {activeRoute.totalDistanceMeters} <span className="font-normal text-[#9EABA0] text-xs">meters</span>
              </span>
            </div>

            <div className="bg-[#242D23] p-3 rounded-lg border border-[#2D382B]">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block">
                Estimated Time
              </span>
              <span className="text-lg font-bold text-[#D4A373] tracking-tight tabular-nums font-heading">
                {activeRoute.estimatedMinutes} <span className="font-normal text-[#9EABA0] text-xs">min walk</span>
              </span>
            </div>
          </div>

          {activeRoute.isSafeBypass && (
            <div className="bg-[#242D23] border border-[#D4A373]/40 rounded-lg p-3 text-xs text-[#E2E8F0]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]"></span>
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#D4A373]">
                  Safe Corridor Active
                </span>
              </div>
              <span className="text-[#9EABA0] text-[11px] leading-relaxed block">
                Direct Pontoon Bridge path is closed. You are safely routed through East Steps (Route A).
              </span>
            </div>
          )}

          {/* Direct Google Maps Voice Walking Navigation Link */}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#242D23] hover:bg-[#2D382B] text-[#D4A373] border border-[#2D382B] p-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[#D4A373]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Open in Google Maps Walking Navigation</span>
            </a>
          )}

          {/* Turn-by-turn guidance */}
          <div>
            <span className="font-semibold text-[#9EABA0] text-xs block mb-2">
              Step-by-Step Directions:
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {activeRoute.waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-[#242D23] p-2.5 rounded-lg border border-[#2D382B]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#1C241B] text-[#D4A373] border border-[#2D382B] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[#E2E8F0] text-xs">{wp.instruction}</span>
                  </div>
                  <span className="font-medium text-[#9EABA0] text-[11px] tabular-nums shrink-0 ml-2">
                    {wp.distanceMeters} m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[#2D382B] rounded-lg p-5 text-center font-normal text-[#9EABA0] text-xs bg-[#1C241B]/40">
          Select a destination above or click any map pin to draw the shortest safe walking route.
        </div>
      )}
    </div>
  );
};
