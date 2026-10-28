import React from 'react';
import type { RouteCalculationResult } from '../types';

interface NavigationPanelProps {
  destinations: { id: string; label: string; category: string; distanceMeters: number }[];
  selectedDestinationId: string;
  activeRoute: RouteCalculationResult | null;
  avoidCongestion: boolean;
  onSelectDestination: (destId: string) => void;
  onToggleAvoidCongestion: () => void;
  onClearRoute: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destinations,
  selectedDestinationId,
  activeRoute,
  avoidCongestion,
  onSelectDestination,
  onToggleAvoidCongestion,
  onClearRoute,
}) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-card flex flex-col gap-4 font-sans">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block mb-0.5">
            Navigation Assistant
          </span>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Find Safest Pathway
          </h2>
        </div>
        {activeRoute && (
          /* Action Tier 3: Secondary HUD Dock Action */
          <button
            onClick={onClearRoute}
            className="bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
          >
            Clear Route
          </button>
        )}
      </div>

      {/* Destination Selector: Action Tier 3 Container */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destination-select" className="font-medium text-slate-400 text-xs">
          Where do you want to go?
        </label>
        <div className="relative">
          <select
            id="destination-select"
            value={selectedDestinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            className="w-full bg-[#111827] text-slate-200 border border-slate-700/60 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white focus:border-slate-400 rounded-2xl px-3.5 py-2.5 text-sm font-sans focus:outline-none transition-colors cursor-pointer appearance-none"
          >
            <option value="" className="bg-[#111827] text-slate-400">Choose a camp, ghat, or help desk...</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#111827] text-slate-200">
                {d.label} ({d.distanceMeters} m away)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Congestion Avoidance Toggle: Secondary HUD Dock Action */}
      <div className="bg-[#111827] border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white">
            Avoid Crowded Corridors
          </div>
          <div className="font-normal text-slate-200 text-xs mt-0.5">
            Bypasses closed Pontoon Bridge 2 via East Steps Safe Corridor.
          </div>
        </div>
        <button
          onClick={onToggleAvoidCongestion}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
            avoidCongestion ? 'bg-blue-600' : 'bg-slate-800'
          }`}
          role="switch"
          aria-checked={avoidCongestion}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-150 ease-in-out ${
              avoidCongestion ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Route Calculation Details */}
      {activeRoute ? (
        <div className="border border-slate-800/80 rounded-2xl p-4 bg-[#0B0F19] flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-[#111827] p-3 rounded-xl border border-slate-700/60">
              <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block">
                Walking Distance
              </span>
              <span className="text-xl font-semibold text-white tracking-tight tabular-nums font-sans">
                {activeRoute.totalDistanceMeters} <span className="font-normal text-slate-200 text-xs">meters</span>
              </span>
            </div>

            <div className="bg-[#111827] p-3 rounded-xl border border-slate-700/60">
              <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block">
                Estimated Time
              </span>
              <span className="text-xl font-semibold text-blue-400 tracking-tight tabular-nums font-sans">
                {activeRoute.estimatedMinutes} <span className="font-normal text-slate-200 text-xs">min walk</span>
              </span>
            </div>
          </div>

          {activeRoute.isSafeBypass && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
              <span className="font-medium uppercase tracking-wider text-[11px] text-amber-300 block mb-0.5">
                Safe Corridor Active
              </span>
              <span className="font-normal text-slate-200 text-xs">
                Direct Pontoon Bridge path is closed. You are safely routed through East Steps (Route A).
              </span>
            </div>
          )}

          {/* Turn-by-turn guidance */}
          <div>
            <span className="font-medium text-slate-400 text-xs block mb-2">
              Route Directions:
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {activeRoute.waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-[#111827] p-2.5 rounded-xl border border-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-[10px] text-white shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-normal text-slate-200 text-xs">{wp.instruction}</span>
                  </div>
                  <span className="font-medium text-slate-400 text-xs tabular-nums shrink-0 ml-2">{wp.distanceMeters} m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-800 rounded-2xl p-4 text-center font-normal text-slate-200 text-xs">
          Select a destination above or click any map pin to draw the shortest safe walking route.
        </div>
      )}
    </div>
  );
};
