import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Moon, Bell, Volume2, Brain, Shield, Palette, Smartphone, Bluetooth } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { WeatherSetup } from "@/components/WeatherSetup";

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("nox-settings");
    return stored ? JSON.parse(stored) : {
      learningMode: true,
      nightMode: false,
      environmentAwareness: true,
      adaptiveVolume: true,
      notifications: true,
      privacyMode: false,
      voiceResponseEnabled: true,
      continuousListening: true,
      appControl: true,
      bluetoothControl: true,
      voiceRate: 1.0,
      voicePitch: 1.0,
    };
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev: typeof settings) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      
      // Handle dependent settings
      if (key === "privacyMode" && !prev[key]) {
        // Turning on privacy mode disables learning
        newSettings.learningMode = false;
        toast.info("Privacy Mode Enabled", {
          description: "Learning mode has been disabled for your privacy.",
        });
      }
      
      if (key === "environmentAwareness" && !prev[key]) {
        // Turning off environment awareness should notify user
        toast.warning("Environment Awareness Disabled", {
          description: "Sound detection will be paused.",
        });
      }

      return newSettings;
    });
  };

  useEffect(() => {
    localStorage.setItem("nox-settings", JSON.stringify(settings));
  }, [settings]);

  const handleSave = () => {
    localStorage.setItem("nox-settings", JSON.stringify(settings));
    toast.success("Settings Saved", {
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Customize your NOX AI experience
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Settings Groups */}
        <div className="space-y-6 animate-slide-up">
          {/* Appearance */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </GlassCard>

          {/* Voice & Speech Settings */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-primary" />
              Voice & Speech
            </h2>
            <div className="space-y-6">
              <SettingItem
                icon={Volume2}
                label="Voice Responses"
                description="Enable NOX AI to speak responses and confirmations"
                checked={settings.voiceResponseEnabled}
                onCheckedChange={() => toggleSetting("voiceResponseEnabled")}
              />
              <SettingItem
                icon={Bell}
                label="Continuous Listening"
                description="Keep listening for 'Hey NOX' wake word continuously"
                checked={settings.continuousListening}
                onCheckedChange={() => toggleSetting("continuousListening")}
              />
              
              {/* Voice Rate Slider */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Speech Rate</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Slow</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.voiceRate || 1.0}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceRate: parseFloat(e.target.value) }))}
                    className="flex-1 h-2 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <span className="text-sm text-muted-foreground">Fast</span>
                </div>
                <p className="text-sm text-muted-foreground">Adjust how fast NOX AI speaks</p>
              </div>

              {/* Voice Pitch Slider */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Voice Pitch</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.voicePitch || 1.0}
                    onChange={(e) => setSettings(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))}
                    className="flex-1 h-2 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <span className="text-sm text-muted-foreground">High</span>
                </div>
                <p className="text-sm text-muted-foreground">Adjust the pitch of NOX AI's voice</p>
              </div>
            </div>
          </GlassCard>

          {/* Intelligence Settings */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary" />

// [NOX-DEV-50]: ongoing module refinement
