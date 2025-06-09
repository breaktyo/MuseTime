import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import ChatBox from '../components/ChatBox';
import PlayerList from '../components/PlayerList';
import Countdown from '../components/Countdown';
import RoundResult from '../pages/RoundResult';

export default function GameRound({ roomCode }) {
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [roundResultData, setRoundResultData] = useState(null);
  const [players, setPlayers] = useState([]);

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
    socket.on('playerList', setPlayers);

    return () => {
      socket.off('chatMessage');
      socket.off('newRound');
      socket.off('roundResult');
      socket.off('playerList');
    };
  }, []);

  const sendGuess = () => {
    socket.emit('guess', { roomCode, message: guess });
    setGuess('');
  };

  const getUnderscorePlaceholder = (text = '') =>
    text.split(/\s+/).map((word, i) => (
      <span key={i} className="mx-1 text-2xl tracking-widest font-mono">
        {'_'.repeat(word.length)}
      </span>
    ));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Left: Player list */}
      <div className="w-1/5 bg-white text-black p-4 overflow-y-auto">
        <PlayerList players={players} showScore />
      </div>

      {/* Center: Game content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="bg-white text-black rounded-2xl shadow-lg w-full max-w-2xl p-6 flex flex-col items-center gap-6">
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
                    className="w-48 h-48 object-cover rounded-xl shadow-md"
                  />

                  <div className="flex flex-wrap justify-center text-indigo-700">
                    {getUnderscorePlaceholder(currentSong.title)}
                  </div>

                  <div className="flex flex-wrap justify-center text-indigo-500">
                    {getUnderscorePlaceholder(currentSong.artist)}
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
      </div>

      {/* Right: Chat */}
      <div className="w-1/4 bg-white text-black p-4 h-screen overflow-hidden flex flex-col">
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
