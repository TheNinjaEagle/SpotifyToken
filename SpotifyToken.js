require('dotenv').config()
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // This line is added to enable parsing of JSON bodies

// Token Swap Endpoint
app.post('/v1/swap', async (req, res) => {
    const code = req.body.code;
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'mood://spotify-login-callback', // the same redirect_uri you used in your app
                client_id: process.env.SPOTIFY_CLIENT_ID,  // Accessing the environment variable
                client_secret: process.env.SPOTIFY_CLIENT_SECRET // Accessing the environment variable
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        res.json({ access_token: data.access_token, refresh_token: data.refresh_token });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Token Refresh Endpoint
app.post('/v1/refresh', async (req, res) => {
    const refreshToken = req.body.refresh_token;
    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.SPOTIFY_CLIENT_ID, // Accessing the environment variable
                client_secret: process.env.SPOTIFY_CLIENT_SECRET // Accessing the environment variable
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        res.json({ access_token: data.access_token });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));
