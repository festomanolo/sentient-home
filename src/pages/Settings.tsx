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

// [NOX-DEV-50]: ongoing module refinement
