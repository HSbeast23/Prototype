import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const DelayChart = ({ routeData }) => {
  const data = {
    labels: routeData.map(station => station.station.split(' ')[0]), // Shortened names
    datasets: [
      {
        label: 'Delay (minutes)',
        data: routeData.map(station => station.delay),
        backgroundColor: routeData.map(station => 
          station.delay === 0 ? '#10b981' : 
          station.delay <= 10 ? '#f59e0b' : '#ef4444'
        ),
        borderColor: routeData.map(station => 
          station.delay === 0 ? '#059669' : 
          station.delay <= 10 ? '#d97706' : '#dc2626'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Station-wise Delays',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Delay (minutes)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Stations',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export const StatusChart = ({ routeData }) => {
  const onTimeCount = routeData.filter(station => station.delay === 0).length;
  const delayedCount = routeData.length - onTimeCount;

  const data = {
    labels: ['On Time', 'Delayed'],
    datasets: [
      {
        data: [onTimeCount, delayedCount],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'On-Time Performance',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};