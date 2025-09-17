import React from 'react';
import { X, Eye, EyeOff } from 'react-feather';

const MapLegend = ({ 
  routes, 
  visibleRoutes, 
  onRouteToggle, 
  showLegend, 
  onToggleLegend 
}) => {
  if (!showLegend) {
    return (
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={onToggleLegend}
          className="bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50"
          title="Show Legend"
        >
          <Eye className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-lg p-4 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Railway Network</h3>
        <button
          onClick={onToggleLegend}
          className="text-gray-400 hover:text-gray-600"
          title="Hide Legend"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Route Controls */}
      <div className="space-y-3 mb-4">
        <h4 className="font-medium text-sm text-gray-700">Routes</h4>
        {Object.entries(routes).map(([routeId, route]) => (
          <div key={routeId} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-1 rounded"
                style={{ backgroundColor: route.color }}
              ></div>
              <span className="text-sm text-gray-700">{route.name.split(' ')[0]}</span>
              <span className="text-xs text-gray-500 capitalize">({route.type})</span>
            </div>
            <button
              onClick={() => onRouteToggle(routeId)}
              className="text-gray-400 hover:text-gray-600"
              title={visibleRoutes[routeId] ? 'Hide Route' : 'Show Route'}
            >
              {visibleRoutes[routeId] ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Station Types */}
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-sm text-gray-700">Stations</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <span className="text-xs text-gray-600">Intercity Station</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <span className="text-xs text-gray-600">Suburban Station</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center relative">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-0.5 bg-white"></div>
                <div className="w-0.5 h-3 bg-white absolute"></div>
              </div>
            </div>
            <span className="text-xs text-gray-600">Junction</span>
          </div>
        </div>
      </div>

      {/* Train Status */}
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-sm text-gray-700">Train Status</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded border-2 border-green-500"></div>
            <span className="text-xs text-gray-600">On Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded border-2 border-yellow-500"></div>
            <span className="text-xs text-gray-600">Minor Delay (≤10 min)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded border-2 border-red-500"></div>
            <span className="text-xs text-gray-600">Major Delay (&gt;10 min)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded border-2 border-gray-500"></div>
            <span className="text-xs text-gray-600">Stopped</span>
          </div>
        </div>
      </div>

      {/* Congestion Levels */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700">Congestion</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-0.5 bg-white"></div>
              <div className="w-0.5 h-2 bg-white absolute"></div>
            </div>
            <span className="text-xs text-gray-600">Clear</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center relative">
              <div className="w-2 h-0.5 bg-white"></div>
              <div className="w-0.5 h-2 bg-white absolute"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center font-bold">1</div>
            </div>
            <span className="text-xs text-gray-600">Light Traffic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center relative">
              <div className="w-2 h-0.5 bg-white"></div>
              <div className="w-0.5 h-2 bg-white absolute"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">2+</div>
            </div>
            <span className="text-xs text-gray-600">Heavy Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;