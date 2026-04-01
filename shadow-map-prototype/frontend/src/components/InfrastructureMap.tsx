import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { findShortestPath, Node as RoadNode } from '../utils/pathfinding';
import { useDisaster } from '../context/DisasterContext';
import 'leaflet/dist/leaflet.css';

interface MapInfrastructure {
  id: string;
  name: string;
  type: string;
  location: { lat: number; lng: number };
  load_percentage: number;
  hvi: number;
  status: string;
}

interface MapData {
  infrastructure: MapInfrastructure[];
  hazard_type: string;
}

const ROAD_NETWORK: Record<string, RoadNode> = {
  'n1': { id: 'n1', point: { lat: 40.710, lng: -74.010 }, neighbors: ['n2', 'n4'] },
  'n2': { id: 'n2', point: { lat: 40.715, lng: -74.005 }, neighbors: ['n1', 'n3', 'n5'] },
  'n3': { id: 'n3', point: { lat: 40.720, lng: -74.000 }, neighbors: ['n2', 'n6'] },
  'n4': { id: 'n4', point: { lat: 40.705, lng: -74.000 }, neighbors: ['n1', 'n5'] },
  'n5': { id: 'n5', point: { lat: 40.712, lng: -73.995 }, neighbors: ['n2', 'n4', 'n6'] },
  'n6': { id: 'n6', point: { lat: 40.718, lng: -73.990 }, neighbors: ['n3', 'n5'] },
};

const InfrastructureMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [center] = useState<[number, number]>([40.7128, -74.0060]);
  const [blockedEdges, setBlockedEdges] = useState<Set<string>>(new Set());
  const { intensity, hazardType, isBlockageMode } = useDisaster();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`[Map] Syncing v3.0 Intelligence. Intensity: ${intensity}% | Hazard: ${hazardType}`);
        const response = await api.get(`/risks?intensity=${intensity}&hazard_type=${hazardType}`);
        setMapData({
          infrastructure: response.data.risks.map((r: any) => ({
            id: r.infrastructure_id,
            name: ROAD_NETWORK[r.infrastructure_id]?.id || r.infrastructure_id,
            type: 'infrastructure',
            location: ROAD_NETWORK[r.infrastructure_id]?.point || { lat: 40.7128, lng: -74.0060 },
            load_percentage: r.casualty_risk_score,
            hvi: r.human_vulnerability_index,
            status: 'operational'
          })),
          hazard_type: response.data.environmental_conditions.hazard_type
        });
      } catch (error) {
        console.error('Error fetching infrastructure:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [intensity, hazardType]);

  const currentPathPoints = useMemo(() => {
    // Calculate hazard radius in lat/lng units (scaled for demo network)
    const hazardRadius = (intensity / 100) * 0.012;

    const isInsideHazard = (point: { lat: number, lng: number }) => {
      const dist = Math.sqrt(Math.pow(point.lat - center[0], 2) + Math.pow(point.lng - center[1], 2));
      return dist < hazardRadius;
    };

    // Combine manual blockages with hazard-based automatic blockages
    const allBlocked = new Set(blockedEdges);

    Object.entries(ROAD_NETWORK).forEach(([id, node]) => {
      node.neighbors.forEach(neighborId => {
        const neighbor = ROAD_NETWORK[neighborId];
        const midpoint = {
          lat: (node.point.lat + neighbor.point.lat) / 2,
          lng: (node.point.lng + neighbor.point.lng) / 2
        };

        if (isInsideHazard(midpoint) || isInsideHazard(node.point) || isInsideHazard(neighbor.point)) {
          allBlocked.add([id, neighborId].sort().join('-'));
        }
      });
    });

    const path = findShortestPath('n4', 'n3', ROAD_NETWORK, allBlocked);
    return path ? path.map(id => [ROAD_NETWORK[id].point.lat, ROAD_NETWORK[id].point.lng] as [number, number]) : null;
  }, [blockedEdges, intensity, hazardType, center]);

  // Calculate real ETA from path distance (Haversine)
  const routeEtaMinutes = useMemo(() => {
    if (!currentPathPoints || currentPathPoints.length < 2) return null;
    const R = 6371; // Earth radius km
    let totalKm = 0;
    for (let i = 0; i < currentPathPoints.length - 1; i++) {
      const [lat1, lon1] = currentPathPoints[i];
      const [lat2, lon2] = currentPathPoints[i + 1];
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      totalKm += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    // Ambulance speed: 40 km/h in emergency urban traffic
    const minutes = (totalKm / 40) * 60;
    return Math.max(1, Math.round(minutes));
  }, [currentPathPoints]);

  const toggleBlockage = (nodeA: string, nodeB: string) => {
    const edgeId = [nodeA, nodeB].sort().join('-');
    const newBlocked = new Set(blockedEdges);
    if (newBlocked.has(edgeId)) newBlocked.delete(edgeId);
    else newBlocked.add(edgeId);
    setBlockedEdges(newBlocked);
    console.log(`[Blockage] Edge toggle: ${edgeId} | Status: ${newBlocked.has(edgeId) ? 'BLOCKED' : 'CLEARED'}`);
  };

  const getRiskColor = (hvi: number) => {
    if (hvi >= 80) return '#f43f5e'; // Red for High Vulnerability
    if (hvi >= 50) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div className="relative w-full h-[500px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* v3.0 Scientific Hazard Overlays */}
        {hazardType === 'flood' && (
          <CircleMarker
            center={center}
            radius={intensity * 5}
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.15 + (intensity * 0.002),
              color: '#3b82f6',
              weight: 1,
              className: 'ripple'
            }}
          />
        )}

        {hazardType === 'earthquake' && [1.5, 3.0, 5.0].map((multiplier, i) => (
          <CircleMarker
            key={`eq-${i}`}
            center={center}
            radius={intensity * multiplier}
            pathOptions={{
              fillColor: '#f59e0b',
              fillOpacity: 0.1 / (i + 1),
              color: '#f59e0b',
              weight: 1,
              className: 'ripple'
            }}
          />
        ))}

        {hazardType === 'storm' && [1, 0.55].map((scale, i) => (
          <CircleMarker
            key={`storm-${i}`}
            center={center}
            radius={intensity * 4 * scale}
            pathOptions={{
              fillColor: '#94a3b8',
              fillOpacity: i === 0 ? 0.22 : 0.08,
              color: '#cbd5e1',
              weight: i === 0 ? 2 : 1,
            }}
          />
        ))}

        {hazardType === 'general' && (
          <CircleMarker
            center={center}
            radius={intensity * 1.8}
            pathOptions={{
              fillColor: '#f43f5e',
              fillOpacity: 0.25,
              color: '#f43f5e',
              weight: 3,
              dashArray: '10, 15',
              className: 'ripple'
            }}
          />
        )}

        {/* Road Network Visualization */}
        {Object.entries(ROAD_NETWORK).map(([id, node]) =>
          node.neighbors.map(neighborId => {
            const edgeId = [id, neighborId].sort().join('-');
            const isBlocked = blockedEdges.has(edgeId);

            // Combine manual blockages with auto-blockages for visualization
            const hazardRadius = (intensity / 100) * 0.012;
            const isInsideHazard = (point: { lat: number, lng: number }) => {
              const dist = Math.sqrt(Math.pow(point.lat - center[0], 2) + Math.pow(point.lng - center[1], 2));
              return dist < hazardRadius;
            };
            const neighbor = ROAD_NETWORK[neighborId];
            const midpoint = {
              lat: (node.point.lat + neighbor.point.lat) / 2,
              lng: (node.point.lng + neighbor.point.lng) / 2
            };
            const isAutoBlocked = isInsideHazard(midpoint) || isInsideHazard(node.point) || isInsideHazard(neighbor.point);

            return (
              <React.Fragment key={edgeId}>
                {/* Visual Line */}
                <Polyline
                  positions={[[node.point.lat, node.point.lng], [ROAD_NETWORK[neighborId].point.lat, ROAD_NETWORK[neighborId].point.lng]]}
                  pathOptions={{
                    color: isBlocked ? '#f43f5e' : (isAutoBlocked ? '#f59e0b40' : '#ffffff20'),
                    weight: (isBlocked || isAutoBlocked) ? 4 : 2,
                    dashArray: isBlocked ? "2, 10" : (isAutoBlocked ? "5, 5" : undefined),
                    interactive: false
                  }}
                />
                {/* Click Target (Invisible but Wide) */}
                <Polyline
                  positions={[[node.point.lat, node.point.lng], [ROAD_NETWORK[neighborId].point.lat, ROAD_NETWORK[neighborId].point.lng]]}
                  pathOptions={{
                    color: 'transparent',
                    weight: 15,
                  }}
                  eventHandlers={{
                    click: () => {
                      if (isBlockageMode) {
                        toggleBlockage(id, neighborId);
                      }
                    }
                  }}
                />
              </React.Fragment>
            );
          })
        )}

        {/* Current Ambulance Route */}
        {currentPathPoints && (
          <Polyline
            positions={currentPathPoints}
            pathOptions={{
              color: "#818cf8",
              weight: 8,
              opacity: 1,
              className: 'marching-ants route-glow'
            }}
          />
        )}

        {/* Route Start and Destination Indicators */}
        {currentPathPoints && (
          <>
            <CircleMarker
              center={currentPathPoints[0]}
              radius={7}
              pathOptions={{
                fillColor: '#6366f1',
                color: '#fff',
                weight: 2,
                fillOpacity: 1
              }}
            />
            <CircleMarker
              center={currentPathPoints[currentPathPoints.length - 1]}
              radius={12}
              pathOptions={{
                fillColor: '#f43f5e',
                color: '#fff',
                weight: 2,
                fillOpacity: 1,
                className: 'destination-pulse'
              }}
            />
          </>
        )}

        {/* Infrastructure Markers */}
        {mapData?.infrastructure.map((infra: MapInfrastructure) => {
          const isCritical = infra.hvi > 75;
          return (
            <CircleMarker
              key={infra.id}
              center={[infra.location.lat, infra.location.lng]}
              radius={(infra.hvi / 10) + 8 + (intensity * 0.05)}
              pathOptions={{
                fillColor: getRiskColor(infra.hvi),
                color: isCritical ? '#ffffff' : 'transparent',
                weight: 2,
                fillOpacity: 0.9,
                className: isCritical ? 'animate-pulse-fast' : ''
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 text-black">
                  <h4 className="font-bold text-indigo-400">{infra.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">HVI: {infra.hvi.toFixed(1)}</p>
                  <div className="mt-2 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${infra.hvi > 75 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${infra.hvi}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 uppercase">Criticality driven by population density & hazard proximity</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {isBlockageMode && (
        <div className="absolute top-6 left-6 z-[1000] px-4 py-2 bg-rose-500 text-white text-xs font-black rounded-full shadow-lg shadow-rose-500/20 animate-pulse uppercase tracking-widest">
          Blockage Mode Active: Click Roads to Close
        </div>
      )}

      {!currentPathPoints && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] px-8 py-6 bg-rose-500/90 backdrop-blur-3xl text-white rounded-3xl border border-white/20 shadow-2xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase mb-1">Grid Lock Alert</h2>
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest">No viable route for emergency services</p>
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-[1000] p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4">
        <div className="flex flex-col text-white">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Current Route ETA</span>
          <span className="text-xl font-black text-indigo-400">{currentPathPoints ? `${routeEtaMinutes} min` : 'NO PATH'}</span>
        </div>
        {currentPathPoints && (
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              🚑
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfrastructureMap;
