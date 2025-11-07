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

// [NOX-DEV-40]: ongoing module refinement
