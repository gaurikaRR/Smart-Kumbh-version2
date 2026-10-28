import React from 'react';
import type { WeatherAdvisory } from '../types';

interface HeaderUtilityBarProps {
  weather: WeatherAdvisory;
  freshnessTimestamp: string;
  isSimulatedLocation: boolean;
  gpsAccuracy: number | null;
  onRefreshData: () => void;
  onToggleLocationMode: () => void;
  onRequestSos: () => void;
  activeSosCount: number;
}

export const HeaderUtilityBar: React.FC<HeaderUtilityBarProps> = ({
  weather,
  freshnessTimestamp,
  isSimulatedLocation,
  gpsAccuracy,
  onRefreshData,
  onToggleLocationMode,
  onRequestSos,
  activeSosCount,
}) => {
  return (
    <header className="w-full bg-[#0F172A] border-b border-slate-800/80 sticky top-0 z-40">
      {/* Top Utility Strip */}
      <div className="bg-[#0B0F19] border-b border-slate-800/60 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-medium uppercase tracking-wider text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-medium text-slate-400 text-xs">
              Last Sync:{' '}
              <strong className="text-white font-medium tabular-nums ml-0.5">
                {freshnessTimestamp}
              </strong>
            </span>
            <button
              onClick={onRefreshData}
              className="bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors"
              title="Refresh telemetry"
            >
              Sync
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Real Hardware GPS vs Simulation Toggle with Live Accuracy */}
            <button
              onClick={onToggleLocationMode}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border flex items-center gap-1.5 ${
                !isSimulatedLocation
                  ? 'bg-blue-950/50 text-blue-300 border-blue-500/60'
                  : 'bg-[#111827] text-slate-200 hover:bg-slate-800 hover:text-white border-slate-700/60'
              }`}
              title="Click to toggle between real hardware device GPS and Sangam Mela simulation"
            >
              <span className={`w-2 h-2 rounded-full ${!isSimulatedLocation ? 'bg-blue-400 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>
                {!isSimulatedLocation
                  ? `Live GPS Fix ${gpsAccuracy ? `(±${Math.round(gpsAccuracy)}m)` : ''}`
                  : 'GPS: Sangam Axis (Demo)'}
              </span>
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-400 text-xs">
              <span>Helpline:</span>
              <a href="tel:1920" className="text-white hover:text-red-400 tabular-nums">
                1920 / 112
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            SK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white tracking-tight font-sans">
                Smart Kumbh
              </span>
              <span className="font-medium uppercase tracking-wider text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-full px-2.5 py-0.5">
                Pilgrim Portal
              </span>
            </div>
            <p className="font-medium text-slate-400 text-xs hidden sm:block mt-0.5">
              Triveni Sangam Crowd Safety & Navigation Assistant
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Dock */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111827] p-1 rounded-full border border-slate-700/60 text-xs">
            <span className="px-3 py-1 rounded-full border-slate-400 bg-slate-800 text-white font-medium shadow-sm">
              English
            </span>
            <span className="px-3 py-1 rounded-full text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer font-medium">
              हिंदी
            </span>
          </div>

          {/* Emergency SOS Trigger Button */}
          <button
            onClick={onRequestSos}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold tracking-wide px-5 py-2.5 rounded-full text-xs uppercase border border-red-500/40 shadow-sm cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{activeSosCount > 0 ? `Active SOS (${activeSosCount})` : 'Emergency SOS'}</span>
          </button>
        </div>
      </div>

      {/* Live Weather & Environmental Strip */}
      <div className="bg-[#0B0F19] border-t border-slate-800/60 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-400 text-xs">Temperature:</span>
              <span className="font-semibold text-white tabular-nums">{weather.temperatureC}°C</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-400 text-xs">Humidity:</span>
              <span className="font-medium text-white tabular-nums">{weather.humidityPercent}%</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-400 text-xs">Wind:</span>
              <span className="font-medium text-white tabular-nums">{weather.windSpeedKmh} km/h</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-400 text-xs">Rain Risk:</span>
              <span className="font-medium text-white tabular-nums">{weather.rainLikelihoodPercent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-500/30 font-medium uppercase tracking-wider text-[11px]">
              Advisory
            </span>
            <span className="font-normal text-slate-200 text-xs truncate max-w-xl">
              {weather.operationalAdvisory}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
