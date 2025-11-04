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

// [NOX-DEV-43]: ongoing module refinement
