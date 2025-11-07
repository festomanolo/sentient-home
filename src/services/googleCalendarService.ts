import { CalendarEvent } from './calendarService';

export interface GoogleCalendarConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

class GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isAuthenticated = false;
  
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  constructor() {
    this.loadTokens();
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('Google Calendar authentication not yet implemented');
      console.log('This requires:');
      console.log('1. Google Cloud Console project setup');
      console.log('2. OAuth 2.0 credentials');
      console.log('3. @codetrix-studio/capacitor-google-auth package');
      console.log('For now, using local calendar data');
      
      // TODO: Implement actual OAuth flow
      // const auth = await GoogleAuth.signIn();
      // this.accessToken = auth.authentication.accessToken;
      // this.refreshToken = auth.authentication.refreshToken;
      // await this.storeTokens();
      
      return false;
    } catch (error) {
      console.error('Google Calendar authentication failed:', error);
      return false;
    }
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  async syncEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    if (!this.isAuthenticated || !this.accessToken) {
      console.log('Not authenticated with Google Calendar');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&` +
        `singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      return this.convertGoogleEvents(data.items || []);
    } catch (error) {
      console.error('Failed to sync Google Calendar events:', error);
      return [];
    }
  }

  async getUpcomingEvents(count: number = 10): Promise<CalendarEvent[]> {
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const events = await this.syncEvents(now, future);
    return events.slice(0, count);
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    if (!this.isAuthenticated || !this.accessToken) {
      console.log('Not authenticated with Google Calendar');
      return null;
    }

    try {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        reminders: event.reminder ? {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: event.reminder }
          ]
        } : undefined
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(googleEvent)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.status}`);
      }

      const data = await response.json();
      return this.convertGoogleEvent(data);
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return null;
    }
  }

  private convertGoogleEvents(googleEvents: any[]): CalendarEvent[] {
    return googleEvents.map(event => this.convertGoogleEvent(event)).filter(e => e !== null) as CalendarEvent[];
  }

  private convertGoogleEvent(googleEvent: any): CalendarEvent | null {
    try {
      const startTime = googleEvent.start.dateTime 
        ? new Date(googleEvent.start.dateTime)
        : new Date(googleEvent.start.date);
      
      const endTime = googleEvent.end.dateTime
        ? new Date(googleEvent.end.dateTime)
        : new Date(googleEvent.end.date);

      return {
        id: googleEvent.id,
        title: googleEvent.summary || 'Untitled Event',
        description: googleEvent.description || '',
        startTime,
        endTime,
        location: googleEvent.location || '',
        isAllDay: !googleEvent.start.dateTime,
        category: 'other',
        reminder: googleEvent.reminders?.overrides?.[0]?.minutes
      };
    } catch (error) {
      console.error('Failed to convert Google Calendar event:', error);
      return null;
    }
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem('nox-google-calendar-tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.isAuthenticated = !!this.accessToken;
      }
    } catch (error) {
      console.error('Failed to load Google Calendar tokens:', error);
    }
  }

  private async storeTokens(): Promise<void> {
    try {
      const tokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      };
      localStorage.setItem('nox-google-calendar-tokens', JSON.stringify(tokens));
      this.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to store Google Calendar tokens:', error);
    }
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    localStorage.removeItem('nox-google-calendar-tokens');
  }
}

export const googleCalendarService = new GoogleCalendarService();
