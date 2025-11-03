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

// [NOX-DEV-39]: ongoing module refinement
