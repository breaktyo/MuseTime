import { useEffect, useState } from 'react';
import { socket } from '../socket/socket';

function GameRound({ roomCode, name }) {
  const [titleMask, setTitleMask] = useState('_ _ _ _');
  const [authorMask, setAuthorMask] = useState('_ _ _');
  const [timeLeft, setTimeLeft] = useState(30);
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    socket.on('titleMask', setTitleMask);
    socket.on('authorMask', setAuthorMask);
    socket.on('chatMessage', msg => setMessages(prev => [...prev, msg]));
    socket.on('playerList', setPlayers);
    return () => clearInterval(timer);
  }, []);

  const sendGuess = () => {
    if (!guess) return;
    socket.emit('guess', { roomCode, user: name, message: guess });
    setGuess('');
  };

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="col-span-1 bg-gray-100 p-4">
        <h3 className="font-bold">Players</h3>
        <ul>{players.map(p => <li key={p}>{p}</li>)}</ul>
      </div>
      <div className="col-span-3 flex flex-col p-4">
        <div className="text-center text-2xl mb-2">Time Remaining: {timeLeft}s</div>
        <div className="text-center text-xl mb-4">{titleMask} — {authorMask}</div>
        <div className="flex-1 overflow-y-scroll border p-2">
          {messages.map((msg, i) => (
            <div key={i}><strong>{msg.user}:</strong> {msg.message}</div>
          ))}
        </div>
        <input
          className="mt-2"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendGuess()}
          placeholder="Guess the song..."
        />
      </div>
    </div>
  );
}

export default GameRound;
