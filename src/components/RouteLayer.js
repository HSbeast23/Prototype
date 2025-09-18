import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { routes, getRouteCoordinates } from '../data/multiRouteData';

// Station icons for different route types
const createStationIcon = (routeType, isJunction = false) => {
  const colors = {
    intercity: '#ef4444',
    suburban: '#059669',
    junction: '#7c3aed'
  };
  
  const color = isJunction ? colors.junction : colors[routeType];
  const size = isJunction ? 32 : 24;
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="#ffffff" stroke-width="3"/>
        <circle cx="16" cy="16" r="6" fill="#ffffff"/>
        ${isJunction ? '<circle cx="16" cy="16" r="3" fill="' + color + '"/>' : ''}
      </svg>
    `),
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

// Calculate offset coordinates for parallel tracks
const calculateOffset = (coord1, coord2, offsetDistance) => {
  const dx = coord2[1] - coord1[1]; // longitude difference
  const dy = coord2[0] - coord1[0]; // latitude difference
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return { left: coord1, right: coord1 };
  
  const unitX = -dy / length; // perpendicular unit vector
  const unitY = dx / length;
  
  const leftOffset = [
    coord1[0] + unitY * offsetDistance,
    coord1[1] + unitX * offsetDistance
  ];
  const rightOffset = [
    coord1[0] - unitY * offsetDistance,
    coord1[1] - unitX * offsetDistance
  ];
  
  return { left: leftOffset, right: rightOffset };
};

// Create parallel track coordinates
const createParallelTracks = (coordinates, offsetDistance = 0.0003) => {
  const leftTrack = [];
  const rightTrack = [];
  
  for (let i = 0; i < coordinates.length; i++) {
    if (i === 0 && coordinates.length > 1) {
      // First point - use direction to next point
      const offset = calculateOffset(coordinates[i], coordinates[i + 1], offsetDistance);
      leftTrack.push(offset.left);
      rightTrack.push(offset.right);
    } else if (i === coordinates.length - 1) {
      // Last point - use direction from previous point
      const offset = calculateOffset(coordinates[i - 1], coordinates[i], offsetDistance);
      leftTrack.push(offset.left);
      rightTrack.push(offset.right);
    } else {
      // Middle points - average the offsets from both directions
      const offset1 = calculateOffset(coordinates[i - 1], coordinates[i], offsetDistance);
      const offset2 = calculateOffset(coordinates[i], coordinates[i + 1], offsetDistance);
      
      const avgLeft = [
        (offset1.left[0] + offset2.left[0]) / 2,
        (offset1.left[1] + offset2.left[1]) / 2
      ];
      const avgRight = [
        (offset1.right[0] + offset2.right[0]) / 2,
        (offset1.right[1] + offset2.right[1]) / 2
      ];
      
      leftTrack.push(avgLeft);
      rightTrack.push(avgRight);
    }
  }
  
  return { leftTrack, rightTrack };
};

const RouteLayer = ({ route, trains = [], visible = true, showStations = true, junctionStations = [] }) => {
  if (!visible || !route) return null;
  
  const coordinates = getRouteCoordinates(route.id);
  const { leftTrack, rightTrack } = createParallelTracks(coordinates);
  
  return (
    <>
      {/* Railway Track Base (Ballast) */}
      <Polyline
        positions={coordinates}
        color="#8B7355"
        weight={8}
        opacity={0.6}
      />
      
      {/* Railway Sleepers/Ties */}
      <Polyline
        positions={coordinates}
        color="#654321"
        weight={6}
        opacity={0.8}
        dashArray="3, 8"
      />
      
      {/* Left Rail */}
      <Polyline
        positions={leftTrack}
        color="#2C3E50"
        weight={2}
        opacity={0.9}
      />
      
      {/* Right Rail */}
      <Polyline
        positions={rightTrack}
        color="#2C3E50"
        weight={2}
        opacity={0.9}
      />
      
      {/* Route Color Identifier Line (center) */}
      <Polyline
        positions={coordinates}
        color={route.color}
        weight={3}
        opacity={0.8}
        dashArray={route.type === 'suburban' ? "5, 5" : route.type === 'intercity' ? "8, 3" : "10, 2"}
      />
      
      {/* Station markers */}
      {showStations && route.stations.map((station, index) => {
        const isJunction = junctionStations.includes(station.code);
        
        return (
          <Marker
            key={`${route.id}-${index}`}
            position={[station.lat, station.lng]}
            icon={createStationIcon(route.type, isJunction)}
          >
            <Popup>
              <div className="font-sans">
                <h4 className={`font-bold text-lg ${isJunction ? 'text-purple-600' : 'text-red-600'}`}>
                  {station.name}
                  {isJunction && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Junction</span>}
                </h4>
                <p className="text-sm text-gray-600">Code: <strong>{station.code}</strong></p>
                <p className="text-sm text-gray-600">Route: <strong style={{ color: route.color }}>{route.name}</strong></p>
                <p className="text-sm text-gray-600">Type: <strong>{route.type}</strong></p>
                
                {/* Show route connections for junction stations */}
                {isJunction && (
                  <div className="mt-2 p-2 bg-purple-50 rounded">
                    <p className="text-xs font-medium text-purple-800">Connected Routes:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {routes.map(r => {
                        const hasStation = r.stations.some(s => s.code === station.code);
                        if (hasStation) {
                          return (
                            <span 
                              key={r.id} 
                              className="text-xs px-2 py-1 rounded text-white"
                              style={{ backgroundColor: r.color }}
                            >
                              {r.name.split(' ')[0]}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default RouteLayer;