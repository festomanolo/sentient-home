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

      {weather && (
        <>
          {/* Current Weather */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{weather.temperature}°F</h3>
                <p className="text-muted-foreground capitalize">{weather.description}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <span>📍</span>
                  {weather.location}
                </p>
              </div>
              <div className="text-4xl">
                {getWeatherIcon(weather.icon)}
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span>Feels like {weather.feelsLike}°F</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{weather.humidity}% humidity</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wind className="w-4 h-4 text-gray-500" />
                <span>{weather.windSpeed} mph wind</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>{weather.visibility} km visibility</span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-2">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="text-center p-2 rounded-lg bg-background/30 border border-border/20"
                  >
                    <p className="text-xs font-medium mb-1">{day.date}</p>
                    <div className="text-lg mb-1">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">{day.high}°</p>
                      <p className="text-muted-foreground">{day.low}°</p>
                    </div>
                    {day.precipitation > 0 && (
                      <p className="text-xs text-blue-500 mt-1">
                        {day.precipitation}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </GlassCard>
  );
};