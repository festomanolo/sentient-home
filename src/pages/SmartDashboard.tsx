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
      console.error('Failed to process text command:', error);
    } finally {
      setIsProcessingText(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getSoundLabel = (type: string) => {
    const labels: Record<string, string> = {
      door_knock: "🚪 Door knock",
      phone_ring: "📞 Phone ringing",
      voice: "🗣️ Voice detected",
      music: "🎵 Music playing",
      tv: "📺 TV audio",
      appliance: "🏠 Appliance sound",
      alarm: "⏰ Alarm detected",
      silence: "🔇 Quiet environment",
    };
    return labels[type] || "🔊 Sound detected";
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 animate-fade-in backdrop-blur-lg rounded-2xl p-4 bg-background/10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                NOX AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground mt-1 tracking-wide">
                {assistant.state.isInitialized ? 
                  (isListening ? "🎤 Listening to your world..." : "⏸️ Standing by") :
                  "🔄 Initializing..."
                }
              </p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button asChild variant="outline" size="icon">
                <Link to="/settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/advanced-settings">
                  Advanced
                </Link>
              </Button>
            </div>
          </header>

          {/* Main Orb Section */}
          <div className="relative flex justify-center mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <MicrophoneIndicator 
                isListening={isListening}
                isProcessing={assistant.state.isProcessingCommand}
                isSpeaking={false}
                size="xl"
                showLabel={true}
              />
            </div>
          </div>

          {/* Command Feedback */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <CommandFeedback
              currentCommand={assistant.state.lastCommand || undefined}
              isProcessing={assistant.state.isProcessingCommand}
              showHistory={true}
            />
          </div>

          {/* Voice Command Interface */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Voice Commands</h2>
                <Badge variant={isListeningEnabled ? "default" : "secondary"}>
                  {isListeningEnabled ? "Active" : "Paused"}
                </Badge>
              </div>
              
              <form onSubmit={handleTextCommand} className="flex gap-2 mb-4">
                <Input
                  value={textCommand}
                  onChange={(e) => setTextCommand(e.target.value)}
                  placeholder="Ask about weather, time, calendar, or control apps..."
                  className="flex-1"
                  disabled={isProcessingText}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!textCommand.trim() || isProcessingText}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "What's the weather?",
                  "What time is it in Tokyo?",
                  "What's on my calendar?",
                  "Play music",
                  "Open Lark Player"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setTextCommand(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              
              {assistant.state.lastCommand && (
                <div className="p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Last command:</span> {assistant.state.lastCommand}
                    {assistant.state.isProcessingCommand && (
                      <span className="ml-2 text-accent animate-pulse">Processing...</span>
                    )}
                  </p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <WeatherWidget />
              <WorldClock />
            </div>

            {/* Middle Column */}
            <div className="space-y-6">
              <CalendarWidget />
              
              {/* Connected Apps */}
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">

// [NOX-DEV-44]: ongoing module refinement
