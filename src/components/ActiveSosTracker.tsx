import React from 'react';
import type { SosIncident } from '../types';
import { getGoogleMapsPinUrl, getWhatsAppShareLocationUrl } from '../utils/googleMaps';

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
  const googleMapsUrl = getGoogleMapsPinUrl(incident.coordinates);
  const whatsAppShareUrl = getWhatsAppShareLocationUrl(
    incident.coordinates,
    `KUMBH EMERGENCY SOS (ID: ${incident.id}) - Category: ${incident.category}. Nearest landmark: ${incident.landmark}. Location link:`
  );

  return (
    <div className="bg-[#0F172A] border-2 border-red-500/80 rounded-3xl p-5 sm:p-6 shadow-card flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Your Emergency Request: {incident.category}
              </h3>
              <span className="rounded-full px-2.5 py-0.5 font-medium uppercase tracking-wider text-[11px] font-mono bg-red-950/60 text-red-300 border border-red-500/40">
                {incident.id}
              </span>
            </div>
            <p className="font-medium text-slate-400 text-xs mt-0.5">
              Submitted at <span className="tabular-nums text-slate-300">{incident.timestamp}</span> • Location: {incident.landmark}
            </p>
          </div>
        </div>

        <button
          onClick={() => onCancelIncident(incident.id)}
          className="bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
        >
          {incident.status === 'Resolved' ? 'Dismiss Card' : 'Cancel Request'}
        </button>
      </div>

      {/* 4-Step Progress Stepper */}
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            let cardBg = 'bg-[#111827] border-slate-700/60 text-slate-400';
            let dotColor = 'bg-slate-500';
            let textColor = 'text-slate-300';

            if (isCompleted) {
              cardBg = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
              dotColor = 'bg-emerald-400';
              textColor = 'text-emerald-300';
            } else if (isCurrent) {
              cardBg = 'bg-red-950/50 border-red-500/60 text-red-200';
              dotColor = 'bg-red-500';
              textColor = 'text-red-200';
            }

            return (
              <div
                key={step.key}
                className={`p-3 rounded-2xl border flex flex-col gap-1 transition-colors ${cardBg}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className={`text-xs font-semibold ${textColor}`}>
                    {idx + 1}. {step.label}
                  </span>
                </div>
                <span className="font-normal text-slate-300 text-xs">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Responder ETA, Google Maps & WhatsApp Action Bar */}
      <div className="bg-[#111827] rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-medium uppercase tracking-wider text-[11px] text-slate-400 block">
            Response Status
          </span>
          <div className="text-sm font-semibold text-white mt-0.5">
            {incident.assignedResponder
              ? `${incident.assignedResponder} is en route to your position.`
              : 'Control room is assigning the nearest on-duty sector responder...'}
          </div>
          {incident.responderEtaMinutes && (
            <div className="text-xs text-blue-400 font-semibold mt-1">
              Estimated arrival: ~<span className="tabular-nums">{incident.responderEtaMinutes}</span> minutes (<span className="tabular-nums">{incident.responderDistanceMeters}</span> meters away)
            </div>
          )}
        </div>

        {/* Free Deep-Link Integration Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0F172A] hover:bg-slate-800 text-blue-300 hover:text-white border border-blue-500/40 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Google Maps Pin ↗</span>
          </a>

          <a
            href={whatsAppShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Share via WhatsApp ↗</span>
          </a>

          <div className="text-right border-l border-slate-700/60 pl-3">
            <span className="font-medium text-slate-400 text-xs block">Helpline:</span>
            <span className="font-semibold text-white text-xs tabular-nums">1920</span>
          </div>
        </div>
      </div>
    </div>
  );
};
