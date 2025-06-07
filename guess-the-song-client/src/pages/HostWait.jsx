// HostWait.jsx
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
    // Fetch playlists from your backend when accessToken is available
    const fetchPlaylists = async () => {
      if (!accessToken) return;

      try {
        const response = await axios.get('http://127.0.0.1:3001/playlists', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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
    socket.emit('startGame', {
      roomCode,
      playlistId: playlist, // rename this from just 'playlist'
      accessToken
    });
    setPage('game-round');
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl">Room Code: {roomCode}</h2>
      <PlayerList players={players} />

      <div className="flex flex-col items-center">
        <h3 className="text-lg mb-2">Choose Playlist</h3>
        <select
          className="p-2 border mb-4"
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

      <button onClick={toggleReady} className="p-2 bg-yellow-500 text-white">
        {isReady ? 'Unready' : 'Ready'}
      </button>
      <button onClick={startGame} className="p-2 bg-green-500 text-white">
        Start Game
      </button>
    </div>
  );
}
