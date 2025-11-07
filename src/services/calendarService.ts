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
      event.startTime >= start && event.startTime <= end
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getTodaysEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.getEvents(startOfDay, endOfDay);
  }

  async getUpcomingEvents(hours: number = 24): Promise<CalendarEvent[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return this.getEvents(now, future);
  }

  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    this.events.push(newEvent);
    this.saveEvents();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
    this.saveEvents();
    return this.events[eventIndex];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const initialLength = this.events.length;
    this.events = this.events.filter(e => e.id !== id);
    
    if (this.events.length < initialLength) {
      this.saveEvents();
      return true;
    }
    return false;
  }

  async getEventById(id: string): Promise<CalendarEvent | null> {
    return this.events.find(e => e.id === id) || null;
  }

  // Voice command helpers
  async getNextEvent(): Promise<CalendarEvent | null> {
    const upcoming = await this.getUpcomingEvents(168); // Next week
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  async getEventsForDay(dayName: string): Promise<CalendarEvent[]> {
    const targetDate = this.parseDayName(dayName);
    if (!targetDate) return [];

    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    return this.getEvents(startOfDay, endOfDay);
  }

  formatEventForSpeech(event: CalendarEvent): string {
    const timeStr = event.isAllDay 
      ? 'all day' 
      : event.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    let speech = `${event.title} at ${timeStr}`;
    if (event.location) {
      speech += ` at ${event.location}`;
    }
    return speech;
  }

  updateSettings(newSettings: Partial<CalendarSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): CalendarSettings {
    return { ...this.settings };
  }

  // Sync with device calendar using native APIs
  async syncWithDeviceCalendar(): Promise<void> {
    try {
      console.log('Attempting to sync with device calendar...');
      
      // Try to use native calendar access if available
      if ('Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.()) {
        // In a real implementation, this would use a Capacitor calendar plugin
        console.log('Native calendar sync not yet implemented, using local events');
      }
      
      // For web, try to use the experimental Calendar API
      if ('calendar' in navigator) {
        try {
          // This is experimental and not widely supported yet
          const calendars = await (navigator as any).calendar.getCalendars();
          console.log('Found calendars:', calendars);
          
          for (const calendar of calendars) {
            const events = await calendar.getEvents({
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
            
            for (const event of events) {
              await this.addEvent({
                title: event.title || 'Untitled Event',
                description: event.description || '',
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime),
                location: event.location || '',
                isAllDay: event.allDay || false,
                category: 'other'
              });
            }
          }
          
          console.log('Calendar sync completed successfully');
          return;
        } catch (calendarError) {
          console.log('Web Calendar API failed:', calendarError);
        }
      }
      
      // Fallback: Try to parse calendar data from localStorage or create sample events
      const existingEvents = localStorage.getItem('nox-calendar-events');
      if (!existingEvents) {
        console.log('No existing calendar data, creating sample events...');
        this.createRealisticSampleEvents();
      } else {
        console.log('Using existing calendar data');
      }
      
    } catch (error) {
      console.error('Calendar sync failed:', error);
      // Create sample events as fallback
      this.createRealisticSampleEvents();
    }
  }

  private createRealisticSampleEvents(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sampleEvents: Omit<CalendarEvent, 'id'>[] = [
      // Today's events
      {
        title: 'Morning Standup',

// [NOX-DEV-45]: ongoing module refinement
