export type CommandAction = 
  | 'play_music' | 'pause_music' | 'next_track' | 'previous_track'
  | 'volume_up' | 'volume_down' | 'set_volume'
  | 'get_weather' | 'get_forecast'
  | 'get_calendar' | 'get_next_event'
  | 'open_app' | 'control_app'
  | 'get_time' | 'get_time_in_location'
  | 'greeting' | 'thanks'
  | 'unknown';

export interface CommandEntities {
  app?: string;
  location?: string;
  time?: Date;
  volume?: number;
  query?: string;
  day?: string;
}

export interface CommandIntent {
  action: CommandAction;
  confidence: number;
  entities: CommandEntities;
  requiresConfirmation: boolean;
  originalTranscript: string;
}

interface CommandPattern {
  regex: RegExp;
  action: CommandAction;
  extractEntities?: (match: RegExpMatchArray) => Partial<CommandEntities>;
  confidence?: number;
}

class AICommandProcessor {
  private commandHistory: Array<{ command: string; intent: CommandIntent; timestamp: Date; success: boolean }> = [];
  private contextStack: CommandIntent[] = [];
  private readonly MAX_HISTORY = 100;
  private readonly MAX_CONTEXT = 5;

  // Command patterns organized by category
  private commandPatterns: CommandPattern[] = [
    // Greetings
    {
      regex: /^(hello|hi|hey|good\s+(morning|afternoon|evening))$/i,
      action: 'greeting',
      confidence: 0.95
    },
    
    // Thanks
    {
      regex: /^(thank\s+you|thanks|appreciate\s+it)$/i,
      action: 'thanks',
      confidence: 0.95
    },

    // Music control - Play
    {
      regex: /^(play|start|resume)\s+(music|song|track|audio|some\s+music)$/i,
      action: 'play_music',
      confidence: 0.9
    },
    {
      regex: /^(play|start)\s+(.+)\s+in\s+(lark|lark\s+player)$/i,
      action: 'play_music',
      extractEntities: (match) => ({ app: 'lark_player', query: match[2] }),
      confidence: 0.85
    },
    {
      regex: /^music\s+(on|play)$/i,
      action: 'play_music',
      confidence: 0.85
    },

    // Music control - Pause
    {
      regex: /^(pause|stop|halt)\s+(music|song|track|audio|it)$/i,
      action: 'pause_music',
      confidence: 0.9
    },
    {
      regex: /^(pause|stop)$/i,
      action: 'pause_music',
      confidence: 0.75
    },

    // Music control - Next/Previous
    {
      regex: /^(next|skip)\s+(song|track)?$/i,
      action: 'next_track',
      confidence: 0.9
    },
    {
      regex: /^(previous|back|last)\s+(song|track)?$/i,
      action: 'previous_track',
      confidence: 0.9
    },

    // Volume control
    {
      regex: /^volume\s+(up|louder|increase)$/i,
      action: 'volume_up',
      confidence: 0.9
    },
    {
      regex: /^(louder|turn\s+it\s+up)$/i,
      action: 'volume_up',
      confidence: 0.85
    },
    {
      regex: /^volume\s+(down|quieter|decrease|lower)$/i,
      action: 'volume_down',
      confidence: 0.9
    },
    {
      regex: /^(quieter|turn\s+it\s+down)$/i,
      action: 'volume_down',
      confidence: 0.85
    },
    {
      regex: /^set\s+volume\s+to\s+(\d+)$/i,
      action: 'set_volume',
      extractEntities: (match) => ({ volume: parseInt(match[1]) }),
      confidence: 0.95
    },

    // Weather
    {
      regex: /^(what'?s|how'?s|tell\s+me)\s+the\s+weather$/i,
      action: 'get_weather',
      confidence: 0.9
    },
    {
      regex: /^weather\s+(today|now|outside)?$/i,
      action: 'get_weather',
      confidence: 0.85
    },
    {
      regex: /^(what'?s\s+the\s+)?temperature(\s+outside)?$/i,
      action: 'get_weather',
      confidence: 0.85
    },
    {
      regex: /^(what'?s\s+the\s+)?weather\s+in\s+(.+)$/i,
      action: 'get_weather',
      extractEntities: (match) => ({ location: match[2] }),
      confidence: 0.9
    },
    {
      regex: /^weather\s+forecast$/i,
      action: 'get_forecast',
      confidence: 0.9
    },

    // Time
    {
      regex: /^what\s+time\s+is\s+it$/i,
      action: 'get_time',
      confidence: 0.95
    },
    {
      regex: /^(what'?s\s+the\s+)?time$/i,
      action: 'get_time',
      confidence: 0.85
    },
    {
      regex: /^(what\s+time\s+is\s+it|time)\s+in\s+(.+)$/i,
      action: 'get_time_in_location',
      extractEntities: (match) => ({ location: match[2] }),
      confidence: 0.9
    },

    // Calendar
    {
      regex: /^(what'?s\s+on\s+my\s+calendar|my\s+calendar|calendar)$/i,
      action: 'get_calendar',
      confidence: 0.9
    },
    {
      regex: /^(what'?s\s+my\s+schedule|my\s+schedule|schedule)\s+(today|tomorrow)?$/i,
      action: 'get_calendar',
      extractEntities: (match) => ({ day: match[2] || 'today' }),
      confidence: 0.9
    },
    {
      regex: /^(what'?s\s+my\s+)?(next\s+)?(meeting|appointment|event)$/i,
      action: 'get_next_event',
      confidence: 0.9
    },
    {
      regex: /^calendar\s+for\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
      action: 'get_calendar',
      extractEntities: (match) => ({ day: match[1] }),
      confidence: 0.9
    },

    // App control
    {
      regex: /^(open|launch|start)\s+(.+)$/i,
      action: 'open_app',
      extractEntities: (match) => ({ app: match[2] }),
      confidence: 0.85
    },
    {
      regex: /^(play|pause|control)\s+(.+)$/i,
      action: 'control_app',
      extractEntities: (match) => ({ app: match[2] }),
      confidence: 0.75
    },
  ];

  async processCommand(transcript: string): Promise<CommandIntent> {
    const cleanTranscript = transcript.toLowerCase().trim();
    
    // Try to match against patterns
    let bestMatch: CommandIntent | null = null;
    let highestConfidence = 0;

    for (const pattern of this.commandPatterns) {
      const match = cleanTranscript.match(pattern.regex);
      if (match) {
        const confidence = pattern.confidence || 0.7;
        
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          
          const entities: CommandEntities = pattern.extractEntities 
            ? pattern.extractEntities(match) 
            : {};

          bestMatch = {
            action: pattern.action,
            confidence,
            entities,
            requiresConfirmation: confidence < 0.7,
            originalTranscript: transcript
          };
        }
      }
    }

    // If no match found, try fuzzy matching for app names
    if (!bestMatch) {
      const appMatch = this.fuzzyMatchApp(cleanTranscript);
      if (appMatch) {
        bestMatch = {
          action: 'open_app',
          confidence: appMatch.confidence,
          entities: { app: appMatch.app },
          requiresConfirmation: appMatch.confidence < 0.7,
          originalTranscript: transcript
        };
      }
    }

    // If still no match, check context
    if (!bestMatch && this.contextStack.length > 0) {
      const contextualMatch = this.matchWithContext(cleanTranscript);
      if (contextualMatch) {
        bestMatch = contextualMatch;
      }
    }

    // Default to unknown
    if (!bestMatch) {
      bestMatch = {
        action: 'unknown',
        confidence: 0,
        entities: {},
        requiresConfirmation: false,
        originalTranscript: transcript
      };
    }

    // Add to context stack
    this.addToContext(bestMatch);

    return bestMatch;
  }

  extractEntities(transcript: string): CommandEntities {
    const entities: CommandEntities = {};
    const cleanTranscript = transcript.toLowerCase();

    // Extract volume numbers
    const volumeMatch = cleanTranscript.match(/(\d+)\s*%?/);
    if (volumeMatch) {
      entities.volume = parseInt(volumeMatch[1]);
    }

    // Extract locations (simple heuristic)
    const locationMatch = cleanTranscript.match(/in\s+([a-z\s]+)/i);
    if (locationMatch) {
      entities.location = locationMatch[1].trim();
    }

    // Extract day references
    const dayMatch = cleanTranscript.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (dayMatch) {
      entities.day = dayMatch[1].toLowerCase();
    }

    return entities;
  }

  getCommandSuggestions(partialCommand: string): string[] {
    const suggestions: string[] = [];
    const partial = partialCommand.toLowerCase();

    const commonCommands = [
      "play music",
      "pause music",
      "next song",
      "volume up",
      "volume down",
      "what's the weather",
      "what time is it",
      "what's on my calendar",
      "open lark player",
      "weather forecast"
    ];

    for (const command of commonCommands) {
      if (command.startsWith(partial) || command.includes(partial)) {
        suggestions.push(command);
      }
    }

    return suggestions.slice(0, 5);
  }

  learnFromFeedback(command: string, wasSuccessful: boolean): void {
    const lastIntent = this.commandHistory[this.commandHistory.length - 1];
    if (lastIntent && lastIntent.command === command) {
      lastIntent.success = wasSuccessful;
    }
  }

  private fuzzyMatchApp(transcript: string): { app: string; confidence: number } | null {
    const knownApps = [
      { name: 'lark player', aliases: ['lark', 'player', 'music player'], key: 'lark_player' },
      { name: 'spotify', aliases: ['spot'], key: 'spotify' },
      { name: 'youtube', aliases: ['tube', 'you tube'], key: 'youtube' },
      { name: 'camera', aliases: ['cam', 'photo'], key: 'camera' },
      { name: 'settings', aliases: ['setting'], key: 'settings' },
    ];

    for (const app of knownApps) {
      // Check exact match
      if (transcript.includes(app.name)) {
        return { app: app.key, confidence: 0.9 };
      }

      // Check aliases
      for (const alias of app.aliases) {
        if (transcript.includes(alias)) {
          return { app: app.key, confidence: 0.75 };
        }
      }

      // Check fuzzy match (Levenshtein distance)
      const distance = this.levenshteinDistance(transcript, app.name);
      if (distance <= 2) {
        return { app: app.key, confidence: 0.7 };
      }
    }

    return null;
  }

  private matchWithContext(transcript: string): CommandIntent | null {
    const lastContext = this.contextStack[this.contextStack.length - 1];
    
    // Handle contextual commands like "louder" after "play music"
    if (lastContext.action === 'play_music' || lastContext.action === 'pause_music') {
      if (transcript.match(/^(louder|up)$/i)) {
        return {
          action: 'volume_up',
          confidence: 0.8,
          entities: {},
          requiresConfirmation: false,
          originalTranscript: transcript
        };
      }
      if (transcript.match(/^(quieter|down)$/i)) {
        return {
          action: 'volume_down',
          confidence: 0.8,
          entities: {},
          requiresConfirmation: false,
          originalTranscript: transcript
        };
      }
    }

    return null;
  }

  private addToContext(intent: CommandIntent): void {
    this.contextStack.push(intent);
    if (this.contextStack.length > this.MAX_CONTEXT) {
      this.contextStack.shift();
    }

    this.commandHistory.push({
      command: intent.originalTranscript,
      intent,
      timestamp: new Date(),
      success: true
    });

    if (this.commandHistory.length > this.MAX_HISTORY) {
      this.commandHistory.shift();
    }
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  getCommandHistory(): Array<{ command: string; intent: CommandIntent; timestamp: Date; success: boolean }> {
    return [...this.commandHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
    this.contextStack = [];
  }
}

export const aiCommandProcessor = new AICommandProcessor();
