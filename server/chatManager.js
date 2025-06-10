class ChatManager {
  constructor(io, rooms) {
    this.io = io;
    this.rooms = rooms;
  }

  normalize(str) {
    return str.toLowerCase().replace(/\s+/g, '');
  }

  handleGuess(player, roomCode, message) {
    const room = this.rooms[roomCode];
    if (!room || !room.currentSong || !player) return { correct: false };

    const song = room.currentSong;
    const guess = this.normalize(message);

    const normalizedTitle = this.normalize(song.title || '');
    const normalizedArtist = this.normalize(song.artist || '');

    const guessedTitle = normalizedTitle && guess.includes(normalizedTitle);
    const guessedArtist = normalizedArtist && guess.includes(normalizedArtist);

    if (!room.guessedTitles) room.guessedTitles = new Set();
    if (!room.guessedArtists) room.guessedArtists = new Set();

    let responseMessage = message;
    let correct = false;

    if (guessedTitle && !room.guessedTitles.has(player.id)) {
      player.score += 10;
      room.guessedTitles.add(player.id);
      responseMessage = `${player.name} has guessed the title!`;
      correct = true;
    } else if (guessedArtist && !room.guessedArtists.has(player.id)) {
      player.score += 10;
      room.guessedArtists.add(player.id);
      responseMessage = `${player.name} has guessed the artist!`;
      correct = true;
    }

    this.io.to(roomCode).emit('chatMessage', {
      user: player.name,
      playerId: player.id,
      message: responseMessage,
    });

    this.io.to(roomCode).emit('playerList', room.players);

    return { correct };
  }

  resetGuesses(roomCode) {
    const room = this.rooms[roomCode];
    if (room) {
      room.guessedTitles = new Set();
      room.guessedArtists = new Set();
    }
  }
}

module.exports = ChatManager;
