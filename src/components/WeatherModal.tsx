import React from 'react';
import type { WeatherAdvisory } from '../types';

interface WeatherModalProps {
  isOpen: boolean;
  weather: WeatherAdvisory;
  onClose: () => void;
}

const HOURLY_FORECAST = [
  { time: '16:00 IST', temp: 24, humidity: 48, condition: 'Clear Sky', wind: '9 km/h', crowdRisk: 'Normal' },
  { time: '17:00 IST', temp: 23, humidity: 52, condition: 'Mild Breeze', wind: '8 km/h', crowdRisk: 'Rising' },
  { time: '18:00 IST', temp: 21, humidity: 58, condition: 'Sunset Aarti Peak', wind: '6 km/h', crowdRisk: 'High (Sangam Ghat)' },
  { time: '19:00 IST', temp: 19, humidity: 64, condition: 'Cool Night', wind: '5 km/h', crowdRisk: 'Moderate' },
  { time: '20:00 IST', temp: 18, humidity: 68, condition: 'Clear & Chilly', wind: '5 km/h', crowdRisk: 'Dispersing' },
];

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  weather,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#242D23] border border-[#2D382B] rounded-xl max-w-2xl w-full p-6 text-[#E2E8F0] shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2D382B] pb-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1C241B] text-[#D4A373] border border-[#2D382B] font-medium uppercase tracking-wider text-[11px] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
              Prayagraj Triveni Sangam Telemetry
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight font-heading">
              Weather & Environmental Advisory
            </h2>
            <p className="text-xs text-[#9EABA0] mt-0.5">
              Live meteorological sensors across Sangam Ghat, Pontoon Corridors, and Sector 4.
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

        {/* Current Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-[#1C241B] p-3.5 rounded-lg border border-[#2D382B]">
            <span className="text-[11px] font-medium text-[#9EABA0] uppercase tracking-wider block">Temperature</span>
            <div className="text-2xl font-bold text-white tabular-nums mt-1">{weather.temperatureC}°C</div>
            <span className="text-[10px] text-[#728570]">Feels like 25°C</span>
          </div>

          <div className="bg-[#1C241B] p-3.5 rounded-lg border border-[#2D382B]">
            <span className="text-[11px] font-medium text-[#9EABA0] uppercase tracking-wider block">Relative Humidity</span>
            <div className="text-2xl font-bold text-white tabular-nums mt-1">{weather.humidityPercent}%</div>
            <span className="text-[10px] text-[#728570]">Optimal Comfort</span>
          </div>

          <div className="bg-[#1C241B] p-3.5 rounded-lg border border-[#2D382B]">
            <span className="text-[11px] font-medium text-[#9EABA0] uppercase tracking-wider block">Wind Speed</span>
            <div className="text-2xl font-bold text-white tabular-nums mt-1">{weather.windSpeedKmh} <span className="text-xs font-normal">km/h</span></div>
            <span className="text-[10px] text-[#728570]">North-Easterly</span>
          </div>

          <div className="bg-[#1C241B] p-3.5 rounded-lg border border-[#2D382B]">
            <span className="text-[11px] font-medium text-[#9EABA0] uppercase tracking-wider block">Precipitation Risk</span>
            <div className="text-2xl font-bold text-[#D4A373] tabular-nums mt-1">{weather.rainLikelihoodPercent}%</div>
            <span className="text-[10px] text-[#728570]">Dry Ground Conditions</span>
          </div>
        </div>

        {/* Operational Field Advisory */}
        <div className="bg-[#1C241B] border border-[#2D382B] rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2D382B] text-[#D4A373] border border-[#3D4A3C]">
              Field Advisory
            </span>
            <span className="text-xs font-semibold text-white">River Current & Evacuation Clearance</span>
          </div>
          <p className="text-xs text-[#E2E8F0] leading-relaxed">
            {weather.operationalAdvisory}
          </p>
        </div>

        {/* Hourly Forecast Table */}
        <div className="border border-[#2D382B] rounded-lg overflow-hidden mb-5">
          <div className="bg-[#1C241B] px-3.5 py-2 border-b border-[#2D382B] flex items-center justify-between text-xs font-semibold text-white">
            <span>Hourly Kumbh Horizon Forecast</span>
            <span className="text-[11px] text-[#9EABA0] font-normal">Prayagraj Observatory</span>
          </div>
          <div className="divide-y divide-[#2D382B] max-h-48 overflow-y-auto">
            {HOURLY_FORECAST.map((item, idx) => (
              <div key={idx} className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-[#1C241B]/60 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white text-[11px]">{item.time}</span>
                  <span className="text-[#9EABA0]">{item.condition}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold tabular-nums">{item.temp}°C</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded text-xs font-medium border ${
                    item.crowdRisk.startsWith('High') 
                      ? 'bg-red-950/60 text-red-300 border-red-500/40' 
                      : item.crowdRisk.startsWith('Rising')
                      ? 'bg-amber-950/60 text-[#D4A373] border-[#D4A373]/40'
                      : 'bg-[#1C241B] text-[#9EABA0] border-[#2D382B]'
                  }`}>
                    {item.crowdRisk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2D382B] text-xs">
          <span className="text-[11px] text-[#728570]">
            Emergency Weather Control Room: 1920
          </span>
          <button
            onClick={onClose}
            className="bg-[#1C241B] hover:bg-[#2D382B] text-white border border-[#2D382B] px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
