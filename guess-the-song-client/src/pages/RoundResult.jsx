import React from 'react';

export default function RoundResult({ roundData, onNext }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <img src={roundData.songImage} alt="Song cover" className="w-32 h-32" />
      <h2 className="text-xl">{roundData.title} - {roundData.artist}</h2>
      <h3>Top Players:</h3>
      <ul>
        {roundData.topPlayers.map((player, index) => (
          <li key={index}>{player.name}: {player.points} pts</li>
        ))}
      </ul>
      <button onClick={onNext} className="p-2 bg-blue-500 text-white">Next Round</button>
    </div>
  );
}