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

  // Destination options for dropdown
  const destinationOptions = useMemo(() => {
    const list = [
      ...facilities.map((f) => ({
        id: f.id,
        label: f.name,
        category: f.type,
        distanceMeters: f.distanceMeters,
      })),
      {
        id: 'main-steps',
        label: 'Main Steps (Ghat Steps 4)',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4288, 81.8835]),
      },
      {
        id: 'rest-area',
        label: 'Rest Area Sector 3',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4255, 81.8805]),
      },
      {
        id: 'river-bridge',
        label: 'River Bridge (Pontoon 2 - Caution)',
        category: 'landmark',
        distanceMeters: calculateHaversineDistance(userLocation, [25.4262, 81.8872]),
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

  // GPS hardware detection toggle
  const handleToggleLocationMode = useCallback(() => {
    if (isSimulatedLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
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
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col font-sans">
      {/* 1. Header & Utility Bar with Theme Toggle */}
      <HeaderUtilityBar
        weather={weather}
        freshnessTimestamp={freshnessTimestamp}
        isSimulatedLocation={isSimulatedLocation}
        onRefreshData={handleRefreshData}
        onToggleLocationMode={handleToggleLocationMode}
        onRequestSos={() => setIsSosModalOpen(true)}
        activeSosCount={mySosIncident ? 1 : 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        {/* Pilgrim's Personal Active Request Tracker (Only shown if pilgrim has submitted an SOS) */}
        {mySosIncident && (
          <ActiveSosTracker
            incident={mySosIncident}
            onCancelIncident={handleCancelSos}
          />
        )}

        {/* Interactive Map & Safe-Path Navigation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <InteractiveMap
              userLocation={userLocation}
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
              onSelectDestination={(id) => setSelectedDestinationId(id)}
              onToggleAvoidCongestion={() => setAvoidCongestion((prev) => !prev)}
              onClearRoute={() => setSelectedDestinationId('')}
            />

            {/* Quick Emergency Assistance Card */}
            <div className="bg-[#0F172A] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-card flex items-center justify-between gap-4">
              <div>
                <span className="font-medium uppercase tracking-wider text-[11px] text-red-400 block mb-0.5">
                  Need Help?
                </span>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Instant Emergency SOS
                </h3>
                <p className="font-normal text-slate-200 text-sm leading-relaxed mt-0.5">
                  One tap to alert the nearest medical & assistance team.
                </p>
              </div>

              {/* Action Tier 1: Critical Danger / Emergency SOS Action */}
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold tracking-wide px-5 py-2.5 rounded-full text-xs uppercase border border-red-500/40 shadow-sm transition-colors cursor-pointer shrink-0"
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
          onNavigateToFacility={handleSelectFacility}
        />

        {/* Sector Crowd Conditions Summary */}
        <CrowdStatusSummary
          zones={crowdZones}
          onSelectZone={(zoneId) => setSelectedDestinationId(zoneId)}
        />
      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0F172A] py-6 px-4 sm:px-6 mt-12 text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <strong className="text-white font-semibold">Smart Kumbh</strong>
            <span className="text-slate-700">•</span>
            <span className="text-slate-300">Pilgrim Safety & Navigation Platform</span>
            <span className="text-slate-700">•</span>
            <span>VNIT INNOV8</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <span>Toll-Free Helpline: <span className="tabular-nums text-white">1920</span></span>
            <span className="text-slate-700">•</span>
            <span>Emergency Police: <span className="tabular-nums text-white">112</span></span>
            <span className="text-slate-700">•</span>
            <span>Medical Triage: <span className="tabular-nums text-white">108</span></span>
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
