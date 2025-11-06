import { useTheme } from "@/contexts/ThemeContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Clock, MapPin, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Learning() {
  const { theme } = useTheme();

  const learningStats = [
    {
      title: "Sound Recognition",
      progress: 78,
      description: "Accuracy in identifying common sounds",
      icon: Brain
    },
    {
      title: "Pattern Learning",
      progress: 65,
      description: "Understanding your daily routines",
      icon: TrendingUp
    },
    {
      title: "Temporal Awareness",
      progress: 82,
      description: "Time-based sound pattern recognition",
      icon: Clock
    },
    {
      title: "Spatial Learning",
      progress: 45,
      description: "Room acoustics and sound source localization",
      icon: MapPin
    }
  ];

  const insights = [
    {
      title: "Peak Activity Hours",
      description: "Most sounds are detected between 9 AM and 11 AM",
      type: "temporal"
    },
    {
      title: "Common Pattern",
      description: "Door knocks often followed by voice detection",

// [NOX-DEV-43]: ongoing module refinement
