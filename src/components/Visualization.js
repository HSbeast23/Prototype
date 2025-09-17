import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  {
    name: 'Train 101',
    original: [10, 30],
    rescheduled: [30, 60],
  },
  {
    name: 'Train 102',
    original: [20, 50],
    rescheduled: [50, 80],
  },
  {
    name: 'Train 103',
    original: [40, 70],
    rescheduled: [70, 100],
  },
];

const Visualization = () => {
  return (
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="original" fill="#8884d8" />
      <Bar dataKey="rescheduled" fill="#82ca9d" />
    </BarChart>
  );
};

export default Visualization;
