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
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl mb-2">Lobby</h2>

      <input
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        placeholder="Your name"
        className="p-2 border rounded w-64"
      />

      <input
        value={roomCodeInput}
        onChange={(e) => setRoomCodeInput(e.target.value)}
        placeholder="Room code"
        className="p-2 border rounded w-64"
      />

      <button
        className="bg-blue-500 text-white p-2 rounded w-64"
        onClick={handleJoin}
      >
        Join Game
      </button>

      {accessToken ? (
        <button
          className="bg-green-500 text-white p-2 rounded w-64"
          onClick={handleCreate}
        >
          Create Game
        </button>
      ) : (
        <p className="text-gray-500 text-sm mt-2">
          Log in with Spotify to create a game
        </p>
      )}
    </div>
  );
}
