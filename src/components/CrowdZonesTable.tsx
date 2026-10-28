import React from 'react';
import type { CrowdZone } from '../types';

interface CrowdZonesTableProps {
  zones: CrowdZone[];
  onSelectZoneOnMap: (zoneId: string) => void;
}

export const CrowdZonesTable: React.FC<CrowdZonesTableProps> = ({
  zones,
  onSelectZoneOnMap,
}) => {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] p-4 sm:p-6 font-sans flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider block">
            Real-Time Surveillance Telemetry
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white uppercase">
            Sector Crowd Density & Status Log
          </h2>
        </div>
        <div className="text-xs font-mono text-[#94A3B8]">
          Source: Sensor Gate Logs & Field Observation
        </div>
      </div>

      {/* Structured Table */}
      <div className="overflow-x-auto border border-[#1E293B]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0A0F1D] text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#1E293B]">
              <th className="p-3">Sector Area</th>
              <th className="p-3">Density Level</th>
              <th className="p-3">Est. Count</th>
              <th className="p-3">Freshness</th>
              <th className="p-3">Sector Advisory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B] text-white">
            {zones.map((zone) => {
              let dotBg = 'bg-emerald-500';
              let badgeText = 'GREEN';
              let badgeClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';

              if (zone.status === 'amber') {
                dotBg = 'bg-amber-500';
                badgeText = 'AMBER';
                badgeClass = 'text-amber-400 bg-amber-950/40 border-amber-500/40';
              } else if (zone.status === 'red') {
                dotBg = 'bg-red-500';
                badgeText = 'RED';
                badgeClass = 'text-red-400 bg-red-950/40 border-red-500/40';
              }

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZoneOnMap(zone.id)}
                  className="hover:bg-[#1E293B]/60 transition-none cursor-pointer"
                >
                  <td className="p-3 font-bold font-sans">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 ${dotBg} shrink-0`}></span>
                      <span className="text-white">{zone.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 border text-[10px] font-bold ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {zone.estimatedPeople.toLocaleString()} <span className="text-[10px] text-[#94A3B8] font-normal">people</span>
                  </td>
                  <td className="p-3 font-mono text-[#94A3B8]">
                    {zone.lastUpdated}
                  </td>
                  <td className="p-3 text-[#CBD5E1] text-[11px] max-w-xs">
                    {zone.advisory}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Route Warning Banner from presentation: "Route warning: Route B restricted. Use Route A via the east steps." */}
      <div className="bg-[#7F1D1D]/20 border-l-4 border-red-600 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-red-400 font-bold uppercase font-mono block text-[10px]">
            Active Restriction Notice
          </span>
          <span className="text-white font-medium">
            Route B (Pontoon Bridge 2) is closed due to severe crowd buildup. Divert to East Safe Corridor (Route A via east steps).
          </span>
        </div>
        <span className="font-mono text-red-300 text-[11px] shrink-0">
          Enforced by Mela Police
        </span>
      </div>
    </div>
  );
};
