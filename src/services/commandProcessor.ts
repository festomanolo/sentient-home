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

// [NOX-DEV-31]: ongoing module refinement
