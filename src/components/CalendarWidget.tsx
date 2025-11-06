import { useState, useEffect } from 'react';
import { calendarService, CalendarEvent } from '@/services/calendarService';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, RefreshCw, Plus } from 'lucide-react';

export const CalendarWidget = () => {
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadCalendarData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const [today, upcoming] = await Promise.all([
        calendarService.getTodaysEvents(),
        calendarService.getUpcomingEvents(72) // Next 3 days
      ]);
      
      setTodayEvents(today);
      setUpcomingEvents(upcoming.filter(event => {
        const eventDate = new Date(event.startTime);
        const today = new Date();
        return eventDate.toDateString() !== today.toDateString();
      }));
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    return `${start.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  };


// [NOX-DEV-41]: ongoing module refinement
