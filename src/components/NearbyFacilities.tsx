import React, { useState } from 'react';
import type { Facility } from '../types';
import { getGoogleMapsNavigationUrl } from '../utils/googleMaps';

interface NearbyFacilitiesProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  userLocation: [number, number];
  onNavigateToFacility: (facilityId: string) => void;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  facilities,
  selectedFacilityId,
  userLocation,
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
    <section className="bg-[#242D23] border border-[#2D382B] rounded-xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans">
      {/* Header and Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D382B] pb-4">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#D4A373] block mb-0.5">
            Public Services Directory
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight font-heading">
            Nearby Emergency & Support Facilities
          </h2>
          <p className="text-xs text-[#9EABA0] font-normal mt-0.5">
            Verified medical camps, lost-person desks, water distribution points, and evacuation exits.
          </p>
        </div>

        {/* Filter Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  isActive
                    ? 'border-[#D4A373] bg-[#1C241B] text-[#D4A373] font-semibold'
                    : 'bg-[#1C241B] text-[#9EABA0] hover:text-white border-[#2D382B]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Cards Grid (3-column layout with elevation lift) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => {
          const isSelected = facility.id === selectedFacilityId;
          const googleMapsNav = getGoogleMapsNavigationUrl(userLocation, facility.coordinates, 'walking');

          let badgeColor = 'bg-[#1C241B] text-[#9EABA0] border-[#2D382B]';
          let tagText = 'Facility';

          if (facility.type === 'medical') {
            badgeColor = 'bg-red-950/40 text-red-300 border-red-500/30';
            tagText = 'Medical Triage';
          } else if (facility.type === 'lost_found') {
            badgeColor = 'bg-[#1C241B] text-[#D4A373] border-[#D4A373]/40';
            tagText = 'Help Desk';
          } else if (facility.type === 'water') {
            badgeColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30';
            tagText = 'Water & ORS';
          } else if (facility.type === 'exit') {
            badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30';
            tagText = 'Evacuation Exit';
          }

          return (
            <div
              key={facility.id}
              className={`p-5 rounded-lg border flex flex-col justify-between gap-4 card-interactive cursor-pointer ${
                isSelected
                  ? 'border-[#D4A373] bg-[#1C241B] shadow-md ring-1 ring-[#D4A373]/30'
                  : 'border-[#2D382B] bg-[#1C241B] hover:border-[#3D4A3C]'
              }`}
              onClick={() => onNavigateToFacility(facility.id)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeColor}`}>
                    {tagText}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400">
                    {facility.operationalStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight font-heading">
                  {facility.name}
                </h3>
                <p className="text-xs text-[#D4A373] font-medium mt-0.5">
                  {facility.landmark}
                </p>
                <p className="text-xs text-[#9EABA0] leading-relaxed mt-2.5">
                  {facility.details}
                </p>
              </div>

              <div className="border-t border-[#2D382B] pt-3.5 mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9EABA0]">
                    Distance: <strong className="text-white font-semibold tabular-nums">{facility.distanceMeters} m</strong>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToFacility(facility.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-[#D4A373] text-[#0F130E] border-[#D4A373]'
                        : 'bg-[#242D23] text-white hover:bg-[#2D382B] border-[#2D382B]'
                    }`}
                  >
                    {isSelected ? 'Route Active' : 'Get Directions'}
                  </button>
                </div>

                <a
                  href={googleMapsNav}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 bg-[#242D23] hover:bg-[#2D382B] text-[#D4A373] text-[11px] font-medium py-1.5 rounded-lg border border-[#2D382B] transition-colors"
                >
                  <span>Open in Google Maps Walking Navigation</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
