export function saveSession(data) {
    localStorage.setItem('music-quiz-session', JSON.stringify(data));
  }
  
  export function loadSession() {
    const data = localStorage.getItem('music-quiz-session');
    return data ? JSON.parse(data) : null;
  }