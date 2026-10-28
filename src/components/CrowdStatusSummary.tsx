import React from 'react';
import type { CrowdZone } from '../types';

interface CrowdStatusSummaryProps {
  zones: CrowdZone[];
  onSelectZone: (zoneId: string) => void;
}

export const CrowdStatusSummary: React.FC<CrowdStatusSummaryProps> = ({
  zones,
  onSelectZone,
}) => {
  return (
    <section className="bg-[#242D23] border border-[#2D382B] rounded-xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D382B] pb-4">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#D4A373] block mb-0.5">
            Sector Safety Advisory
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight font-heading">
            Current Ghat & Sector Crowd Levels
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[#9EABA0] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse"></span>
          <span>Refreshed continuously via aerial and field telemetry</span>
        </div>
      </div>

      {/* Grid of Sector Crowd Levels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {zones.map((zone) => {
          let badgeClass = 'bg-[#1C241B] text-emerald-400 border-emerald-500/30';
          let levelText = 'Normal Flow';
          let borderAccent = 'border-[#2D382B] bg-[#1C241B]';

          if (zone.status === 'amber') {
            badgeClass = 'bg-[#1C241B] text-[#D4A373] border-[#D4A373]/40';
            levelText = 'Moderate Crowd';
            borderAccent = 'border-[#2D382B] bg-[#1C241B]';
          } else if (zone.status === 'red') {
            badgeClass = 'bg-red-950/60 text-red-300 border-red-500/40';
            levelText = 'Severe Congestion';
            borderAccent = 'border-red-500/30 bg-[#1C241B]';
          }

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`p-4 rounded-lg border ${borderAccent} shadow-sm card-interactive cursor-pointer flex flex-col justify-between gap-3.5`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeClass}`}>
                    {levelText}
                  </span>
                  <span className="text-[#728570] text-[11px] tabular-nums font-mono">
                    {zone.lastUpdated}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight font-heading">
                  {zone.name}
                </h3>
                <p className="text-xs text-[#9EABA0] mt-1">
                  {zone.densityLabel}
                </p>
              </div>

              <div>
                <div className="text-[11px] text-[#E2E8F0] bg-[#242D23] p-2.5 rounded-md border border-[#2D382B] leading-relaxed">
                  {zone.advisory}
                </div>
                <div className="flex items-center justify-end text-[11px] font-semibold text-[#D4A373] mt-2">
                  View Sector on Map
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route B Alert Callout */}
      <div className="bg-[#1C241B] border border-red-500/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#FF4D4D] text-white font-bold flex items-center justify-center shrink-0 text-xs">
            !
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-300">
              Travel Advisory: Route B (Pontoon Bridge 2) Closed
            </h4>
            <p className="text-[#E2E8F0] text-xs leading-relaxed mt-0.5">
              Pontoon Bridge 2 is temporarily closed due to severe crowd volume. Pilgrims are safely routed through East Steps Safe Corridor (Route A).
            </p>
          </div>
        </div>
        <span className="font-semibold uppercase tracking-wider text-[10px] text-red-300 bg-red-950/60 px-3 py-1 rounded border border-red-500/40 shrink-0 self-start sm:self-center">
          Police Notice
        </span>
      </div>
    </section>
  );
};
