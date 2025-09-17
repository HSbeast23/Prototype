import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom train icon
const trainIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <rect x="2" y="8" width="20" height="10" rx="2" fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
      <circle cx="6" cy="16" r="1.5" fill="#374151"/>
      <circle cx="18" cy="16" r="1.5" fill="#374151"/>
      <rect x="4" y="10" width="16" height="4" fill="#3b82f6"/>
      <rect x="5" y="11" width="2" height="2" fill="#ffffff"/>
      <rect x="8" y="11" width="2" height="2" fill="#ffffff"/>
      <rect x="11" y="11" width="2" height="2" fill="#ffffff"/>
      <rect x="14" y="11" width="2" height="2" fill="#ffffff"/>
      <rect x="17" y="11" width="2" height="2" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Station icon
const stationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Component to animate train movement
const TrainMarker = ({ position, trainData }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  const getStatusColor = (delay) => {
    if (delay === 0) return '#10b981'; // Green - On time
    if (delay <= 10) return '#f59e0b'; // Orange - Minor delay
    return '#ef4444'; // Red - Major delay
  };

  return (
    <Marker position={position} icon={trainIcon}>
      <Popup>
        <div className="font-sans">
          <h3 className="font-bold text-lg text-blue-600">{trainData.name}</h3>
          <p className="text-sm"><strong>Train ID:</strong> {trainData.trainId}</p>
          <p className="text-sm"><strong>Status:</strong> 
            <span style={{ color: getStatusColor(trainData.currentDelay || 0) }} className="font-medium ml-1">
              {trainData.status}
            </span>
          </p>
          {trainData.currentStation && (
            <p className="text-sm"><strong>Next:</strong> {trainData.currentStation}</p>
          )}
          {trainData.currentDelay > 0 && (
            <p className="text-sm text-red-600"><strong>Delay:</strong> {trainData.currentDelay} min</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const TrainMap = ({ trainData, onTrainUpdate }) => {
  const [trainPosition, setTrainPosition] = useState(trainData.route[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Delhi to Mumbai route coordinates
  const routeCoordinates = trainData.route.map(point => [point.lat, point.lng]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % trainData.route.length;
        const nextPosition = trainData.route[nextIndex];
        setTrainPosition(nextPosition);
        
        // Update parent component with current station info
        if (onTrainUpdate) {
          onTrainUpdate({
            ...trainData,
            currentStation: nextPosition.station,
            currentDelay: nextPosition.delay,
            currentIndex: nextIndex
          });
        }
        
        return nextIndex;
      });
    }, 3000); // Move every 3 seconds

    return () => clearInterval(interval);
  }, [trainData, onTrainUpdate]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[24.0, 77.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Railway route polyline */}
        <Polyline
          positions={routeCoordinates}
          color="#2563eb"
          weight={4}
          opacity={0.8}
          dashArray="10, 5"
        />
        
        {/* Station markers */}
        {trainData.route.map((station, index) => (
          <Marker
            key={index}
            position={[station.lat, station.lng]}
            icon={stationIcon}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-red-600">{station.station}</h4>
                <p className="text-sm"><strong>ETA:</strong> {station.eta}</p>
                {station.delay > 0 ? (
                  <p className="text-sm text-red-600"><strong>Delay:</strong> {station.delay} min</p>
                ) : (
                  <p className="text-sm text-green-600"><strong>Status:</strong> On Time</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Animated train marker */}
        <TrainMarker 
          position={[trainPosition.lat, trainPosition.lng]} 
          trainData={{
            ...trainData,
            currentStation: trainPosition.station,
            currentDelay: trainPosition.delay
          }}
        />
      </MapContainer>
    </div>
  );
};

export default TrainMap;