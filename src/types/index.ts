export type ZoneStatus = 'green' | 'amber' | 'red';

export interface CrowdZone {
  id: string;
  name: string;
  status: ZoneStatus;
  densityLabel: string;
  estimatedPeople: number;
  lastUpdated: string;
  coordinates: [number, number][]; // Polygon coordinates
  center: [number, number];
  advisory: string;
  source: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'medical' | 'helpdesk' | 'lost_found' | 'water' | 'exit';
  coordinates: [number, number];
  distanceMeters: number;
  operationalStatus: string;
  details: string;
  landmark: string;
}

export type SosCategory =
  | 'Medical Emergency'
  | 'Crowd Surge / Crush Risk'
  | 'Lost Person / Child'
  | 'Physical Assistance';

export type SosStage = 'Reported' | 'Acknowledged' | 'Responder Dispatched' | 'Resolved';

export interface SosIncident {
  id: string;
  category: SosCategory;
  timestamp: string;
  coordinates: [number, number];
  landmark: string;
  notes: string;
  status: SosStage;
  assignedResponder?: string;
  responderEtaMinutes?: number;
  responderDistanceMeters?: number;
}

export interface WeatherAdvisory {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  rainLikelihoodPercent: number;
  heatIndexStatus: string;
  operationalAdvisory: string;
}

export interface NavigationNode {
  id: string;
  name: string;
  coordinates: [number, number];
}

export interface NavigationEdge {
  from: string;
  to: string;
  distanceMeters: number;
  zoneStatus: ZoneStatus;
  isRestricted?: boolean;
  restrictionReason?: string;
}

export interface RouteCalculationResult {
  path: [number, number][];
  nodeIds: string[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  isSafeBypass: boolean;
  blockedZoneAvoided?: string;
  restrictedRouteBypassed?: string;
  waypoints: {
    instruction: string;
    distanceMeters: number;
  }[];
}
