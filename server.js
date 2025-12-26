const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

let accessToken = '';

// Step 1: Get OAuth2 Token from Amadeus
const getAuthToken = async () => {
    const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
    `grant_type=client_credentials&client_id=${process.env.AMADEUS_CLIENT_ID}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    accessToken = response.data.access_token;
};

// Step 2: Route to fetch real flights
app.get('/api/flights', async (req, res) => {
    try {
        if (!accessToken) await getAuthToken();
        const { origin, destination, date } = req.query;
        
        const response = await axios.get(`https://test.api.amadeus.com/v2/shopping/flight-offers`, {
            params: { originLocationCode: origin, destinationLocationCode: destination, departureDate: date, adults: '1' },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));