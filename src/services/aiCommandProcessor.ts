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

// [NOX-DEV-30]: ongoing module refinement
