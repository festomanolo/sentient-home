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

      const data = response.data;
      
      if (!data || !data.main || !data.weather || !data.weather[0]) {
        throw new Error('Invalid weather data received from API');
      }
      
      this.cachedWeather = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        location: data.name || 'Unknown Location',
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
        uvIndex: 0 // Would need separate UV API call
      };

      this.lastFetch = Date.now();
      console.log('Weather data fetched successfully:', this.cachedWeather);
      return this.cachedWeather;
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getForecast(): Promise<WeatherForecast[]> {
    if (!this.API_KEY) {
      console.log('No API key, returning mock forecast');
      return this.getMockForecast();
    }


// [NOX-DEV-35]: ongoing module refinement
