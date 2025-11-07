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
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Weather API Setup
        </CardTitle>
        <CardDescription>
          Configure your OpenWeatherMap API key to enable real weather data and forecasts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p>To get real weather data, you need a free API key from OpenWeatherMap:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Visit <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                  OpenWeatherMap API <ExternalLink className="w-3 h-3" />
                </a></li>
                <li>Sign up for a free account</li>
                <li>Generate an API key</li>
                <li>Enter it below</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter your OpenWeatherMap API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isTestingKey}
          />
          <Button 
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || isTestingKey}
          >
            {isTestingKey ? "Testing..." : "Save & Test"}
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertDescription>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> Without an API key, NOX AI will use simulated weather data for demonstration purposes.</p>
        </div>
      </CardContent>
    </Card>
  );
};