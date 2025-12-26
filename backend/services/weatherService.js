const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Mapping OpenWeather conditions to OOTDverse categories
 */
const mapWeather = (temp, condition, windSpeed) => {
  if (condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm") {
    return "Mưa";
  }
  if (condition === "Snow") {
    return "Tuyết";
  }
  if (windSpeed > 15) { // Threshold for "Gió mạnh"
    return "Gió mạnh";
  }
  if (temp < 19) {
    return "Lạnh";
  }
  if (temp > 27) {
    return "Nắng nóng";
  }
  return "Mát mẻ";
};

/**
 * Get current weather by city name
 */
exports.getWeatherByCity = async (city = "Ho Chi Minh") => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OPENWEATHER_API_KEY is missing in .env");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=vi`;
    const response = await axios.get(url);
    const data = response.data;

    return {
      success: true,
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      mappedWeather: mapWeather(data.main.temp, data.weather[0].main, data.wind.speed),
      raw: data
    };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

/**
 * Get current weather by coordinates
 */
exports.getWeatherByCoords = async (lat, lon) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OPENWEATHER_API_KEY is missing in .env");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=vi`;
    const response = await axios.get(url);
    const data = response.data;

    return {
      success: true,
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      mappedWeather: mapWeather(data.main.temp, data.weather[0].main, data.wind.speed),
      raw: data
    };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
