import React, { useState } from 'react';
import { socket } from '../socket/socket';
import { saveSession } from '../utils/sessionManager';

export default function Join({ setPage, setRoomCode, setName, setIsHost }) {
  const [inputName, setInputName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleJoin = () => {
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
      <input value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Your name" className="p-2 border" />
      <input value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value)} placeholder="Room code" className="p-2 border" />
      <button className="bg-blue-500 text-white p-2" onClick={handleJoin}>Join Game</button>
      <button className="bg-green-500 text-white p-2" onClick={handleCreate}>Create Game</button>
    </div>
  );
}