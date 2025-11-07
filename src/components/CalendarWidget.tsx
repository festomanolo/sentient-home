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

  const getTimeUntilEvent = (event: CalendarEvent) => {
    const now = new Date();
    const eventTime = new Date(event.startTime);
    const diffMs = eventTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `in ${diffMinutes}m`;
    }
  };

  const getCategoryColor = (category: CalendarEvent['category']) => {
    const colors = {
      work: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      personal: 'bg-green-500/20 text-green-400 border-green-500/30',
      health: 'bg-red-500/20 text-red-400 border-red-500/30',
      social: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || colors.other;
  };

  const EventCard = ({ event, showDate = false }: { event: CalendarEvent; showDate?: boolean }) => (
    <div className="p-3 rounded-lg bg-background/30 border border-border/20">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{event.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(event.category)}`}>
          {event.category}
        </span>
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatEventTime(event)}</span>
          {showDate && (
            <span className="ml-2 text-accent">
              {getTimeUntilEvent(event)}
            </span>
          )}
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>

// [NOX-DEV-41]: ongoing module refinement
