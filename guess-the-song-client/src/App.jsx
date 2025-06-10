import React, { useEffect, useState } from 'react';
import Join from './pages/Join';
import HostWait from './pages/HostWait';
import PlayerWait from './pages/PlayerWait';
import GameRound from './pages/GameRound';
import RoundResult from './pages/RoundResult';
import GameEnd from './pages/GameEnd';
import StartPage from './pages/StartPage';
import { socket } from './socket/socket';
import { loadSession, saveSession } from './utils/sessionManager';

function App() {
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState('start');

  // Game state tracking
  const [currentSong, setCurrentSong] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [finalScores, setFinalScores] = useState(null);

  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);

  const [spotifyId, setSpotifyId] = useState('');
  const [nickname, setNickname] = useState('');

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
    case 'start':
      return <StartPage accessToken={accessToken} setAccessToken={setAccessToken} playlists={playlists} setPlaylists={setPlaylists} setPage={setPage} setSpotifyId={setSpotifyId} setNickname={setNickname} />;
    case 'join':
      return <Join setRoomCode={setRoomCode} setName={setName} setPage={setPage} setIsHost={setIsHost} accessToken={accessToken} spotifyId={spotifyId} nickname={nickname} />;
    case 'host-wait':
      return <HostWait {...sharedProps} accessToken={accessToken} />;
    case 'player-wait':
      return <PlayerWait {...sharedProps} />;
    case 'game-round':
      return <GameRound {...sharedProps} currentSong={currentSong} />;
    case 'round-result':
      return <RoundResult {...sharedProps} result={roundResult} />;
    case 'game-end':
      return <GameEnd {...sharedProps} finalScores={finalScores} />;
    default:
      return <div>Loading...</div>;
  }
}

export default App;
