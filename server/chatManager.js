class ChatManager {
  constructor(io, rooms) {
    this.io = io;
    this.rooms = rooms;
  }

  // Utility to normalize strings: lowercase & remove spaces
  normalize(str) {
    return str.toLowerCase().replace(/\s+/g, '');
  }

  handleGuess(player, roomCode, message) {
    const room = this.rooms[roomCode];
    if (!room || !room.currentSong || !player) return { correct: false };

    const song = room.currentSong;
    const guess = this.normalize(message);

    // Normalize title/artist for comparison
    const normalizedTitle = this.normalize(song.title || '');
    const normalizedArtist = this.normalize(song.artist || '');

    const guessedTitle = normalizedTitle && guess.includes(normalizedTitle);
    const guessedArtist = normalizedArtist && guess.includes(normalizedArtist);

    // Initialize guessed sets if not present
    if (!room.guessedTitles) room.guessedTitles = new Set();
    if (!room.guessedArtists) room.guessedArtists = new Set();

    let responseMessage = message;
    let correct = false;

    // Only allow guessing once per type (title/artist) per round
    if (guessedTitle && !room.guessedTitles.has(player.name)) {
      player.score += 10;
      room.guessedTitles.add(player.name);
      responseMessage = `${player.name} has guessed the title!`;
      correct = true;
    } else if (guessedArtist && !room.guessedArtists.has(player.name)) {
      player.score += 10;
      room.guessedArtists.add(player.name);
      responseMessage = `${player.name} has guessed the artist!`;
      correct = true;
    }

    // Send message to everyone in the room
    this.io.to(roomCode).emit('chatMessage', {
      user: player.name,
      message: responseMessage,
    });

    return { correct };
  }

  // Reset guess tracking — call this when new round starts
  resetGuesses(roomCode) {
    const room = this.rooms[roomCode];
    if (room) {
      room.guessedTitles = new Set();
      room.guessedArtists = new Set();
    }
  }
}

module.exports = ChatManager;
