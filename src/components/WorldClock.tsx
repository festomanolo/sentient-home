import { useState, useEffect } from 'react';
import { worldClockService, TimeZoneInfo } from '@/services/worldClockService';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Plus, X, Sun, Moon } from 'lucide-react';

export const WorldClock = () => {
  const [clocks, setClocks] = useState<TimeZoneInfo[]>([]);
  const [availableTimezones, setAvailableTimezones] = useState<{ value: string; label: string }[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');

  useEffect(() => {
    // Load initial clocks
    updateClocks();
    setAvailableTimezones(worldClockService.getAllTimezones());

    // Update every second
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateClocks = () => {
    const worldClocks = worldClockService.getWorldClocks();
    setClocks(worldClocks);
  };

  const addTimezone = () => {
    if (selectedTimezone) {
      worldClockService.addTimezone(selectedTimezone);
      setSelectedTimezone('');
      updateClocks();
    }
  };

  const removeTimezone = (timezone: string) => {
    worldClockService.removeTimezone(timezone);
    updateClocks();
  };

  const formatTime = (timeInfo: TimeZoneInfo) => {
    return timeInfo.time;
  };

  const getTimeIcon = (isDaytime: boolean) => {
    return isDaytime ? (
      <Sun className="w-4 h-4 text-yellow-500" />
    ) : (
      <Moon className="w-4 h-4 text-blue-400" />
    );
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">World Clock</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add timezone..." />
            </SelectTrigger>
            <SelectContent>
              {availableTimezones
                .filter(tz => !clocks.some(clock => clock.timezone === tz.value))
                .map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

// [NOX-DEV-39]: ongoing module refinement
