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
    <div className="bg-[#242D23] border border-red-500/80 rounded-xl p-5 sm:p-6 shadow-card flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2D382B] pb-3.5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4D4D]"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight font-heading">
                Emergency Request Active: {incident.category}
              </h3>
              <span className="rounded px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] font-mono bg-red-950/60 text-red-300 border border-red-500/40">
                {incident.id}
              </span>
            </div>
            <p className="text-xs text-[#9EABA0] mt-0.5">
              Submitted at <span className="tabular-nums font-medium text-white">{incident.timestamp}</span> • Location: {incident.landmark}
            </p>
          </div>
        </div>

        <button
          onClick={() => onCancelIncident(incident.id)}
          className="bg-[#1C241B] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {incident.status === 'Resolved' ? 'Dismiss Card' : 'Cancel Request'}
        </button>
      </div>

      {/* 4-Step Progress Stepper */}
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            let cardBg = 'bg-[#1C241B] border-[#2D382B] text-[#728570]';
            let dotColor = 'bg-[#3D4A3C]';
            let textColor = 'text-[#9EABA0]';

            if (isCompleted) {
              cardBg = 'bg-[#1C241B] border-emerald-500/40 text-emerald-300';
              dotColor = 'bg-emerald-400';
              textColor = 'text-emerald-300';
            } else if (isCurrent) {
              cardBg = 'bg-[#1C241B] border-red-500/60 text-red-200';
              dotColor = 'bg-[#FF4D4D]';
              textColor = 'text-red-200 font-bold';
            }

            return (
              <div
                key={step.key}
                className={`p-3 rounded-lg border flex flex-col gap-1 transition-colors ${cardBg}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <span className={`text-xs font-semibold ${textColor}`}>
                    {idx + 1}. {step.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#9EABA0]">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Responder ETA, Google Maps & WhatsApp Action Bar */}
      <div className="bg-[#1C241B] rounded-lg p-4 border border-[#2D382B] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9EABA0] block">
            Response Status
          </span>
          <div className="text-sm font-bold text-white mt-0.5">
            {incident.assignedResponder
              ? `${incident.assignedResponder} is en route to your position.`
              : 'Control room is assigning the nearest on-duty sector responder...'}
          </div>
          {incident.responderEtaMinutes && (
            <div className="text-xs text-[#D4A373] font-semibold mt-1">
              Estimated arrival: ~<span className="tabular-nums">{incident.responderEtaMinutes}</span> minutes (<span className="tabular-nums">{incident.responderDistanceMeters}</span> meters away)
            </div>
          )}
        </div>

        {/* Integration Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#242D23] hover:bg-[#2D382B] text-[#D4A373] border border-[#2D382B] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Google Maps Pin</span>
          </a>

          <a
            href={whatsAppShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Share via WhatsApp</span>
          </a>

          <div className="text-right border-l border-[#2D382B] pl-3">
            <span className="text-[#9EABA0] text-[10px] block">Helpline:</span>
            <span className="font-bold text-white text-xs tabular-nums">1920</span>
          </div>
        </div>
      </div>
    </div>
  );
};
