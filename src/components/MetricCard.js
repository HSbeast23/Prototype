import React from 'react';

const MetricCard = ({ title, value, icon: Icon, trend, trendText, trendType = 'up' }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className={`mt-2 flex items-center text-sm ${trendColors[trendType]}`}>
              {trend}
              <span className="ml-1">{trendText}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
