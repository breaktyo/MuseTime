import { useState, useEffect } from 'react';
import { socket } from '../socket/socket';

function HostWait({ roomCode, name, setPage }) {
  const [readyCount, setReadyCount] = useState(0);
  const [playlist, setPlaylist] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleReadyCount = (count) => {
      setReadyCount(count);
    };
    const handlePlayerList = (playerList) => setPlayers(playerList);


    socket.on('readyCount', handleReadyCount);
    socket.on('playerList', handlePlayerList);

    return () => {
      socket.off('readyCount', handleReadyCount);
      socket.off('playerList', handlePlayerList);
    };
  }, []);

  const toggleReady = () => {
    socket.emit('hostReady', { roomCode, ready: !isReady });
    setIsReady((prev) => !prev);
  };

  const startGame = () => {
    socket.emit('startGame', { roomCode, playlist });
    setPage('game-round');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 gap-4">
      <h2 className="text-2xl">Room Code: <strong>{roomCode}</strong></h2>
      <p>Players ready: {readyCount}</p>
      <ul className="border rounded p-4 w-64">
        <li className="flex justify-between font-bold text-blue-600">
          <span>{name} (Host)</span>
          <span>{isReady ? '✅' : '❌'}</span>
        </li>
        {players.map((player, index) => (
          <li key={index} className="flex justify-between">
            <span>{player.name}</span>
            <span>{player.ready ? '✅' : '❌'}</span>
          </li>
        ))}
      </ul>
      <input className="p-2" placeholder="Spotify playlist URL" value={playlist} onChange={e => setPlaylist(e.target.value)} />
      <button
        className={`p-2 ${isReady ? 'bg-gray-400' : 'bg-yellow-500'} text-white`}
        onClick={toggleReady}
      >
        {isReady ? 'Unready' : 'Ready'}
      </button>
      <button
        className="p-2 bg-green-600 text-white"
        onClick={startGame}
        disabled={!isReady}
      >
        Start Game
      </button>
    </div>
  );
}

export default HostWait;