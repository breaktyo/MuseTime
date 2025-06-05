const { getTimer, clearTimer } = require('./utils/timer');

class GameManager {
  constructor(io, rooms) {
    this.io = io;
    this.rooms = rooms;
    this.roundTimers = {}; // store timers per room
  }

  async startGame(roomCode, playlist) {
    const room = this.rooms[roomCode];
    if (!room) throw new Error('Room not found');

    room.playlist = playlist;
    room.currentSongIndex = -1;
    room.scores = {};
    room.players.forEach(player => (player.score = 0)); // Reset scores

    this.io.to(roomCode).emit('gameStarted');
    this.startNextRound(roomCode);

    return playlist;
  }

  startNextRound(roomCode) {
    const room = this.rooms[roomCode];
    if (!room || !room.playlist || room.playlist.length === 0) return;

    room.currentSongIndex++;
    if (room.currentSongIndex >= room.playlist.length) {
      this.endGame(roomCode);
      return;
    }

    const currentSong = room.playlist[room.currentSongIndex];
    room.currentSong = currentSong;
    room.guessedPlayers = new Set();

    this.io.to(roomCode).emit('newRound', {
      title: currentSong.title.replace(/[^ ]/g, '_'),
      image: currentSong.image,
    });

    if (this.roundTimers[roomCode]) clearTimer(this.roundTimers[roomCode]);
    this.roundTimers[roomCode] = getTimer(() => this.endRound(roomCode), 15000); // 15s round
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

    if (this.roundTimers[roomCode]) clearTimer(this.roundTimers[roomCode]);
    this.roundTimers[roomCode] = getTimer(() => this.startNextRound(roomCode), 5000); // 5s delay before next round
  }

  endGame(roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    const finalScores = [...room.players].sort((a, b) => b.score - a.score);
    this.io.to(roomCode).emit('gameEnded', finalScores);

    if (this.roundTimers[roomCode]) {
      clearTimer(this.roundTimers[roomCode]);
      delete this.roundTimers[roomCode];
    }
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
