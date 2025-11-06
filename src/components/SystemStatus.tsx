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

// [NOX-DEV-38]: ongoing module refinement
