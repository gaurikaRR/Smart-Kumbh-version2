import type { CrowdZone, Facility, NavigationNode, NavigationEdge, WeatherAdvisory } from '../types';

// Prayagraj Triveni Sangam Kumbh Mela Reference Center
export const KUMBH_CENTER: [number, number] = [25.4285, 81.8845];

// Default simulated user location near Central Axis / Main Steps
export const DEFAULT_USER_LOCATION: [number, number] = [25.4278, 81.8838];

export const CROWD_ZONES: CrowdZone[] = [
  {
    id: 'north-gate',
    name: 'North Gate Exit',
    status: 'green',
    densityLabel: 'Low density: Moving freely',
    estimatedPeople: 6500,
    lastUpdated: '15:52 IST',
    source: 'Staff observation and sensor gate count',
    advisory: 'Clear corridor. Recommended exit route for northern sectors.',
    center: [25.4335, 81.8820],
    coordinates: [
      [25.4350, 81.8805],
      [25.4355, 81.8840],
      [25.4320, 81.8845],
      [25.4315, 81.8810],
    ],
  },
  {
    id: 'main-steps',
    name: 'Main Steps (Ghat Steps 4)',
    status: 'amber',
    densityLabel: 'Moderate density: Slow movement',
    estimatedPeople: 2100,
    lastUpdated: '15:50 IST',
    source: 'CCTV crowd counting and barrier monitors',
    advisory: 'Regulated descent in batches. Maintain steady pace, do not stop on steps.',
    center: [25.4288, 81.8835],
    coordinates: [
      [25.4300, 81.8820],
      [25.4302, 81.8855],
      [25.4278, 81.8858],
      [25.4275, 81.8825],
    ],
  },
  {
    id: 'river-bridge',
    name: 'River Bridge (Pontoon 2)',
    status: 'red',
    densityLabel: 'Severe congestion: Entry caution',
    estimatedPeople: 850,
    lastUpdated: '15:48 IST',
    source: 'Sector coordinator alert',
    advisory: 'CRITICAL: Pontoon bridge temporarily restricted. Divert to East Safe Corridor (Route A).',
    center: [25.4262, 81.8872],
    coordinates: [
      [25.4275, 81.8860],
      [25.4278, 81.8885],
      [25.4248, 81.8890],
      [25.4245, 81.8865],
    ],
  },
  {
    id: 'rest-area',
    name: 'Rest Area Sector 3',
    status: 'green',
    densityLabel: 'Low density: Ample seating and shade',
    estimatedPeople: 1200,
    lastUpdated: '15:45 IST',
    source: 'Volunteer field log',
    advisory: 'Shaded resting pavilions, hydration stations, and family reunion point.',
    center: [25.4255, 81.8805],
    coordinates: [
      [25.4270, 81.8790],
      [25.4272, 81.8820],
      [25.4240, 81.8822],
      [25.4238, 81.8792],
    ],
  },
];

export const CRITICAL_FACILITIES: Facility[] = [
  {
    id: 'med-camp-a',
    name: 'Medical Camp A',
    type: 'medical',
    coordinates: [25.4265, 81.8830],
    distanceMeters: 250,
    operationalStatus: '24h Open',
    details: '18 emergency beds, triage doctor, trauma kit, cardiac defibrillator, oxygen supply.',
    landmark: 'Sangam South Spine, 50m south of Sector Flag 4',
  },
  {
    id: 'med-camp-b',
    name: 'Medical Camp B',
    type: 'medical',
    coordinates: [25.4325, 81.8835],
    distanceMeters: 600,
    operationalStatus: '24h Open',
    details: 'Ambulance transfer bay, dedicated heat exhaustion treatment center, pediatric support.',
    landmark: 'North Axis, near Sector Gate 2',
  },
  {
    id: 'helpdesk-b4',
    name: 'Help Desk & Lost Person Center B4',
    type: 'lost_found',
    coordinates: [25.4295, 81.8815],
    distanceMeters: 380,
    operationalStatus: 'Active Desk',
    details: 'Multilingual assistance, PA announcement system, lost child safe holding zone, digital registry.',
    landmark: 'Central Axis Junction, Tower B4',
  },
  {
    id: 'exit-north-gate',
    name: 'North Gate Exit Terminal',
    type: 'exit',
    coordinates: [25.4345, 81.8825],
    distanceMeters: 820,
    operationalStatus: 'Free Flow Corridor',
    details: 'High-capacity exit gates connecting to Shuttle Bus Bay 1 and Railway Station feeder road.',
    landmark: 'North Ring Perimeter',
  },
  {
    id: 'water-ors-station-7',
    name: 'Water & ORS Distribution Point 7',
    type: 'water',
    coordinates: [25.4272, 81.8842],
    distanceMeters: 190,
    operationalStatus: 'Operational',
    details: 'Free filtered cold drinking water, electrolytic ORS sachets, crowd hydration team.',
    landmark: 'East Steps Promenade',
  },
];

