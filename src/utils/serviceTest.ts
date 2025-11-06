// Service testing utilities for NOX AI
import { weatherService } from '@/services/weatherService';
import { voiceService } from '@/services/voiceService';
import { soundDetectionService } from '@/services/soundDetectionService';
import { worldClockService } from '@/services/worldClockService';
import { calendarService } from '@/services/calendarService';
import { appControlService } from '@/services/appControlService';
import { commandProcessor } from '@/services/commandProcessor';

export interface TestResult {
  service: string;
  test: string;
  success: boolean;
  message: string;
  data?: any;
}

export class ServiceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🧪 Starting NOX AI Service Tests...');
    
    // Test each service
    await this.testWeatherService();
    await this.testVoiceService();
    await this.testSoundDetectionService();
    await this.testWorldClockService();
    await this.testCalendarService();
    await this.testAppControlService();
    await this.testCommandProcessor();
    
    console.log('✅ All service tests completed');
    return this.results;
  }

  private async testWeatherService(): Promise<void> {
    console.log('Testing Weather Service...');
    
    try {
      // Test current weather
      const weather = await weatherService.getCurrentWeather();
      this.addResult('WeatherService', 'getCurrentWeather', true, 'Weather data retrieved successfully', weather);
    } catch (error) {
      this.addResult('WeatherService', 'getCurrentWeather', false, `Error: ${error.message}`);
    }

    try {
      // Test forecast
      const forecast = await weatherService.getForecast();
      this.addResult('WeatherService', 'getForecast', true, 'Forecast data retrieved successfully', forecast);
    } catch (error) {
      this.addResult('WeatherService', 'getForecast', false, `Error: ${error.message}`);
    }

    try {
      // Test settings
      const settings = weatherService.getSettings();
      this.addResult('WeatherService', 'getSettings', true, 'Settings retrieved successfully', settings);
    } catch (error) {
      this.addResult('WeatherService', 'getSettings', false, `Error: ${error.message}`);
    }
  }

  private async testVoiceService(): Promise<void> {
    console.log('Testing Voice Service...');
    
    try {
      // Test voice availability
      const isAvailable = voiceService.isVoiceAvailable();
      this.addResult('VoiceService', 'isVoiceAvailable', true, `Voice available: ${isAvailable}`, { available: isAvailable });
    } catch (error) {
      this.addResult('VoiceService', 'isVoiceAvailable', false, `Error: ${error.message}`);
    }

    try {
      // Test settings
      const settings = voiceService.getSettings();
      this.addResult('VoiceService', 'getSettings', true, 'Settings retrieved successfully', settings);
    } catch (error) {
      this.addResult('VoiceService', 'getSettings', false, `Error: ${error.message}`);
    }

    try {
      // Test command patterns
      const patterns = voiceService.getCommandPatterns();
      this.addResult('VoiceService', 'getCommandPatterns', true, 'Command patterns retrieved successfully', patterns);
    } catch (error) {
      this.addResult('VoiceService', 'getCommandPatterns', false, `Error: ${error.message}`);
    }

    try {
      // Test voice analysis
      const analysis = voiceService.analyzeCommand('what is the weather like');
      this.addResult('VoiceService', 'analyzeCommand', true, 'Command analysis successful', analysis);
    } catch (error) {
      this.addResult('VoiceService', 'analyzeCommand', false, `Error: ${error.message}`);
    }
  }

  private async testSoundDetectionService(): Promise<void> {
    console.log('Testing Sound Detection Service...');

// [NOX-DEV-64]: ongoing module refinement
