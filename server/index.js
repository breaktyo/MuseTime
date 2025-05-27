const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const roomManager = require('./roomManager');
const chatManager = require('./chatManager');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

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

server.listen(3001, () => console.log('Server listening on port 3001'));