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
        if (nextEvent) {
          const message = `Your next event is ${calendarService.formatEventForSpeech(nextEvent)}`;
          return {
            success: true,
            message,
            data: nextEvent,
            shouldSpeak: true
          };
        } else {
          return {
            success: true,
            message: "You don't have any upcoming events.",
            shouldSpeak: true
          };
        }
      }

      if (command.includes('today')) {
        const todayEvents = await calendarService.getTodaysEvents();
        if (todayEvents.length === 0) {
          return {
            success: true,
            message: "You don't have any events scheduled for today.",
            shouldSpeak: true
          };
        }

        const eventList = todayEvents.map(event => calendarService.formatEventForSpeech(event)).join(', ');
        return {
          success: true,
          message: `Today you have: ${eventList}`,
          data: todayEvents,
          shouldSpeak: true
        };
      }

      if (command.includes('tomorrow')) {
        const tomorrowEvents = await calendarService.getEventsForDay('tomorrow');
        if (tomorrowEvents.length === 0) {
          return {
            success: true,
            message: "You don't have any events scheduled for tomorrow.",
            shouldSpeak: true
          };
        }

        const eventList = tomorrowEvents.map(event => calendarService.formatEventForSpeech(event)).join(', ');
        return {
          success: true,
          message: `Tomorrow you have: ${eventList}`,
          data: tomorrowEvents,
          shouldSpeak: true
        };
      }

      // Default calendar overview
      const upcomingEvents = await calendarService.getUpcomingEvents(48);
      if (upcomingEvents.length === 0) {
        return {
          success: true,
          message: "You don't have any upcoming events.",
          shouldSpeak: true
        };
      }

      const nextEvent = upcomingEvents[0];
      return {
        success: true,
        message: `Your next event is ${calendarService.formatEventForSpeech(nextEvent)}`,
        data: upcomingEvents,
        shouldSpeak: true
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't access your calendar right now.",
        shouldSpeak: true
      };
    }
  }

  private async handleMusicCommand(command: string): Promise<CommandResponse> {
    try {
      if (command.includes('play')) {
        bluetoothService.play();
        return {
          success: true,
          message: "Playing music",
          shouldSpeak: true
        };
      }

      if (command.includes('pause') || command.includes('stop')) {
        bluetoothService.pause();
        return {
          success: true,
          message: "Music paused",
          shouldSpeak: true
        };
      }

      if (command.includes('volume up')) {
        bluetoothService.adjustVolume(10);
        return {
          success: true,
          message: "Volume increased",
          shouldSpeak: true
        };
      }

      if (command.includes('volume down')) {
        bluetoothService.adjustVolume(-10);
        return {
          success: true,
          message: "Volume decreased",
          shouldSpeak: true
        };
      }

      const volumeMatch = command.match(/volume (?:to )?(\d+)/i);
      if (volumeMatch) {
        const volume = parseInt(volumeMatch[1]);
        bluetoothService.setVolume(volume);
        return {
          success: true,
          message: `Volume set to ${volume} percent`,
          shouldSpeak: true
        };
      }

      return {
        success: false,
        message: "I didn't understand that music command.",
        shouldSpeak: true
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't control the music right now.",
        shouldSpeak: true
      };
    }
  }

  private async handleAppCommand(command: string): Promise<CommandResponse> {
    try {
      const appCommand = appControlService.parseAppCommand(command);
      if (!appCommand) {
        return {
          success: false,
          message: "I didn't understand that app command.",
          shouldSpeak: true
        };
      }

      const success = await appControlService.controlApp(
        appCommand.app,
        appCommand.action,
        appCommand.parameters
      );

      if (success) {
        let message = `${appCommand.action} ${appCommand.app}`;
        if (appCommand.action === 'open') {
          message = `Opening ${appCommand.app}`;
        } else if (appCommand.action === 'play') {
          message = `Playing in ${appCommand.app}`;
        } else if (appCommand.action === 'pause') {
          message = `Paused ${appCommand.app}`;
        }

        return {
          success: true,
          message,
          shouldSpeak: true
        };
      } else {
        return {
          success: false,
          message: `Sorry, I couldn't control ${appCommand.app}. Make sure it's installed and supported.`,
          shouldSpeak: true
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't control that app right now.",
        shouldSpeak: true
      };
    }
  }

  private async handleVolumeCommand(command: string): Promise<CommandResponse> {
    try {
      if (command.includes('up') || command.includes('louder')) {
        await appControlService.controlApp('settings', 'volume_up');
        return {
          success: true,
          message: "Volume increased",
          shouldSpeak: true
        };
      }

      if (command.includes('down') || command.includes('quieter')) {
        await appControlService.controlApp('settings', 'volume_down');
        return {
          success: true,
          message: "Volume decreased",
          shouldSpeak: true
        };
      }

      return {
        success: false,
        message: "I didn't understand that volume command.",
        shouldSpeak: true
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't adjust the volume right now.",
        shouldSpeak: true
      };
    }
  }

  private matchesPattern(command: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(command));
  }

  private isDirectCommand(command: string): boolean {
    // Commands that don't require wake word
    const directCommands = [
      'hello', 'hi', 'hey', 'thank you', 'thanks', 'goodbye', 'bye'
    ];
    
    return directCommands.some(cmd => command.toLowerCase().includes(cmd));
  }

  // Public method to process text commands directly
  async processTextCommand(command: string): Promise<CommandResponse> {
    return this.executeCommand(command);
  }
}

export const commandProcessor = new CommandProcessor();