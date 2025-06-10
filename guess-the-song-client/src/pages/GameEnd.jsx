import React from 'react';

export default function GameEnd({ finalScores }) {
  console.log("finalScores in GameEnd:", finalScores);
  if (!Array.isArray(finalScores)) {
    return <div className="text-xl">Loading final scores...</div>;
  }

  const hasScores = finalScores.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-3xl font-bold text-center">🎵 Game Over! 🎵</h2>

      <h3 className="text-xl mt-4">Final Scores:</h3>
      <ul className="list-inside">
        {!hasScores ? (
          <li className="text-gray-500">No players scored points.</li>
        ) : (
          finalScores.map((player, index) => (
            <li
              key={player.id}
              className={`text-lg ${
                index === 0 ? 'font-bold text-yellow-500' : ''
              }`}
            >
              {index === 0 && '🥇 '}
              {player.name}: {player.score} pts
            </li>
          ))
        )}
      </ul>

      {hasScores && (
        <div className="text-lg text-green-600 mt-2">
          🎉 Congrats {finalScores[0].name}! 🎉
        </div>
      )}
    </div>
  );
}
