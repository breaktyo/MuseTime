import React, { useState, useEffect } from 'react';
import { socket } from '../socket/socket';
import ChatBox from '../components/ChatBox';
import PlayerList from '../components/PlayerList';
import Countdown from '../components/Countdown';
import RoundResult from '../pages/RoundResult';

const getUnderscorePlaceholder = (text = '') =>
  text.split(' ').map((word, wordIndex) => (
    <span key={wordIndex} className="mx-1 text-2xl tracking-widest font-mono">
      {word
        .split('')
        .map((char) => (/[a-zA-Z0-9]/.test(char) ? '_' : char))
        .join('')}
    </span>
  ));

export default function GameRound({ roomCode }) {
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [roundResultData, setRoundResultData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [titleGuessers, setTitleGuessers] = useState(new Set());
  const [artistGuessers, setArtistGuessers] = useState(new Set());

  const playerId = players.find((p) => p.socketId === socket.id)?.id || socket.id;

  useEffect(() => {
    socket.on('chatMessage', (msg) => {
      if (msg.message.includes('has guessed the title')) {
        setTitleGuessers((prev) => new Set(prev).add(msg.playerId));
      }
      if (msg.message.includes('has guessed the artist')) {
        setArtistGuessers((prev) => new Set(prev).add(msg.playerId));
      }
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('newRound', (songData) => {
      setCurrentSong(songData);
      setMessages([]);
      setRoundResultData(null);
      setTitleGuessers(new Set());
      setArtistGuessers(new Set());
    });

    socket.on('roundResult', setRoundResultData);
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

  const hasGuessedTitle = titleGuessers.has(playerId);
  const hasGuessedArtist = artistGuessers.has(playerId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      <div className="w-1/5 bg-white text-black p-4 overflow-y-auto">
        <PlayerList players={players} showScore />
      </div>

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

                  <div className="text-2xl font-bold">
                    {hasGuessedTitle
                      ? currentSong.title
                      : getUnderscorePlaceholder(currentSong.title)}
                  </div>

                  <div className="text-xl text-gray-600">
                    {hasGuessedArtist
                      ? currentSong.artist
                      : getUnderscorePlaceholder(currentSong.artist)}
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