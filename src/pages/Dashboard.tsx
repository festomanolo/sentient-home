import { useState, useEffect } from "react";
import { AIOrb } from "@/components/AIOrb";
import { SoundWave } from "@/components/SoundWave";
import { GlassCard } from "@/components/GlassCard";
import { StatusCard } from "@/components/StatusCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarryBackground } from "@/components/StarryBackground";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, CloudSun, Music, Volume2, Mic, Settings, Play, Pause, Calendar, MapPin, Send, MicIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import { useBluetoothControl } from "@/hooks/useBluetoothControl";
import { useSmartReactions } from "@/hooks/useSmartReactions";
import { useNoxAssistant } from "@/hooks/useNoxAssistant";
import { useIsMobile } from "@/hooks/use-mobile";
import { serviceTester } from "@/utils/serviceTest";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const [isListeningEnabled, setIsListeningEnabled] = useState(() => {
    const stored = localStorage.getItem("nox-listening-enabled");
    return stored === null ? true : stored === "true";
  });

  const { recentEvents, isListening } = useSoundDetection(isListeningEnabled);
  const { musicState, setVolume, togglePlayback, next, previous } = useBluetoothControl();
  const assistant = useNoxAssistant();

  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("nox-settings");
    return stored ? JSON.parse(stored) : {
      adaptiveVolume: true,
      notifications: true,
    };
  });

  const [textCommand, setTextCommand] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);

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

  const runServiceTests = async () => {
    console.log('🧪 Running comprehensive service tests...');
    try {
      const results = await serviceTester.runAllTests();
      serviceTester.printSummary();
      
      // Show results in UI
      const successRate = serviceTester.getSuccessRate();
      const message = `Service tests completed! Success rate: ${successRate.toFixed(1)}%. Check console for details.`;
      await assistant.speak(message);
    } catch (error) {
      console.error('Service test error:', error);
      await assistant.speak('Service tests encountered an error. Check the console for details.');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const getSoundLabel = (type: string) => {
    const labels: Record<string, string> = {
      door_knock: "Door knock detected",
      phone_ring: "Phone ringing",
      voice: "Voice detected",
      silence: "Environment quiet",
    };
    return labels[type] || "Sound detected";
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <StarryBackground />
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 animate-fade-in backdrop-blur-lg rounded-2xl p-4 bg-background/10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                NOX AI
              </h1>
              <p className="text-sm text-muted-foreground mt-1 tracking-wide">
                {isListening ? "Listening to your world..." : "Standing by"}
              </p>
            </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="icon">
              <Link to="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Orb Section */}
        <div className="relative flex justify-center mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <AIOrb isListening={isListening} size="xl" />
            <SoundWave isActive={isListening} intensity={1.2} />
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <StatusCard
            icon={Clock}
            title="Current Time"
            value={assistant.state.currentTime.time}
            subtitle={assistant.state.currentTime.date}
          />
          <StatusCard
            icon={CloudSun}
            title="Weather"
            value={assistant.state.weather ? `${assistant.state.weather.temperature}°F` : "Loading..."}
            subtitle={assistant.state.weather ? `${assistant.state.weather.description} in ${assistant.state.weather.location}` : "Fetching weather data"}
          />
          <StatusCard
            icon={Calendar}
            title="Next Event"
            value={assistant.state.upcomingEvents.length > 0 ? assistant.state.upcomingEvents[0].title : "No events"}
            subtitle={assistant.state.upcomingEvents.length > 0 ? 
              new Date(assistant.state.upcomingEvents[0].startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 
              "Calendar is clear"
            }
          />
        </div>

        {/* Now Playing & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          {/* Now Playing */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Now Playing</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-foreground font-medium">{musicState.track}</p>
                <p className="text-sm text-muted-foreground">{musicState.artist}</p>
              </div>
              
              {/* Playback Control */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={previous}
                  className="w-10 h-10 p-0"
                  disabled={!musicState.device?.connected}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
                  </svg>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                  className="w-10 h-10 p-0"
                  disabled={!musicState.device?.connected}
                >
                  {musicState.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={next}
                  className="w-10 h-10 p-0"
                  disabled={!musicState.device?.connected}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"/>
                  </svg>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {musicState.device?.connected ? 
                    (musicState.isPlaying ? "Playing" : "Paused") : 
                    "No device connected"
                  }
                </span>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-accent" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicState.volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <span className="text-sm text-muted-foreground min-w-[3ch]">{musicState.volume}%</span>
              </div>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Mic className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{getSoundLabel(event.type)}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</p>
                      {event.action && (
                        <p className="text-xs text-accent mt-1">{event.action}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(event.confidence * 100)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-1">
                    {isListening ? "Listening for sounds..." : "Start listening to see activity"}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Voice Command Input */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Voice Commands</h2>
            </div>
            
            <form onSubmit={handleTextCommand} className="flex gap-2">
              <Input
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                placeholder="Type a command or ask a question..."
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
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Try: "What's the weather?", "What time is it in Tokyo?", "What's on my calendar?", "Play music", "Open Lark Player"</p>
            </div>
            
            {assistant.state.lastCommand && (
              <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Last command:</span> {assistant.state.lastCommand}
                  {assistant.state.isProcessingCommand && (
                    <span className="ml-2 text-accent">Processing...</span>
                  )}
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Button
            size="lg"
            onClick={() => setIsListeningEnabled(!isListeningEnabled)}
            className="px-8"
            variant={isListeningEnabled ? "default" : "outline"}
          >
            <MicIcon className="w-5 h-5 mr-2" />
            {isListeningEnabled ? "Voice Listening On" : "Start Voice Listening"}
          </Button>
          
          <Button
            size="lg"
            onClick={() => assistant.speak("Hello Manolo! I'm ready to assist you.")}
            variant="outline"
            className="px-8"
          >
            Test Voice
          </Button>
          
          <Button
            size="lg"
            onClick={runServiceTests}
            variant="outline"
            className="px-8"
          >
            Run Service Tests
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;
