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


// [NOX-DEV-45]: ongoing module refinement
