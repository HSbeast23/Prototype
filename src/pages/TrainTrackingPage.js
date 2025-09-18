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
  const [selectedTrain, setSelectedTrain] = useState(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTrains(prevTrains => {
        const updatedTrains = prevTrains.map(train => multiRouteData.updateTrainPosition(train));
        
        // Update selected train if it exists to keep the right panel in sync
        if (selectedTrain) {
          const updatedSelectedTrain = updatedTrains.find(t => t.id === selectedTrain.id);
          if (updatedSelectedTrain) {
            setSelectedTrain(updatedSelectedTrain);
          }
        }
        
        return updatedTrains;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedTrain]);

  const handleBack = () => {
    window.history.back();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getCongestionData = () => {
    return multiRouteData.getCongestionData(trains);
  };

  const handleTrainClick = (trainId) => {
    const train = trains.find(t => t.id === trainId);
    setSelectedTrain(train);
  };

  // Calculate detailed train progress for "Where is My Train" feature
  const getTrainJourneyDetails = (train) => {
    if (!train) return null;
    
    const route = multiRouteData.routes.find(r => r.id === train.routeId);
    if (!route) return null;

    const stations = route.stations;
    const currentIndex = train.currentStationIndex;
    const direction = train.direction;
    const progress = train.progressToNext || 0;
    
    // Calculate start and end stations based on direction
    const startStation = direction === 1 ? stations[0] : stations[stations.length - 1];
    const endStation = direction === 1 ? stations[stations.length - 1] : stations[0];
    
    // Calculate passed, current, and upcoming stations with real-time updates
    const passedStations = [];
    const upcomingStations = [];
    let currentStation = null;
    let nextStation = null;
    
    // Generate base time (8:00 AM start)
    const baseHour = 8;
    const currentTime = new Date();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    if (direction === 1) {
      // Forward direction
      for (let i = 0; i < currentIndex; i++) {
        const stationTime = new Date();
        stationTime.setHours(baseHour + Math.floor(i * 0.5), (i * 30) % 60);
        passedStations.push({
          ...stations[i],
          status: 'passed',
          estimatedTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actualTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCompleted: true
        });
      }
      
      // Current station with real-time progress
      const currentStationTime = new Date();
      currentStationTime.setHours(baseHour + Math.floor(currentIndex * 0.5), (currentIndex * 30) % 60);
      currentStation = {
        ...stations[currentIndex],
        status: 'current',
        estimatedTime: currentStationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        progress: Math.round(progress * 100),
        isActive: true,
        departureProgress: progress
      };
      
      // Next station
      if (currentIndex + 1 < stations.length) {
        const nextStationTime = new Date();
        nextStationTime.setHours(baseHour + Math.floor((currentIndex + 1) * 0.5), ((currentIndex + 1) * 30) % 60);
        nextStation = {
          ...stations[currentIndex + 1],
          status: 'next',
          estimatedTime: nextStationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrivalProgress: progress,
          isNext: true
        };
      }
      
      for (let i = currentIndex + 1; i < stations.length; i++) {
        const stationTime = new Date();
        stationTime.setHours(baseHour + Math.floor(i * 0.5) + Math.floor(train.delay / 60), ((i * 30) + train.delay) % 60);
        upcomingStations.push({
          ...stations[i],
          status: 'upcoming',
          estimatedTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          delayAdjusted: train.delay > 0,
          isUpcoming: true
        });
      }
    } else {
      // Reverse direction
      for (let i = stations.length - 1; i > currentIndex; i--) {
        const stationTime = new Date();
        stationTime.setHours(baseHour + Math.floor((stations.length - 1 - i) * 0.5), ((stations.length - 1 - i) * 30) % 60);
        passedStations.push({
          ...stations[i],
          status: 'passed',
          estimatedTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actualTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCompleted: true
        });
      }
      
      const currentStationTime = new Date();
      currentStationTime.setHours(baseHour + Math.floor((stations.length - 1 - currentIndex) * 0.5), ((stations.length - 1 - currentIndex) * 30) % 60);
      currentStation = {
        ...stations[currentIndex],
        status: 'current',
        estimatedTime: currentStationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        progress: Math.round((1 - progress) * 100),
        isActive: true,
        departureProgress: 1 - progress
      };
      
      if (currentIndex - 1 >= 0) {
        const nextStationTime = new Date();
        nextStationTime.setHours(baseHour + Math.floor((stations.length - currentIndex) * 0.5), ((stations.length - currentIndex) * 30) % 60);
        nextStation = {
          ...stations[currentIndex - 1],
          status: 'next',
          estimatedTime: nextStationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrivalProgress: 1 - progress,
          isNext: true
        };
      }
      
      for (let i = currentIndex - 1; i >= 0; i--) {
        const stationTime = new Date();
        stationTime.setHours(baseHour + Math.floor((stations.length - 1 - i) * 0.5) + Math.floor(train.delay / 60), (((stations.length - 1 - i) * 30) + train.delay) % 60);
        upcomingStations.push({
          ...stations[i],
          status: 'upcoming',
          estimatedTime: stationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          delayAdjusted: train.delay > 0,
          isUpcoming: true
        });
      }
    }

    // Calculate overall journey progress
    const totalDistance = stations.length - 1;
    const completedDistance = passedStations.length + progress;
    const progressPercentage = Math.round((completedDistance / totalDistance) * 100);

    return {
      train,
      route,
      startStation,
      endStation,
      currentStation,
      nextStation,
      passedStations,
      upcomingStations,
      totalStations: stations.length,
      completedStations: passedStations.length + 1,
      progressPercentage,
      isMoving: progress > 0 && progress < 1,
      timeToNext: nextStation ? Math.round((1 - progress) * 15) : 0, // Estimated minutes
      currentSpeed: train.speed,
      realTimeProgress: progress
    };
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
            center={[19.0760, 72.8777]}
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
                onTrainClick={handleTrainClick}
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
            {/* Header with back button for selected train */}
            {selectedTrain ? (
              <div className="mb-6">
                <button 
                  onClick={() => setSelectedTrain(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Network</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800">Where is My Train</h2>
              </div>
            ) : (
              <h2 className="text-xl font-bold text-gray-800 mb-6">Network Overview</h2>
            )}

            {/* Selected Train Details */}
            {selectedTrain ? (
              <div className="space-y-6">
                {(() => {
                  const journeyDetails = getTrainJourneyDetails(selectedTrain);
                  if (!journeyDetails) return <div>Unable to load train details</div>;

                  return (
                    <>
                      {/* Train Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{journeyDetails.train.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            journeyDetails.train.status === 'on-time' 
                              ? 'bg-green-100 text-green-700'
                              : journeyDetails.train.status === 'delayed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {journeyDetails.train.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">#{journeyDetails.train.id}</p>
                        <p className="text-sm font-medium" style={{ color: journeyDetails.route.color }}>
                          {journeyDetails.route.name}
                        </p>
                      </div>

                      {/* Journey Progress */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            🚂 Live Journey Progress
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {journeyDetails.progressPercentage}%
                          </span>
                        </div>
                        <div className="relative bg-gray-200 h-3 rounded-full mb-3 overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${journeyDetails.progressPercentage}%` }}
                          >
                            {/* Moving indicator */}
                            <div className="absolute top-0 right-0 w-2 h-3 bg-white opacity-60 animate-pulse"></div>
                          </div>
                          {/* Station markers on progress bar */}
                          {journeyDetails.route.stations.map((_, index) => {
                            const position = (index / (journeyDetails.totalStations - 1)) * 100;
                            return (
                              <div
                                key={index}
                                className="absolute top-0 w-0.5 h-3 bg-gray-400"
                                style={{ left: `${position}%` }}
                              ></div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span className="font-medium">{journeyDetails.startStation.name}</span>
                          <span className="font-medium">{journeyDetails.endStation.name}</span>
                        </div>
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>{journeyDetails.completedStations}/{journeyDetails.totalStations} stations</span>
                          <span className="flex items-center gap-1">
                            {journeyDetails.isMoving ? (
                              <>🚂 {journeyDetails.currentSpeed} km/h</>
                            ) : (
                              <>⏸️ Stopped</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Current Status */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          Current Status - LIVE
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Current Station:</span>
                            <span className="font-medium text-blue-800">{journeyDetails.currentStation.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Estimated Time:</span>
                            <span className="font-medium text-blue-800">{journeyDetails.currentStation.estimatedTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Progress to Next:</span>
                            <span className="font-medium text-blue-800 flex items-center gap-2">
                              {journeyDetails.currentStation.progress}%
                              {journeyDetails.isMoving && (
                                <span className="text-xs text-green-600 animate-pulse">● Moving</span>
                              )}
                            </span>
                          </div>
                          {journeyDetails.nextStation && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-blue-700">Next Station:</span>
                              <span className="font-medium text-blue-800">{journeyDetails.nextStation.name}</span>
                            </div>
                          )}
                          {journeyDetails.timeToNext > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-blue-700">ETA to Next:</span>
                              <span className="font-medium text-blue-800">{journeyDetails.timeToNext} min</span>
                            </div>
                          )}
                          {journeyDetails.train.delay > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-red-700">Delay:</span>
                              <span className="font-medium text-red-800">+{journeyDetails.train.delay} min</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Speed:</span>
                            <span className="font-medium text-blue-800">{journeyDetails.currentSpeed} km/h</span>
                          </div>
                        </div>
                        
                        {/* Real-time progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-blue-600 mb-1">
                            <span>{journeyDetails.currentStation.name}</span>
                            <span>{journeyDetails.nextStation?.name || 'Destination'}</span>
                          </div>
                          <div className="bg-blue-200 h-2 rounded-full">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-in-out"
                              style={{ width: `${journeyDetails.currentStation.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Station Timeline */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span>Live Station Timeline</span>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {/* Passed Stations */}
                          {journeyDetails.passedStations.map((station, index) => (
                            <div key={`passed-${index}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400 transform transition-all duration-500 hover:scale-102">
                              <div className="relative">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                {index < journeyDetails.passedStations.length - 1 && (
                                  <div className="absolute top-4 left-2 w-0.5 h-8 bg-green-300"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-green-800">{station.name}</span>
                                  <span className="text-sm text-green-600 font-medium">{station.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">✓ Departed</span>
                                  <span className="text-xs text-green-500">on time</span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Current Station */}
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 transform transition-all duration-500 animate-pulse">
                            <div className="relative">
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-ping">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <div className="absolute top-4 left-2 w-0.5 h-8 bg-blue-300"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-800">{journeyDetails.currentStation.name}</span>
                                <span className="text-sm font-bold text-blue-600">{journeyDetails.currentStation.estimatedTime}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded animate-pulse">
                                  📍 Currently Here
                                </span>
                                <span className="text-xs text-blue-500">
                                  {journeyDetails.isMoving ? '🚂 Moving' : '⏸️ Stopped'}
                                </span>
                              </div>
                              {/* Real-time progress within station */}
                              <div className="mt-1">
                                <div className="flex justify-between text-xs text-blue-600 mb-1">
                                  <span>Progress</span>
                                  <span>{journeyDetails.currentStation.progress}%</span>
                                </div>
                                <div className="bg-blue-200 h-1.5 rounded-full">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${journeyDetails.currentStation.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Next Station (if exists) */}
                          {journeyDetails.nextStation && (
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 transform transition-all duration-500">
                              <div className="relative">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-between animate-bounce">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <div className="absolute top-4 left-2 w-0.5 h-8 bg-yellow-300"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-yellow-800">{journeyDetails.nextStation.name}</span>
                                  <span className="text-sm font-medium text-yellow-600">{journeyDetails.nextStation.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                    🎯 Next Stop
                                  </span>
                                  {journeyDetails.timeToNext > 0 && (
                                    <span className="text-xs text-yellow-500">
                                      ETA: {journeyDetails.timeToNext} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Upcoming Stations */}
                          {journeyDetails.upcomingStations.map((station, index) => (
                            <div key={`upcoming-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transform transition-all duration-500 hover:bg-gray-100">
                              <div className="relative">
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                {index < journeyDetails.upcomingStations.length - 1 && (
                                  <div className="absolute top-4 left-2 w-0.5 h-8 bg-gray-300"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-700">{station.name}</span>
                                  <span className="text-sm text-gray-600">{station.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    ⏳ Upcoming
                                  </span>
                                  {station.delayAdjusted && (
                                    <span className="text-xs text-red-500">delay adjusted</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Journey Summary */}
                      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          📊 Live Journey Analytics
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">REAL-TIME</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded shadow-sm">
                            <span className="text-gray-600 block">Total Stations:</span>
                            <span className="font-bold text-gray-800 text-lg">{journeyDetails.totalStations}</span>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <span className="text-gray-600 block">Completed:</span>
                            <span className="font-bold text-green-600 text-lg">{journeyDetails.completedStations}</span>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <span className="text-gray-600 block">Current Speed:</span>
                            <span className="font-bold text-blue-600 text-lg flex items-center gap-1">
                              {journeyDetails.train.speed}
                              <span className="text-xs">km/h</span>
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded shadow-sm">
                            <span className="text-gray-600 block">Direction:</span>
                            <span className="font-bold text-purple-600 text-lg flex items-center gap-1">
                              {journeyDetails.train.direction === 1 ? '➡️' : '⬅️'}
                              {journeyDetails.train.direction === 1 ? 'Forward' : 'Return'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Real-time status indicators */}
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                          <div className={`p-2 rounded text-center ${
                            journeyDetails.train.status === 'on-time' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="font-medium">On Time</div>
                            <div className={journeyDetails.train.status === 'on-time' ? 'animate-pulse' : ''}>
                              {journeyDetails.train.status === 'on-time' ? '✅' : '⚪'}
                            </div>
                          </div>
                          <div className={`p-2 rounded text-center ${
                            journeyDetails.isMoving 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="font-medium">Moving</div>
                            <div className={journeyDetails.isMoving ? 'animate-pulse' : ''}>
                              {journeyDetails.isMoving ? '🚂' : '⏸️'}
                            </div>
                          </div>
                          <div className={`p-2 rounded text-center ${
                            journeyDetails.train.delay > 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="font-medium">Delayed</div>
                            <div className={journeyDetails.train.delay > 0 ? 'animate-pulse' : ''}>
                              {journeyDetails.train.delay > 0 ? '⚠️' : '⚪'}
                            </div>
                          </div>
                        </div>

                        {/* ETA Information */}
                        {journeyDetails.timeToNext > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-medium">
                              🕐 Next Station ETA: {journeyDetails.timeToNext} minutes
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                {/* Network Overview - Original Content */}
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

                {/* Active Trains - Clickable */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Trains</h3>
                  <p className="text-sm text-gray-600 mb-3">Click on any train to see detailed journey progress</p>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredTrains.map(train => {
                      const route = multiRouteData.routes.find(r => r.id === train.routeId);
                      const currentStation = route?.stations[train.currentStationIndex];
                      const nextStation = route?.stations[train.currentStationIndex + 1];
                      
                      return (
                        <button
                          key={train.id}
                          onClick={() => handleTrainClick(train.id)}
                          className="w-full p-3 border rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
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
                        </button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainTrackingPage;