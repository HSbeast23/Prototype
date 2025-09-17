import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Activity, Clock, AlertTriangle, StopCircle } from 'react-feather';

// Enhanced train icon with status colors
const createTrainIcon = (status, delay = 0, routeColor = '#2563eb') => {
  let statusColor = '#10b981'; // Green - On time
  if (delay > 0 && delay <= 10) statusColor = '#f59e0b'; // Orange - Minor delay
  if (delay > 10) statusColor = '#ef4444'; // Red - Major delay
  if (status === 'Stopped') statusColor = '#6b7280'; // Gray - Stopped

  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
        <!-- Train body -->
        <rect x="3" y="12" width="30" height="14" rx="3" fill="${routeColor}" stroke="${statusColor}" stroke-width="2"/>
        
        <!-- Windows -->
        <rect x="6" y="15" width="3" height="3" fill="#ffffff" rx="1"/>
        <rect x="11" y="15" width="3" height="3" fill="#ffffff" rx="1"/>
        <rect x="16" y="15" width="3" height="3" fill="#ffffff" rx="1"/>
        <rect x="21" y="15" width="3" height="3" fill="#ffffff" rx="1"/>
        <rect x="26" y="15" width="3" height="3" fill="#ffffff" rx="1"/>
        
        <!-- Wheels -->
        <circle cx="9" cy="24" r="2.5" fill="#374151" stroke="${statusColor}" stroke-width="1"/>
        <circle cx="27" cy="24" r="2.5" fill="#374151" stroke="${statusColor}" stroke-width="1"/>
        
        <!-- Status indicator -->
        <circle cx="30" cy="6" r="4" fill="${statusColor}" stroke="#ffffff" stroke-width="1"/>
        
        <!-- Direction arrow -->
        <polygon points="31,12 35,18 31,24" fill="${routeColor}"/>
      </svg>
    `),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Interpolate between two positions for smooth movement
const interpolatePosition = (start, end, progress) => {
  const lat = start.lat + (end.lat - start.lat) * progress;
  const lng = start.lng + (end.lng - start.lng) * progress;
  return { lat, lng };
};

const EnhancedTrainMarker = ({ 
  train, 
  route,
  onTrainUpdate, 
  simulationSpeed = 1 
}) => {
  if (!train || !route || !route.stations) return null;

  const currentStation = route.stations[train.currentStationIndex];
  const nextStationIndex = (train.currentStationIndex + 1) % route.stations.length;
  const nextStation = route.stations[nextStationIndex];

  // Calculate current position based on progress
  const getCurrentPosition = () => {
    if (!currentStation || !nextStation) return currentStation;
    
    return interpolatePosition(
      currentStation,
      nextStation,
      train.progressToNext || 0
    );
  };

  const currentPosition = getCurrentPosition();

  const getStatusIcon = (status) => {
    if (status === 'stopped') return <StopCircle className="h-5 w-5 text-gray-500" />;
    if (status === 'on-time') return <Activity className="h-5 w-5 text-green-500" />;
    if (status === 'delayed') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = (status) => {
    if (status === 'stopped') return "Stopped";
    if (status === 'on-time') return "On Time";
    if (status === 'delayed') return "Delayed";
    return "Running";
  };

  return (
    <Marker 
      position={[currentPosition.lat, currentPosition.lng]} 
      icon={createTrainIcon(train.status, train.delay || 0, route.color)}
    >
      <Popup>
        <div className="font-sans min-w-48">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg" style={{ color: route.color }}>
                {train.name}
              </h3>
              <p className="text-sm text-gray-600 font-mono">#{train.id}</p>
            </div>
            {getStatusIcon(train.status)}
          </div>

          {/* Route Info */}
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-600 mb-1">Route</p>
            <p className="font-medium text-sm">{route.name}</p>
            <p className="text-xs text-gray-600">{route.type}</p>
          </div>

          {/* Current Journey */}
          <div className="space-y-2 mb-3">
            <div>
              <p className="text-xs text-gray-600">Current Station</p>
              <p className="font-semibold text-sm">{currentStation?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Next Station</p>
              <p className="font-semibold text-sm">{nextStation?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Progress</p>
              <p className="font-semibold text-sm">{Math.round((train.progressToNext || 0) * 100)}%</p>
            </div>
          </div>

          {/* Status */}
          <div className={`p-2 rounded border ${
            train.status === 'stopped' ? 'bg-gray-50 border-gray-200' :
            train.status === 'on-time' ? 'bg-green-50 border-green-200' :
            train.status === 'delayed' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className={`text-sm font-bold ${
                train.status === 'stopped' ? 'text-gray-600' :
                train.status === 'on-time' ? 'text-green-600' :
                train.status === 'delayed' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {getStatusText(train.status)}
              </span>
            </div>
            {train.delay > 0 && (
              <p className="text-xs text-red-600 mt-1">
                Delay: +{train.delay} minutes
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Speed: {train.speed} km/h
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default EnhancedTrainMarker;