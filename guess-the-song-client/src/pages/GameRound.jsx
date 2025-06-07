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
  const [roundResultData, setRoundResultData] = useState(null); // round result state

  useEffect(() => {
    // Chat messages
    socket.on('chatMessage', (msg) => setMessages((prev) => [...prev, msg]));

    // New round starts
    socket.on('newRound', (songData) => {
      setCurrentSong(songData);
      setMessages([]);
      setRoundResultData(null); // clear round result when new round starts
    });

    // Round result received
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
      <PlayerList players={players} showScore />

      <div className="flex flex-col justify-center items-center flex-1 gap-4 p-4">

        {roundResultData ? (
          // Show RoundResult screen
          <RoundResult roundData={roundResultData} />
        ) : (
          // Show current game round
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

                {currentSong.previewUrl ? (
                  <audio controls autoPlay src={currentSong.previewUrl} />
                ) : (
                  <div className="text-sm text-gray-500">No preview available</div>
                )}
              </>
            ) : (
              <div className="text-xl">Waiting for song...</div>
            )}

            <ChatBox
              guess={guess}
              setGuess={setGuess}
              messages={messages}
              onSend={sendGuess}
            />
          </>
        )}
      </div>
    </div>
  );
}
