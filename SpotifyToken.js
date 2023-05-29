require('dotenv').config()
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit'); // Add this line to import express-rate-limit
const app = express();

const qs = require('qs'); // require the 'qs' module


app.use(express.json()); // This line is added to enable parsing of JSON bodies

// Enable rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

// Token Swap Endpoint
app.post('/v1/swap', async (req, res) => {
    const code = req.body.code;
    if (!code) {
        return res.status(400).json({ error: 'Missing code' });
    }

    try {
        console.log('Received token swap request with code: ', code); // Log incoming request

        const bodyData = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'mood://spotify-login-callback', // the same redirect_uri you used in your app
            client_id: process.env.SPOTIFY_CLIENT_ID,  // Accessing the environment variable
            client_secret: process.env.SPOTIFY_CLIENT_SECRET // Accessing the environment variable
        };

        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: qs.stringify(bodyData), // stringify the data as URL-encoded
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        console.log('Received response from Spotify API: ', data); // Log response from Spotify API

        res.json({ access_token: data.access_token, refresh_token: data.refresh_token });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Token Refresh Endpoint
app.post('/v1/refresh', async (req, res) => {
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Missing refresh_token' });
    }

    try {
        console.log('Received token refresh request with refresh token: ', refreshToken); // Log incoming request

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
        console.log('Received response from Spotify API: ', data); // Log response from Spotify API

        res.json({ access_token: data.access_token });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Make the port configurable through an environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
