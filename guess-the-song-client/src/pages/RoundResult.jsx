import React from 'react';

export default function RoundResult({ roundData }) {
  return (
    <div className="w-full max-w-2xl bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Round Result</h2>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">{roundData.title}</span> — <span>{roundData.artist}</span>
        </p>
      </div>

      <img
        src={roundData.songImage}
        alt="Song cover"
        className="w-40 h-40 rounded-xl shadow-md object-cover"
      />

      <div className="w-full">
        <h3 className="text-xl font-semibold mb-3 text-center">Top Players</h3>
        {roundData.topPlayers.length === 0 ? (
          <p className="text-center text-gray-500">No players scored points.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {roundData.topPlayers.map((player, index) => (
              <li
                key={index}
                className="bg-gray-100 rounded-lg px-4 py-2 flex justify-between items-center shadow-sm"
              >
                <span className="font-medium break-words">{player.name}</span>
                <span className="text-sm text-gray-700">{player.score} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
