const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const rooms = {}; // Store all rooms and players
const hostReadyStatus = {};


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', ({ name }, callback) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[code] = {
      host: socket.id,
      players: [{ id: socket.id, name, ready: false, score: 0 }],
      playlist: '',
      gameStarted: false,
    };
    console.log(`Creating room for ${name} with code ${code}`);
    socket.join(code);
    callback(code);
  });

  socket.on('joinRoom', ({ name, roomCode }, callback) => {
    const room = rooms[roomCode];
    if (room) {
      room.players.push({ id: socket.id, name, ready: false, score: 0 });
      socket.join(roomCode);
  
      io.to(roomCode).emit('playerList', room.players.map((p) => ({ name: p.name, ready: p.ready })));
  
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('playerReady', ({ roomCode, ready }) => {
    const room = rooms[roomCode];
    const player = room?.players.find((p) => p.id === socket.id);
    if (room && player) {
      player.ready = ready;
      updateReadyCount(roomCode);
      io.to(roomCode).emit('playerList', room.players.map((p) => ({ name: p.name, ready: p.ready })));
    }
  });

  socket.on('hostReady', ({ roomCode, ready }) => {
    const room = rooms[roomCode];
    if (!room) return;
  
    hostReadyStatus[roomCode] = ready;
  
    const hostPlayer = room.players.find(p => p.id === room.host);
    if (hostPlayer) {
      hostPlayer.ready = ready;
    }
  
    updateReadyCount(roomCode);
  
    io.to(roomCode).emit('playerList', room.players.map(p => ({
      name: p.name,
      ready: p.ready
    })));
  });

  socket.on('startGame', ({ roomCode, playlist }) => {
    const room = rooms[roomCode];
    if (room) {
      room.playlist = playlist;
      room.gameStarted = true;
      io.to(roomCode).emit('gameStarted');
    }
  });

  socket.on('guess', ({ roomCode, user, message }) => {
    io.to(roomCode).emit('chatMessage', { user, message });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const code in rooms) {
      const room = rooms[code];
      room.players = room.players.filter((p) => p.id !== socket.id);
      if (room.players.length === 0) {
        delete hostReadyStatus[code];
        delete rooms[code];
      } else {
        io.to(code).emit('playerList', room.players.map((p) => ({ name: p.name, ready: p.ready })));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function updateReadyCount(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const playerReadyCount = room.players.filter((p) => p.ready).length;
  const hostReady = hostReadyStatus[roomCode] || false;

  const totalReady = hostReady ? playerReadyCount + 1 : playerReadyCount;

  io.to(roomCode).emit('readyCount', totalReady);
}