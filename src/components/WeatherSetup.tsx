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

// [NOX-DEV-33]: ongoing module refinement
