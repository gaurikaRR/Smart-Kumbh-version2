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
    <section className="bg-white border border-olive-900/10 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6 font-sans">
      {/* Header and Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-olive-700 block mb-1">
            Public Services Directory
          </span>
          <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">
            Nearby Emergency & Support Facilities
          </h2>
          <p className="text-xs text-charcoal-500 font-normal mt-0.5">
            Verified medical camps, lost-person desks, water kiosks, and evacuation routes.
          </p>
        </div>

        {/* Filter Toggles */}
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
                className={`px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'border-olive-800 bg-olive-800 text-white font-semibold shadow-sm'
                    : 'bg-sand-100 text-charcoal-700 font-medium hover:bg-sand-200 hover:text-charcoal-900 border-stone-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Cards Grid (3-column layout with elevation lift & interactive cue) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((facility) => {
          const isSelected = facility.id === selectedFacilityId;

          let badgeColor = 'bg-olive-50 text-olive-800 border-olive-200';
          let tagText = 'Facility';

          if (facility.type === 'medical') {
            badgeColor = 'bg-red-50 text-red-700 border-red-200';
            tagText = 'Medical Triage';
          } else if (facility.type === 'lost_found') {
            badgeColor = 'bg-gold-50 text-gold-700 border-gold-300';
            tagText = 'Help Desk';
          } else if (facility.type === 'water') {
            badgeColor = 'bg-cyan-50 text-cyan-800 border-cyan-200';
            tagText = 'Water & ORS';
          } else if (facility.type === 'exit') {
            badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            tagText = 'Evacuation Exit';
          }

          return (
            <div
              key={facility.id}
              className={`group p-6 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-olive-800 bg-sand-50 shadow-card-hover -translate-y-1 ring-1 ring-olive-800/20'
                  : 'border-stone-200/90 bg-white hover:border-olive-600/40 hover:-translate-y-1 hover:shadow-card-hover'
              }`}
              onClick={() => onNavigateToFacility(facility.id)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider text-[11px] ${badgeColor}`}>
                    {tagText}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    {facility.operationalStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-charcoal-900 tracking-tight group-hover:text-olive-800 transition-colors">
                  {facility.name}
                </h3>
                <p className="font-semibold text-olive-700 text-xs mt-0.5">
                  📍 {facility.landmark}
                </p>
                <p className="font-normal text-charcoal-600 text-sm leading-relaxed mt-3">
                  {facility.details}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200/80 pt-4 mt-1">
                <span className="font-semibold text-charcoal-600 text-xs">
                  Distance: <strong className="text-charcoal-900 font-bold tabular-nums ml-1 bg-sand-100 px-2 py-0.5 rounded-md">{facility.distanceMeters} m</strong>
                </span>

                {/* Primary Safe Navigation Action with interactive arrow cue */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFacility(facility.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 border shadow-sm ${
                    isSelected
                      ? 'bg-olive-800 hover:bg-olive-900 text-white border-olive-900'
                      : 'bg-sand-100 text-olive-900 hover:bg-olive-800 hover:text-white border-stone-300'
                  }`}
                >
                  <span>{isSelected ? 'Route Active' : 'Get Directions'}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
