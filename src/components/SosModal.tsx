import React, { useState } from 'react';
import type { SosCategory } from '../types';

interface SosModalProps {
  isOpen: boolean;
  userLocation: [number, number];
  nearestLandmark: string;
  onClose: () => void;
  onSubmitIncident: (category: SosCategory, notes: string) => void;
}

const CATEGORIES: { label: SosCategory; desc: string }[] = [
  {
    label: 'Medical Emergency',
    desc: 'Heat exhaustion, breathing difficulty, injury, fainting, sudden chest pain.',
  },
  {
    label: 'Crowd Surge / Crush Risk',
    desc: 'Overcrowding pressure, barrier blockage, stampede hazard, trapped movement.',
  },
  {
    label: 'Lost Person / Child',
    desc: 'Separated family member, missing child, or stranded elder at ghats.',
  },
  {
    label: 'Physical Assistance',
    desc: 'Mobility support needed, extreme fatigue, hydration collapse, wheelchair aid.',
  },
];

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  userLocation,
  nearestLandmark,
  onClose,
  onSubmitIncident,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SosCategory>('Medical Emergency');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitIncident(selectedCategory, notes);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#242D23] border border-[#2D382B] rounded-xl max-w-lg w-full p-6 text-[#E2E8F0] shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2D382B] pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-950/60 text-red-300 border border-red-500/40 font-bold uppercase tracking-wider text-[11px] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] animate-pulse" />
              Emergency Response Dispatch
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight font-heading">
              Request Immediate Assistance
            </h2>
            <p className="text-xs text-[#9EABA0] mt-0.5">
              Transmits your coordinates directly to the nearest Mela sector rapid response team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1C241B] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Auto-Captured GPS & Landmark Field */}
          <div className="bg-[#1C241B] border border-[#2D382B] rounded-lg p-3.5 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block mb-1">
              Live Coordinate Telemetry
            </span>
            <div className="flex flex-col gap-1 text-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-[#9EABA0]">GPS Fix:</span>
                <strong className="text-white font-mono tabular-nums bg-[#242D23] px-2 py-0.5 rounded border border-[#2D382B]">
                  {userLocation[0].toFixed(5)}° N, {userLocation[1].toFixed(5)}° E
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9EABA0]">Nearest Sector Landmark:</span>
                <span className="font-medium text-white">{nearestLandmark}</span>
              </div>
            </div>
          </div>

          {/* Emergency Category Options */}
          <div>
            <label className="font-medium text-[#9EABA0] text-xs block mb-1.5">
              Select Assistance Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-red-500 bg-red-950/40 text-white shadow-sm'
                        : 'bg-[#1C241B] text-[#9EABA0] border-[#2D382B] hover:border-[#3D4A3C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {cat.label}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#9EABA0] leading-relaxed">
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="notes" className="font-medium text-[#9EABA0] text-xs block mb-1">
              Situation Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Near Flagpole 4, person requires hydration/wheelchair support."
              rows={2}
              className="w-full bg-[#1C241B] border border-[#2D382B] rounded-lg p-3 text-xs text-white placeholder-[#728570] focus:outline-none focus:border-[#D4A373]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2D382B] gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1C241B] hover:bg-[#2D382B] text-white border border-[#2D382B] px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FF4D4D] hover:bg-[#E63939] text-white font-bold tracking-wider py-2.5 px-4 rounded-lg text-xs uppercase border border-red-400 shadow-md transition-colors cursor-pointer text-center"
            >
              Send Emergency Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
