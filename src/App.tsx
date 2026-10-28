import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HeaderUtilityBar } from './components/HeaderUtilityBar';
import { InteractiveMap } from './components/InteractiveMap';
import { NavigationPanel } from './components/NavigationPanel';
import { SosModal } from './components/SosModal';
import { ActiveSosTracker } from './components/ActiveSosTracker';
import { NearbyFacilities } from './components/NearbyFacilities';
import { CrowdStatusSummary } from './components/CrowdStatusSummary';
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

export const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [isSimulatedLocation, setIsSimulatedLocation] = useState<boolean>(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>(CROWD_ZONES);
  const [weather] = useState<WeatherAdvisory>(INITIAL_WEATHER);
  const [freshnessTimestamp, setFreshnessTimestamp] = useState<string>('15:52 IST');

  // Navigation State
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('med-camp-a');
  const [avoidCongestion, setAvoidCongestion] = useState<boolean>(true);
  const [activeRoute, setActiveRoute] = useState<RouteCalculationResult | null>(null);

  // Pilgrim's Individual Active SOS Request (Only their own, strictly decoupled from coordinator queue)
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [mySosIncident, setMySosIncident] = useState<SosIncident | null>({
    id: 'SK-8841-MED',
    category: 'Medical Emergency',
    timestamp: '15:49 IST',
    coordinates: [25.4278, 81.8838],
    landmark: 'Main Steps West Corridor (Near Flag 4)',
    notes: 'Heat exhaustion, pilgrim sitting near shaded barrier.',
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

  return (
    <div className="min-h-screen bg-sand-100 text-charcoal-900 flex flex-col font-sans selection:bg-gold-500/20 selection:text-olive-900">
      {/* 1. Header & Utility Bar with Live GPS Telemetry */}
      <HeaderUtilityBar
        weather={weather}
        freshnessTimestamp={freshnessTimestamp}
        isSimulatedLocation={isSimulatedLocation}
        gpsAccuracy={gpsAccuracy}
        onRefreshData={handleRefreshData}
        onToggleLocationMode={handleToggleLocationMode}
        onRequestSos={() => setIsSosModalOpen(true)}
        activeSosCount={mySosIncident ? 1 : 0}
      />

      {/* 2. Full-Width Bold Hero Section in Deep Olive Green (Enterprise B2B Architecture) */}
      <section className="w-full bg-gradient-to-b from-olive-800 via-olive-850 to-olive-900 text-white border-b border-olive-950/60 pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 shadow-md relative overflow-hidden">
        {/* Subtle background ambient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,163,115,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-950/80 text-gold-400 border border-gold-500/30 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span>Prayagraj MahaKumbh • Smart Pilgrim Operations</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Safe-Pathway Navigation & Intelligent Crowd Protection
              </h1>
              <p className="mt-4 text-base sm:text-lg text-sand-200 font-normal leading-relaxed">
                Empowering millions of Triveni Sangam pilgrims with live corridor telemetry, automated choke-point bypass routing, and rapid emergency triage response.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="#navigation-section"
                className="bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wide transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <span>Navigate Safe Pathway</span>
                <span>↓</span>
              </a>
              <a
                href="#crowd-summary"
                className="bg-olive-950/80 hover:bg-olive-900 text-sand-200 hover:text-white border border-olive-700/80 font-semibold px-5 py-3 rounded-full text-xs uppercase tracking-wide transition-all duration-200 shadow-sm inline-flex items-center gap-2"
              >
                <span>Sector Conditions</span>
                <span>↓</span>
              </a>
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-full text-xs uppercase tracking-wide transition-all duration-200 shadow-md hover:scale-[1.02] inline-flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>

          {/* Enterprise Stats / Highlights Bar (4 Framed Callout Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-olive-950/70 border border-olive-700/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gold-500/40 transition-all duration-200 group">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gold-400 block mb-1">
                Active Sangam Sectors
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                4 Zones
              </div>
              <span className="text-sand-300 text-xs font-normal mt-1 block">
                Continuous drone & telemetry sensor grid
              </span>
            </div>

            <div className="bg-olive-950/70 border border-olive-700/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gold-500/40 transition-all duration-200 group">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gold-400 block mb-1">
                Dynamic Rerouting
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                Route A Safe
              </div>
              <span className="text-sand-300 text-xs font-normal mt-1 block">
                Pontoon Bridge 2 choke-point auto-bypass
              </span>
            </div>

            <div className="bg-olive-950/70 border border-olive-700/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gold-500/40 transition-all duration-200 group">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gold-400 block mb-1">
                Triage & Support Camps
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                100% Verified
              </div>
              <span className="text-sand-300 text-xs font-normal mt-1 block">
                Medical, lost-person & hydration stations
              </span>
            </div>

            <div className="bg-olive-950/70 border border-olive-700/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-gold-500/40 transition-all duration-200 group">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-gold-400 block mb-1">
                Field Responder ETA
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-gold-400 tracking-tight tabular-nums">
                &lt; 3 mins
              </div>
              <span className="text-sand-300 text-xs font-normal mt-1 block">
                Rapid on-ground dispatch team arrival
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Overview (3-Column Interactive Card Grid) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-olive-900/10 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-800 flex items-center justify-center font-bold text-lg mb-3 border border-olive-200">
              🧭
            </div>
            <h3 className="text-base font-bold text-charcoal-900 tracking-tight group-hover:text-olive-800 transition-colors">
              Intelligent Safe-Path Routing
            </h3>
            <p className="text-charcoal-600 text-xs leading-relaxed mt-2">
              Our dynamic A* graph engine calculates the safest walking path, routing pilgrims away from high-density bottlenecks directly to their holy destination.
            </p>
          </div>

          <div className="bg-white border border-olive-900/10 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-bold text-lg mb-3 border border-gold-200">
              🏥
            </div>
            <h3 className="text-base font-bold text-charcoal-900 tracking-tight group-hover:text-olive-800 transition-colors">
              Verified Essential Services
            </h3>
            <p className="text-charcoal-600 text-xs leading-relaxed mt-2">
              Locate medical triage camps, lost-family desks, free drinking water distribution points, and safe exit gates calibrated with real-time walking distance.
            </p>
          </div>

          <div className="bg-white border border-olive-900/10 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg mb-3 border border-red-200">
              🚨
            </div>
            <h3 className="text-base font-bold text-charcoal-900 tracking-tight group-hover:text-olive-800 transition-colors">
              Direct Emergency Dispatch
            </h3>
            <p className="text-charcoal-600 text-xs leading-relaxed mt-2">
              One-touch SOS transmits exact GPS telemetry and landmark coordinates to the sector control room, dispatching the nearest sector responder in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Main Interactive Sections Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-8">
        {/* Pilgrim's Personal Active Request Tracker (Only shown if pilgrim has submitted an SOS) */}
        {mySosIncident && (
          <ActiveSosTracker
            incident={mySosIncident}
            onCancelIncident={handleCancelSos}
          />
        )}

        {/* Interactive Map & Safe-Path Navigation Section */}
        <div id="navigation-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-24">
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
          <div className="lg:col-span-5 flex flex-col gap-6">
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

            {/* Quick Emergency Assistance Card in Warm Sand & Red Accent */}
            <div className="bg-white border border-red-500/30 rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold uppercase tracking-wider text-[11px] text-red-600 block mb-1">
                  Need Help?
                </span>
                <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
                  Instant Emergency SOS
                </h3>
                <p className="font-normal text-charcoal-600 text-xs leading-relaxed mt-0.5">
                  One tap to alert the nearest medical & rapid assistance squad.
                </p>
              </div>

              {/* Action Tier 1: Critical Danger / Emergency SOS Action */}
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold tracking-wide px-5 py-2.5 rounded-full text-xs uppercase border border-red-500 shadow-sm transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.02]"
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
        <div id="crowd-summary" className="scroll-mt-24">
          <CrowdStatusSummary
            zones={crowdZones}
            onSelectZone={(zoneId) => setSelectedDestinationId(zoneId)}
          />
        </div>
      </main>

      {/* 5. Enterprise Modern Footer in Deep Olive Green */}
      <footer className="border-t border-olive-900/40 bg-olive-950 py-8 px-4 sm:px-6 mt-16 text-xs text-sand-300 font-sans shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-olive-800 text-gold-400 font-bold flex items-center justify-center text-xs border border-gold-500/30">
                SK
              </span>
              <strong className="text-white font-bold text-sm">Smart Kumbh</strong>
            </div>
            <span className="text-olive-700 hidden sm:inline">•</span>
            <span className="text-sand-300">Pilgrim Crowd Safety & Navigation Network</span>
            <span className="text-olive-700 hidden sm:inline">•</span>
            <span className="text-gold-400 font-semibold">VNIT INNOV8</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-sand-200">
            <span className="bg-olive-900/80 px-3 py-1.5 rounded-full border border-olive-800">
              Toll-Free Helpline: <span className="tabular-nums text-gold-400 ml-1 font-bold">1920</span>
            </span>
            <span className="bg-olive-900/80 px-3 py-1.5 rounded-full border border-olive-800">
              Police Emergency: <span className="tabular-nums text-white ml-1 font-bold">112</span>
            </span>
            <span className="bg-olive-900/80 px-3 py-1.5 rounded-full border border-olive-800">
              Medical Triage: <span className="tabular-nums text-white ml-1 font-bold">108</span>
            </span>
          </div>
        </div>
      </footer>

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