export const INITIAL_WEATHER: WeatherAdvisory = {
  temperatureC: 28,
  humidityPercent: 64,
  windSpeedKmh: 14,
  rainLikelihoodPercent: 10,
  heatIndexStatus: 'Heat index moderate: Hydration recommended',
  operationalAdvisory: 'Peak sunlight exposure on ghat steps. Consume fluids every 30 minutes. Keep children by hand.',
};

// Navigation network graph representing the mela pathways
export const NAVIGATION_NODES: NavigationNode[] = [
  { id: 'user_pos', name: 'Your Location', coordinates: [25.4278, 81.8838] },
  { id: 'junction_central', name: 'Central Spine Junction', coordinates: [25.4282, 81.8835] },
  { id: 'main_steps_entrance', name: 'Main Steps Entrance', coordinates: [25.4288, 81.8835] },
  { id: 'east_corridor_1', name: 'East Safe Corridor (Gate E1)', coordinates: [25.4280, 81.8860] },
  { id: 'east_corridor_2', name: 'East Safe Corridor (Gate E2)', coordinates: [25.4260, 81.8862] },
  { id: 'pontoon_choke_point', name: 'Pontoon 2 Approach (Congested)', coordinates: [25.4268, 81.8868] },
  { id: 'pontoon_bridge_center', name: 'Pontoon 2 River Deck (Restricted)', coordinates: [25.4258, 81.8875] },
  { id: 'med_camp_a_node', name: 'Medical Camp A Portal', coordinates: [25.4265, 81.8830] },
  { id: 'med_camp_b_node', name: 'Medical Camp B Portal', coordinates: [25.4325, 81.8835] },
  { id: 'helpdesk_node', name: 'Help Desk B4 Entrance', coordinates: [25.4295, 81.8815] },
  { id: 'north_gate_node', name: 'North Gate Exit Portal', coordinates: [25.4345, 81.8825] },
  { id: 'rest_area_node', name: 'Rest Area Pavilion Gate', coordinates: [25.4255, 81.8805] },
  { id: 'water_station_node', name: 'Water Point 7', coordinates: [25.4272, 81.8842] },
];

export const NAVIGATION_EDGES: NavigationEdge[] = [
  // User connection to central spine
  { from: 'user_pos', to: 'junction_central', distanceMeters: 60, zoneStatus: 'amber' },
  { from: 'user_pos', to: 'water_station_node', distanceMeters: 80, zoneStatus: 'green' },
  { from: 'user_pos', to: 'med_camp_a_node', distanceMeters: 170, zoneStatus: 'green' },

  // Water station connections
  { from: 'water_station_node', to: 'med_camp_a_node', distanceMeters: 120, zoneStatus: 'green' },
  { from: 'water_station_node', to: 'east_corridor_1', distanceMeters: 150, zoneStatus: 'green' },

  // Central spine connections
  { from: 'junction_central', to: 'main_steps_entrance', distanceMeters: 90, zoneStatus: 'amber' },
  { from: 'junction_central', to: 'helpdesk_node', distanceMeters: 210, zoneStatus: 'green' },
  { from: 'junction_central', to: 'med_camp_a_node', distanceMeters: 200, zoneStatus: 'green' },

  // Helpdesk to North Gate & Rest Area
  { from: 'helpdesk_node', to: 'rest_area_node', distanceMeters: 450, zoneStatus: 'green' },
  { from: 'helpdesk_node', to: 'med_camp_b_node', distanceMeters: 380, zoneStatus: 'green' },
  { from: 'med_camp_b_node', to: 'north_gate_node', distanceMeters: 230, zoneStatus: 'green' },

  // Main steps to north axis
  { from: 'main_steps_entrance', to: 'med_camp_b_node', distanceMeters: 420, zoneStatus: 'amber' },

  // East safe corridor (Route A)
  { from: 'east_corridor_1', to: 'east_corridor_2', distanceMeters: 220, zoneStatus: 'green' },
  { from: 'east_corridor_2', to: 'med_camp_a_node', distanceMeters: 290, zoneStatus: 'green' },
  { from: 'main_steps_entrance', to: 'east_corridor_1', distanceMeters: 260, zoneStatus: 'green' },

  // RESTRICTED ROUTE B (Through Red Zone Pontoon 2)
  {
    from: 'main_steps_entrance',
    to: 'pontoon_choke_point',
    distanceMeters: 280,
    zoneStatus: 'red',
    isRestricted: true,
    restrictionReason: 'Route B restricted: Pontoon bridge surge. Overcrowding risk.',
  },
  {
    from: 'pontoon_choke_point',
    to: 'pontoon_bridge_center',
    distanceMeters: 120,
    zoneStatus: 'red',
    isRestricted: true,
    restrictionReason: 'Route B restricted: Barricaded by rapid response force.',
  },
  {
    from: 'pontoon_bridge_center',
    to: 'east_corridor_2',
    distanceMeters: 140,
    zoneStatus: 'red',
    isRestricted: true,
    restrictionReason: 'Route B restricted: South access halted.',
  },
];
