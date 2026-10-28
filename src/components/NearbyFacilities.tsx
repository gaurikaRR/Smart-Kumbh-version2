import React, { useState } from 'react';
import type { Facility } from '../types';

interface NearbyFacilitiesProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  onNavigateToFacility: (facilityId: string) => void;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  facilities,
  selectedFacilityId,
  onNavigateToFacility,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredFacilities = facilities.filter((f) => {
    if (filterType === 'all') return true;
    if (filterType === 'medical') return f.type === 'medical';
    if (filterType === 'helpdesk') return f.type === 'helpdesk' || f.type === 'lost_found';
    if (filterType === 'water_exit') return f.type === 'water' || f.type === 'exit';
    return true;
  });

  return (
    <section className="bg-[#0F172A] border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans">
      {/* Header and Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block mb-0.5">
            Public Services Directory
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Nearby Emergency & Support Facilities
          </h2>
        </div>

        {/* Action Tier 3: Secondary / Floating HUD Dock Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'medical', label: 'Medical Camps' },
            { id: 'helpdesk', label: 'Help Desks' },
            { id: 'water_exit', label: 'Water & Exits' },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
                  isActive
                    ? 'border-slate-400 bg-slate-800 text-white font-medium'
                    : 'bg-[#111827] text-slate-200 font-medium hover:bg-slate-800 hover:text-white border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => {
          const isSelected = facility.id === selectedFacilityId;

          let badgeColor = 'bg-blue-950/40 text-blue-300 border-blue-500/30';
          let tagText = 'Facility';

          if (facility.type === 'medical') {
            badgeColor = 'bg-red-950/40 text-red-300 border-red-500/30';
            tagText = 'Medical';
          } else if (facility.type === 'lost_found') {
            badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
            tagText = 'Help Desk';
          } else if (facility.type === 'water') {
            badgeColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30';
            tagText = 'Water & ORS';
          } else if (facility.type === 'exit') {
            badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30';
            tagText = 'Exit Gate';
          }

          return (
            <div
              key={facility.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-colors ${
                isSelected
                  ? 'border-blue-500/80 bg-slate-850 bg-[#162032] shadow-sm'
                  : 'border-slate-800/80 bg-[#111827] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wider text-[11px] ${badgeColor}`}>
                    {tagText}
                  </span>
                  <span className="font-medium text-emerald-400 text-xs">
                    {facility.operationalStatus}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">
                  {facility.name}
                </h3>
                <p className="font-medium text-slate-400 text-xs mt-0.5">
                  {facility.landmark}
                </p>
                <p className="font-normal text-slate-200 text-sm leading-relaxed mt-2.5">
                  {facility.details}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5 mt-1">
                <span className="font-medium text-slate-400 text-xs">
                  Distance: <strong className="text-white font-semibold tabular-nums">{facility.distanceMeters} m</strong>
                </span>

                {/* Action Tier 2: Primary Safe Navigation & Route Selection Action */}
                <button
                  onClick={() => onNavigateToFacility(facility.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-400 shadow-sm'
                      : 'bg-white text-slate-950 hover:bg-slate-100 active:bg-slate-200 border-slate-300'
                  }`}
                >
                  {isSelected ? 'Route Active' : 'Get Directions'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
