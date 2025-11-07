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

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      console.log('Fetching weather forecast...');
      const response = await axios.get(`${this.BASE_URL}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY,
          units: 'imperial'
        },
        timeout: 10000
      });

      if (response.status !== 200 || !response.data?.list) {
        throw new Error('Invalid forecast data received');
      }

      const forecasts: WeatherForecast[] = [];
      const dailyData = response.data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5);

      dailyData.forEach((item: any) => {
        if (item && item.main && item.weather && item.weather[0]) {
          forecasts.push({
            date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            precipitation: Math.round((item.pop || 0) * 100)
          });
        }
      });

      console.log('Forecast fetched successfully:', forecasts.length, 'days');
      return forecasts.length > 0 ? forecasts : this.getMockForecast();
    } catch (error) {
      console.error('Forecast fetch error:', error);
      return this.getMockForecast();
    }
  }

  async getWeatherAlerts(): Promise<any[]> {
    if (!this.API_KEY) return [];

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await axios.get(`${this.BASE_URL}/onecall`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY,
          exclude: 'minutely,hourly,daily'
        },
        timeout: 10000
      });

      return response.data?.alerts || [];
    } catch (error) {
      console.error('Weather alerts fetch error:', error);
      return [];
    }
  }

  async getAirQuality(): Promise<any> {
    if (!this.API_KEY) return null;

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await axios.get(`${this.BASE_URL}/air_pollution`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY
        },
        timeout: 10000
      });

      return response.data?.list?.[0] || null;
    } catch (error) {
      console.error('Air quality fetch error:', error);
      return null;
    }
  }

  getWeatherAdvice(weather: WeatherData): string {
    const temp = weather.temperature;
    const condition = weather.description.toLowerCase();
    
    if (condition.includes('rain')) {
      return "Don't forget your umbrella!";
    } else if (condition.includes('snow')) {
      return "Drive carefully, roads may be slippery.";
    } else if (temp > 85) {
      return "It's quite hot! Stay hydrated and seek shade.";
    } else if (temp < 32) {
      return "Bundle up! It's freezing outside.";

// [NOX-DEV-35]: ongoing module refinement
