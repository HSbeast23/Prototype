import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Visualization from '../components/Visualization';
import InsightsPanel from '../components/InsightsPanel';
import schedules from '../data/schedules.json';

const ResultsPage = () => {
  const location = useLocation();
  const { selectedTrain, delay } = location.state || {};
  const [originalSchedule, setOriginalSchedule] = useState([]);
  const [rescheduledSchedule, setRescheduledSchedule] = useState([]);

  useEffect(() => {
    const getTrainName = (trainId) => {
      const train = schedules.trains.find((t) => t.id === trainId);
      return train ? train.name : '';
    };

    const original = schedules.schedules.map((s) => ({
      ...s,
      trainName: getTrainName(s.trainId),
    }));
    setOriginalSchedule(original);

    if (selectedTrain && delay) {
      const newSchedules = schedules.schedules.map((schedule) => {
        if (schedule.trainId === selectedTrain) {
          const newStartTime = new Date();
          const [startHour, startMinute] = schedule.startTime.split(':');
          newStartTime.setHours(startHour, startMinute, 0);
          newStartTime.setMinutes(newStartTime.getMinutes() + parseInt(delay));

          const newEndTime = new Date();
          const [endHour, endMinute] = schedule.endTime.split(':');
          newEndTime.setHours(endHour, endMinute, 0);
          newEndTime.setMinutes(newEndTime.getMinutes() + parseInt(delay));

          return {
            ...schedule,
            startTime: newStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: newEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return schedule;
      });

      const rescheduled = newSchedules.map((s) => ({
        ...s,
        trainName: getTrainName(s.trainId),
      }));
      setRescheduledSchedule(rescheduled);
    }
  }, [selectedTrain, delay]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Simulation Results</h1>
      <p className="mt-2 text-lg text-gray-600">
        The original and rescheduled train schedules are displayed below.
      </p>
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-2xl font-bold">Original Schedule</h2>
          <table className="w-full mt-4 border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-100">Train</th>
                <th className="p-2 border bg-gray-100">Start</th>
                <th className="p-2 border bg-gray-100">End</th>
              </tr>
            </thead>
            <tbody>
              {originalSchedule.map((s) => (
                <tr key={s.trainId}>
                  <td className="p-2 border">{s.trainName}</td>
                  <td className="p-2 border">{s.startTime}</td>
                  <td className="p-2 border">{s.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Rescheduled Schedule</h2>
          <table className="w-full mt-4 border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-100">Train</th>
                <th className="p-2 border bg-gray-100">New Start</th>
                <th className="p-2 border bg-gray-100">New End</th>
              </tr>
            </thead>
            <tbody>
              {rescheduledSchedule.map((s) => (
                <tr key={s.trainId}>
                  <td className="p-2 border">{s.trainName}</td>
                  <td className="p-2 border">{s.startTime}</td>
                  <td className="p-2 border">{s.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Visualization />
      <InsightsPanel />
    </div>
  );
};

export default ResultsPage;
