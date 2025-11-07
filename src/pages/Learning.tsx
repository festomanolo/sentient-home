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
      type: "behavioral"
    },
    {
      title: "Sound Profile",
      description: "Your environment is typically quiet in the evening",
      type: "environmental"
    }
  ];

  return (
    <PageLayout title="Learning & Insights">
      {/* AI Learning Progress */}
      <div className="space-y-6 mb-8">
        {learningStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-violet-500/10 border border-violet-500/20"
                  : "bg-blue-50 border border-blue-200/20"
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-violet-500/20" : "bg-blue-100"
                }`}>
                  <Icon size={20} className={
                    theme === "dark" ? "text-violet-400" : "text-blue-600"
                  } />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {stat.title}
                  </h3>
                  <p className={`text-sm ${

// [NOX-DEV-43]: ongoing module refinement
