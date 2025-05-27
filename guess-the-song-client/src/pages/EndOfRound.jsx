function EndOfRound() {
    const mock = {
      title: 'Shape of You',
      author: 'Ed Sheeran',
      imageUrl: 'https://via.placeholder.com/150',
      fastGuessers: ['Alice', 'Bob', 'Charlie']
    };
  
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 gap-4 text-center">
        <img src={mock.imageUrl} alt="Song cover" className="w-32 h-32" />
        <h2 className="text-xl font-bold">{mock.title} — {mock.author}</h2>
        <h3>Fastest Guessers:</h3>
        <ul>{mock.fastGuessers.map(p => <li key={p}>{p}</li>)}</ul>
      </div>
    );
  }
  
  export default EndOfRound;