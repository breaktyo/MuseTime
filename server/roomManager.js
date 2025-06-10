
const generateRoomCode = require('./utils/generateRoomCode');

class RoomManager {
  constructor() {
    this.rooms = {}; 
    this.playerMap = {}; 
  }

  createRoom(socketId, hostName, spotifyId) {
    const roomCode = generateRoomCode();
    const player = {
      id: spotifyId || socketId, // use Spotify ID if available
      name: hostName,
      socketId,
      score: 0,
      ready: false
    };

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

  joinRoom(socketId, name, spotifyId, roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return false;

    const player = {
      id: spotifyId || socketId,
      name,
      socketId,
      score: 0,
      ready: false
    };
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

    room.players = room.players.filter(p => p.id !== socketId);
    delete this.playerMap[socketId];

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
  
    const room = this.rooms[info.roomCode];
    if (!room) return null;
  
    return room.players.find(p => p.socketId === socketId) || null;
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
