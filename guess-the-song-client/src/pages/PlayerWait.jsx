import { socket } from '../socket/socket';
import React, { useEffect, useState } from 'react';

function PlayerWait({ roomCode, setPage }) {
  const [readyCount, setReadyCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleReadyCount = (count) => {
      setReadyCount(count);
    };

    const handlePlayerList = (list) => {
      setPlayers(list);
    };

    socket.on('readyCount', handleReadyCount);
    socket.on('playerList', handlePlayerList);
    
    return () => {
      socket.off('readyCount', handleReadyCount);
      socket.off('playerList', handlePlayerList);
    };
  }, []);

  const toggleReady = () => {
    socket.emit('playerReady', { roomCode, ready: !isReady });
    setIsReady((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 gap-4">
      <h2 className="text-2xl">Waiting in Room: {roomCode}</h2>
      <p>Players ready: {readyCount}</p>
      <ul className="border rounded p-4 w-64">
        {players.map((player, index) => (
          <li key={index} className="flex justify-between">
            <span>{player.name}</span>
            <span>{player.ready ? '✅' : '❌'}</span>
          </li>
        ))}
      </ul>
      <button
        className={`p-2 ${isReady ? 'bg-gray-400' : 'bg-yellow-500'} text-white`}
        onClick={toggleReady}
      >
        {isReady ? 'Unready' : 'Ready'}
      </button>
    </div>
  );
}

export default PlayerWait;