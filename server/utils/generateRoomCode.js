module.exports = function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };