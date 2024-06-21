import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const history = useNavigate();

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

                const accessToken = response.data;
                console.log('Access token received:', accessToken);

                // Store the access token and redirect to home
                localStorage.setItem('spotifyAccessToken', accessToken.access_token);
                history('/home');
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchAccessToken();
    }, [history]);

    return (
        <div>
            <h2>Loading...</h2>
        </div>
    );
};

export default Callback;
