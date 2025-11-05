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

// [NOX-DEV-40]: ongoing module refinement
