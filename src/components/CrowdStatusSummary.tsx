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
    <section className="bg-[#0F172A] border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
        <div>
          <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block mb-0.5">
            Sector Safety Advisory
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Current Ghat & Sector Crowd Levels
          </h2>
        </div>
        <span className="font-medium text-slate-400 text-xs">
          Updated continuously based on live field observations
        </span>
      </div>

      {/* Grid of Sector Crowd Levels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {zones.map((zone) => {
          let badgeClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30';
          let levelText = 'Normal Flow';
          let borderAccent = 'border-slate-800/80 bg-[#111827]';

          if (zone.status === 'amber') {
            badgeClass = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
            levelText = 'Moderate Crowd';
          } else if (zone.status === 'red') {
            badgeClass = 'bg-red-950/40 text-red-300 border-red-500/30';
            levelText = 'Severe Congestion';
            borderAccent = 'border-red-500/40 bg-red-950/20';
          }

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`p-4 rounded-2xl border ${borderAccent} hover:border-slate-700 transition-colors cursor-pointer flex flex-col justify-between gap-3`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wider text-[11px] ${badgeClass}`}>
                    {levelText}
                  </span>
                  <span className="font-medium text-slate-400 text-xs tabular-nums">
                    {zone.lastUpdated}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {zone.name}
                </h3>
                <p className="font-normal text-slate-200 text-sm mt-1">
                  {zone.densityLabel}
                </p>
              </div>

              <div className="font-normal text-slate-300 text-xs bg-[#0F172A] p-2.5 rounded-xl border border-slate-800/80 mt-1 leading-relaxed">
                {zone.advisory}
              </div>
            </div>
          );
        })}
      </div>

      {/* Route B Alert Callout */}
      <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-semibold flex items-center justify-center shrink-0 text-xs shadow-sm">
            !
          </div>
          <div>
            <h4 className="font-medium uppercase tracking-wider text-[11px] text-red-300">
              Travel Advisory: Route B (Pontoon Bridge 2) Closed
            </h4>
            <p className="font-normal text-slate-200 text-sm leading-relaxed mt-0.5">
              Pontoon Bridge is temporarily closed due to severe crowd volume. Pilgrims are advised to use East Safe Corridor (Route A) via East Steps.
            </p>
          </div>
        </div>
        <span className="font-medium uppercase tracking-wider text-[11px] text-red-300 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/40 shrink-0 self-start sm:self-center">
          Sector Police Notice
        </span>
      </div>
    </section>
  );
};
