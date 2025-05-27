import React, { useEffect, useState } from 'react';
import Join from './pages/Join';
import HostWait from './pages/HostWait';
import PlayerWait from './pages/PlayerWait';
import GameRound from './pages/GameRound';
import RoundResult from './pages/RoundResult';
import GameEnd from './pages/GameEnd';
import { socket } from './socket/socket';
import { loadSession, saveSession } from './utils/sessionManager';

function App() {
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState('join');

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setRoomCode(session.roomCode);
      setName(session.name);
      setIsHost(session.isHost);
      setPage(session.page);
    }
  }, []);

  useEffect(() => {
    saveSession({ page, roomCode, name, isHost });
  }, [page, roomCode, name, isHost]);

  useEffect(() => {
    socket.on('gameStarted', (songs) => {
      // Save any song data if needed later
      console.log('Game started!', songs);
  
      // Move everyone to the game-round page
      setPage('game-round');
    });
  
    return () => {
      socket.off('gameStarted');
    };
  }, []);

  const sharedProps = { roomCode, name, setPage };

  switch (page) {
    case 'join':
      return <Join setRoomCode={setRoomCode} setName={setName} setPage={setPage} setIsHost={setIsHost} />;
    case 'host-wait':
      return <HostWait {...sharedProps} />;
    case 'player-wait':
      return <PlayerWait {...sharedProps} />;
    case 'game-round':
      return <GameRound {...sharedProps} />;
    case 'round-result':
      return <RoundResult {...sharedProps} />;
    case 'game-end':
      return <GameEnd {...sharedProps} />;
    default:
      return <div>Loading...</div>;
  }
}

export default App;