import React from 'react';

export default function WaitingForStart() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Preparing Game...</h1>
        <p className="text-lg">Please wait while the songs are being loaded.</p>
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
