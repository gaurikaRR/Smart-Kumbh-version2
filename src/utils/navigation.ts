import type { NavigationNode, NavigationEdge, RouteCalculationResult } from '../types';
import { NAVIGATION_NODES, NAVIGATION_EDGES } from '../data/kumbhData';

// Haversine distance between two [lat, lng] coordinates in meters
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;
  const deltaLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const deltaLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Map destination ID to graph node ID
export function getDestinationNodeId(destinationId: string): string {
  switch (destinationId) {
    case 'med-camp-a':
      return 'med_camp_a_node';
    case 'med-camp-b':
      return 'med_camp_b_node';
    case 'helpdesk-b4':
      return 'helpdesk_node';
    case 'exit-north-gate':
      return 'north_gate_node';
    case 'water-ors-station-7':
      return 'water_station_node';
    case 'main-steps':
      return 'main_steps_entrance';
    case 'rest-area':
      return 'rest_area_node';
    case 'river-bridge':
      return 'pontoon_choke_point';
    default:
      return 'junction_central';
  }
}

// Calculate shortest path using Dijkstra algorithm with dynamic obstacle avoidance
export function calculateRoute(
  startCoords: [number, number],
  targetNodeId: string,
  avoidCongestion: boolean = true
): RouteCalculationResult | null {
  // Update starting user_pos node coordinates in memory
  const nodes = NAVIGATION_NODES.map((n) =>
    n.id === 'user_pos' ? { ...n, coordinates: startCoords } : n
  );

  const nodeMap = new Map<string, NavigationNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Build bidirectional adjacency list
  const adjacency = new Map<string, { target: string; weight: number; edge: NavigationEdge }[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));

  NAVIGATION_EDGES.forEach((edge) => {
    let weight = edge.distanceMeters;

    if (avoidCongestion) {
      if (edge.isRestricted) {
        // Red zone restricted edge has prohibitive cost in safe mode
        weight += 50000;
      } else if (edge.zoneStatus === 'red') {
        weight += 20000;
      } else if (edge.zoneStatus === 'amber') {
        weight *= 1.4; // 40% penalty for moderate crowd delay
      }
    }

    adjacency.get(edge.from)?.push({ target: edge.to, weight, edge });
    adjacency.get(edge.to)?.push({ target: edge.from, weight, edge });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();

  nodes.forEach((n) => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
  });

  distances.set('user_pos', 0);

  while (visited.size < nodes.length) {
    let closestNode: string | null = null;
    let shortestDist = Infinity;

    distances.forEach((dist, nodeId) => {
      if (!visited.has(nodeId) && dist < shortestDist) {
        shortestDist = dist;
        closestNode = nodeId;
      }
    });

    if (!closestNode || shortestDist === Infinity) break;
    if (closestNode === targetNodeId) break;

    visited.add(closestNode);

    const neighbors = adjacency.get(closestNode) || [];
    for (const { target, weight } of neighbors) {
      if (visited.has(target)) continue;
      const newDist = distances.get(closestNode)! + weight;
      if (newDist < distances.get(target)!) {
        distances.set(target, newDist);
        previous.set(target, closestNode);
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let curr: string | null = targetNodeId;

  while (curr) {
    pathNodeIds.unshift(curr);
    curr = previous.get(curr) || null;
  }

  if (pathNodeIds.length === 0 || pathNodeIds[0] !== 'user_pos') {
    return null;
  }

  // Calculate real physical distance and coordinate path
  let totalDistanceMeters = 0;
  const pathCoordinates: [number, number][] = [];
  const waypoints: { instruction: string; distanceMeters: number }[] = [];

  for (let i = 0; i < pathNodeIds.length; i++) {
    const node = nodeMap.get(pathNodeIds[i])!;
    pathCoordinates.push(node.coordinates);

    if (i > 0) {
      const prevNode = nodeMap.get(pathNodeIds[i - 1])!;
      const legDist = calculateHaversineDistance(prevNode.coordinates, node.coordinates);
      totalDistanceMeters += legDist;
      waypoints.push({
        instruction: `Proceed toward ${node.name}`,
        distanceMeters: legDist,
      });
    }
  }

  // Average walking speed: 75 meters per minute in mela conditions
  const estimatedMinutes = Math.max(1, Math.ceil(totalDistanceMeters / 75));

  const isSafeBypass = avoidCongestion && pathNodeIds.some((id) => id.includes('east_corridor'));

  return {
    path: pathCoordinates,
    nodeIds: pathNodeIds,
    totalDistanceMeters,
    estimatedMinutes,
    isSafeBypass,
    blockedZoneAvoided: isSafeBypass ? 'River Bridge (Pontoon 2 - Red Zone)' : undefined,
    restrictedRouteBypassed: isSafeBypass ? 'Route B (Pontoon Bridge)' : undefined,
    waypoints,
  };
}
