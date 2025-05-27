import { useState } from 'react';
import { socket } from '../socket/socket';

function JoinPage({ setRoomCode, setName, setPage }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  const join = () => {
    socket.emit('joinRoom', { name: username, roomCode: room }, (success) => {
      if (success) {
        setName(username);
        setRoomCode(room);
        setPage('player-wait');
      } else {
        alert('Room does not exist!');
      }
    });
  };

  const create = () => {
    socket.emit('createRoom', { name: username }, (roomCode) => {
      setRoomCode(roomCode);
      setName(username);
      setPage('host-wait');
    });
    console.log("Creating room...");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 comic-bg text-center">
      <h1 className="text-4xl font-extrabold mb-6 comic-header">🎵 Guess the Song</h1>
        <div className="mb-8 w-full max-w-md">
        <label className="block text-xl mb-2 comic-label">Your name</label>
        <input
          className="w-full p-3 rounded-lg border-2 border-dashed border-purple-500 text-center comic-input"
          placeholder="Enter your name"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div className="flex w-full max-w-3xl gap-8">
        {/* Join Section */}
        <div className="flex flex-col items-center w-1/2 gap-4">
          <input
            className="w-full p-3 rounded-lg border-2 border-dotted border-blue-400 text-center comic-input"
            placeholder="Room Code"
            value={room}
            onChange={e => setRoom(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 comic-button"
            onClick={join}
          >
            🚪 Join Game
          </button>
        </div>

        {/* Create Section */}
        <div className="flex flex-col items-center justify-center w-1/2">
          <button
            className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 comic-button"
            onClick={create}
          >
            ✨ Create Room
          </button>
        </div>
      </div>
    </div>

  );
}

export default JoinPage;