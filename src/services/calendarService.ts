export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  attendees?: string[];
  reminder?: number; // minutes before event
  category: 'work' | 'personal' | 'health' | 'social' | 'other';
}

export interface CalendarSettings {
  enableReminders: boolean;
  defaultReminderTime: number;
  syncEnabled: boolean;
  calendarSources: string[];
}

class CalendarService {
  private events: CalendarEvent[] = [];
  private settings: CalendarSettings = {
    enableReminders: true,
    defaultReminderTime: 15,
    syncEnabled: true,
    calendarSources: ['default']
  };

  constructor() {
    this.loadSettings();
    this.loadEvents();
  }

  async getEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    return this.events.filter(event => 

// [NOX-DEV-45]: ongoing module refinement
