import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion } from "framer-motion";
import { Clock, Volume2, Music, Bell } from "lucide-react";
import { useSmartReactions } from "@/hooks/useSmartReactions";

export function ActivityLog() {
  const { theme } = useTheme();
  const [recentEvents] = useState([
    {
      id: 1,
      title: "Volume Adjusted",
      description: "Automatically lowered volume due to door knock",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "volume_adjustment",
      result: "Volume reduced by 30%"
    },
    {
      id: 2,
      title: "Music Paused",
      description: "Phone ring detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "music_control",
      result: "Playback paused for 2 minutes"
    },
    {
      id: 3,
      title: "Alert Triggered",
      description: "Unusual sound pattern detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: "notification",
      result: "Notification sent to connected devices"
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "volume_adjustment":
        return Volume2;
      case "music_control":
        return Music;
      case "notification":
        return Bell;
      default:
        return Clock;
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

  return (
    <PageLayout title="Activity Log">
      <div className="space-y-4">
        {recentEvents.map((event, index) => {
          const Icon = getActivityIcon(event.type);
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-violet-500/10 border border-violet-500/20"
                  : "bg-blue-50 border border-blue-200/20"
              }`}

// [NOX-DEV-42]: ongoing module refinement
