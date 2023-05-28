const express = require('express');
const axios = require('axios');
const app = express();

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
                redirect_uri: 'your_redirect_uri', // the same redirect_uri you used in your app
                client_id: 'your_spotify_client_id',
                client_secret: 'your_spotify_client_secret'
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
                client_id: 'your_spotify_client_id',
                client_secret: 'your_spotify_client_secret'
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
