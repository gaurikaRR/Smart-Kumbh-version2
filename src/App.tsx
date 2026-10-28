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
import { PilgrimEntryGate } from './components/PilgrimEntryGate';
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
  
  // 🚨 ARCHITECTURAL FLOW: Initial load starts at null so the Entry Gate is always presented first
  const [pilgrimProfile, setPilgrimProfile] = useState<PilgrimProfile | null>(null);

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
      ...crowdZones.map((z) => ({
        id: z.id,
        label: `${z.name} (${z.densityLabel})`,
        category: 'Sector Zone',
        distanceMeters: calculateHaversineDistance(userLocation, z.center),
        coordinates: z.center,
      })),
    ];
    return list;
  }, [facilities, crowdZones, userLocation]);

  // Recalculate route whenever destination or user location changes
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

  // Refresh telemetry simulated sync
  const handleRefreshData = useCallback(() => {
    const now = new Date();
    const formatted = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} IST`;
    setFreshnessTimestamp(formatted);

    setCrowdZones((prev) =>
      prev.map((zone) => ({
        ...zone,
        estimatedPeople: Math.max(
          1000,
          Math.floor(zone.estimatedPeople + (Math.random() * 200 - 100))
        ),
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
      notes: pilgrimProfile
        ? `${notes ? `${notes} · ` : ''}Pilgrim: ${pilgrimProfile.full_name} (${pilgrimProfile.age}y, ${pilgrimProfile.gender}) | Special Needs: ${pilgrimProfile.health_conditions.join(', ')}`
        : notes,
      status: 'Reported',
    };

    setMySosIncident(newIncident);
    setIsSosModalOpen(false);

    // Realistic auto-progression simulation from the control room
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

  // 🚨 ARCHITECTURAL FLOW REQUIREMENT:
  // When the application loads, do NOT directly display the main dashboard/home page.
  // Show the Pilgrim Registration & Login Screen first as an entry gate.
  // Once the user completes registration details and passes verification, transition them seamlessly into the main page.
  if (!pilgrimProfile) {
    return (
      <PilgrimEntryGate
        onAuthenticated={(profile) => {
          setPilgrimProfile(profile);
        }}
      />
    );
  }

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
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const navElem = document.getElementById('navigation-section');
                  if (navElem) navElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#D4A373] hover:bg-[#E5B842] active:bg-[#C28E58] text-[#182017] font-bold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm"
              >
                {t('safe_route')}
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('crowd-summary');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#242D23] hover:bg-[#2D382B] text-white font-medium px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase border border-[#2D382B] hover:border-[#D4A373]/50 transition-colors cursor-pointer"
              >
                {t('sector_status')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Pilgrim Workplace Canvas */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 w-full space-y-8 flex-1">
        {/* Navigation & Live Obstacle-Avoidance Map Grid */}
        <div id="navigation-section" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#2D382B] pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                {t('corridor_navigation')}
              </h2>
              <p className="text-xs text-[#9EABA0] mt-0.5">
                {t('corridor_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Cols: Destination Selection & Turn-by-Turn Waypoints */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <NavigationPanel
                destinations={destinationOptions}
                selectedDestinationId={selectedDestinationId}
                avoidCongestion={avoidCongestion}
                activeRoute={activeRoute}
                userLocation={userLocation}
                onSelectDestination={setSelectedDestinationId}
                onToggleAvoidCongestion={() => setAvoidCongestion((prev) => !prev)}
                onClearRoute={() => {
                  setSelectedDestinationId('');
                  setActiveRoute(null);
                }}
              />
            </div>

            {/* Right 8 Cols: Interactive Spatial Geo-Map */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <InteractiveMap
                crowdZones={crowdZones}
                facilities={facilities}
                userLocation={userLocation}
                isSimulatedLocation={isSimulatedLocation}
                gpsAccuracy={gpsAccuracy}
                activeRoute={activeRoute}
                selectedFacilityId={selectedDestinationId}
                showCongestedRouteComparison={avoidCongestion}
                onSelectFacility={handleSelectFacility}
                onRecenter={() => {
                  setUserLocation(DEFAULT_USER_LOCATION);
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Personal SOS Active Progress Tracker */}
        {mySosIncident && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#FF4D4D] flex items-center gap-1.5 font-heading">
                <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-ping" />
                {t('emergency_sos')}
              </span>
              <span className="text-xs text-[#9EABA0]">
                {t('ref_number')}: <strong className="font-mono text-white">{mySosIncident.id}</strong>
              </span>
            </div>

            <ActiveSosTracker
              incident={mySosIncident}
              onCancelIncident={handleCancelSos}
            />
          </div>
        )}

        {/* Emergency SOS Banner Action */}
        <div className="p-5 sm:p-6 bg-[#242D23] border border-[#2D382B] rounded-card shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D4D] block mb-1">
                {t('emergency_sos')}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
                {t('sos_alert_title')}
              </h3>
              <p className="font-normal text-[#9EABA0] text-xs leading-relaxed mt-0.5 max-w-xl">
                {t('sos_alert_desc')}
              </p>
            </div>

            <button
              onClick={() => setIsSosModalOpen(true)}
              className="bg-[#FF4D4D] hover:bg-[#E63939] active:bg-[#CC2929] text-white font-bold tracking-wider px-6 py-3 rounded-lg text-xs uppercase border border-red-400 shadow-md transition-all duration-150 cursor-pointer shrink-0 text-center"
            >
              {t('emergency_sos')}
            </button>
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
        <div id="crowd-summary" className="scroll-mt-24">
          <CrowdStatusSummary
            zones={crowdZones}
            onSelectZone={(zoneId) => setSelectedDestinationId(zoneId)}
          />
        </div>
      </main>

      {/* Modern Footer in Deep Olive Green */}
      <footer className="border-t border-[#2D382B] bg-[#121711] py-8 px-4 sm:px-6 mt-16 text-xs text-[#9EABA0] font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#242D23] text-[#D4A373] font-bold flex items-center justify-center text-xs border border-[#2D382B]">
                SK
              </span>
              <strong className="text-white font-bold text-sm tracking-wider font-heading uppercase">
                SMARTKUMBH
              </strong>
            </div>
            <span className="text-[#2D382B] hidden sm:inline">•</span>
            <span className="text-[#9EABA0]">MahaKumbh Crowd Safety & Navigation Network</span>
            <span className="text-[#2D382B] hidden sm:inline">•</span>
            <span className="text-[#D4A373] font-semibold">Prayagraj Mela Authority</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#E2E8F0]">
            <span className="bg-[#182017] px-3 py-1.5 rounded-md border border-[#2D382B]">
              Toll-Free Helpline: <span className="tabular-nums text-[#D4A373] ml-1 font-bold">1920</span>
            </span>
            <span className="bg-[#182017] px-3 py-1.5 rounded-md border border-[#2D382B]">
              Police: <span className="tabular-nums text-white ml-1 font-bold">112</span>
            </span>
            <span className="bg-[#182017] px-3 py-1.5 rounded-md border border-[#2D382B]">
              Medical: <span className="tabular-nums text-white ml-1 font-bold">108</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        userLocation={userLocation}
        nearestLandmark="Main Steps West Corridor (Sector 4 Axis)"
        onClose={() => setIsSosModalOpen(false)}
        onSubmitIncident={handleCreateSosIncident}
      />

      {/* Comprehensive Weather Telemetry Modal */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        weather={weather}
        onClose={() => setIsWeatherModalOpen(false)}
      />

      {/* Secondary Pilgrim Auth Modal (can be triggered from header navbar) */}
      <PilgrimAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(profile) => {
          setPilgrimProfile(profile);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
