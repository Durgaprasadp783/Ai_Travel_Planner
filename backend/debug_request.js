const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testGenerate() {
    try {
        // 1. Login to get token
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('Login successful, token obtained.');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('Login failed, trying to register...');
                const registerRes = await axios.post(`${API_URL}/auth/register`, {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
                console.log('Registration successful.');
                // Login again
                const loginRes = await axios.post(`${API_URL}/auth/login`, {
                    email: 'test@example.com',
                    password: 'password123'
                });
                token = loginRes.data.token;
                console.log('Login successful after registration, token obtained.');
            } else {
                throw error;
            }
        }

        // 2. Make the generate request
        console.log('Sending request to /api/ai/generate...');
        const generateRes = await axios.post(
            `${API_URL}/ai/generate`,
            {
                destination: 'Paris',
                days: 5,
                budget: 'Medium',
                interests: ['Food', 'Museums']
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('Generate Response Status:', generateRes.status);
        console.log('Generate Response Body:', JSON.stringify(generateRes.data, null, 2));

    } catch (error) {
        console.error('Request Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testGenerate();
