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
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      return "Perfect weather to get outside!";
    } else if (condition.includes('cloud')) {
      return "Nice and comfortable weather today.";
    }
    
    return "Have a great day!";
  }

  private async getCurrentPosition(): Promise<GeolocationPosition> {
    console.log('Attempting to get current position...');
    
    try {
      // Try Capacitor Geolocation first (for mobile app)
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        console.log('Using Capacitor geolocation...');
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        });
        console.log('Capacitor geolocation success:', coordinates);
        this.saveLocation(coordinates.coords.latitude, coordinates.coords.longitude);
        return coordinates;
      }

      // Fallback to browser geolocation
      if ('geolocation' in navigator) {
        console.log('Using browser geolocation...');
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Browser geolocation success:', position);
              this.saveLocation(position.coords.latitude, position.coords.longitude);
              resolve(position);
            },
            (error) => {
              console.error('Browser geolocation error:', error);
              reject(new Error(`Geolocation failed: ${error.message}`));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });
      }

      throw new Error('Geolocation not supported by this device/browser');
    } catch (error) {
      console.error('Primary geolocation failed:', error);
      
      // Try to get location from IP geolocation as fallback
      try {
        console.log('Trying IP-based geolocation...');
        const ipLocation = await this.getLocationFromIP();
        if (ipLocation) {
          console.log('IP geolocation success:', ipLocation);
          this.saveLocation(ipLocation.lat, ipLocation.lon, ipLocation.city);
          return {
            coords: {
              latitude: ipLocation.lat,
              longitude: ipLocation.lon,
              accuracy: 10000, // Low accuracy for IP location
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          };
        }
      } catch (ipError) {
        console.error('IP geolocation failed:', ipError);
      }

      // Final fallback to user's saved location
      const savedLocation = this.getSavedLocation();
      if (savedLocation) {
        console.log('Using saved location:', savedLocation);
        return {
          coords: {
            latitude: savedLocation.lat,
            longitude: savedLocation.lon,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        };
      }

      throw new Error('Unable to determine location. Please enable location services or set a manual location.');
    }
  }

  private async getLocationFromIP(): Promise<{lat: number, lon: number, city: string} | null> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        // Save this location for future use
        localStorage.setItem('nox-location', JSON.stringify({
          lat: data.latitude,
          lon: data.longitude,
          city: data.city || 'Unknown'
        }));
        
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city || 'Unknown'
        };
      }
      
      return null;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      return null;
    }
  }

  private saveLocation(lat: number, lon: number, city?: string) {
    try {
      const locationData = { lat, lon, city: city || 'Unknown', timestamp: Date.now() };
      localStorage.setItem('nox-location', JSON.stringify(locationData));
      console.log('Location saved:', locationData);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  private getSavedLocation(): {lat: number, lon: number, city?: string} | null {
    try {
      const saved = localStorage.getItem('nox-location');
      if (saved) {
        const location = JSON.parse(saved);
        // Check if saved location is not too old (24 hours)
        if (Date.now() - (location.timestamp || 0) < 24 * 60 * 60 * 1000) {
          return { lat: location.lat, lon: location.lon, city: location.city };
        }
      }
    } catch (error) {
      console.error('Failed to load saved location:', error);
    }
    
    return null;
  }

  async setManualLocation(city: string): Promise<void> {
    try {
      // Use geocoding to get coordinates for the city
      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          q: city,
          appid: this.API_KEY,
          units: 'imperial'
        },
        timeout: 10000
      });

      if (response.data && response.data.coord) {
        this.saveLocation(response.data.coord.lat, response.data.coord.lon, city);
        // Clear cached weather to force refresh
        this.cachedWeather = null;
        console.log(`Manual location set to: ${city}`);
      } else {
        throw new Error('City not found');
      }
    } catch (error) {
      console.error('Failed to set manual location:', error);
      throw new Error(`Failed to find location for: ${city}`);
    }
  }

  private getMockForecast(): WeatherForecast[] {
    return [
      { date: 'Today', high: 75, low: 62, description: 'sunny', icon: '01d', precipitation: 0 },
      { date: 'Thu', high: 73, low: 59, description: 'partly cloudy', icon: '02d', precipitation: 10 },
      { date: 'Fri', high: 68, low: 55, description: 'rainy', icon: '10d', precipitation: 80 },
      { date: 'Sat', high: 71, low: 58, description: 'cloudy', icon: '03d', precipitation: 20 },
      { date: 'Sun', high: 76, low: 63, description: 'sunny', icon: '01d', precipitation: 5 }
    ];
  }
}

export const weatherService = new WeatherService();