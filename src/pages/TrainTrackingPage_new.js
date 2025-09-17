import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, TrendingUp, AlertTriangle, Play, Pause } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RouteLayer from '../components/RouteLayer';
import CrossNodeMarker from '../components/CrossNodeMarker';
import EnhancedTrainMarker from '../components/EnhancedTrainMarker';
import MapLegend from '../components/MapLegend';
import { multiRouteData } from '../data/multiRouteData';

const TrainTrackingPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const [trains, setTrains] = useState(multiRouteData.trains);
  const [visibleRoutes, setVisibleRoutes] = useState(
    multiRouteData.routes.reduce((acc, route) => ({ ...acc, [route.id]: true }), {})
  );

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTrains(prevTrains => 
        prevTrains.map(train => multiRouteData.updateTrainPosition(train))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleBack = () => {
    window.history.back();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getCongestionData = () => {
    return multiRouteData.getCongestionData(trains);
  };

  const filteredRoutes = multiRouteData.routes.filter(route => visibleRoutes[route.id]);
  const filteredTrains = trains.filter(train => visibleRoutes[train.routeId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Multi-Route Railway Network</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                isPlaying 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            <div className="text-sm text-gray-600">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[19.0760, 72.8777]} // Mumbai center
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Render Routes */}
            {filteredRoutes.map(route => (
              <RouteLayer 
                key={route.id} 
                route={route} 
                trains={filteredTrains.filter(t => t.routeId === route.id)}
              />
            ))}

            {/* Render Cross Nodes */}
            {multiRouteData.crossNodes.map(node => (
              <CrossNodeMarker 
                key={node.stationCode} 
                node={node} 
                congestionData={getCongestionData()}
                trains={filteredTrains}
              />
            ))}

            {/* Render Trains */}
            {filteredTrains.map(train => (
              <EnhancedTrainMarker 
                key={train.id} 
                train={train} 
                route={multiRouteData.routes.find(r => r.id === train.routeId)}
              />
            ))}
          </MapContainer>

          {/* Map Legend */}
          <MapLegend 
            routes={multiRouteData.routes}
            visibleRoutes={visibleRoutes}
            onToggleRoute={setVisibleRoutes}
          />
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-white shadow-lg border-l overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Network Overview</h2>
            
            {/* Network Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-600">Active Routes</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {Object.values(visibleRoutes).filter(Boolean).length}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={16} />
                  <span className="text-sm font-medium text-green-600">Active Trains</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {filteredTrains.length}
                </div>
              </div>
            </div>

            {/* Route Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Route Status</h3>
              <div className="space-y-3">
                {multiRouteData.routes.map(route => {
                  const routeTrains = trains.filter(t => t.routeId === route.id);
                  const onTimeTrains = routeTrains.filter(t => t.status === 'on-time').length;
                  const delayedTrains = routeTrains.filter(t => t.status === 'delayed').length;
                  
                  return (
                    <div key={route.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: route.color }}>
                          {route.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {routeTrains.length} trains
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">{onTimeTrains} on-time</span>
                        <span className="text-red-600">{delayedTrains} delayed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Trains */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Trains</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredTrains.map(train => {
                  const route = multiRouteData.routes.find(r => r.id === train.routeId);
                  const currentStation = route?.stations[train.currentStationIndex];
                  const nextStation = route?.stations[train.currentStationIndex + 1];
                  
                  return (
                    <div key={train.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{train.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          train.status === 'on-time' 
                            ? 'bg-green-100 text-green-700'
                            : train.status === 'delayed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {train.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>From: {currentStation?.name}</div>
                        <div>To: {nextStation?.name || 'Final Destination'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          <span>Progress: {Math.round(train.progressToNext * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Congestion Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Network Alerts</h3>
              <div className="space-y-2">
                {Object.entries(getCongestionData()).map(([stationCode, congestion]) => {
                  if (congestion.level === 'low') return null;
                  
                  return (
                    <div key={stationCode} className={`p-3 rounded-lg flex items-start gap-2 ${
                      congestion.level === 'high' 
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <AlertTriangle 
                        size={16} 
                        className={congestion.level === 'high' ? 'text-red-600' : 'text-yellow-600'} 
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {congestion.stationName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {congestion.level === 'high' ? 'High' : 'Moderate'} congestion - {congestion.trainCount} trains
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainTrackingPage;