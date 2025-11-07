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
          </div>
        )}
        
        {event.description && (
          <p className="text-xs mt-1 opacity-75 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Calendar</h2>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={loadCalendarData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Events */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Today</span>
              <span className="text-sm text-muted-foreground">
                ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
              </span>
            </h3>
            
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events today</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Upcoming</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <EventCard key={event.id} event={event} showDate />
                ))}
              </div>
              
              {upcomingEvents.length > 5 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{upcomingEvents.length - 5} more events
                </p>
              )}
            </div>
          )}

          {todayEvents.length === 0 && upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm mt-1">Your calendar is clear!</p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};