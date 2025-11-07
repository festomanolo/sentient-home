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
  };

  const StatusItem = ({ 
    icon: Icon, 
    label, 
    isActive, 
    details 
  }: { 
    icon: React.ElementType; 
    label: string; 
    isActive: boolean; 
    details?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{label}</p>
          {details && <p className="text-xs text-muted-foreground">{details}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(isActive)}`} />
        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
          {getStatusText(isActive)}
        </Badge>
      </div>
    </div>
  );

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Signal className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">System Status</h2>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <StatusItem
          icon={Wifi}
          label="Internet Connection"
          isActive={status.internet}
          details={status.internet ? "Online" : "Check your connection"}
        />
        
        <StatusItem
          icon={Mic}
          label="Microphone Access"
          isActive={status.microphone}
          details={status.microphone ? "Voice commands ready" : "Grant microphone permission"}
        />
        
        <StatusItem
          icon={MapPin}
          label="Location Services"
          isActive={status.location}
          details={status.location ? "GPS available" : "Enable location for weather"}
        />
        
        <StatusItem
          icon={Bluetooth}
          label="Bluetooth"
          isActive={status.bluetooth}
          details={status.bluetooth ? "Device control ready" : "Bluetooth not available"}
        />
        
        <StatusItem
          icon={Cloud}
          label="Weather Service"
          isActive={status.weather}
          details={status.weather ? "Weather data available" : "Check API key"}
        />
        
        <StatusItem
          icon={Calendar}
          label="Calendar Integration"
          isActive={status.calendar}
          details={status.calendar ? "Events synchronized" : "No calendar data"}
        />
        
        <StatusItem
          icon={Smartphone}
          label="App Control"
          isActive={status.apps > 0}
          details={`${status.apps} apps connected`}
        />

        {status.battery !== null && (
          <StatusItem
            icon={Battery}
            label="Device Battery"
            isActive={status.battery > 20}
            details={`${status.battery}% remaining`}
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {status.lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </GlassCard>
  );
};