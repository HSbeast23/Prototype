import React from 'react';

const Optimizer = ({ originalSchedule, selectedTrain, delay }) => {
  const optimizeSchedule = () => {
    // A simple optimization algorithm will be implemented here.
    // For now, we will just return the original schedule.
    return originalSchedule;
  };

  const optimizedSchedule = optimizeSchedule();

  return (
    <div>
      <h2 className="text-2xl font-bold">Optimized Schedule</h2>
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th className="p-2 border bg-gray-100">Train</th>
            <th className="p-2 border bg-gray-100">New Start</th>
            <th className="p-2 border bg-gray-100">New End</th>
          </tr>
        </thead>
        <tbody>
          {optimizedSchedule.map((s) => (
            <tr key={s.trainId}>
              <td className="p-2 border">{s.trainName}</td>
              <td className="p-2 border">{s.startTime}</td>
              <td className="p-2 border">{s.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Optimizer;
