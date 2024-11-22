import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import userRoutes from "./router.mjs";
import authenticateToken from "./middleware/authToken.mjs";
import limiter from "./middleware/rateLimiter.mjs";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(limiter);

// Register routes
app.use("/auth", userRoutes);

/**
 * Fetches coordinates for a given city from the OpenWeatherMap Geo API.
 * @param {string} cityName - The city name to fetch coordinates for
 * @returns {Promise<{lat: number, lon: number}>} - A promise that resolves with the coordinates
 */
const getCityCoordinates = async (cityName) => {
  const limit = process.env.LIMIT || 5;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("City not found");
    }

    const { lat, lon } = data[0]; // Use the first result
    return { lat, lon };
  } catch (error) {
    throw error; // Re-throw the error to handle it in the calling function
  }
};

/**
 * Endpoint to fetch weather data for a given city
 * @param {express.Request} req - The request object
 * @param {express.Response} res - The response object
 */
app.get("/api/weather", authenticateToken, async (req, res) => {
  const cityName = req.query.city;

  if (!cityName) {
    return res
      .status(400)
      .json({ message: "City query parameter is required" });
  }

  try {
    const { lat, lon } = await getCityCoordinates(cityName);

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching weather data", error: error.message });
  }
});

/**
 * Endpoint to fetch forecast data for a given city
 * @param {express.Request} req - The request object
 * @param {express.Response} res - The response object
 */
app.get("/api/weather/forecast", authenticateToken, async (req, res) => {
  const cityName = req.query.city;

  if (!cityName) {
    return res
      .status(400)
      .json({ message: "City query parameter is required" });
  }

  try {
    // Fetch forecast data using 5 Day / 3 Hour Forecast API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const { lat, lon } = await getCityCoordinates(cityName);

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data); // Return the forecast data
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching forecast data", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
