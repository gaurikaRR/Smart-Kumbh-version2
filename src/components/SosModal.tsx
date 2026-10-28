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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-charcoal-900 shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold uppercase tracking-wider text-[11px] mb-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Emergency Response
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">
              Request Rapid Assistance
            </h2>
            <p className="font-normal text-charcoal-600 text-sm leading-relaxed mt-1">
              Immediately transmits your live coordinates to the nearest Mela sector response team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-charcoal-700 hover:text-charcoal-900 border border-stone-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Auto-Captured GPS & Landmark Field */}
          <div className="bg-sand-50 border border-olive-900/10 rounded-2xl p-4 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px] text-olive-800 block mb-1.5">
              Your Current Telemetry
            </span>
            <div className="flex flex-col gap-1.5 text-charcoal-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal-500 text-xs">GPS Coordinates:</span>
                <strong className="text-charcoal-900 font-bold tabular-nums bg-white px-2 py-0.5 rounded border border-stone-200">
                  {userLocation[0].toFixed(5)}° N, {userLocation[1].toFixed(5)}° E
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal-500 text-xs">Nearest Landmark:</span>
                <span className="font-bold text-charcoal-900">{nearestLandmark}</span>
              </div>
            </div>
          </div>

          {/* Emergency Category Options */}
          <div>
            <label className="font-bold text-charcoal-800 text-xs block mb-2">
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
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-red-600 bg-red-50 text-charcoal-900 shadow-sm ring-1 ring-red-500/30'
                        : 'bg-white text-charcoal-700 border-stone-200 hover:border-olive-600/40 hover:bg-sand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-charcoal-900">
                        {cat.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </div>
                    <p className="font-normal text-charcoal-600 text-xs leading-relaxed">
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="notes" className="font-bold text-charcoal-800 text-xs block mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Sitting on Ghat steps near Flagpole 4, wearing a yellow kurta."
              rows={2}
              className="w-full bg-sand-50 border border-stone-300 rounded-2xl p-3 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-olive-800 focus:bg-white transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-sand-100 hover:bg-sand-200 text-charcoal-800 border border-stone-300 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold tracking-wide py-3 px-6 rounded-full text-xs uppercase border border-red-500 shadow-sm transition-all duration-200 cursor-pointer text-center"
            >
              Send Emergency Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
