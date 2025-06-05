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

  // Game state tracking
  const [currentSong, setCurrentSong] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [finalScores, setFinalScores] = useState([]);

  // Load session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setRoomCode(session.roomCode);
      setName(session.name);
      setIsHost(session.isHost);
      setPage(session.page);
    }
  }, []);

  // Save session on state change
  useEffect(() => {
    saveSession({ page, roomCode, name, isHost });
  }, [page, roomCode, name, isHost]);

  // Socket listeners for game flow
  useEffect(() => {
    socket.on('gameStarted', () => {
      // Only emitted once at beginning
      console.log('Game started');
      setPage('game-round');
    });

    socket.on('newRound', (song) => {
      console.log('New round started', song);
      setCurrentSong(song);
      setPage('game-round');
    });

    socket.on('roundResult', (result) => {
      console.log('Round ended', result);
      setRoundResult(result);
      setPage('round-result');
    });

    socket.on('gameEnded', (scores) => {
      console.log('Game ended', scores);
      setFinalScores(scores);
      setPage('game-end');
    });

    return () => {
      socket.off('gameStarted');
      socket.off('newRound');
      socket.off('roundResult');
      socket.off('gameEnded');
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
      return <GameRound {...sharedProps} currentSong={currentSong} />;
    case 'round-result':
      return <RoundResult {...sharedProps} result={roundResult} />;
    case 'game-end':
      return <GameEnd {...sharedProps} scores={finalScores} />;
    default:
      return <div>Loading...</div>;
  }
}

export default App;
