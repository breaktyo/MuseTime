// server/roomManager.js
const generateRoomCode = require('./utils/generateRoomCode');

class RoomManager {
  constructor() {
    this.rooms = {}; // { roomCode: { hostId, players: [], playlist, currentSongIndex } }
    this.playerMap = {}; // { socketId: { name, roomCode } }
  }

  createRoom(socketId, hostName) {
    const roomCode = generateRoomCode();
    const player = { id: socketId, name: hostName, score: 0, ready: false };

    this.rooms[roomCode] = {
      hostId: socketId,
      players: [player],
      playlist: [],
      currentSongIndex: -1,
      hostReady: false,
    };

    this.playerMap[socketId] = { name: hostName, roomCode };

    return { roomCode, players: this.rooms[roomCode].players };
  }

  joinRoom(socketId, name, roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return false;

    const player = { id: socketId, name, score: 0, ready: false };
    room.players.push(player);
    this.playerMap[socketId] = { name, roomCode };

    return true;
  }

  leaveRoom(socketId) {
    const info = this.playerMap[socketId];
    if (!info) return {};
    const { roomCode } = info;
    const room = this.rooms[roomCode];
    if (!room) return {};

    // Remove player from room
    room.players = room.players.filter(p => p.id !== socketId);
    delete this.playerMap[socketId];

    // If no players left, delete room
    if (room.players.length === 0) {
      delete this.rooms[roomCode];
      return { roomCode: null, players: [] };
    }

    return { roomCode, players: room.players };
  }

  getPlayers(roomCode) {
    return this.rooms[roomCode]?.players || [];
  }

  getPlayer(socketId) {
    const info = this.playerMap[socketId];
    if (!info) return null;
    return { id: socketId, ...info };
  }

  setReady(socketId, roomCode, ready) {
    const room = this.rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socketId);
    if (player) {
      player.ready = ready;
    }
  }

  setHostReady(roomCode, ready) {
    const room = this.rooms[roomCode];
    if (room) {
      room.hostReady = ready;
    }
  }

  allReady(roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return false;
    return room.players.every(p => p.ready);
  }
}

module.exports = new RoomManager();
