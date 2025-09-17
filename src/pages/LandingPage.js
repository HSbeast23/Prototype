import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800">
        Intelligent Train Scheduling System
      </h1>
      <h2 className="mt-4 text-2xl text-gray-600">
        An AI-driven solution for optimizing railway efficiency and punctuality.
      </h2>
      <p className="mt-4 text-lg text-gray-700 max-w-2xl text-center">
        This prototype demonstrates an intelligent decision-support system that assists section controllers in making optimized, real-time decisions for train precedence and crossings.
      </p>
      <div className="mt-8">
        <Link to="/dashboard">
          <button className="px-6 py-3 m-2 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Run Simulation
          </button>
        </Link>
        <button className="px-6 py-3 m-2 text-lg text-gray-800 bg-gray-300 rounded-md hover:bg-gray-400">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
