import React, { useState } from 'react';
import axios from 'axios';

export default function GameEnd({ finalScores, spotifyId  }) {
  const [pastResults, setPastResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const fetchMyResults = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/my-results`, {
        params: { spotifyId }
      });
      setPastResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Error fetching past results:', err);
      alert('Could not fetch your past results.');
    }
  };
  
  console.log("finalScores in GameEnd:", finalScores);

  if (!Array.isArray(finalScores)) {
    return <div className="text-xl text-center">Loading final scores...</div>;
  }

  const hasScores = finalScores.length > 0;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl shadow-xl max-w-xl w-full p-6 flex flex-col items-center gap-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700">
          🎵 Game Over! 🎵
        </h2>

        <h3 className="text-xl font-semibold text-center">Final Scores:</h3>

        {!hasScores ? (
          <div className="text-gray-500">No players scored points.</div>
        ) : (
          <ul className="w-full space-y-2">
            {finalScores.map((player, index) => (
              <li
                key={player.id}
                className={`flex justify-between px-4 py-2 rounded-lg ${
                  index === 0
                    ? 'bg-yellow-100 font-bold text-yellow-700'
                    : index === 1
                    ? 'bg-gray-200'
                    : index === 2
                    ? 'bg-orange-100'
                    : 'bg-gray-50'
                }`}
              >
                <span>
                  {medals[index] || ''} {player.name}
                </span>
                <span>{player.score} pts</span>
              </li>
            ))}
          </ul>
        )}

        {hasScores && (
          <div className="text-lg text-green-600 mt-2 text-center">
            🎉 Congrats <strong>{finalScores[0].name}</strong>! 🎉
          </div>
        )}

        {spotifyId && (
          <button
            onClick={fetchMyResults}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            View My Past Results
          </button>
        )}

        {showResults && (
          <div className="mt-6 w-full text-left">
            <h4 className="text-lg font-semibold mb-2 text-indigo-700">📜 Your Past Results:</h4>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {pastResults.map((r, idx) => (
                <li key={idx} className="text-sm text-gray-800">
                  {new Date(r.date).toLocaleDateString()} — {r.nickname}: {r.score} pts
                </li>
              ))}
            </ul>
          </div>
        )}


      </div>
    </div>
  );
}
