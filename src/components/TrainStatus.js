import React from 'react';
import { Clock, MapPin, AlertTriangle, CheckCircle, Clock as ClockIcon } from 'react-feather';

const statusColors = {
  onTime: 'bg-green-100 text-green-800',
  delayed: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  departed: 'bg-blue-100 text-blue-800',
  boarding: 'bg-purple-100 text-purple-800',
};

const statusIcons = {
  onTime: <CheckCircle className="h-4 w-4" />,
  delayed: <AlertTriangle className="h-4 w-4" />,
  cancelled: <AlertTriangle className="h-4 w-4" />,
  departed: <ClockIcon className="h-4 w-4" />,
  boarding: <ClockIcon className="h-4 w-4" />,
};

const TrainStatus = ({ train }) => {
  const getStatusBadge = (status) => {
    const statusText = {
      onTime: 'On Time',
      delayed: 'Delayed',
      cancelled: 'Cancelled',
      departed: 'Departed',
      boarding: 'Boarding',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusIcons[status]}
        <span className="ml-1">{statusText[status]}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{train.name}</h3>
          <p className="text-sm text-gray-500">{train.number}</p>
        </div>
        {getStatusBadge(train.status)}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">{train.departureTime}</p>
            <p className="text-sm text-gray-500">{train.from}</p>
          </div>
          <div className="text-center">
            <div className="h-1 w-16 bg-gray-200 rounded-full my-2"></div>
            <p className="text-xs text-gray-500">{train.duration}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{train.arrivalTime}</p>
            <p className="text-sm text-gray-500">{train.to}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
              <span>Platform {train.platform}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span>Delay: {train.delay || '0 min'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainStatus;
