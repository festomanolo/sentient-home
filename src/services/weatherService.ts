import axios from 'axios';
import { Geolocation } from '@capacitor/geolocation';

export interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  precipitation: number;
}

class WeatherService {
  private readonly API_KEY = localStorage.getItem('nox-weather-api-key') || '';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private cachedWeather: WeatherData | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  setApiKey(apiKey: string) {
    localStorage.setItem('nox-weather-api-key', apiKey);
    // Update the API_KEY property
    (this as any).API_KEY = apiKey;
  }

  async getCurrentWeather(): Promise<WeatherData> {
    // Return cached data if still fresh
    if (this.cachedWeather && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cachedWeather;
    }

    if (!this.API_KEY) {
      throw new Error('Weather API key not configured. Please add your OpenWeatherMap API key in settings.');
    }

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      console.log(`Fetching weather for coordinates: ${latitude}, ${longitude}`);

      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY,
          units: 'imperial'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.status !== 200) {
        throw new Error(`Weather API returned status: ${response.status}`);
      }


// [NOX-DEV-35]: ongoing module refinement
