// Multi-route railway network data
const routes = [
  {
    id: 'delhi_mumbai',
    name: 'Delhi → Mumbai Rajdhani',
    color: '#2563eb', // Blue
    type: 'intercity',
    stations: [
      { lat: 28.6139, lng: 77.2090, name: "New Delhi", code: "NDLS" },
      { lat: 27.4924, lng: 77.6737, name: "Mathura", code: "MTJ" },
      { lat: 27.1767, lng: 78.0081, name: "Agra", code: "AGC" },
      { lat: 26.2183, lng: 78.1828, name: "Gwalior", code: "GWL" },
      { lat: 25.4484, lng: 78.5685, name: "Jhansi", code: "JHS" },
      { lat: 23.2599, lng: 77.4126, name: "Bhopal", code: "BPL" },
      { lat: 22.6140, lng: 77.7626, name: "Itarsi", code: "ET" },
      { lat: 21.8257, lng: 76.3526, name: "Khandwa", code: "KNW" },
      { lat: 21.0455, lng: 75.8011, name: "Bhusawal", code: "BSL" },
      { lat: 19.9975, lng: 73.7898, name: "Nashik", code: "NK" },
      { lat: 19.2183, lng: 72.9781, name: "Thane", code: "TNA" },
      { lat: 19.0760, lng: 72.8777, name: "Mumbai Central", code: "MMCT" }
    ]
  },
  {
    id: 'mumbai_pune',
    name: 'Mumbai → Pune Express',
    color: '#dc2626', // Red
    type: 'intercity',
    stations: [
      { lat: 19.0760, lng: 72.8777, name: "Mumbai Central", code: "MMCT" },
      { lat: 19.2183, lng: 72.9781, name: "Thane", code: "TNA" },
      { lat: 19.0330, lng: 73.0297, name: "Kalyan", code: "KYN" },
      { lat: 18.9894, lng: 73.1275, name: "Karjat", code: "KJT" },
      { lat: 18.9067, lng: 73.3364, name: "Lonavala", code: "LNL" },
      { lat: 18.6298, lng: 73.7997, name: "Pune", code: "PUNE" }
    ]
  },
  {
    id: 'mumbai_local',
    name: 'Mumbai Local (Western)',
    color: '#059669', // Green
    type: 'suburban',
    stations: [
      { lat: 19.0760, lng: 72.8777, name: "Mumbai Central", code: "MMCT" },
      { lat: 19.0896, lng: 72.8656, name: "Mahalaxmi", code: "MX" },
      { lat: 19.1136, lng: 72.8697, name: "Lower Parel", code: "LPR" },
      { lat: 19.1197, lng: 72.8746, name: "Elphinstone", code: "EPH" },
      { lat: 19.1268, lng: 72.8777, name: "Dadar", code: "DR" },
      { lat: 19.1410, lng: 72.8803, name: "Bandra", code: "BA" },
      { lat: 19.1972, lng: 72.8235, name: "Andheri", code: "ADH" },
      { lat: 19.2183, lng: 72.9781, name: "Thane", code: "TNA" }
    ]
  }
];

// Cross-connection nodes (railway junctions)
const crossNodes = [
  {
    stationCode: 'TNA',
    lat: 19.2183,
    lng: 72.9781,
    name: 'Thane Junction',
    routes: ['delhi_mumbai', 'mumbai_pune', 'mumbai_local'],
    congestionRadius: 500 // meters
  },
  {
    stationCode: 'MMCT',
    lat: 19.0760,
    lng: 72.8777,
    name: 'Mumbai Central Junction',
    routes: ['delhi_mumbai', 'mumbai_pune', 'mumbai_local'],
    congestionRadius: 500
  }
];

// Train data with enhanced structure
const trains = [
  {
    id: "TRAIN_12952",
    name: "Mumbai Rajdhani",
    routeId: 'delhi_mumbai',
    currentStationIndex: 0,
    progressToNext: 0,
    status: 'on-time',
    speed: 95,
    delay: 0,
    direction: 1 // 1 for forward, -1 for reverse
  },
  {
    id: "TRAIN_12124",
    name: "Deccan Queen",
    routeId: 'mumbai_pune',
    currentStationIndex: 1,
    progressToNext: 0.3,
    status: 'delayed',
    speed: 85,
    delay: 5,
    direction: 1
  },
  {
    id: "LOCAL_01",
    name: "Western Local 1",
    routeId: 'mumbai_local',
    currentStationIndex: 2,
    progressToNext: 0.7,
    status: 'on-time',
    speed: 60,
    delay: 0,
    direction: 1
  },
  {
    id: "LOCAL_02",
    name: "Western Local 2",
    routeId: 'mumbai_local',
    currentStationIndex: 5,
    progressToNext: 0.1,
    status: 'delayed',
    speed: 55,
    delay: 3,
    direction: -1 // Reverse direction
  },
  {
    id: "TRAIN_12951",
    name: "Mumbai Rajdhani Return",
    routeId: 'delhi_mumbai',
    currentStationIndex: 8,
    progressToNext: 0.8,
    status: 'delayed',
    speed: 90,
    delay: 15,
    direction: -1
  }
];

// Calculate distance between two points (in meters)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Update train position for animation
const updateTrainPosition = (train) => {
  const route = routes.find(r => r.id === train.routeId);
  if (!route || !route.stations) return train;

  const stations = route.stations;
  let newProgress = train.progressToNext + 0.02; // Adjust speed as needed
  let newStationIndex = train.currentStationIndex;

  if (newProgress >= 1) {
    newProgress = 0;
    if (train.direction === 1) {
      newStationIndex = (train.currentStationIndex + 1) % stations.length;
    } else {
      newStationIndex = train.currentStationIndex === 0 ? stations.length - 1 : train.currentStationIndex - 1;
    }
  }

  return {
    ...train,
    currentStationIndex: newStationIndex,
    progressToNext: newProgress
  };
};

// Get congestion data for all cross nodes
const getCongestionData = (trains) => {
  const congestionData = {};
  
  crossNodes.forEach(node => {
    const trainsNearby = trains.filter(train => {
      const route = routes.find(r => r.id === train.routeId);
      if (!route) return false;

      const currentStation = route.stations[train.currentStationIndex];
      const nextStation = route.stations[train.currentStationIndex + 1];
      
      if (!currentStation || !nextStation) return false;

      // Calculate train's current position
      const trainLat = currentStation.lat + (nextStation.lat - currentStation.lat) * train.progressToNext;
      const trainLng = currentStation.lng + (nextStation.lng - currentStation.lng) * train.progressToNext;

      const distance = calculateDistance(trainLat, trainLng, node.lat, node.lng);
      return distance <= node.congestionRadius;
    });

    let level = 'low';
    if (trainsNearby.length >= 3) level = 'high';
    else if (trainsNearby.length >= 2) level = 'medium';

    congestionData[node.stationCode] = {
      level,
      trainCount: trainsNearby.length,
      trains: trainsNearby,
      stationName: node.name
    };
  });

  return congestionData;
};

// Get route coordinates for polyline rendering
const getRouteCoordinates = (routeId) => {
  const route = routes.find(r => r.id === routeId);
  return route ? route.stations.map(station => [station.lat, station.lng]) : [];
};

// Export the main data object that components expect
export const multiRouteData = {
  routes,
  trains,
  crossNodes,
  updateTrainPosition,
  getCongestionData
};

// Also export individual items for direct import
export { routes, trains, crossNodes, calculateDistance, updateTrainPosition, getCongestionData, getRouteCoordinates };

// Legacy exports for backward compatibility
export const mockTrains = trains;