import moment from 'moment-timezone';

export interface TimeZoneInfo {
  id: string;
  name: string;
  timezone: string;
  time: string;
  date: string;
  offset: string;
  isDaytime: boolean;
}

export interface WorldClockSettings {
  selectedTimezones: string[];
  format24Hour: boolean;
  showSeconds: boolean;
}

class WorldClockService {
  private readonly DEFAULT_TIMEZONES = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  private settings: WorldClockSettings = {
    selectedTimezones: this.DEFAULT_TIMEZONES.slice(0, 4),
    format24Hour: false,
    showSeconds: true
  };

  constructor() {
    this.loadSettings();
  }

  getCurrentTime(timezone?: string): TimeZoneInfo {
    const tz = timezone || moment.tz.guess();
    const now = moment().tz(tz);
    
    return {
      id: tz,
      name: this.getTimezoneName(tz),
      timezone: tz,
      time: now.format(this.settings.format24Hour ? 'HH:mm:ss' : 'h:mm:ss A'),
      date: now.format('dddd, MMMM Do, YYYY'),
      offset: now.format('Z'),
      isDaytime: this.isDaytime(now)
    };
  }

  getWorldClocks(): TimeZoneInfo[] {
    return this.settings.selectedTimezones.map(tz => this.getCurrentTime(tz));
  }

  addTimezone(timezone: string): void {
    if (!this.settings.selectedTimezones.includes(timezone)) {
      this.settings.selectedTimezones.push(timezone);
      this.saveSettings();
    }
  }

  removeTimezone(timezone: string): void {
    this.settings.selectedTimezones = this.settings.selectedTimezones.filter(tz => tz !== timezone);
    this.saveSettings();
  }

  updateSettings(newSettings: Partial<WorldClockSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): WorldClockSettings {
    return { ...this.settings };
  }

  getAllTimezones(): { value: string; label: string }[] {
    return moment.tz.names().map(tz => ({
      value: tz,
      label: this.getTimezoneName(tz)
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  getTimeInTimezone(timezone: string, format?: string): string {
    const now = moment().tz(timezone);
    return now.format(format || (this.settings.format24Hour ? 'HH:mm:ss' : 'h:mm:ss A'));
  }

  getTimezoneOffset(timezone: string): string {
    return moment().tz(timezone).format('Z');
  }

  convertTime(time: string, fromTz: string, toTz: string): string {
    const converted = moment.tz(time, fromTz).tz(toTz);
    return converted.format(this.settings.format24Hour ? 'HH:mm:ss' : 'h:mm:ss A');
  }

  private getTimezoneName(timezone: string): string {
    const parts = timezone.split('/');
    if (parts.length === 2) {
      const city = parts[1].replace(/_/g, ' ');
      const region = parts[0];
      return `${city}, ${region}`;
    }
    return timezone.replace(/_/g, ' ');
  }

  private isDaytime(momentTime: moment.Moment): boolean {
    const hour = momentTime.hour();
    return hour >= 6 && hour < 18;
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('nox-worldclock-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      } catch (error) {
        console.error('Failed to load world clock settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('nox-worldclock-settings', JSON.stringify(this.settings));
  }

  // Utility methods for voice commands
  getTimeForLocation(location: string): string | null {
    const timezone = this.findTimezoneByLocation(location);
    if (timezone) {
      return this.getTimeInTimezone(timezone);
    }
    return null;
  }

  private findTimezoneByLocation(location: string): string | null {
    const searchTerm = location.toLowerCase();
    const timezone = moment.tz.names().find(tz => 
      tz.toLowerCase().includes(searchTerm) ||
      this.getTimezoneName(tz).toLowerCase().includes(searchTerm)
    );
    return timezone || null;
  }
}

export const worldClockService = new WorldClockService();