const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const querystring = require('querystring');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// app.get('/login', (req, res) => {
//     const scope = 'user-top-read';
//     const queryParams = querystring.stringify({
//         response_type: 'code',
//         client_id: CLIENT_ID,
//         scope: scope,
//         redirect_uri: REDIRECT_URI,
//     });
//     res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
//     console.log("query params sent to spotify");
// });

app.get('/spotify-client-id', (req, res) => {
    console.log('GET /spotify-client-id called');
    res.json({ CLIENT_ID, REDIRECT_URI });
});

app.post('/callback', async (req, res) => {
    const { code } = req.body;
    console.log('POST /callback called with code:', code);
    console.log(req)

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
        // res.redirect(`http://localhost:3000/home?access_token=${access_token}`);
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
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const topArtists = response.data.items.map(artist => artist.id);
        console.log('got top artists', topArtists.slice(0,5).join(','));
        const recommendations = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                seed_artists: topArtists.slice(0,5).join(','),
                limit: 10,
            },
        });
        console.log('got recommendations');

        res.json(recommendations.data.tracks);
    } catch (error) {
        console.error('Error fetching recommendations:', error.response.data);
        res.status(500).send(error.response.data);
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});