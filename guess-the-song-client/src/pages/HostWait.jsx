import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import PlayerList from '../components/PlayerList';

export default function HostWait({ roomCode, setPage }) {
  const [playlist, setPlaylist] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('playerList', setPlayers);
    return () => socket.off('playerList', setPlayers);
  }, []);

  const toggleReady = () => {
    socket.emit('hostReady', { roomCode, ready: !isReady });
    setIsReady(prev => !prev);
  };

  const startGame = () => {
    socket.emit('startGame', { roomCode, playlist });
    setPage('game-round');
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl">Room Code: {roomCode}</h2>
      <PlayerList players={players} />
      <input className="p-2 border" placeholder="Playlist URL" value={playlist} onChange={(e) => setPlaylist(e.target.value)} />
      <button onClick={toggleReady} className="p-2 bg-yellow-500 text-white">{isReady ? 'Unready' : 'Ready'}</button>
      <button onClick={startGame} className="p-2 bg-green-500 text-white">Start Game</button>
    </div>
  );
}
