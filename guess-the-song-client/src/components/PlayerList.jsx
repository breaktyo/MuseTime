import React from 'react';

export default function PlayerList({ players = [], showScore }) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Players</h3>
      <ul className="flex flex-col gap-2">
        {players.map((player, i) => (
          <li
            key={i}
            className="bg-gray-100 rounded-lg px-4 py-2 flex justify-between items-center shadow-sm break-words"
          >
            <span className="font-medium break-words max-w-[70%]">{player.name}</span>
            {showScore ? (
              <span className="text-sm text-gray-700">{player.score} pts</span>
            ) : (
              <span className="text-sm">{player.ready ? '✅' : '❌'}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
