import React from 'react';

export default function RoundResult({ roundData }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <img src={roundData.songImage} alt="Song cover" className="w-32 h-32" />
      <h2 className="text-xl">{roundData.title} - {roundData.artist}</h2>
      <h3 className="text-lg mt-2">Top Players:</h3>
      <ul className="list-disc list-inside">
        {roundData.topPlayers.map((player, index) => (
          <li key={index}>{player.name}: {player.score} pts</li>
        ))}
      </ul>
    </div>
  );
}
