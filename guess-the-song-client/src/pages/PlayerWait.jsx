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
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl">Waiting Room: {roomCode}</h2>
      <PlayerList players={players} />
      <button onClick={toggleReady} className="p-2 bg-yellow-500 text-white">{isReady ? 'Unready' : 'Ready'}</button>
    </div>
  );
}
