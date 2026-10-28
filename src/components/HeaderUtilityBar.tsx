import React from 'react';
import type { WeatherAdvisory } from '../types';

interface HeaderUtilityBarProps {
  weather: WeatherAdvisory;
  freshnessTimestamp: string;
  isSimulatedLocation: boolean;
  onRefreshData: () => void;
  onToggleLocationMode: () => void;
  onRequestSos: () => void;
  activeSosCount: number;
}

export const HeaderUtilityBar: React.FC<HeaderUtilityBarProps> = ({
  weather,
  freshnessTimestamp,
  isSimulatedLocation,
  onRefreshData,
  onToggleLocationMode,
  onRequestSos,
  activeSosCount,
}) => {
  return (
    <header className="w-full bg-olive-800 border-b border-olive-900/40 sticky top-0 z-40 shadow-soft">
      {/* Top Utility Strip */}
      <div className="bg-olive-950 border-b border-olive-900/60 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-sand-300 font-sans">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-olive-900/80 text-gold-400 border border-gold-500/30 font-medium uppercase tracking-wider text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-olive-700">|</span>
            <span className="font-medium text-sand-300 text-xs">
              Last Sync:{' '}
              <strong className="text-white font-medium tabular-nums ml-0.5">
                {freshnessTimestamp}
              </strong>
            </span>
            {/* Secondary Action Tier: Sync */}
            <button
              onClick={onRefreshData}
              className="bg-olive-900 hover:bg-olive-800 text-sand-200 hover:text-white border border-olive-700/60 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
              title="Refresh telemetry"
            >
              Sync
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Secondary Action Tier: GPS Source Selector */}
            <button
              onClick={onToggleLocationMode}
              className="bg-olive-900 hover:bg-olive-800 text-sand-200 hover:text-white border border-olive-700/60 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
              title="Toggle GPS source"
            >
              GPS: <span className="text-gold-400 font-semibold">{isSimulatedLocation ? 'Sangam Axis (Mela Demo)' : 'Device Hardware'}</span>
            </button>
            <span className="text-olive-700">|</span>
            <div className="flex items-center gap-1.5 font-medium text-sand-300 text-xs">
              <span>Helpline:</span>
              <a href="tel:1920" className="text-gold-400 hover:text-gold-300 font-semibold tabular-nums">
                1920 / 112
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-olive-900 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold text-sm shadow-md">
            SK
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-white tracking-tight font-sans">
                Smart Kumbh
              </span>
              <span className="font-semibold uppercase tracking-wider text-[11px] bg-olive-900/90 text-gold-400 border border-gold-500/30 rounded-full px-2.5 py-0.5 shadow-sm">
                Pilgrim Safety Portal
              </span>
            </div>
            <p className="font-normal text-sand-200 text-xs hidden sm:block mt-0.5">
              Triveni Sangam Crowd Safety & Intelligent Safe-Pathway System
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Secondary Action Tier: Language Switcher Dock */}
          <div className="hidden sm:flex items-center gap-1 bg-olive-900/80 p-1 rounded-full border border-olive-700/60 text-xs">
            <span className="px-3 py-1 rounded-full bg-olive-700 text-white font-semibold shadow-sm">
              English
            </span>
            <span className="px-3 py-1 rounded-full text-sand-200 hover:bg-olive-800 hover:text-white transition-colors cursor-pointer font-medium">
              हिंदी
            </span>
          </div>

          {/* Action Tier 1: Critical Danger / Emergency SOS Action */}
          <button
            onClick={onRequestSos}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold tracking-wide px-5 py-2.5 rounded-full text-xs uppercase border border-red-400/40 shadow-card cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{activeSosCount > 0 ? `Active SOS (${activeSosCount})` : 'Emergency SOS'}</span>
          </button>
        </div>
      </div>

      {/* Live Weather & Environmental Strip */}
      <div className="bg-olive-900/90 border-t border-olive-900/60 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-sand-200 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sand-300 text-xs">Temperature:</span>
              <span className="font-semibold text-white tabular-nums">{weather.temperatureC}°C</span>
            </div>
            <span className="text-olive-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sand-300 text-xs">Humidity:</span>
              <span className="font-medium text-white tabular-nums">{weather.humidityPercent}%</span>
            </div>
            <span className="text-olive-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sand-300 text-xs">Wind:</span>
              <span className="font-medium text-white tabular-nums">{weather.windSpeedKmh} km/h</span>
            </div>
            <span className="text-olive-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sand-300 text-xs">Rain Risk:</span>
              <span className="font-medium text-white tabular-nums">{weather.rainLikelihoodPercent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 font-semibold uppercase tracking-wider text-[11px]">
              Advisory
            </span>
            <span className="font-medium text-sand-100 text-xs truncate max-w-xl">
              {weather.operationalAdvisory}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
