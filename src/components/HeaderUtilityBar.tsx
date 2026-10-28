import React from 'react';
import type { WeatherAdvisory } from '../types';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  getTranslation,
} from '../utils/bhashini';
import type { PilgrimProfile } from '../utils/supabase';

interface HeaderUtilityBarProps {
  weather: WeatherAdvisory;
  freshnessTimestamp: string;
  isSimulatedLocation: boolean;
  gpsAccuracy?: number | null;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenWeatherModal: () => void;
  onOpenAuthModal: () => void;
  pilgrimProfile: PilgrimProfile | null;
  onLogoutPilgrim: () => void;
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
  currentLanguage,
  onSelectLanguage,
  onOpenWeatherModal,
  onOpenAuthModal,
  pilgrimProfile,
  onLogoutPilgrim,
  onRefreshData,
  onToggleLocationMode,
  onRequestSos,
  activeSosCount,
}) => {
  const t = (key: string) => getTranslation(key, currentLanguage);

  return (
    <header className="w-full bg-[#182017] border-b border-[#2D382B] sticky top-0 z-40 rounded-none shadow-card">
      {/* Top Utility Bar */}
      <div className="bg-[#141B13] border-b border-[#2D382B] px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[#9EABA0] font-sans">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1C241B] text-[#D4A373] border border-[#2D382B] font-medium uppercase tracking-wider text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse" />
              {t('live_telemetry')}
            </span>
            <span className="text-[#2D382B]">|</span>
            <span className="font-medium text-[#9EABA0] text-xs">
              {t('last_sync')}:{' '}
              <strong className="text-white font-medium tabular-nums ml-0.5">
                {freshnessTimestamp}
              </strong>
            </span>
            <button
              onClick={onRefreshData}
              className="bg-[#242D23] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] px-2.5 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
              title="Refresh telemetry"
            >
              {t('sync')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* GPS Telemetry Selector */}
            <button
              onClick={onToggleLocationMode}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors border flex items-center gap-1.5 ${
                !isSimulatedLocation
                  ? 'bg-[#1C241B] text-[#D4A373] border-[#D4A373]/60'
                  : 'bg-[#242D23] hover:bg-[#2D382B] text-[#E2E8F0] border-[#2D382B]'
              }`}
              title="Toggle between hardware GPS and Sangam Mela simulation"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isSimulatedLocation ? 'bg-[#D4A373] animate-pulse' : 'bg-[#728570]'}`}></span>
              <span>
                {!isSimulatedLocation
                  ? `Live GPS ${gpsAccuracy ? `(±${Math.round(gpsAccuracy)}m)` : ''}`
                  : 'GPS: Sangam Axis (Demo)'}
              </span>
            </button>
            <span className="text-[#2D382B]">|</span>
            <div className="flex items-center gap-1.5 font-medium text-[#9EABA0] text-xs">
              <span>Helpline:</span>
              <a href="tel:1920" className="text-[#D4A373] hover:underline font-semibold tabular-nums">
                1920 / 112
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Header - High Visibility SMARTKUMBH */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#242D23] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] font-extrabold text-sm shadow-sm font-heading">
            SK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-wider font-heading uppercase">
                SMARTKUMBH
              </span>
              <span className="font-semibold uppercase tracking-wider text-[10px] bg-[#242D23] text-[#D4A373] border border-[#2D382B] rounded-md px-2 py-0.5">
                {t('pilgrim_portal')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2.5">
          {/* Bhashini Indian Language Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
              aria-label="Language selection"
              className="bg-[#242D23] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:border-[#D4A373] transition-colors appearance-none pr-7"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#1C241B] text-[#E2E8F0]">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9EABA0]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Dedicated Weather Modal Trigger */}
          <button
            onClick={onOpenWeatherModal}
            className="inline-flex items-center gap-1.5 bg-[#242D23] hover:bg-[#2D382B] text-[#D4A373] border border-[#2D382B] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]"></span>
            <span>{t('weather')} ({weather.temperatureC}°C)</span>
          </button>

          {/* Pilgrim Authentication Button / Logged-in Profile */}
          {pilgrimProfile ? (
            <div className="flex items-center gap-2 bg-[#242D23] border border-[#2D382B] pl-3 pr-1 py-1 rounded-lg text-xs">
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[110px]">
                  {pilgrimProfile.full_name}
                </span>
                <span className="text-[10px] text-[#D4A373] leading-tight">
                  Age {pilgrimProfile.age} • Verified
                </span>
              </div>
              <button
                onClick={onLogoutPilgrim}
                className="text-[#9EABA0] hover:text-white px-2 py-0.5 rounded text-[10px] hover:bg-[#1C241B] transition-colors"
                title="Sign out of Pilgrim Auth"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-[#242D23] hover:bg-[#2D382B] text-[#E2E8F0] hover:text-white border border-[#2D382B] hover:border-[#D4A373]/50 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
            >
              {t('login_register')}
            </button>
          )}

          {/* Emergency SOS Trigger */}
          <button
            onClick={onRequestSos}
            className="inline-flex items-center gap-1.5 bg-[#FF4D4D] hover:bg-[#E63939] active:bg-[#CC2929] text-white font-bold tracking-wider px-4 py-1.5 rounded-lg text-xs uppercase border border-red-400 shadow-md cursor-pointer transition-all duration-150"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{activeSosCount > 0 ? `${t('active_sos')} (${activeSosCount})` : t('emergency_sos')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
