import React from 'react';

export default function GameEnd({ leaderboard }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Final Scores</h1>
      <ul>
        {leaderboard.map((player, index) => (
          <li key={index}>{index + 1}. {player.name}: {player.score} pts</li>
        ))}
      </ul>
    </div>
  );
}
