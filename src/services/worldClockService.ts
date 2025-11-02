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

// [NOX-DEV-40]: ongoing module refinement
