import React from 'react';

const InsightsPanel = () => {
  return (
    <div className="p-4 mt-8 bg-gray-100 rounded-md">
      <h2 className="text-2xl font-bold">Insights</h2>
      <p className="mt-4">Total trains affected: 3</p>
      <p>Average delay reduced: 10 minutes</p>
      <p>
        Conflict resolution summary: Train 102 rescheduled by +20 min to avoid
        conflict with Train 101
      </p>
    </div>
  );
};

export default InsightsPanel;
