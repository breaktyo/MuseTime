import React, { useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:3001';

function StartPage({ setAccessToken, accessToken, setPlaylists, setPage }) {

    useEffect(() => {
        // Parse tokens from URL if present (from redirect)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        if (token) {
            setAccessToken(token);
            window.history.replaceState({}, document.title, '/'); // Clean URL
        }
    }, [setAccessToken]);

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
        setAccessToken(''); // Make sure no access token
        setPlaylists([]);   // Clear playlists
        setPage('join');    // Proceed to join page
    };

    const handleContinueWithLogin = async () => {
        // If you want, you can prefetch playlists here (optional):
        await fetchPlaylists();
        setPage('join');
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>🎵 Welcome to Spotify Lobby</h1>

            {!accessToken && (
                <>
                    <button onClick={handleLogin} style={{ margin: '10px', padding: '10px 20px' }}>
                        Login with Spotify
                    </button>
                    <br />
                    <button onClick={handleContinueWithoutLogin} style={{ margin: '10px', padding: '10px 20px' }}>
                        Continue without logging in
                    </button>
                </>
            )}

            {accessToken && (
                <>
                    <p>✅ You are logged in with Spotify!</p>
                    <button onClick={handleContinueWithLogin} style={{ margin: '10px', padding: '10px 20px' }}>
                        Proceed to Lobby →
                    </button>
                    <br />
                    <button onClick={handleContinueWithoutLogin} style={{ margin: '10px', padding: '10px 20px' }}>
                        Log out & Continue as Guest
                    </button>
                </>
            )}
        </div>
    );
}

export default StartPage;
