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
        description: 'Daily team sync meeting',
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        endTime: new Date(today.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM today
        location: 'Conference Room A',
        isAllDay: false,
        category: 'work',
        reminder: 15
      },
      {
        title: 'Lunch Meeting',
        description: 'Client discussion over lunch',
        startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM today
        endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM today
        location: 'Downtown Restaurant',
        isAllDay: false,
        category: 'work',
        reminder: 30
      },
      
      // Tomorrow's events
      {
        title: 'Doctor Appointment',
        description: 'Annual checkup',
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10 AM tomorrow
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 11 AM tomorrow
        location: 'Medical Center',
        isAllDay: false,
        category: 'health',
        reminder: 60
      },
      
      // This week's events
      {
        title: 'Weekend Plans',
        description: 'Family gathering',
        startTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Saturday 2 PM
        endTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Saturday 6 PM
        location: 'Family Home',
        isAllDay: false,
        category: 'social',
        reminder: 120
      }
    ];

    // Only add events that are in the future
    const futureEvents = sampleEvents.filter(event => event.startTime > now);
    
    futureEvents.forEach(event => {
      this.addEvent(event);
    });
    
    console.log(`Created ${futureEvents.length} realistic sample events`);
  }

  private populateSampleEvents(): void {
    const now = new Date();
    const sampleEvents: Omit<CalendarEvent, 'id'>[] = [
      {
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        location: 'Conference Room A',
        isAllDay: false,
        category: 'work',
        reminder: 15
      },
      {
        title: 'Lunch with Sarah',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        location: 'Downtown Cafe',
        isAllDay: false,
        category: 'social',
        reminder: 30
      },
      {
        title: 'Doctor Appointment',
        startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(now.getTime() + 49 * 60 * 60 * 1000),
        location: 'Medical Center',
        isAllDay: false,
        category: 'health',
        reminder: 60
      }
    ];

    sampleEvents.forEach(event => {
      this.addEvent(event);
    });
  }

  private parseDayName(dayName: string): Date | null {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const normalizedDay = dayName.toLowerCase();
    
    if (normalizedDay === 'today') {
      return today;
    }
    
    if (normalizedDay === 'tomorrow') {
      return new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const dayIndex = dayNames.indexOf(normalizedDay);
    if (dayIndex === -1) return null;
    
    const currentDay = today.getDay();
    let daysUntilTarget = dayIndex - currentDay;
    
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    return new Date(today.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000);
  }

  private loadEvents(): void {
    const stored = localStorage.getItem('nox-calendar-events');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.events = parsed.map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime)
        }));
      } catch (error) {
        console.error('Failed to load calendar events:', error);
        this.populateSampleEvents();
      }
    } else {
      this.populateSampleEvents();
    }
  }

  private saveEvents(): void {
    localStorage.setItem('nox-calendar-events', JSON.stringify(this.events));
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('nox-calendar-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      } catch (error) {
        console.error('Failed to load calendar settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('nox-calendar-settings', JSON.stringify(this.settings));
  }
}

export const calendarService = new CalendarService();