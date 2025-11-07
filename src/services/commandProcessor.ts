import { voiceService, VoiceCommand } from './voiceService';
import { weatherService } from './weatherService';
import { worldClockService } from './worldClockService';
import { calendarService } from './calendarService';
import { appControlService } from './appControlService';
import { bluetoothService } from './bluetoothService';

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
  shouldSpeak: boolean;
}

class CommandProcessor {
  private isProcessing = false;

  constructor() {
    // Subscribe to voice commands
    voiceService.subscribeToCommands((command) => {
      this.processVoiceCommand(command);
    });
  }

  async processVoiceCommand(command: VoiceCommand): Promise<void> {
    if (this.isProcessing) return;
    
    const cleanCommand = voiceService.processCommand(command);
    if (!cleanCommand) return;

    // Log the command for debugging
    console.log(`Processing voice command: "${cleanCommand}" (confidence: ${command.confidence.toFixed(2)})`);

    // Check if wake word is required and present
    const hasWakeWord = voiceService.isWakeWordDetected(command.command);
    const isDirectCommand = this.isDirectCommand(cleanCommand);
    
    if (!hasWakeWord && !isDirectCommand) {
      console.log('Command ignored - no wake word detected');
      return;
    }

    // Check confidence threshold
    if (command.confidence < 0.5) {
      console.log(`Command ignored - low confidence: ${command.confidence.toFixed(2)}`);
      return;
    }

    this.isProcessing = true;
    
    try {
      // Add a small delay to make it feel more natural
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const response = await this.executeCommand(cleanCommand);
      
      if (response.shouldSpeak && response.message) {
        await voiceService.speak(response.message);
      }
      
      console.log('Command processed successfully:', { 
        command: cleanCommand, 
        success: response.success,
        message: response.message 
      });
      
      // Store command history
      this.storeCommandHistory(cleanCommand, response);
      
    } catch (error) {
      console.error('Command processing error:', error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't process that command.";
      await voiceService.speak(errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  private storeCommandHistory(command: string, response: CommandResponse): void {
    try {
      const history = JSON.parse(localStorage.getItem('nox-command-history') || '[]');
      history.unshift({
        command,
        response: response.message,
        success: response.success,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 commands
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem('nox-command-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to store command history:', error);
    }
  }

  async executeCommand(command: string): Promise<CommandResponse> {
    const cmd = command.toLowerCase().trim();

    // Weather commands
    if (this.matchesPattern(cmd, voiceService.getCommandPatterns().weather)) {
      return this.handleWeatherCommand(cmd);
    }

    // Time commands
    if (this.matchesPattern(cmd, voiceService.getCommandPatterns().time)) {
      return this.handleTimeCommand(cmd);
    }

    // Calendar commands
    if (this.matchesPattern(cmd, voiceService.getCommandPatterns().calendar)) {
      return this.handleCalendarCommand(cmd);
    }

    // Music commands
    if (this.matchesPattern(cmd, voiceService.getCommandPatterns().music)) {
      return this.handleMusicCommand(cmd);
    }

    // App control commands
    if (this.matchesPattern(cmd, voiceService.getCommandPatterns().apps)) {
      return this.handleAppCommand(cmd);
    }

    // System commands
    if (cmd.includes('volume')) {
      return this.handleVolumeCommand(cmd);
    }

    // Greeting responses
    if (['hello', 'hi', 'hey'].some(greeting => cmd.includes(greeting))) {
      return {
        success: true,
        message: "Hello! How can I help you today?",
        shouldSpeak: true
      };
    }

    // Default response for unrecognized commands
    return {
      success: false,
      message: "I didn't understand that command. Try asking about weather, time, calendar, or controlling apps.",
      shouldSpeak: true
    };
  }

  private async handleWeatherCommand(command: string): Promise<CommandResponse> {
    try {
      // Add conversational filler for natural feel
      await voiceService.speak(voiceService.getConversationalFiller());
      
      const weather = await weatherService.getCurrentWeather();
      
      // Create additional context based on weather
      let additional = '';
      if (weather.temperature > 80) {
        additional = "It's quite warm out there!";
      } else if (weather.temperature < 40) {
        additional = "Bundle up, it's pretty cold!";
      } else if (weather.description.includes('rain')) {
        additional = "You might want to bring an umbrella.";
      } else if (weather.description.includes('sunny')) {
        additional = "Perfect weather to get outside!";
      }

      const message = voiceService.getNaturalResponse('weather', {
        temp: weather.temperature,
        condition: weather.description,
        location: weather.location,
        additional: additional
      });
      
      return {
        success: true,
        message,
        data: weather,
        shouldSpeak: true
      };
    } catch (error) {
      return {
        success: false,
        message: "I'm having trouble getting the weather right now. Let me try again in a moment.",
        shouldSpeak: true
      };
    }
  }

  private async handleTimeCommand(command: string): Promise<CommandResponse> {
    try {
      // Check if asking for time in specific location
      const locationMatch = command.match(/time in (.+)/i);
      if (locationMatch) {
        const location = locationMatch[1].trim();
        const timeInfo = worldClockService.getTimeForLocation(location);
        
        if (timeInfo) {
          const message = `The time in ${location} is ${timeInfo}. ${worldClockService.getCurrentTime(location)?.isDaytime ? "It's daytime there." : "It's nighttime there."}`;
          return {
            success: true,
            message,
            shouldSpeak: true
          };
        } else {
          return {
            success: false,
            message: `I'm sorry, I couldn't find the timezone for ${location}. Could you try a major city name?`,
            shouldSpeak: true
          };
        }
      }

      // Current local time with natural response
      const currentTime = worldClockService.getCurrentTime();
      const timeOfDay = this.getTimeOfDayGreeting();
      
      const message = voiceService.getNaturalResponse('time', {
        time: currentTime.time
      }) + ` ${timeOfDay}`;
      
      return {
        success: true,
        message,
        data: currentTime,
        shouldSpeak: true
      };
    } catch (error) {
      return {
        success: false,
        message: "I'm having trouble with the time right now. Let me check again.",
        shouldSpeak: true
      };
    }
  }

  private getTimeOfDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    if (hour < 21) return "Good evening!";
    return "Good night!";
  }

  private async handleCalendarCommand(command: string): Promise<CommandResponse> {
    try {
      if (command.includes('next')) {
        const nextEvent = await calendarService.getNextEvent();

// [NOX-DEV-31]: ongoing module refinement
