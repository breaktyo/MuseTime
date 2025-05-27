import { useState } from 'react';
import JoinPage from './pages/JoinPage';
import HostWait from './pages/HostWait';
import PlayerWait from './pages/PlayerWait';
import GameRound from './pages/GameRound';
import EndOfRound from './pages/EndOfRound';
import EndGame from './pages/EndGame';

function App() {
  const [page, setPage] = useState('join');
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');

  const props = { roomCode, setRoomCode, name, setName, setPage };

  switch (page) {
    case 'host-wait': return <HostWait {...props} />;
    case 'player-wait': return <PlayerWait {...props} />;
    case 'game-round': return <GameRound {...props} />;
    case 'end-round': return <EndOfRound {...props} />;
    case 'end-game': return <EndGame {...props} />;
    default: return <JoinPage {...props} />;
  }
}

export default App;