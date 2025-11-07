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

// [NOX-DEV-79]: ongoing module refinement
