import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Wifi, 
  Mic, 
  Volume2, 
  Bluetooth, 
  MapPin, 
  Cloud, 
  Calendar,
  Smartphone,
  Battery,
  Signal,
  RefreshCw
} from 'lucide-react';

interface SystemStatusProps {
  onRefresh?: () => void;
}

export const SystemStatus = ({ onRefresh }: SystemStatusProps) => {
  const [status, setStatus] = useState({
    internet: false,
    microphone: false,
    location: false,
    bluetooth: false,
    weather: false,
    calendar: false,
    apps: 0,
    battery: null as number | null,
    lastUpdate: new Date()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check internet connectivity
      const internetStatus = navigator.onLine;
      
      // Check microphone access
      let microphoneStatus = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStatus = true;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        microphoneStatus = false;
      }

      // Check geolocation
      let locationStatus = false;
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationStatus = true;
      } catch (error) {
        locationStatus = false;
      }

      // Check Bluetooth (if available)
      let bluetoothStatus = false;
      if ('bluetooth' in navigator) {
        try {
          bluetoothStatus = await (navigator as any).bluetooth.getAvailability();
        } catch (error) {
          bluetoothStatus = false;
        }
      }

      // Check weather API (test call)
      let weatherStatus = false;
      try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo');
        weatherStatus = response.status !== 401; // 401 means API key needed, but service is up
      } catch (error) {
        weatherStatus = false;
      }

      // Check calendar access (localStorage based)
      const calendarStatus = localStorage.getItem('nox-calendar-events') !== null;

      // Check connected apps
      const connectedApps = JSON.parse(localStorage.getItem('nox-connected-apps') || '[]').length;

      // Check battery (if available)
      let batteryLevel = null;
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryLevel = Math.round(battery.level * 100);
        } catch (error) {
          batteryLevel = null;
        }
      }

      setStatus({
        internet: internetStatus,
        microphone: microphoneStatus,
        location: locationStatus,
        bluetooth: bluetoothStatus,
        weather: weatherStatus,
        calendar: calendarStatus,
        apps: connectedApps,
        battery: batteryLevel,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkSystemStatus();
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Connected' : 'Disconnected';

// [NOX-DEV-38]: ongoing module refinement
