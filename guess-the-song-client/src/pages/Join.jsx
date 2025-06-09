import React, { useState } from 'react';
import { socket } from '../socket/socket';
import { saveSession } from '../utils/sessionManager';

export default function Join({ setPage, setRoomCode, setName, setIsHost, accessToken }) {
  const [inputName, setInputName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleJoin = () => {
    if (!inputName || !roomCodeInput) {
      alert('Please enter your name and room code');
      return;
    }

    socket.emit('joinRoom', { name: inputName, roomCode: roomCodeInput }, (success) => {
      if (success) {
        setRoomCode(roomCodeInput);
        setName(inputName);
        setIsHost(false);
        saveSession(roomCodeInput, inputName, false);
        setPage('player-wait');
      } else {
        alert('Room not found');
      }
    });
  };

  const handleCreate = () => {
    if (!inputName) {
      alert('Please enter your name');
      return;
    }

    socket.emit('createRoom', { name: inputName }, (code) => {
      setRoomCode(code);
      setName(inputName);
      setIsHost(true);
      saveSession(code, inputName, true);
      setPage('host-wait');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4">
      <div className="bg-white text-black rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">🎮 Join or Create a Game</h2>

        <input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Your name"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <input
          value={roomCodeInput}
          onChange={(e) => setRoomCodeInput(e.target.value)}
          placeholder="Room code (leave blank if creating)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          onClick={handleJoin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Join Game
        </button>

        {accessToken ? (
          <button
            onClick={handleCreate}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Create Game
          </button>
        ) : (
          <p className="text-center text-sm text-gray-600">
            Log in with Spotify to create a game
          </p>
        )}
      </div>
    </div>
  );
}
