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
    <section className="bg-white border border-olive-900/10 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-olive-700 block mb-1">
            Sector Safety Advisory
          </span>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">
            Current Ghat & Sector Crowd Levels
          </h2>
        </div>
        <div className="flex items-center gap-2 text-charcoal-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse"></span>
          <span>Continuously refreshed via drone & field sensors</span>
        </div>
      </div>

      {/* Grid of Sector Crowd Levels (Card-driven 4-col architecture) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let levelText = 'Normal Flow';
          let borderAccent = 'border-stone-200/90 bg-white hover:border-olive-600/40';

          if (zone.status === 'amber') {
            badgeClass = 'bg-gold-50 text-gold-800 border-gold-300';
            levelText = 'Moderate Crowd';
            borderAccent = 'border-gold-300/80 bg-white hover:border-gold-500';
          } else if (zone.status === 'red') {
            badgeClass = 'bg-red-50 text-red-700 border-red-200';
            levelText = 'Severe Congestion';
            borderAccent = 'border-red-300/80 bg-red-50/20 hover:border-red-500';
          }

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`group p-5 rounded-2xl border ${borderAccent} shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider text-[11px] ${badgeClass}`}>
                    {levelText}
                  </span>
                  <span className="font-semibold text-charcoal-500 text-xs tabular-nums bg-sand-100 px-2 py-0.5 rounded-md">
                    {zone.lastUpdated}
                  </span>
                </div>
                <h3 className="text-base font-bold text-charcoal-900 tracking-tight group-hover:text-olive-800 transition-colors">
                  {zone.name}
                </h3>
                <p className="font-medium text-charcoal-600 text-sm mt-1">
                  {zone.densityLabel}
                </p>
              </div>

              <div>
                <div className="font-normal text-charcoal-700 text-xs bg-sand-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                  {zone.advisory}
                </div>
                <div className="flex items-center justify-end text-[11px] font-bold text-olive-700 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <span>View on map</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route B Alert Callout with Olive & Amber framing */}
      <div className="bg-sand-100/90 border border-gold-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-md">
            !
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-700">
              Travel Advisory: Route B (Pontoon Bridge 2) Closed
            </h4>
            <p className="font-normal text-charcoal-700 text-sm leading-relaxed mt-0.5">
              Pontoon Bridge is temporarily closed due to severe crowd volume. Pilgrims are advised to use East Safe Corridor (Route A) via East Steps.
            </p>
          </div>
        </div>
        <span className="font-bold uppercase tracking-wider text-[11px] text-olive-900 bg-sand-200 px-3.5 py-1.5 rounded-full border border-stone-300 shrink-0 self-start sm:self-center shadow-sm">
          Sector Police Notice
        </span>
      </div>
    </section>
  );
};
