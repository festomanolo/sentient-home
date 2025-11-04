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
      

// [NOX-DEV-50]: ongoing module refinement
