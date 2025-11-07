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

    soundDetectionService.updateSettings({
      sensitivity: settings.soundSensitivity,
      noiseThreshold: settings.noiseThreshold,
      enableVoiceDetection: settings.enableVoiceDetection,
      enableKnockDetection: settings.enableKnockDetection,
      enablePhoneDetection: settings.enablePhoneDetection
    });
  }, [settings]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("nox-advanced-settings", JSON.stringify(settings));
    toast.success("Settings Saved", {
      description: "All your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.removeItem("nox-advanced-settings");
      window.location.reload();
    }
  };

  const testVoiceSettings = async () => {
    await voiceService.speak("Hello Manolo! These are your current voice settings. How do I sound?");
  };

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    description, 
    children 
  }: { 
    icon: React.ElementType; 
    label: string; 
    description: string; 
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-background/30 border border-border/20">
      <div className="p-2 rounded-lg bg-primary/10 mt-1">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <Label className="text-base font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link to="/smart">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Advanced Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure NOX AI for optimal performance
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - System Status */}
          <div className="space-y-6">
            <SystemStatus onRefresh={() => toast.info("System status refreshed")} />
          </div>

          {/* Middle Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="voice" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="intelligence">AI</TabsTrigger>
                <TabsTrigger value="apps">Apps</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {/* Voice Settings */}
              <TabsContent value="voice" className="space-y-6">
                <VoiceTraining />
                
                <GlassCard>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Configuration
                  </h3>
                  
                  <div className="space-y-6">
                    <SettingItem
                      icon={Mic}
                      label="Wake Word"
                      description="The phrase to activate NOX AI"
                    >
                      <Input
                        value={settings.wakeWord}
                        onChange={(e) => updateSetting("wakeWord", e.target.value)}
                        placeholder="hey nox"
                      />
                    </SettingItem>

                    <SettingItem
                      icon={Volume2}
                      label="Speech Rate"
                      description="How fast NOX AI speaks"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Slow</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={settings.voiceRate}
                          onChange={(e) => updateSetting("voiceRate", parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm">Fast</span>
                        <Button size="sm" variant="outline" onClick={testVoiceSettings}>
                          Test
                        </Button>
                      </div>
                    </SettingItem>

                    <SettingItem
                      icon={Volume2}
                      label="Voice Pitch"
                      description="The pitch of NOX AI's voice"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Low</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={settings.voicePitch}
                          onChange={(e) => updateSetting("voicePitch", parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm">High</span>
                      </div>
                    </SettingItem>

                    <SettingItem
                      icon={Bell}
                      label="Language"
                      description="Voice recognition and response language"
                    >
                      <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="it-IT">Italian</SelectItem>
                          <SelectItem value="pt-BR">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingItem>
                  </div>
                </GlassCard>
              </TabsContent>

              {/* Intelligence Settings */}
              <TabsContent value="intelligence" className="space-y-6">

// [NOX-DEV-48]: ongoing module refinement
