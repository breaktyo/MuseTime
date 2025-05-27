const { getTimer, clearTimer } = require('./utils/timer');

class GameManager {
  constructor(io, rooms) {
    this.io = io;
    this.rooms = rooms;  // expects an object like { roomCode: {...} }
  }

  async startGame(roomCode, playlist) {
    const room = this.rooms[roomCode];
    if (!room) throw new Error('Room not found');

    room.playlist = playlist;
    room.currentSongIndex = -1;

    this.startRound(roomCode);

    // Return playlist or part of it for client to start
    return playlist;
  }

  startRound(roomCode) {
    const room = this.rooms[roomCode];
    if (!room || room.playlist.length === 0) return;

    // Move to next song in playlist, loop around
    room.currentSongIndex = (room.currentSongIndex + 1) % room.playlist.length;
    const currentSong = room.playlist[room.currentSongIndex];
    room.currentSong = currentSong;
    room.guessedPlayers = new Set();

    this.io.to(roomCode).emit('newRound', {
      title: currentSong.title.replace(/[^ ]/g, '_'), // hide title letters
      image: currentSong.image,
    });

    // Clear previous timer if exists
    if (room.timer) clearTimer(room.timer);

    // Start 30 sec timer for round end
    room.timer = getTimer(() => this.endRound(roomCode), 30000);
  }

  endRound(roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    // Emit round result with song details and top 3 players by score
    const result = {
      songImage: room.currentSong.image,
      title: room.currentSong.title,
      artist: room.currentSong.artist,
      topPlayers: [...room.players]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    };

    this.io.to(roomCode).emit('roundResult', result);

    // Optionally start next round after a delay, or wait for host to trigger
  }

  awardPoints(playerId, roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Check if player already guessed this round
    if (room.guessedPlayers.has(playerId)) return;

    player.score += 10; // award 10 points
    room.guessedPlayers.add(playerId);

    // Optionally emit updated scores to room
    this.io.to(roomCode).emit('playerList', room.players);
  }
}

module.exports = GameManager;
