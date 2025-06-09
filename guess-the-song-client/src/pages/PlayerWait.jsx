import React, { useEffect, useState } from 'react';
import { socket } from '../socket/socket';
import PlayerList from '../components/PlayerList';

export default function PlayerWait({ roomCode }) {
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('playerList', setPlayers);
    return () => socket.off('playerList', setPlayers);
  }, []);

  const toggleReady = () => {
    socket.emit('playerReady', { roomCode, ready: !isReady });
    setIsReady(prev => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Left: Player list */}
      <div className="w-1/4 bg-white text-black p-4 overflow-y-auto">
        <PlayerList players={players} />
      </div>

      {/* Center: Waiting screen */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="bg-white text-black rounded-2xl shadow-lg w-full max-w-xl p-6 flex flex-col gap-6 items-center">
          <h2 className="text-2xl font-bold">
            Waiting Room: <span className="text-indigo-600">{roomCode}</span>
          </h2>

          <p className="text-center text-gray-700">
            The host will start the game once everyone is ready. Click the button below when you're ready!
          </p>

          <button
            onClick={toggleReady}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isReady
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-400 hover:bg-yellow-500 text-black'
            }`}
          >
            {isReady ? 'Unready' : 'Mark Ready'}
          </button>
        </div>
      </div>
    </div>
  );
}
