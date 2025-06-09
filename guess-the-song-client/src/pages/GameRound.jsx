import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import ChatBox from '../components/ChatBox';
import PlayerList from '../components/PlayerList';
import Countdown from '../components/Countdown';
import RoundResult from '../pages/RoundResult';

export default function GameRound({ roomCode, players }) {
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [roundResultData, setRoundResultData] = useState(null);

  useEffect(() => {
    socket.on('chatMessage', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('newRound', (songData) => {
      setCurrentSong(songData);
      setMessages([]);
      setRoundResultData(null);
    });
    socket.on('roundResult', (roundData) => {
      setRoundResultData(roundData);
    });

    return () => {
      socket.off('chatMessage');
      socket.off('newRound');
      socket.off('roundResult');
    };
  }, []);

  const sendGuess = () => {
    socket.emit('guess', { roomCode, message: guess });
    setGuess('');
  };

  return (
    <div className="flex h-screen">
      {/* Left: Players */}
      <div className="w-1/5 border-r">
        <PlayerList players={players} showScore />
      </div>

      {/* Center: Game content */}
      <div className="flex flex-col justify-center items-center flex-1 gap-4 p-4">
        {roundResultData ? (
          <RoundResult roundData={roundResultData} />
        ) : (
          <>
            <Countdown seconds={15} />

            {currentSong ? (
              <>
                <img
                  src={currentSong.image}
                  alt="Song cover"
                  className="w-48 h-48 object-cover rounded-lg shadow"
                />

                <div className="text-2xl font-mono tracking-widest">
                  {currentSong.title}
                </div>

                <div className="text-2xl font-mono tracking-widest">
                  {currentSong.artist}
                </div>

                {currentSong.previewUrl ? (
                  <audio controls autoPlay src={currentSong.previewUrl} />
                ) : (
                  <div className="text-sm text-gray-500">No preview available</div>
                )}
              </>
            ) : (
              <div className="text-xl">Waiting for song...</div>
            )}
          </>
        )}
      </div>

      <div className="w-1/4 border-l p-2 h-screen">
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
