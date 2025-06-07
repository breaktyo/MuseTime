import React from 'react';

export default function GameEnd({ finalScores }) {
  // Defensive check: is it an array?
  if (!Array.isArray(finalScores)) {
    return <div className="text-xl">Loading final scores...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-3xl font-bold">Game Over!</h2>
      <h3 className="text-xl mt-4">Final Scores:</h3>
      <ul className="list-disc list-inside">
        {finalScores.length === 0 ? (
          <li>No players scored points.</li>
        ) : (
          finalScores.map((player, index) => (
            <li key={player.id}>
              {player.name}: {player.score} pts
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
