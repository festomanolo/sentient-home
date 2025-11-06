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


// [NOX-DEV-39]: ongoing module refinement
