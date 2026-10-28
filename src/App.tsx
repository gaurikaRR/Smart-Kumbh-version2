import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HeaderUtilityBar } from './components/HeaderUtilityBar';
import { InteractiveMap } from './components/InteractiveMap';
import { NavigationPanel } from './components/NavigationPanel';
import { SosModal } from './components/SosModal';
import { ActiveSosTracker } from './components/ActiveSosTracker';
import { NearbyFacilities } from './components/NearbyFacilities';
import { CrowdStatusSummary } from './components/CrowdStatusSummary';
import { WeatherModal } from './components/WeatherModal';
import { PilgrimAuthModal } from './components/PilgrimAuthModal';
import {
  CROWD_ZONES,
  CRITICAL_FACILITIES,
  INITIAL_WEATHER,
  DEFAULT_USER_LOCATION,
} from './data/kumbhData';
import type {
  CrowdZone,
  WeatherAdvisory,
  SosIncident,
  SosCategory,
  RouteCalculationResult,
} from './types';
import { calculateRoute, getDestinationNodeId, calculateHaversineDistance } from './utils/navigation';
import {
  type SupportedLanguage,
  getTranslation,
} from './utils/bhashini';
import {
  getStoredPilgrimProfile,
  setStoredPilgrimProfile,
  type PilgrimProfile,
} from './utils/supabase';

