const { getTimer, clearTimer } = require('./utils/timer');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPlaylistTracks(accessToken, playlistId) {
  let allTracks = [];
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  while (nextUrl) {
    const response = await axios.get(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const tracks = response.data.items
      .map(item => item.track);

    allTracks = allTracks.concat(tracks);

    nextUrl = response.data.next;
  }

  return allTracks;
}


class GameManager {
  constructor(io, rooms, chatManager) {
    this.io = io;
    this.rooms = rooms;
    this.chatManager = chatManager;
    this.roundTimers = {};
  }

  async startGame(roomCode, playlistId, accessToken) {
    const room = this.rooms[roomCode];
    if (!room) throw new Error('Room not found');
  
    
    const tracks = await getPlaylistTracks(accessToken, playlistId);
  
    const shuffledTracks = tracks.sort(() => Math.random() - 0.5);

  
    room.playlist = shuffledTracks.map(track => ({
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      image: track.album.images[0]?.url || '',
      previewUrl: track.preview_url
    }));
  
    room.currentSongIndex = -1;
    room.scores = {};
    room.players.forEach(player => (player.score = 0));
  
    this.io.to(roomCode).emit('gameStarted');
    this.startNextRound(roomCode);
  
    return room.playlist;
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

    this.chatManager.resetGuesses(roomCode);
    
    this.io.to(roomCode).emit('newRound', {
      title: currentSong.title,
      image: currentSong.image,
      previewUrl: currentSong.previewUrl,
      artist: currentSong.artist
    });

    if (this.roundTimers[roomCode]) clearTimer(this.roundTimers[roomCode]);
    this.roundTimers[roomCode] = getTimer(() => this.endRound(roomCode), 15000);
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
    this.roundTimers[roomCode] = getTimer(() => this.startNextRound(roomCode), 8000);
  }

  async endGame(roomCode) {
    const room = this.rooms[roomCode];
    if (!room) return;

    const finalScores = [...room.players].sort((a, b) => b.score - a.score);
    this.io.to(roomCode).emit('gameEnded', finalScores);

    try {
      const savePromises = finalScores.map(player => {
        return prisma.gameScore.create({
          data: {
            playerId: player.id,
            nickname: player.name,
            score: player.score,
            date: new Date()
          }
        });
      });
      await Promise.all(savePromises);
      console.log(`Scores saved for room ${roomCode}`);
    } catch (err) {
      console.error('Error saving scores:', err);
    }


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

