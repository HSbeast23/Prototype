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

const RouteLayer = ({ route, trains = [], visible = true, showStations = true, junctionStations = [] }) => {
  if (!visible || !route) return null;
  
  const coordinates = getRouteCoordinates(route.id);
  
  return (
    <>
      {/* Route polyline */}
      <Polyline
        positions={coordinates}
        color={route.color}
        weight={route.type === 'suburban' ? 3 : 4}
        opacity={0.8}
        dashArray={route.type === 'suburban' ? "5, 5" : "10, 5"}
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