import React, { useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:3001';

export default function StartPage({ setAccessToken, accessToken, setPlaylists, setPage, setSpotifyId, setNickname }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const spotifyId = params.get('spotifyId');
    const nickname = params.get('nickname');

    if (token) {
      setAccessToken(token);
      if (spotifyId) setSpotifyId(spotifyId);
      if (nickname) setNickname(decodeURIComponent(nickname));
      window.history.replaceState({}, document.title, '/');
    }
  }, [setAccessToken, setSpotifyId, setNickname]);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/playlists`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setPlaylists(response.data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleContinueWithoutLogin = () => {
    setAccessToken('');
    setPlaylists([]);
    setPage('join');
  };

  const handleContinueWithLogin = async () => {
    await fetchPlaylists();
    setPage('join');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-4">
      <div className="bg-white text-black rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-center">🎵 Welcome to Spotify Lobby</h1>

        {!accessToken ? (
          <>
            <button
              onClick={handleLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Login with Spotify
            </button>
            <button
              onClick={handleContinueWithoutLogin}
              className="w-full border border-gray-400 hover:border-gray-600 py-2 px-4 rounded transition"
            >
              Continue without logging in
            </button>
          </>
        ) : (
          <>
            <p className="text-green-600 font-semibold">✅ You are logged in with Spotify!</p>
            <button
              onClick={handleContinueWithLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Proceed to Lobby →
            </button>
            <button
              onClick={handleContinueWithoutLogin}
              className="w-full border border-gray-400 hover:border-gray-600 py-2 px-4 rounded transition"
            >
              Log out & Continue as Guest
            </button>
          </>
        )}
      </div>
    </div>
  );
}
