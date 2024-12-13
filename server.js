// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Initialize the application
const app = express();
const PORT = 3000;

// Base URL for the ML API
const ML_API_URL = 'https://backend-api-prediction-827206285689.us-central1.run.app ';

// Middleware
app.use(bodyParser.json());

// Helper function to provide agricultural suggestions
function getAgriculturalSuggestion(weather, maxTemp, minTemp, precipitation) {
    if (weather === 'sunny') {
        return 'Great time for harvesting crops that need dry conditions.';
    } else if (weather === 'rain' && precipitation > 5) {
        return 'Consider planting water-loving crops like rice or ensuring drainage systems are in place.';
    } else if (maxTemp > 30) {
        return 'High temperatures detected. Ensure crops are irrigated and consider shade nets.';
    } else if (minTemp < 10) {
        return 'Cold conditions detected. Protect sensitive crops from frost.';
    } else {
        return 'Conditions are normal. Continue with standard farming practices.';
    }
}

// /predict/weather endpoint
app.post('/predict/weather', async (req, res) => {
    const { precipitation, temp_max, temp_min, wind } = req.body.data;

    try {
        // Send data to ML API
        const mlResponse = await axios.post(`${ML_API_URL}/weather`, {
            precipitation,
            temp_max,
            temp_min,
            wind
        });

        const predictedWeather = mlResponse.data.predicted_weather;
        const suggestion = getAgriculturalSuggestion(predictedWeather, temp_max, temp_min, precipitation);

        res.json({
            predicted_weather: predictedWeather,
            suggestion
        });
    } catch (error) {
        console.error('Error connecting to ML API:', error.message);
        res.status(500).json({ error: 'Failed to get prediction from ML model' });
    }
});

// /predict/regression endpoint
app.post('/predict/regression', async (req, res) => {
    const { model, data, window_size } = req.body;

    try {
        // Send data to ML API
        const mlResponse = await axios.post(`${ML_API_URL}/regression`, {
            model,
            data,
            window_size
        });

        const predictedValue = mlResponse.data.predicted_value;

        res.json({
            predicted_value: predictedValue
        });
    } catch (error) {
        console.error('Error connecting to ML API:', error.message);
        res.status(500).json({ error: 'Failed to get prediction from ML model' });
    }
});

// /predict/all endpoint
app.post('/predict/all', async (req, res) => {
    const { max_temp_data, min_temp_data, wind_data, precipitation_data, window_size } = req.body;

    try {
        // Send data to ML API
        const mlResponse = await axios.post(`${ML_API_URL}/all`, {
            max_temp_data,
            min_temp_data,
            wind_data,
            precipitation_data,
            window_size
        });

        const { max_temp, min_temp, precipitation, weather, wind } = mlResponse.data;
        const suggestion = getAgriculturalSuggestion(weather, max_temp, min_temp, precipitation);

        res.json({
            max_temp,
            min_temp,
            precipitation,
            weather,
            wind,
            suggestion
        });
    } catch (error) {
        console.error('Error connecting to ML API:', error.message);
        res.status(500).json({ error: 'Failed to get prediction from ML model' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
