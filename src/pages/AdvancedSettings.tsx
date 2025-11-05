import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { SystemStatus } from "@/components/SystemStatus";
import { VoiceTraining } from "@/components/VoiceTraining";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Settings, 
  Mic, 
  Volume2, 
  Brain, 
  Shield, 
  Palette,
  Smartphone,
  Bluetooth,
  Cloud,
  Bell,
  Moon,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { voiceService } from "@/services/voiceService";
import { weatherService } from "@/services/weatherService";
import { soundDetectionService } from "@/services/soundDetectionService";

const AdvancedSettings = () => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("nox-advanced-settings");
    return stored ? JSON.parse(stored) : {
      // Voice Settings
      voiceResponseEnabled: true,
      continuousListening: true,
      wakeWord: "hey nox",
      voiceRate: 1.0,
      voicePitch: 1.0,
      voiceVolume: 0.8,
      language: "en-US",
      
      // Intelligence Settings
      learningMode: true,
      adaptiveVolume: true,
      smartReactions: true,
      contextAwareness: true,
      
      // Sound Detection
      soundSensitivity: 0.7,
      noiseThreshold: 30,
      enableVoiceDetection: true,
      enableKnockDetection: true,
      enablePhoneDetection: true,
      
      // App Control
      appControl: true,
      bluetoothControl: true,
      systemVolumeControl: true,
      
      // Privacy & Security
      privacyMode: false,
      dataCollection: false,
      cloudSync: false,
      
      // Weather & Location
      weatherApiKey: "",
      locationAccuracy: "high",
      weatherUpdateInterval: 10,
      
      // Notifications
      notifications: true,
      nightMode: false,
      quietHours: { start: "22:00", end: "07:00" }
    };
  });

  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem("nox-advanced-settings", JSON.stringify(settings));
    
    // Apply settings to services
    voiceService.updateSettings({
      language: settings.language,
      voiceRate: settings.voiceRate,
      voicePitch: settings.voicePitch,
      volume: settings.voiceVolume,
      wakeWord: settings.wakeWord,
      continuousListening: settings.continuousListening,
      voiceResponseEnabled: settings.voiceResponseEnabled
    });


// [NOX-DEV-48]: ongoing module refinement
