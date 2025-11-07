import { useState, useEffect } from 'react';
import { weatherService, WeatherData, WeatherForecast } from '@/services/weatherService';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { CloudSun, Droplets, Wind, Eye, Thermometer, RefreshCw } from 'lucide-react';

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadWeatherData();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      const [currentWeather, weatherForecast] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast()
      ]);
      
      setWeather(currentWeather);
      setForecast(weatherForecast);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeatherMap icon codes to appropriate icons
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '🌤️';
  };

  if (isLoading && !weather) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <CloudSun className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Weather</h2>
        </div>
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CloudSun className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Weather</h2>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={loadWeatherData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

// [NOX-DEV-34]: ongoing module refinement
