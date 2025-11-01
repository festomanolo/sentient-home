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

// [NOX-DEV-35]: ongoing module refinement
