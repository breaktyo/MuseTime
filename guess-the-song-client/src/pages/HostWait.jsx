import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import PlayerList from '../components/PlayerList';
import axios from 'axios';

export default function HostWait({ roomCode, setPage, accessToken }) {
  const [playlist, setPlaylist] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState([]);
  const [availablePlaylists, setAvailablePlaylists] = useState([]);

  useEffect(() => {
    socket.on('playerList', setPlayers);
    return () => socket.off('playerList', setPlayers);
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!accessToken) return;
      try {
        const response = await axios.get('http://127.0.0.1:3001/playlists', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAvailablePlaylists(response.data.items || []);
      } catch (error) {
        console.error('Error fetching playlists', error);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  const toggleReady = () => {
    socket.emit('hostReady', { roomCode, ready: !isReady });
    setIsReady((prev) => !prev);
  };

  const startGame = () => {
    if (!playlist) return alert('Please select a playlist first.');
    socket.emit('startGame', { roomCode, playlistId: playlist, accessToken });
    setPage('game-round');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Left: Player list */}
      <div className="w-1/4 bg-white text-black p-4 overflow-y-auto">
        <PlayerList players={players} />
      </div>

      {/* Center: Game setup */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="bg-white text-black rounded-2xl shadow-lg w-full max-w-xl p-6 flex flex-col gap-6 items-center">
          <h2 className="text-2xl font-bold">
            Room Code: <span className="text-indigo-600">{roomCode}</span>
          </h2>

          <div className="w-full text-left">
            <label htmlFor="playlist" className="block text-lg font-medium mb-2">
              Choose a Playlist
            </label>
            <select
              id="playlist"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={playlist}
              onChange={(e) => setPlaylist(e.target.value)}
            >
              <option value="">-- Select a Playlist --</option>
              {availablePlaylists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-4 justify-between">
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

            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
