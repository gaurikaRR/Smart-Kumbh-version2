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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-slate-200 shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-500/30 font-medium uppercase tracking-wider text-[11px] mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Emergency Help
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Request Immediate Assistance
            </h2>
            <p className="font-normal text-slate-200 text-sm leading-relaxed mt-1">
              Transmits your coordinates directly to the nearest Mela sector response team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60 flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Auto-Captured GPS & Landmark Field */}
          <div className="bg-[#111827] border border-slate-700/60 rounded-2xl p-3.5 text-xs">
            <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block mb-1">
              Your Current Telemetry
            </span>
            <div className="flex flex-col gap-1 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-400 text-xs">GPS Coordinates:</span>
                <strong className="text-white font-medium tabular-nums">{userLocation[0].toFixed(5)}° N, {userLocation[1].toFixed(5)}° E</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-400 text-xs">Nearest Landmark:</span>
                <span className="font-medium text-white">{nearestLandmark}</span>
              </div>
            </div>
          </div>

          {/* Emergency Category Options: Action Tier 3 */}
          <div>
            <label className="font-medium text-slate-400 text-xs block mb-2">
              Select What You Need Help With:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-red-500 bg-red-950/50 text-white shadow-sm'
                        : 'bg-[#111827] text-slate-200 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">
                        {cat.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    <p className="font-normal text-slate-300 text-xs leading-relaxed">
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="notes" className="font-medium text-slate-400 text-xs block mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Sitting on Ghat steps near Flagpole 4, wearing a yellow kurta."
              rows={2}
              className="w-full bg-[#111827] border border-slate-700/60 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Action Tier 1 & Action Tier 3 Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60 px-5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold tracking-wide py-3 px-6 rounded-full text-xs uppercase border border-red-500/40 shadow-sm transition-colors cursor-pointer text-center"
            >
              Send Emergency Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
