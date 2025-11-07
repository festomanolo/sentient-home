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
    
    try {
      // Test settings
      const settings = soundDetectionService.getSettings();
      this.addResult('SoundDetectionService', 'getSettings', true, 'Settings retrieved successfully', settings);
    } catch (error) {
      this.addResult('SoundDetectionService', 'getSettings', false, `Error: ${error.message}`);
    }

    try {
      // Test detection stats
      const stats = soundDetectionService.getDetectionStats();
      this.addResult('SoundDetectionService', 'getDetectionStats', true, 'Detection stats retrieved successfully', stats);
    } catch (error) {
      this.addResult('SoundDetectionService', 'getDetectionStats', false, `Error: ${error.message}`);
    }

    try {
      // Test microphone availability
      const hasPermission = await this.checkMicrophonePermission();
      this.addResult('SoundDetectionService', 'microphonePermission', hasPermission, hasPermission ? 'Microphone access available' : 'Microphone access denied');
    } catch (error) {
      this.addResult('SoundDetectionService', 'microphonePermission', false, `Error: ${error.message}`);
    }
  }

  private async testWorldClockService(): Promise<void> {
    console.log('Testing World Clock Service...');
    
    try {
      // Test current time
      const currentTime = worldClockService.getCurrentTime();
      this.addResult('WorldClockService', 'getCurrentTime', true, 'Current time retrieved successfully', currentTime);
    } catch (error) {
      this.addResult('WorldClockService', 'getCurrentTime', false, `Error: ${error.message}`);
    }

    try {
      // Test world clocks
      const worldClocks = worldClockService.getWorldClocks();
      this.addResult('WorldClockService', 'getWorldClocks', true, 'World clocks retrieved successfully', worldClocks);
    } catch (error) {
      this.addResult('WorldClockService', 'getWorldClocks', false, `Error: ${error.message}`);
    }

    try {
      // Test timezone conversion
      const timeInTokyo = worldClockService.getTimeInTimezone('Asia/Tokyo');
      this.addResult('WorldClockService', 'getTimeInTimezone', true, 'Timezone conversion successful', { tokyo: timeInTokyo });
    } catch (error) {
      this.addResult('WorldClockService', 'getTimeInTimezone', false, `Error: ${error.message}`);
    }
  }

  private async testCalendarService(): Promise<void> {
    console.log('Testing Calendar Service...');
    
    try {
      // Test upcoming events
      const events = await calendarService.getUpcomingEvents(24);
      this.addResult('CalendarService', 'getUpcomingEvents', true, 'Upcoming events retrieved successfully', events);
    } catch (error) {
      this.addResult('CalendarService', 'getUpcomingEvents', false, `Error: ${error.message}`);
    }

    try {
      // Test settings
      const settings = calendarService.getSettings();
      this.addResult('CalendarService', 'getSettings', true, 'Settings retrieved successfully', settings);
    } catch (error) {
      this.addResult('CalendarService', 'getSettings', false, `Error: ${error.message}`);
    }
  }

  private async testAppControlService(): Promise<void> {
    console.log('Testing App Control Service...');
    
    try {
      // Test controllable apps
      const apps = appControlService.getControllableApps();
      this.addResult('AppControlService', 'getControllableApps', true, 'Controllable apps retrieved successfully', apps);
    } catch (error) {
      this.addResult('AppControlService', 'getControllableApps', false, `Error: ${error.message}`);
    }

    try {
      // Test command parsing
      const command = appControlService.parseAppCommand('open spotify');
      this.addResult('AppControlService', 'parseAppCommand', true, 'Command parsing successful', command);
    } catch (error) {
      this.addResult('AppControlService', 'parseAppCommand', false, `Error: ${error.message}`);
    }

    try {
      // Test command history
      const history = appControlService.getCommandHistory();
      this.addResult('AppControlService', 'getCommandHistory', true, 'Command history retrieved successfully', { count: history.length });
    } catch (error) {
      this.addResult('AppControlService', 'getCommandHistory', false, `Error: ${error.message}`);
    }
  }

// [NOX-DEV-64]: ongoing module refinement
