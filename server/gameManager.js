const { getTimer, clearTimer } = require('./utils/timer');

class GameManager {
  constructor(io, rooms) {
    this.io = io;
    this.rooms = rooms; 
  }

  async startGame(roomCode, playlist) {
    const room = this.rooms[roomCode];
    if (!room) throw new Error('Room not found');

    room.playlist = playlist;
    room.currentSongIndex = -1;

    this.startRound(roomCode);

    
    return playlist;
  }

  startRound(roomCode) {
    const room = this.rooms[roomCode];
    if (!room || room.playlist.length === 0) return;

    
    room.currentSongIndex = (room.currentSongIndex + 1) % room.playlist.length;
    const currentSong = room.playlist[room.currentSongIndex];
    room.currentSong = currentSong;
    room.guessedPlayers = new Set();

    this.io.to(roomCode).emit('newRound', {
      title: currentSong.title.replace(/[^ ]/g, '_'), 
      image: currentSong.image,
    });

    if (room.timer) clearTimer(room.timer);

    room.timer = getTimer(() => this.endRound(roomCode), 30000);
  }

  endRound(roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    const result = {
      songImage: room.currentSong.image,
      title: room.currentSong.title,
      artist: room.currentSong.artist,
      topPlayers: [...room.players]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    };

    this.io.to(roomCode).emit('roundResult', result);

  }

  awardPoints(playerId, roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    if (room.guessedPlayers.has(playerId)) return;

    player.score += 10;
    room.guessedPlayers.add(playerId);

    this.io.to(roomCode).emit('playerList', room.players);
  }
}

module.exports = GameManager;
