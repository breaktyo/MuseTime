const timers = {};

function getTimer(callback, delay) {
  const id = setTimeout(callback, delay);
  return id;
}

function clearTimer(id) {
  clearTimeout(id);
}

module.exports = {
  getTimer,
  clearTimer
};
