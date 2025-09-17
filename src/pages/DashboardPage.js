import React, { useState } from 'react';
import { BarChart2, Clock, Truck, AlertTriangle, RefreshCw, Search, Upload, FileText, CheckCircle } from 'react-feather';
import MetricCard from '../components/MetricCard';
import TrainStatus from '../components/TrainStatus';

// Mock data - in a real app, this would come from an API
const mockMetrics = {
  onTimePerformance: 67, // Reduced due to delays
  totalTrains: 28,
  delayedTrains: 6,
  avgDelay: '18 min',
};

const mockTrains = [
  {
    id: '12301',
    name: 'Rajdhani Express',
    number: '12301',
    from: 'NDLS',
    to: 'MMCT',
    departureTime: '16:25',
    arrivalTime: '08:30',
    duration: '16h 5m',
    platform: 5,
    delay: '15 min',
    status: 'delayed'
  },
  {
    id: '12951',
    name: 'Rajdhani Express',
    number: '12951',
    from: 'NDLS',
    to: 'MMCT',
    departureTime: '16:40',
    arrivalTime: '08:45',
    duration: '16h 5m',
    platform: 8,
    delay: null,
    status: 'onTime'
  },
  {
    id: '12429',
    name: 'Rajdhani Express',
    number: '12429',
    from: 'NDLS',
    to: 'SBC',
    departureTime: '20:05',
    arrivalTime: '11:00',
    duration: '38h 55m',
    platform: 2,
    delay: '30 min',
    status: 'delayed'
  },
  {
    id: '12430',
    name: 'Rajdhani Express',
    number: '12430',
    from: 'SBC',
    to: 'NDLS',
    departureTime: '20:00',
    arrivalTime: '10:35',
    duration: '38h 35m',
    platform: 1,
    delay: null,
    status: 'onTime'
  },
];

const DashboardPage = () => {
  const [selectedTrain, setSelectedTrain] = useState('');
  const [delay, setDelay] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // CSV Upload states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rescheduleResult, setRescheduleResult] = useState(null);

  // Sample schedule data - Realistic Indian Railway schedules
  const originalSchedule = [
    { 
      trainNo: '12301', 
      name: 'Rajdhani Express', 
      departure: '16:25', 
      arrival: '08:30+1', 
      platform: 5, 
      status: 'scheduled',
      route: 'NDLS → MMCT',
      coaches: 'AC1/AC2/AC3',
      distance: '1384 km'
    },
    { 
      trainNo: '12951', 
      name: 'Mumbai Rajdhani', 
      departure: '16:40', 
      arrival: '08:45+1', 
      platform: 8, 
      status: 'scheduled',
      route: 'NDLS → MMCT',
      coaches: 'AC1/AC2/AC3',
      distance: '1384 km'
    },
    { 
      trainNo: '12429', 
      name: 'Bangalore Rajdhani', 
      departure: '20:05', 
      arrival: '11:00+1', 
      platform: 2, 
      status: 'scheduled',
      route: 'NDLS → SBC',
      coaches: 'AC1/AC2/AC3',
      distance: '2444 km'
    },
    { 
      trainNo: '12002', 
      name: 'Shatabdi Express', 
      departure: '06:15', 
      arrival: '11:35', 
      platform: 1, 
      status: 'scheduled',
      route: 'NDLS → LKO',
      coaches: 'CC/EC',
      distance: '496 km'
    },
    { 
      trainNo: '12009', 
      name: 'Shatabdi Express', 
      departure: '07:20', 
      arrival: '14:45', 
      platform: 3, 
      status: 'scheduled',
      route: 'NDLS → AGC',
      coaches: 'CC/EC',
      distance: '403 km'
    },
    { 
      trainNo: '12423', 
      name: 'Dibrugarh Rajdhani', 
      departure: '11:45', 
      arrival: '07:30+1', 
      platform: 6, 
      status: 'scheduled',
      route: 'NDLS → DBRG',
      coaches: 'AC1/AC2/AC3',
      distance: '2419 km'
    }
  ];

  const delayedSchedule = [
    { 
      trainNo: '12301', 
      name: 'Rajdhani Express', 
      departure: '16:55', 
      arrival: '09:10+1', 
      platform: 5, 
      status: 'delayed', 
      delay: '30 min',
      route: 'NDLS → MMCT',
      coaches: 'AC1/AC2/AC3',
      distance: '1384 km',
      reason: 'Signal failure at GZB'
    },
    { 
      trainNo: '12951', 
      name: 'Mumbai Rajdhani', 
      departure: '16:40', 
      arrival: '08:45+1', 
      platform: 8, 
      status: 'on-time', 
      delay: null,
      route: 'NDLS → MMCT',
      coaches: 'AC1/AC2/AC3',
      distance: '1384 km',
      reason: null
    },
    { 
      trainNo: '12429', 
      name: 'Bangalore Rajdhani', 
      departure: '20:45', 
      arrival: '12:15+1', 
      platform: 2, 
      status: 'delayed', 
      delay: '40 min',
      route: 'NDLS → SBC',
      coaches: 'AC1/AC2/AC3',
      distance: '2444 km',
      reason: 'Late arrival of incoming rake'
    },
    { 
      trainNo: '12002', 
      name: 'Shatabdi Express', 
      departure: '06:30', 
      arrival: '11:50', 
      platform: 1, 
      status: 'delayed', 
      delay: '15 min',
      route: 'NDLS → LKO',
      coaches: 'CC/EC',
      distance: '496 km',
      reason: 'Platform congestion'
    },
    { 
      trainNo: '12009', 
      name: 'Shatabdi Express', 
      departure: '07:20', 
      arrival: '14:45', 
      platform: 3, 
      status: 'on-time', 
      delay: null,
      route: 'NDLS → AGC',
      coaches: 'CC/EC',
      distance: '403 km',
      reason: null
    },
    { 
      trainNo: '12423', 
      name: 'Dibrugarh Rajdhani', 
      departure: '12:10', 
      arrival: '08:05+1', 
      platform: 6, 
      status: 'delayed', 
      delay: '25 min',
      route: 'NDLS → DBRG',
      coaches: 'AC1/AC2/AC3',
      distance: '2419 km',
      reason: 'Engine change delay'
    }
  ];

  // Simulate data refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
      setRescheduleResult(null);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  // Process CSV and generate reschedule
  const handleProcessSchedule = () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing the CSV file
    setTimeout(() => {
      const mockOptimizedSchedule = [
        { 
          trainNo: '12301', 
          name: 'Rajdhani Express', 
          departure: '16:35', 
          arrival: '08:50+1', 
          platform: 7, 
          status: 'optimized', 
          originalDelay: '30 min', 
          newDelay: '10 min',
          route: 'NDLS → MMCT',
          coaches: 'AC1/AC2/AC3',
          distance: '1384 km',
          optimization: 'Platform change + Route via BRC'
        },
        { 
          trainNo: '12951', 
          name: 'Mumbai Rajdhani', 
          departure: '16:45', 
          arrival: '08:50+1', 
          platform: 8, 
          status: 'optimized', 
          originalDelay: null, 
          newDelay: null,
          route: 'NDLS → MMCT',
          coaches: 'AC1/AC2/AC3',
          distance: '1384 km',
          optimization: 'Minor timing adjustment'
        },
        { 
          trainNo: '12429', 
          name: 'Bangalore Rajdhani', 
          departure: '20:20', 
          arrival: '11:25+1', 
          platform: 4, 
          status: 'optimized', 
          originalDelay: '40 min', 
          newDelay: '15 min',
          route: 'NDLS → SBC',
          coaches: 'AC1/AC2/AC3',
          distance: '2444 km',
          optimization: 'Platform change + Priority signaling'
        },
        { 
          trainNo: '12002', 
          name: 'Shatabdi Express', 
          departure: '06:20', 
          arrival: '11:40', 
          platform: 9, 
          status: 'optimized', 
          originalDelay: '15 min', 
          newDelay: '5 min',
          route: 'NDLS → LKO',
          coaches: 'CC/EC',
          distance: '496 km',
          optimization: 'Platform change for faster departure'
        },
        { 
          trainNo: '12009', 
          name: 'Shatabdi Express', 
          departure: '07:25', 
          arrival: '14:50', 
          platform: 3, 
          status: 'optimized', 
          originalDelay: null, 
          newDelay: null,
          route: 'NDLS → AGC',
          coaches: 'CC/EC',
          distance: '403 km',
          optimization: 'Buffer time added for reliability'
        },
        { 
          trainNo: '12423', 
          name: 'Dibrugarh Rajdhani', 
          departure: '11:55', 
          arrival: '07:45+1', 
          platform: 6, 
          status: 'optimized', 
          originalDelay: '25 min', 
          newDelay: '10 min',
          route: 'NDLS → DBRG',
          coaches: 'AC1/AC2/AC3',
          distance: '2419 km',
          optimization: 'Pre-positioned engine + faster turnaround'
        }
      ];

      const mockRescheduleResult = {
        originalTrains: 6,
        rescheduledTrains: 4,
        optimizationScore: 89,
        delayReduction: '71%',
        optimizedSchedule: mockOptimizedSchedule,
        summary: {
          totalDelayReduced: '75 minutes',
          platformChanges: 3,
          routeOptimizations: 2,
          avgDelayBefore: '22 min',
          avgDelayAfter: '6.7 min'
        }
      };
      setRescheduleResult(mockRescheduleResult);
      setIsProcessing(false);
    }, 3000);
  };

  // Reset upload
  const handleResetUpload = () => {
    setUploadedFile(null);
    setRescheduleResult(null);
    document.getElementById('csv-upload').value = '';
  };

  // Filter trains based on search term
  const filteredTrains = mockTrains.filter(train => 
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.number.includes(searchTerm) ||
    train.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Schedule Card Component
  const ScheduleCard = ({ train, type }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
        case 'on-time': 
        case 'scheduled': return 'bg-green-100 text-green-800 border-green-200';
        case 'optimized': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case 'original': return 'border-l-4 border-l-blue-500';
        case 'delayed': return 'border-l-4 border-l-red-500';
        case 'optimized': return 'border-l-4 border-l-green-500';
        default: return 'border-l-4 border-l-gray-500';
      }
    };

    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${getTypeColor(type)} hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{train.name}</h3>
            <p className="text-xs text-gray-600 font-mono">#{train.trainNo}</p>
            <p className="text-xs text-gray-500 mt-1">{train.route}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(train.status)}`}>
              {train.status === 'on-time' ? 'On Time' : train.status.charAt(0).toUpperCase() + train.status.slice(1)}
            </span>
            {train.delay && (
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                +{train.delay}
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 font-medium">Departure</p>
              <p className="font-bold text-gray-900">{train.departure}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 font-medium">Arrival</p>
              <p className="font-bold text-gray-900">{train.arrival}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 font-medium">Platform</p>
              <p className="font-bold text-gray-900">{train.platform}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 font-medium">Coaches</p>
              <p className="font-bold text-gray-900">{train.coaches}</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 border-t pt-2">
            <p><span className="font-medium">Distance:</span> {train.distance}</p>
            {train.reason && (
              <p className="text-red-600 mt-1"><span className="font-medium">Reason:</span> {train.reason}</p>
            )}
            {train.optimization && (
              <p className="text-green-600 mt-1"><span className="font-medium">Optimization:</span> {train.optimization}</p>
            )}
          </div>
          
          {train.originalDelay && (
            <div className="bg-green-50 border border-green-200 p-2 rounded text-xs">
              <p className="font-medium text-green-800 mb-1">Improvement</p>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Before: +{train.originalDelay}</span>
                <span className="text-green-600">After: {train.newDelay ? `+${train.newDelay}` : 'On Time'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Train Traffic Control Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search trains..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard 
            title="On-Time Performance" 
            value={`${mockMetrics.onTimePerformance}%`} 
            icon={BarChart2}
            trend="↓ 5.2%"
            trendText="vs last week"
            trendType="down"
          />
          <MetricCard 
            title="Active Trains" 
            value={mockMetrics.totalTrains}
            icon={Truck}
            trend="+4"
            trendText="in last hour"
            trendType="up"
          />
          <MetricCard 
            title="Delayed Trains" 
            value={mockMetrics.delayedTrains}
            icon={AlertTriangle}
            trend="+3"
            trendText="vs yesterday"
            trendType="up"
          />
          <MetricCard 
            title="Avg. Delay" 
            value={mockMetrics.avgDelay}
            icon={Clock}
            trend="+6 min"
            trendText="vs last week"
            trendType="up"
          />
        </div>

        {/* CSV Upload Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Schedule Optimizer</h2>
            <p className="text-sm text-gray-500">Upload your train schedule CSV to generate an optimized reschedule</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {uploadedFile && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {uploadedFile.name}
                </div>
              )}
              <button
                onClick={handleProcessSchedule}
                disabled={!uploadedFile || isProcessing}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Generate Reschedule
                  </>
                )}
              </button>
              {uploadedFile && (
                <button
                  onClick={handleResetUpload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Display Section */}
        <div className="space-y-8 mb-8">
          {/* Original Schedule */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
                <h2 className="text-lg font-medium text-gray-900">Original Schedule</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Baseline</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {originalSchedule.map((train) => (
                  <ScheduleCard key={`original-${train.trainNo}`} train={train} type="original" />
                ))}
              </div>
            </div>
          </div>

          {/* Delayed Schedule */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-red-500 rounded mr-3"></div>
                <h2 className="text-lg font-medium text-gray-900">Current Delayed Schedule</h2>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Live Status</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {delayedSchedule.map((train) => (
                  <ScheduleCard key={`delayed-${train.trainNo}`} train={train} type="delayed" />
                ))}
              </div>
            </div>
          </div>

          {/* Optimized Schedule - Only show after CSV processing */}
          {rescheduleResult && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
                    <h2 className="text-lg font-medium text-gray-900">Optimized Reschedule</h2>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">AI Optimized</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Delay Reduction: <strong className="text-green-600">{rescheduleResult.delayReduction}</strong></span>
                    <span>Optimization Score: <strong className="text-green-600">{rescheduleResult.optimizationScore}%</strong></span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {rescheduleResult.optimizedSchedule.map((train) => (
                    <ScheduleCard key={`optimized-${train.trainNo}`} train={train} type="optimized" />
                  ))}
                </div>
                
                {/* Summary Stats */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-medium text-green-800 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    AI Optimization Results
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                    <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{rescheduleResult.summary.totalDelayReduced}</div>
                      <div className="text-green-700">Total Delay Saved</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{rescheduleResult.summary.platformChanges}</div>
                      <div className="text-blue-700">Platform Changes</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{rescheduleResult.summary.routeOptimizations}</div>
                      <div className="text-purple-700">Route Changes</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-red-600">{rescheduleResult.summary.avgDelayBefore}</div>
                      <div className="text-red-700">Avg Before</div>
                    </div>
                    <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{rescheduleResult.summary.avgDelayAfter}</div>
                      <div className="text-green-700">Avg After</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-800 mb-3">Key Improvements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-gray-800">Smart Platform Allocation:</span>
                          <span className="text-gray-600"> Reduced congestion by 45%</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-gray-800">Dynamic Route Planning:</span>
                          <span className="text-gray-600"> Optimized 2 critical paths</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-gray-800">Predictive Scheduling:</span>
                          <span className="text-gray-600"> 89% reliability score</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-gray-800">Resource Optimization:</span>
                          <span className="text-gray-600"> Saved 3.2 hours total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Optimized Schedule
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Apply to Live System
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Train List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Scheduled Trains</h2>
              <div className="flex space-x-3">
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedTrain}
                  onChange={(e) => setSelectedTrain(e.target.value)}
                >
                  <option value="">All Stations</option>
                  <option value="NDLS">New Delhi (NDLS)</option>
                  <option value="MMCT">Mumbai Central (MMCT)</option>
                  <option value="SBC">Bengaluru (SBC)</option>
                </select>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <select 
                    className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                  >
                    <option value="0">No Delay</option>
                    <option value="15">15 min delay</option>
                    <option value="30">30 min delay</option>
                    <option value="60">1 hour delay</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Simulate Delay
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredTrains.map((train) => (
                <li key={train.id} className="hover:bg-gray-50">
                  <TrainStatus train={train} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Trains
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Optimize Schedule
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
