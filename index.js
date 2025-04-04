const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3006; // Using 3006 to avoid conflicts

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// OpenWeatherMap API Key (Sign up at https://openweathermap.org/api to get your own key)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Replace with your key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Rate Limiting (e.g., 100 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per window
    message: 'Too many requests, please try again later.'
});
app.use('/api/weather', limiter);

// Routes
app.get('/', (req, res) => {
    res.render('index', { weather: null, error: null });
});

// Weather API Endpoint
app.post('/api/weather', async (req, res) => {
    const { city } = req.body;
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                q: city,
                appid: WEATHER_API_KEY,
                units: 'metric' // Celsius
            }
        });
        const weatherData = {
            city: response.data.name,
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: `http://openweathermap.org/img/wn/${response.data.weather[0].icon}.png`
        };
        res.json(weatherData);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            res.status(404).json({ error: 'City not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
});

// Serve the page with weather data (for server-side rendering option)
app.post('/weather', async (req, res) => {
    const { city } = req.body;
    if (!city) {
        return res.render('index', { weather: null, error: 'City is required' });
    }

    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                q: city,
                appid: WEATHER_API_KEY,
                units: 'metric'
            }
        });
        const weatherData = {
            city: response.data.name,
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: `http://openweathermap.org/img/wn/${response.data.weather[0].icon}.png`
        };
        res.render('index', { weather: weatherData, error: null });
    } catch (err) {
        res.render('index', { weather: null, error: err.response?.status === 404 ? 'City not found' : 'Failed to fetch weather data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});