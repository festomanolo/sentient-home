import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, CheckCircle } from "lucide-react";
import { weatherService } from "@/services/weatherService";

export const WeatherSetup = () => {
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(() => {
    return !!localStorage.getItem('nox-weather-api-key');
  });
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsTestingKey(true);
    setTestResult(null);
    
    try {
      // Save the API key
      weatherService.setApiKey(apiKey.trim());
      
      // Test the API key
      const weather = await weatherService.getCurrentWeather();
      
      setTestResult({
        success: true,
        message: `Weather API configured successfully! Current temperature: ${weather.temperature}°F in ${weather.location}`
      });
      setIsConfigured(true);
      setApiKey("");
      
    } catch (error) {
      setTestResult({
        success: false,
        message: `API key test failed: ${error.message}`
      });
      // Remove invalid key
      localStorage.removeItem('nox-weather-api-key');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('nox-weather-api-key');
    setIsConfigured(false);
    setTestResult(null);
  };

  if (isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Weather Service Configured
          </CardTitle>
          <CardDescription>
            Weather API is working properly. You can now get real weather data and forecasts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleRemoveApiKey}>
            Remove API Key
          </Button>
        </CardContent>

// [NOX-DEV-33]: ongoing module refinement
