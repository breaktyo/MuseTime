import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import ChatBox from '../components/ChatBox';
import PlayerList from '../components/PlayerList';
import Countdown from '../components/Countdown';

export default function GameRound({ roomCode, currentSong, players }) {
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('chatMessage', (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off('chatMessage');
  }, []);

  const sendGuess = () => {
    socket.emit('guess', { roomCode, message: guess });
    setGuess('');
  };

  return (
    <div className="flex h-screen">
      <PlayerList players={players} showScore />
      <div className="flex flex-col justify-center items-center flex-1 gap-4">
        <Countdown seconds={30} />
        <div className="text-2xl font-mono tracking-widest">
          {currentSong ? currentSong.title.replace(/[^ ]/g, '_') : 'Waiting for song...'}
        </div>
        <ChatBox
          guess={guess}
          setGuess={setGuess}
          messages={messages}
          onSend={sendGuess}
        />
      </div>
    </div>
  );
}