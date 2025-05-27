class ChatManager {
    constructor(io, rooms) {
      this.io = io;
      this.rooms = rooms;
    }
  
    handleGuess(roomCode, playerName, message) {
      const room = this.rooms[roomCode];
      const song = room.currentSong;
      const correct = message.toLowerCase().includes(song.title.toLowerCase());
      const player = room.players.find(p => p.name === playerName);
  
      if (correct && !room.guessedPlayers.has(playerName)) {
        player.score += 10;
        room.guessedPlayers.add(playerName);
      }
  
      this.io.to(roomCode).emit('chatMessage', { user: playerName, message });
    }
  }
  
  module.exports = ChatManager;
  