const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const roomManager = require('./roomManager');
const chatManager = require('./chatManager');
const GameManager = require('./gameManager');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
});

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const gameManager = new GameManager(io, roomManager.rooms);


io.on('connection', (socket) => {
  socket.on('createRoom', ({ name }, callback) => {
    const { roomCode, players } = roomManager.createRoom(socket.id, name);
    socket.join(roomCode);
    io.to(roomCode).emit('playerList', players);
    callback(roomCode);
  });

  socket.on('joinRoom', ({ name, roomCode }, callback) => {
    const success = roomManager.joinRoom(socket.id, name, roomCode);
    if (success) {
      socket.join(roomCode);
      const players = roomManager.getPlayers(roomCode);
      io.to(roomCode).emit('playerList', players);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('playerReady', ({ roomCode, ready }) => {
    roomManager.setReady(socket.id, roomCode, ready);
    const players = roomManager.getPlayers(roomCode);
    io.to(roomCode).emit('playerList', players);
  });

  socket.on('hostReady', ({ roomCode, ready }) => {
    roomManager.setHostReady(roomCode, ready);
  });

  socket.on('startGame', async ({ roomCode, playlist }) => {
    const songs = await gameManager.startGame(roomCode, playlist);
    const players = roomManager.getPlayers(roomCode);
    io.to(roomCode).emit('playerList', players);
    io.to(roomCode).emit('gameStarted', songs);
  });

  socket.on('guess', ({ roomCode, message }) => {
    const player = roomManager.getPlayer(socket.id);
    const result = chatManager.handleGuess(player, roomCode, message);
    if (result.correct) {
      gameManager.awardPoints(player.id, roomCode);
    }
    io.to(roomCode).emit('chatMessage', { user: player.name, message });
  });

  socket.on('disconnect', () => {
    const { roomCode, players } = roomManager.leaveRoom(socket.id);
    if (roomCode) {
      io.to(roomCode).emit('playerList', players);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Spotify Lobby Backend Running');
});

app.get('/login', (req, res) => {
  const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative'
  ].join(' ');

  const authUrl = 'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CLIENT_ID,
          scope: scopes,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          state: 'some-random-state' // You can generate random state per session for more security
      });

  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
      const tokenResponse = await axios.post(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
              client_id: process.env.SPOTIFY_CLIENT_ID,
              client_secret: process.env.SPOTIFY_CLIENT_SECRET
          }),
          {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          }
      );

      const { access_token, refresh_token } = tokenResponse.data;

      // For demo: redirect to frontend with tokens in query string
      res.redirect(`http://localhost:3000/?access_token=${access_token}&refresh_token=${refresh_token}`);

  } catch (err) {
      console.error('Error getting tokens:', err.response.data);
      res.send('Error during authentication');
  }
});


app.get('/playlists', async (req, res) => {
  const access_token = req.headers.authorization?.split(' ')[1]; // Expect Bearer token

  if (!access_token) {
      return res.status(400).json({ error: 'No access token provided' });
  }

  try {
      const playlistsResponse = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: {
              Authorization: `Bearer ${access_token}`
          }
      });

      res.json(playlistsResponse.data);

  } catch (err) {
      console.error('Error fetching playlists:', err.response.data);
      res.status(500).json({ error: 'Error fetching playlists' });
  }
});













//server.listen(3001, () => console.log('Server listening on port 3001'));
server.listen(3001, '127.0.0.1', () => console.log('Server listening on http://127.0.0.1:3001'));
