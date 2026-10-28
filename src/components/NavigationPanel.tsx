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
    <div className="bg-white border border-olive-900/10 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans transition-all duration-300">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-olive-700 block mb-1">
            Navigation Assistant
          </span>
          <h2 className="text-xl font-bold text-charcoal-900 tracking-tight">
            Find Safest Pathway
          </h2>
        </div>
        {activeRoute && (
          <button
            onClick={onClearRoute}
            className="bg-sand-100 hover:bg-sand-200 text-charcoal-700 hover:text-charcoal-900 border border-stone-300 px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 shadow-sm"
          >
            Clear Route
          </button>
        )}
      </div>

      {/* Destination Selector: Card Container */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destination-select" className="font-semibold text-charcoal-700 text-xs flex items-center justify-between">
          <span>Choose Target Camp, Ghat, or Facility</span>
          <span className="text-[11px] text-olive-600 font-normal">Auto-routes safe corridor</span>
        </label>
        <div className="relative">
          <select
            id="destination-select"
            value={selectedDestinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            className="w-full bg-sand-50 text-charcoal-900 border border-stone-300 hover:border-olive-600 focus:border-olive-800 focus:bg-white rounded-2xl px-4 py-3 text-sm font-sans focus:outline-none transition-all duration-200 cursor-pointer appearance-none shadow-sm font-medium"
          >
            <option value="" className="text-charcoal-400">Select a destination...</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="text-charcoal-800">
                {d.label} • ({d.distanceMeters} m away)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-olive-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Congestion Avoidance Toggle Card */}
      <div className="bg-sand-100/90 border border-olive-900/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:bg-sand-100">
        <div>
          <div className="text-xs font-bold text-charcoal-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-olive-700"></span>
            Dynamic Congestion Bypass
          </div>
          <div className="font-normal text-charcoal-600 text-xs mt-0.5 leading-relaxed">
            Automatically reroutes around closed Pontoon Bridge 2 via East Steps Safe Corridor.
          </div>
        </div>
        <button
          onClick={onToggleAvoidCongestion}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
            avoidCongestion ? 'bg-olive-800' : 'bg-stone-300'
          }`}
          role="switch"
          aria-checked={avoidCongestion}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              avoidCongestion ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Route Calculation Details */}
      {activeRoute ? (
        <div className="border border-olive-900/10 rounded-2xl p-4 bg-sand-50 flex flex-col gap-3.5 shadow-sm">
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-charcoal-500 block">
                Total Distance
              </span>
              <span className="text-xl font-bold text-charcoal-900 tracking-tight tabular-nums font-sans">
                {activeRoute.totalDistanceMeters} <span className="font-normal text-charcoal-500 text-xs">meters</span>
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-olive-700 block">
                Estimated Time
              </span>
              <span className="text-xl font-bold text-olive-800 tracking-tight tabular-nums font-sans">
                {activeRoute.estimatedMinutes} <span className="font-normal text-charcoal-500 text-xs">min walk</span>
              </span>
            </div>
          </div>

          {activeRoute.isSafeBypass && (
            <div className="bg-gold-50/90 border border-gold-400/50 rounded-xl p-3.5 text-xs text-charcoal-900 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-gold-600 animate-pulse"></span>
                <span className="font-bold uppercase tracking-wider text-[11px] text-gold-700">
                  Safe Corridor Active
                </span>
              </div>
              <span className="font-normal text-charcoal-700 text-xs leading-relaxed block">
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
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-800 border border-olive-300 hover:border-olive-600 p-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 shadow-sm group"
            >
              <svg className="w-4 h-4 text-olive-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Open in Google Maps (Live Voice Walking Navigation)</span>
              <span className="transition-transform group-hover:translate-x-1">↗</span>
            </a>
          )}

          {/* Turn-by-turn guidance */}
          <div>
            <span className="font-semibold text-charcoal-700 text-xs block mb-2">
              Step-by-Step Directions:
            </span>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {activeRoute.waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-stone-200/90 shadow-sm hover:border-olive-600/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-olive-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-charcoal-800 text-xs">{wp.instruction}</span>
                  </div>
                  <span className="font-semibold text-olive-700 text-xs tabular-nums shrink-0 ml-2 bg-sand-100 px-2 py-0.5 rounded-full">
                    {wp.distanceMeters} m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-stone-300 rounded-2xl p-6 text-center font-medium text-charcoal-500 text-xs bg-sand-50/50">
          Select a destination above or click any map pin to draw the shortest safe walking route.
        </div>
      )}
    </div>
  );
};
