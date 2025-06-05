import React from 'react';

export default function PlayerList({ players = [], showScore }) {
  return (
    <div className="w-64 bg-gray-100 p-2">
      <h3 className="text-lg">Players</h3>
      <ul>
        {players.map((player, i) => (
          <li key={i} className="flex justify-between">
            <span>{player.name}</span>
            {showScore ? <span>{player.score}</span> : <span>{player.ready ? '✅' : '❌'}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
