import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Activity, Clock, MapPin } from 'lucide-react';

// Cross node icon with congestion indicator
const createCrossNodeIcon = (congestionLevel = 0) => {
  const colors = {
    0: '#059669', // Green - No congestion
    1: '#f59e0b', // Yellow - Light congestion
    2: '#ef4444', // Red - Heavy congestion
  };
  
  const level = Math.min(congestionLevel, 2);
  const color = colors[level];
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
        <!-- Main junction circle -->
        <circle cx="20" cy="20" r="16" fill="${color}" stroke="#ffffff" stroke-width="3"/>
        <circle cx="20" cy="20" r="10" fill="#ffffff"/>
        <circle cx="20" cy="20" r="6" fill="${color}"/>
        
        <!-- Junction cross lines -->
        <line x1="4" y1="20" x2="36" y2="20" stroke="#ffffff" stroke-width="3"/>
        <line x1="20" y1="4" x2="20" y2="36" stroke="#ffffff" stroke-width="3"/>
        
        <!-- Congestion indicator -->
        ${congestionLevel > 0 ? `
          <circle cx="32" cy="8" r="6" fill="#dc2626"/>
          <text x="32" y="12" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">${congestionLevel}</text>
        ` : ''}
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const CrossNodePopup = ({ node, congestionData, trains }) => {
  // Get congestion info for this specific node
  const nodeData = congestionData[node.stationCode] || { level: 'low', trainCount: 0, trains: [] };
  
  const getStatusIcon = (status) => {
    if (status === 'on-time') return <Activity className="h-4 w-4 text-green-500" />;
    if (status === 'delayed') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getCongestionIcon = (level) => {
    if (level === 'high') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (level === 'medium') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Activity className="h-4 w-4 text-green-500" />;
  };

  const getCongestionText = (level) => {
    if (level === 'high') return 'Heavy';
    if (level === 'medium') return 'Light';
    return 'Clear';
  };

  const getCongestionColor = (level) => {
    if (level === 'high') return 'bg-red-50 border-red-200 text-red-600';
    if (level === 'medium') return 'bg-yellow-50 border-yellow-200 text-yellow-600';
    return 'bg-green-50 border-green-200 text-green-600';
  };
  
  return (
    <div className="font-sans min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-purple-600">{node.name}</h3>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-purple-500 mr-1" />
          <span className="text-xs text-gray-600">Junction</span>
        </div>
      </div>
      
      {/* Congestion Status */}
      <div className={`p-2 rounded-lg mb-3 border ${getCongestionColor(nodeData.level)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getCongestionIcon(nodeData.level)}
            <span className="text-sm font-medium ml-1">Congestion Status</span>
          </div>
          <span className="text-sm font-bold">
            {getCongestionText(nodeData.level)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {nodeData.trainCount} train{nodeData.trainCount !== 1 ? 's' : ''} in vicinity
        </p>
      </div>

      {/* Connected Routes */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-800 mb-2">Connected Routes</h4>
        <div className="space-y-1">
          {node.routes.map(routeId => {
            const routeColors = {
              delhi_mumbai: '#2563eb',
              mumbai_pune: '#dc2626', 
              mumbai_local: '#059669'
            };
            const routeNames = {
              delhi_mumbai: 'Delhi-Mumbai',
              mumbai_pune: 'Mumbai-Pune',
              mumbai_local: 'Mumbai Local'
            };
            
            return (
              <div key={routeId} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: routeColors[routeId] }}
                ></div>
                <span className="text-sm text-gray-700">{routeNames[routeId]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trains at Junction */}
      {nodeData.trains && nodeData.trains.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Trains at Junction</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {nodeData.trains.slice(0, 5).map(train => {
              return (
                <div key={train.id} className="p-2 bg-gray-50 rounded border-l-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-blue-600">{train.name}</p>
                      <p className="text-xs text-gray-600">#{train.id}</p>
                    </div>
                    {getStatusIcon(train.status)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    <p>Speed: {train.speed} km/h</p>
                    {train.delay > 0 && (
                      <p className="text-red-600">Delay: +{train.delay} min</p>
                    )}
                  </div>
                </div>
              );
            })}
            {nodeData.trains.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{nodeData.trains.length - 5} more trains
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CrossNodeMarker = ({ node, congestionData, trains }) => {
  // Get congestion info for this specific node
  const nodeData = congestionData[node.stationCode] || { level: 'low', trainCount: 0, trains: [] };
  
  // Map congestion level to numeric value for icon
  const congestionLevel = nodeData.level === 'high' ? 2 : nodeData.level === 'medium' ? 1 : 0;
  
  return (
    <Marker
      position={[node.lat, node.lng]}
      icon={createCrossNodeIcon(congestionLevel)}
    >
      <Popup maxWidth={300} maxHeight={400}>
        <CrossNodePopup 
          node={node} 
          congestionData={congestionData} 
          trains={trains} 
        />
      </Popup>
    </Marker>
  );
};

export default CrossNodeMarker;