export const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [isSimulatedLocation, setIsSimulatedLocation] = useState<boolean>(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>(CROWD_ZONES);
  const [weather] = useState<WeatherAdvisory>(INITIAL_WEATHER);
  const [freshnessTimestamp, setFreshnessTimestamp] = useState<string>('15:52 IST');

  // Modals & Authentication State
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pilgrimProfile, setPilgrimProfile] = useState<PilgrimProfile | null>(() => getStoredPilgrimProfile());

  // Language State (Bhashini Pipeline)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const t = (key: string) => getTranslation(key, currentLanguage);

  // Navigation State
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('med-camp-a');
  const [avoidCongestion, setAvoidCongestion] = useState<boolean>(true);
  const [activeRoute, setActiveRoute] = useState<RouteCalculationResult | null>(null);

  // Pilgrim's Individual Active SOS Request
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [mySosIncident, setMySosIncident] = useState<SosIncident | null>({
    id: 'SK-8841-MED',
    category: 'Medical Emergency',
    timestamp: '15:49 IST',
    coordinates: [25.4278, 81.8838],
    landmark: 'Main Steps West Corridor (Near Flag 4)',
    notes: 'Heat exhaustion, pilgrim resting near shaded barrier.',
    status: 'Responder Dispatched',
    assignedResponder: 'Assistance Worker 2 (Field Rapid Response)',
    responderEtaMinutes: 3,
    responderDistanceMeters: 120,
  });

  // Calculate facilities distance from pilgrim's location
  const facilities = useMemo(() => {
    return CRITICAL_FACILITIES.map((fac) => {
      const distance = calculateHaversineDistance(userLocation, fac.coordinates);
      return {
        ...fac,
        distanceMeters: distance,
      };
    }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [userLocation]);

  // Destination options for dropdown with coordinates
  const destinationOptions = useMemo(() => {
    const list: { id: string; label: string; category: string; distanceMeters: number; coordinates: [number, number] }[] = [
      ...facilities.map((f) => ({
        id: f.id,
        label: f.name,
        category: f.type,
        distanceMeters: f.distanceMeters,
        coordinates: f.coordinates,
      })),
      {
        id: 'main-steps',
        label: 'Main Steps (Ghat Steps 4)',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4288, 81.8835]),
        coordinates: [25.4288, 81.8835],
      },
      {
        id: 'rest-area',
        label: 'Rest Area Sector 3',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4255, 81.8805]),
        coordinates: [25.4255, 81.8805],
      },
      {
        id: 'river-bridge',
        label: 'River Bridge (Pontoon 2 - Caution)',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4262, 81.8872]),
        coordinates: [25.4262, 81.8872],
      },
    ];
    return list;
  }, [facilities, userLocation]);

  // Compute Shortest Safe Route
  useEffect(() => {
    if (!selectedDestinationId) {
      setActiveRoute(null);
      return;
    }

    const targetNodeId = getDestinationNodeId(selectedDestinationId);
    const calculated = calculateRoute(userLocation, targetNodeId, avoidCongestion);
    setActiveRoute(calculated);
  }, [selectedDestinationId, avoidCongestion, userLocation]);

  // Continuous Hardware GPS Tracking when Live Mode is active
  useEffect(() => {
    if (isSimulatedLocation) {
      setGpsAccuracy(null);
      return;
    }

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      setIsSimulatedLocation(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setGpsAccuracy(pos.coords.accuracy);
      },
      (err) => {
        console.warn('Live GPS watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulatedLocation]);

  // GPS hardware detection toggle
  const handleToggleLocationMode = useCallback(() => {
    if (isSimulatedLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            setGpsAccuracy(pos.coords.accuracy);
            setIsSimulatedLocation(false);
          },
          () => {
            alert('Hardware location permission denied. Retaining simulated Prayagraj Mela coordinates.');
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    } else {
      setUserLocation(DEFAULT_USER_LOCATION);
      setGpsAccuracy(null);
      setIsSimulatedLocation(true);
    }
  }, [isSimulatedLocation]);

  // Telemetry sync
  const handleRefreshData = useCallback(() => {
    const now = new Date();
    const formatted = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} IST`;
    setFreshnessTimestamp(formatted);

    setCrowdZones((prev) =>
      prev.map((z) => ({
        ...z,
        lastUpdated: formatted,
      }))
    );
  }, []);

  // Pilgrim SOS creation
  const handleCreateSosIncident = (category: SosCategory, notes: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} IST`;
    const randomId = `SK-${Math.floor(1000 + Math.random() * 9000)}-${category.substring(0, 3).toUpperCase()}`;

    const newIncident: SosIncident = {
      id: randomId,
      category,
      timestamp: timeStr,
      coordinates: userLocation,
      landmark: 'Main Steps Sector Axis 4',
      notes,
      status: 'Reported',
    };

    setMySosIncident(newIncident);
    setIsSosModalOpen(false);

    setTimeout(() => {
      setMySosIncident((curr) =>
        curr && curr.id === randomId
          ? {
              ...curr,
              status: 'Acknowledged',
              assignedResponder: 'Sector Coordinator Queue',
            }
          : curr
      );
    }, 3500);

    setTimeout(() => {
      setMySosIncident((curr) =>
        curr && curr.id === randomId
          ? {
              ...curr,
              status: 'Responder Dispatched',
              assignedResponder: 'Assistance Worker 2 (En Route)',
              responderEtaMinutes: 3,
              responderDistanceMeters: 140,
            }
          : curr
      );
    }, 7500);
  };

  const handleCancelSos = (incidentId: string) => {
    if (mySosIncident && mySosIncident.id === incidentId) {
      setMySosIncident(null);
    }
  };

  const handleSelectFacility = (facilityId: string) => {
    setSelectedDestinationId(facilityId);
    const navElem = document.getElementById('navigation-section');
    if (navElem) {
      navElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoutPilgrim = () => {
    setStoredPilgrimProfile(null);
    setPilgrimProfile(null);
  };

  return (
    <div className="min-h-screen bg-[#1C241B] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#D4A373]/20 selection:text-[#D4A373]">
      {/* 1. Top Header & Utility Navigation */}
      <HeaderUtilityBar
        weather={weather}
        freshnessTimestamp={freshnessTimestamp}
        isSimulatedLocation={isSimulatedLocation}
        gpsAccuracy={gpsAccuracy}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        pilgrimProfile={pilgrimProfile}
        onLogoutPilgrim={handleLogoutPilgrim}
        onRefreshData={handleRefreshData}
        onToggleLocationMode={handleToggleLocationMode}
        onRequestSos={() => setIsSosModalOpen(true)}
        activeSosCount={mySosIncident ? 1 : 0}
      />

      {/* 2. Hero Section in Deep Dark Olive Green with Sharp Presentation Outer Edges */}
      <section className="w-full bg-[#182017] text-white border-b border-[#2D382B] pt-12 pb-16 sm:pt-14 sm:pb-18 px-4 sm:px-6 rounded-none relative">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#242D23] text-[#D4A373] border border-[#2D382B] text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                <span>MahaKumbh Prayagraj • Integrated Command & Safety Grid</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
                {t('hero_title')}
              </h1>
              <p className="mt-3.5 text-sm sm:text-base text-[#9EABA0] font-normal leading-relaxed">
                {t('hero_desc')}
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="#navigation-section"
                className="bg-[#D4A373] hover:bg-[#E5B842] text-[#0F130E] font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                {t('nav_safe_pathway')}
              </a>
              <a
                href="#crowd-summary"
                className="bg-[#242D23] hover:bg-[#2D382B] text-[#E2E8F0] border border-[#2D382B] font-medium px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
              >
                {t('sector_conditions')}
              </a>
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-[#FF4D4D] hover:bg-[#E63939] text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                {t('emergency_sos')}
              </button>
            </div>
          </div>

          {/* Enterprise Stats Bar (4 Structured Cards with 8px-12px inner corners) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
            <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-4 shadow-card hover:border-[#D4A373]/40 card-interactive">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block mb-1">
                Monitored Sectors
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums font-heading">
                4 Zones
              </div>
              <span className="text-[#9EABA0] text-[11px] mt-1 block">
                Live sensor & aerial coverage
              </span>
            </div>

            <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-4 shadow-card hover:border-[#D4A373]/40 card-interactive">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block mb-1">
                Corridor Routing
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums font-heading">
                Route A Safe
              </div>
              <span className="text-[#9EABA0] text-[11px] mt-1 block">
                Automatic Pontoon 2 bypass
              </span>
            </div>

            <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-4 shadow-card hover:border-[#D4A373]/40 card-interactive">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block mb-1">
                Support Stations
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums font-heading">
                100% Active
              </div>
              <span className="text-[#9EABA0] text-[11px] mt-1 block">
                Medical, lost-person & ORS
              </span>
            </div>

            <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-4 shadow-card hover:border-[#D4A373]/40 card-interactive">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-[#D4A373] block mb-1">
                Field Triage ETA
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#D4A373] tracking-tight tabular-nums font-heading">
                &lt; 3 mins
              </div>
              <span className="text-[#9EABA0] text-[11px] mt-1 block">
                Assigned on-duty responder
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Overview (3-Column Interactive Grid Cards) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-5 shadow-card hover:border-[#D4A373]/40 card-interactive">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373] block mb-1">
              Path Routing
            </span>
            <h3 className="text-base font-bold text-white tracking-tight font-heading">
              Dynamic Safe-Path Calculation
            </h3>
            <p className="text-[#9EABA0] text-xs leading-relaxed mt-1.5">
              Graph-based calculation routes pilgrims away from bottlenecked pontoon bridges directly to their holy destination.
            </p>
          </div>

          <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-5 shadow-card hover:border-[#D4A373]/40 card-interactive">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373] block mb-1">
              Facility Locator
            </span>
            <h3 className="text-base font-bold text-white tracking-tight font-heading">
              Verified Essential Services
            </h3>
            <p className="text-[#9EABA0] text-xs leading-relaxed mt-1.5">
              Locate medical camps, help desks, water distribution, and evacuation exit corridors with walking distance telemetry.
            </p>
          </div>

          <div className="bg-[#242D23] border border-[#2D382B] rounded-lg p-5 shadow-card hover:border-[#D4A373]/40 card-interactive">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373] block mb-1">
              Rapid Response
            </span>
            <h3 className="text-base font-bold text-white tracking-tight font-heading">
              Direct Emergency Dispatch
            </h3>
            <p className="text-[#9EABA0] text-xs leading-relaxed mt-1.5">
              One-touch SOS transmits exact GPS telemetry and landmark coordinates to the sector control room for immediate triage dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Main Interactive Sections Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-7">
        {/* Pilgrim's Personal Active Request Tracker */}
        {mySosIncident && (
          <ActiveSosTracker
            incident={mySosIncident}
            onCancelIncident={handleCancelSos}
          />
        )}

        {/* Interactive Map & Safe-Path Navigation Section */}
        <div id="navigation-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start scroll-mt-20">
          {/* Map (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <InteractiveMap
              userLocation={userLocation}
              gpsAccuracy={gpsAccuracy}
              isSimulatedLocation={isSimulatedLocation}
              crowdZones={crowdZones}
              facilities={facilities}
              selectedFacilityId={selectedDestinationId}
              activeRoute={activeRoute}
              showCongestedRouteComparison={!avoidCongestion}
              onSelectFacility={handleSelectFacility}
              onRecenter={() => {}}
            />
          </div>

          {/* Navigation Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <NavigationPanel
              destinations={destinationOptions}
              selectedDestinationId={selectedDestinationId}
              activeRoute={activeRoute}
              avoidCongestion={avoidCongestion}
              userLocation={userLocation}
              onSelectDestination={(id) => setSelectedDestinationId(id)}
              onToggleAvoidCongestion={() => setAvoidCongestion((prev) => !prev)}
              onClearRoute={() => setSelectedDestinationId('')}
            />

            {/* Quick Emergency Assistance Card */}
            <div className="bg-[#242D23] border border-red-500/40 rounded-xl p-5 shadow-card flex items-center justify-between gap-4">
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-red-400 block mb-0.5">
                  {t('need_help')}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight font-heading">
                  {t('instant_emergency_sos')}
                </h3>
                <p className="font-normal text-[#9EABA0] text-xs leading-relaxed mt-0.5">
                  {t('sos_desc')}
                </p>
              </div>

              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-[#FF4D4D] hover:bg-[#E63939] text-white font-bold tracking-wider px-4 py-2 rounded-lg text-xs uppercase border border-red-400 shadow-md transition-colors cursor-pointer shrink-0"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>

        {/* Nearby Essential Services Directory */}
        <NearbyFacilities
          facilities={facilities}
          selectedFacilityId={selectedDestinationId}
          userLocation={userLocation}
          onNavigateToFacility={handleSelectFacility}
        />

        {/* Sector Crowd Conditions Summary */}
        <div id="crowd-summary" className="scroll-mt-20">
          <CrowdStatusSummary
            zones={crowdZones}
            onSelectZone={(zoneId) => setSelectedDestinationId(zoneId)}
          />
        </div>
      </main>

      {/* 5. Clean Enterprise Footer with Sharp Outer Edges */}
      <footer className="border-t border-[#2D382B] bg-[#141B13] py-7 px-4 sm:px-6 mt-12 text-xs text-[#9EABA0] font-sans rounded-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#242D23] text-[#D4A373] font-bold flex items-center justify-center text-xs border border-[#2D382B] font-heading">
                SK
              </span>
              <strong className="text-white font-bold text-sm tracking-wider font-heading uppercase">SMARTKUMBH</strong>
            </div>
            <span className="text-[#2D382B] hidden sm:inline">•</span>
            <span className="text-[#9EABA0]">MahaKumbh Pilgrim Safety & Safe-Corridor Network</span>
            <span className="text-[#2D382B] hidden sm:inline">•</span>
            <span className="text-[#D4A373] font-semibold">VNIT INNOV8</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#E2E8F0]">
            <span className="bg-[#1C241B] px-3 py-1 rounded-md border border-[#2D382B]">
              Toll-Free Helpline: <span className="tabular-nums text-[#D4A373] ml-1 font-bold">1920</span>
            </span>
            <span className="bg-[#1C241B] px-3 py-1 rounded-md border border-[#2D382B]">
              Police Emergency: <span className="tabular-nums text-white ml-1 font-bold">112</span>
            </span>
            <span className="bg-[#1C241B] px-3 py-1 rounded-md border border-[#2D382B]">
              Medical Triage: <span className="tabular-nums text-white ml-1 font-bold">108</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Weather Forecast Popup Modal */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        weather={weather}
        onClose={() => setIsWeatherModalOpen(false)}
      />

      {/* Supabase Pilgrim Login & Registration Modal */}
      <PilgrimAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(profile) => {
          setPilgrimProfile(profile);
          alert(`Welcome, ${profile.full_name}! Your health profile has been registered for emergency priority routing.`);
        }}
      />

      {/* Pilgrim Emergency SOS Submission Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        userLocation={userLocation}
        nearestLandmark="Main Steps West Corridor (Sector 4 Axis)"
        onClose={() => setIsSosModalOpen(false)}
        onSubmitIncident={handleCreateSosIncident}
      />
    </div>
  );
};

export default App;
