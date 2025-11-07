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
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" 
                    ? "bg-violet-500/20" 
                    : "bg-blue-100"
                }`}>
                  <Icon 
                    size={20} 
                    className={
                      theme === "dark" ? "text-violet-400" : "text-blue-600"
                    } 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {event.title}
                    </h3>
                    <span className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {event.description}
                  </p>
                  {event.result && (
                    <p className={`mt-2 text-sm ${
                      theme === "dark" ? "text-violet-400" : "text-blue-600"
                    }`}>
                      Result: {event.result}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {recentEvents.length === 0 && (
          <div className={`text-center py-12 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No Activity Yet</p>
            <p className="text-sm">
              NOX AI will log smart reactions and automated actions here
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}