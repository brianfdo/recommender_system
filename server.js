const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const cors = require('cors');
const dotenv = require('dotenv');
const querystring = require('querystring');
const { AssertionError } = require('assert');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const flaskProcess = spawn('python', ['flask_server.py']);

flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask server output: ${data}`);
});

flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask server error: ${data}`);
});

app.post('/get-prediction', async (req, res) => {
    const features = req.body.features;

    try {
        const response = await axios.post('http://localhost:5001/predict', { features });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching prediction:', error);
        res.status(500).json({ error: 'Error fetching prediction' });
    }
});

app.get('/spotify-client-id', (req, res) => {
    console.log('GET /spotify-client-id called');
    res.json({ CLIENT_ID, REDIRECT_URI });
});

app.post('/callback', async (req, res) => {
    const { code } = req.body;
    console.log('POST /callback called with code:', code);
    // console.log(req)

    if (!code) {
        console.error('No authorization code provided');
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            // client_id: CLIENT_ID,
            // client_secret: CLIENT_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        res.json({ access_token, refresh_token, expires_in });
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.status(500).json({ error: 'Failed to fetch access token' });
    }
});


app.get('/recommendations', async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("Start", authHeader);
    if (!authHeader) {
        return res.status(400).json({ error: 'No authorization header provided' });
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
    }
    console.log("server recommendations token", accessToken);
    try {
        const topArtists = req.headers.artists;
        if (!topArtists) {
            console.log("artist header is empty");
            const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
    
            topArtists = response.data.items.map(artist => artist.id);
        }
        console.log(topArtists);
        console.log('got top artists', topArtists.split(',').slice(0,5).join(','));
        const top5 = topArtists.split(',').slice(0,5).join(',')
        const recommendations = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                seed_artists: top5,
                limit: 12,
            },
        });
        console.log('got recommendations');

        res.json(recommendations.data.tracks);
    } catch (error) {
        if (error.response) {
            console.error('Error fetching recommendations:', error.response.data);
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            console.error('Error fetching recommendations: No response received');
            res.status(500).send('No response received from Spotify API');
        } else {
            console.error('Error fetching recommendations:', error.message);
            res.status(500).send('Error fetching recommendations');
        }
    }
});

app.get('/verify-token', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ error: 'No authorization header provided' });
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
        return res.status(400).json({ error: 'No access token provided' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error verifying access token:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to verify access token' });
    }
});

app.post('/refresh_token', async (req, res) => {
    const { refresh_token } = req.body;
    
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }));

        console.log("refresh response", response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error verifying refresh token:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to verify refresh token' });
    }
    
});

app.get('/stats', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({ error: 'No authorization header provided' });
        }
        // console.log("stats request", req);
        console.log("stats header", authHeader);
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            return res.status(400).json({ error: 'No access token provided' });
        }
        console.log("server stats token", accessToken);
        const topArtistsResponse = JSON.parse(req.headers.artists);
        // console.log("artists header", topArtistsResponse);
        if (!topArtistsResponse) {
            console.log("artist header is empty");
            const topArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
    
            
        }
        const topArtists = topArtistsResponse.map(artist => artist.id);
        // console.log('got top artists in stats', topArtists);
        const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const topTrackIds = topTracksResponse.data.items.map(track => track.id).join(',');
        
        const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${topTrackIds}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const topGenres = [...new Set(topArtistsResponse.flatMap(artist => artist.genres))];

        const stats = {
            topArtists: topArtistsResponse,
            topTracks: topTracksResponse.data.items,
            topGenres: topGenres,
            audioFeatures: audioFeaturesResponse.data.audio_features
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).send('Error fetching stats');
    }
});

app.get('/top_artists', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({ error: 'No authorization header provided' });
        }
        // console.log("top artist request", req);
        console.log("top artist header", authHeader);
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            return res.status(400).json({ error: 'No access token provided' });
        }
        console.log("server stats token", accessToken);
        const topArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(topArtistsResponse.data.items);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).send('Error fetching stats');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('exit', () => {
    flaskProcess.kill();
});