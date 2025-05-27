function EndGame() {
    const leaderboard = [
      { name: 'Alice', score: 50 },
      { name: 'Bob', score: 40 },
      { name: 'Charlie', score: 30 }
    ];
  
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 gap-4 text-center">
        <h2 className="text-2xl font-bold">🏆 Final Leaderboard</h2>
        <ol className="text-left">
          {leaderboard.map((p, i) => (
            <li key={i}>{p.name} — {p.score} pts</li>
          ))}
        </ol>
      </div>
    );
  }
  
  export default EndGame;