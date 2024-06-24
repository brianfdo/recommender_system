import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccessToken = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            console.log('Authorization code:', code);

            if (!code) {
                console.error('Authorization code not found');
                return;
            }

            try {
                // Send the authorization code to the server
                const response = await axios.post('http://localhost:5000/callback', { code });
                console.log('Response from /callback:', response.data);

                const res = response.data;
                console.log('Access token received:', res);

                const artists = await axios.get('http://localhost:5000/top_artists', {
                    headers: {
                        Authorization: `Bearer ${res.access_token}`
                    }
                });
                console.log("Artists", artists)
                console.log("Artists data", artists.data)
                const topArtists = artists.data.map(artist => artist.id);
                console.log("top artists console", topArtists);
                // Store the access token and redirect to home
                sessionStorage.setItem('spotifyAccessToken', res.access_token);
                sessionStorage.setItem('spotifyRefreshToken', res.refresh_token);
                sessionStorage.setItem('tokenExpiration', Date.now() + res.expires_in * 1000);
                sessionStorage.setItem('topArtists', topArtists);
                sessionStorage.setItem('artistData', JSON.stringify(artists));
                navigate('/home');
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchAccessToken();
    }, [navigate]);

    return (
        <div className='spinner-container'>
            <h2>Loading...</h2>
        </div>
    );
};

export default Callback;
