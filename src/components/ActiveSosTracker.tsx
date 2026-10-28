import React from 'react';
import type { SosIncident } from '../types';

interface ActiveSosTrackerProps {
  incident: SosIncident;
  onCancelIncident: (id: string) => void;
}

const STEPS = [
  { key: 'Reported', label: 'Reported', desc: 'Alert logged' },
  { key: 'Acknowledged', label: 'Acknowledged', desc: 'Control room verified' },
  { key: 'Responder Dispatched', label: 'Worker Assigned', desc: 'En route to you' },
  { key: 'Resolved', label: 'Resolved', desc: 'Assistance complete' },
];

export const ActiveSosTracker: React.FC<ActiveSosTrackerProps> = ({
  incident,
  onCancelIncident,
}) => {
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Reported':
        return 0;
      case 'Acknowledged':
        return 1;
      case 'Responder Dispatched':
        return 2;
      case 'Resolved':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(incident.status);

  return (
    <div className="bg-white border-2 border-red-500/80 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                Emergency Request Active: {incident.category}
              </h3>
              <span className="rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider text-[11px] font-mono bg-red-100 text-red-800 border border-red-300">
                {incident.id}
              </span>
            </div>
            <p className="font-medium text-charcoal-500 text-xs mt-0.5">
              Submitted at <span className="tabular-nums font-semibold text-charcoal-800">{incident.timestamp}</span> • Location: {incident.landmark}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onCancelIncident(incident.id)}
          className="bg-sand-100 hover:bg-sand-200 text-charcoal-800 border border-stone-300 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm"
        >
          {incident.status === 'Resolved' ? 'Dismiss Card' : 'Cancel Request'}
        </button>
      </div>

      {/* 4-Step Progress Stepper (Card layout) */}
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            let cardBg = 'bg-sand-50 border-stone-200 text-charcoal-400';
            let dotColor = 'bg-stone-400';
            let textColor = 'text-charcoal-600';

            if (isCompleted) {
              cardBg = 'bg-olive-50 border-olive-300 text-olive-800';
              dotColor = 'bg-olive-700';
              textColor = 'text-olive-900';
            } else if (isCurrent) {
              cardBg = 'bg-red-50 border-red-300 text-red-900 shadow-sm';
              dotColor = 'bg-red-600';
              textColor = 'text-red-900 font-bold';
            }

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border flex flex-col gap-1 transition-all duration-200 ${cardBg}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className={`text-xs font-bold ${textColor}`}>
                    {idx + 1}. {step.label}
                  </span>
                </div>
                <span className="font-normal text-charcoal-600 text-xs">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Responder ETA & Instructions */}
      <div className="bg-sand-50 rounded-2xl p-4 sm:p-5 border border-olive-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] text-olive-700 block">
            Response Status
          </span>
          <div className="text-sm font-bold text-charcoal-900 mt-0.5">
            {incident.assignedResponder
              ? `${incident.assignedResponder} is en route to your position.`
              : 'Control room is assigning the nearest on-duty sector responder...'}
          </div>
          {incident.responderEtaMinutes && (
            <div className="text-xs text-olive-800 font-bold mt-1.5 bg-olive-100/70 inline-block px-3 py-1 rounded-full border border-olive-300">
              Estimated arrival: ~<span className="tabular-nums">{incident.responderEtaMinutes}</span> minutes (<span className="tabular-nums">{incident.responderDistanceMeters}</span> meters away)
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="font-semibold text-charcoal-500 text-xs block">Emergency Helpline:</span>
            <a href="tel:1920" className="font-bold text-red-600 text-sm tabular-nums hover:underline">
              1920 (Free Call)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
