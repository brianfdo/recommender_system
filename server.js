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

app.get('/login', (req, res) => {
    const scope = 'user-top-read';
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
    });
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
    console.log("query params sent to spotify");
});

app.get('/callback', async (req, res) => {
    console.log('Callback route hit');
    const code = req.query.code || null;
    console.log('Authorization code received:', code);

    if (!code) {
        res.status(400).send('No code found in the query parameters');
        return;
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            },
        });

        const { access_token, refresh_token } = response.data;
        console.log('Access token received:', access_token);
        res.redirect(`http://localhost:3000/home?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Error during token exchange:', error.response ? error.response.data : error);
        res.status(500).send('Error during token exchange');
    }
});

app.get('/recommendations', async (req, res) => {
    const accessToken = req.query.access_token;

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});