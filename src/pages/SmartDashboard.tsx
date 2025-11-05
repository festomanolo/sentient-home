import { useState, useEffect } from "react";
import { AIOrb } from "@/components/AIOrb";
import { MicrophoneIndicator } from "@/components/MicrophoneIndicator";
import { CommandFeedback } from "@/components/CommandFeedback";
import { SoundWave } from "@/components/SoundWave";
import { GlassCard } from "@/components/GlassCard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { WorldClock } from "@/components/WorldClock";
import { CalendarWidget } from "@/components/CalendarWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarryBackground } from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Send, 
  MicIcon, 
  Volume2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Smartphone,
  Wifi,
  Battery
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import { useBluetoothControl } from "@/hooks/useBluetoothControl";
import { useSmartReactions } from "@/hooks/useSmartReactions";
import { useNoxAssistant } from "@/hooks/useNoxAssistant";
import { appControlService } from "@/services/appControlService";

const SmartDashboard = () => {
  const [isListeningEnabled, setIsListeningEnabled] = useState(() => {
    const stored = localStorage.getItem("nox-listening-enabled");
    return stored === null ? true : stored === "true";
  });

  const { recentEvents, isListening } = useSoundDetection(isListeningEnabled);
  const { musicState, setVolume, togglePlayback, next, previous } = useBluetoothControl();
  const assistant = useNoxAssistant();

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("nox-settings");
    return stored ? JSON.parse(stored) : {
      adaptiveVolume: true,
      notifications: true,
    };
  });

  const [textCommand, setTextCommand] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [connectedApps, setConnectedApps] = useState<any[]>([]);

  useSmartReactions(recentEvents, settings);

  useEffect(() => {
    localStorage.setItem("nox-listening-enabled", isListeningEnabled.toString());
  }, [isListeningEnabled]);

  useEffect(() => {
    if (isListeningEnabled) {
      assistant.startListening();
    } else {
      assistant.stopListening();
    }
  }, [isListeningEnabled]);

  useEffect(() => {
    // Load connected apps
    const apps = appControlService.getControllableApps();
    setConnectedApps(apps);
  }, []);

  const handleTextCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim() || isProcessingText) return;

    setIsProcessingText(true);
    try {
      await assistant.processTextCommand(textCommand);
      setTextCommand("");
    } catch (error) {

// [NOX-DEV-44]: ongoing module refinement
