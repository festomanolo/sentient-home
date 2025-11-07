import { useTheme } from "@/contexts/ThemeContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion } from "framer-motion";
import { useSoundDetection } from "@/hooks/useSoundDetection";
import { SoundWave } from "@/components/SoundWave";
import { Volume2 } from "lucide-react";

export function DetectionFeed() {
  const { theme } = useTheme();
  const { recentEvents, isListening } = useSoundDetection(true);

  return (
    <PageLayout title="Sound Detection">
      {/* Live Detection Display */}
      <div className="relative h-40 mb-8 flex items-center justify-center">
        <SoundWave isActive={isListening} intensity={1.5} />
        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 flex items-center justify-center ${
            theme === "dark" ? "text-violet-400" : "text-blue-600"
          }`}
        >
          <Volume2 size={40} />
        </motion.div>
      </div>

      {/* Detection Feed */}
      <div className="space-y-4">
        {recentEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${
              theme === "dark"
                ? "bg-violet-500/10 border border-violet-500/20"
                : "bg-blue-50 border border-blue-200/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {event.type}
              </h3>
              <span className={`text-sm ${
                theme === "dark" ? "text-violet-400" : "text-blue-600"
              }`}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${event.confidence * 100}%` }}
                  className={`h-full ${
                    theme === "dark" ? "bg-violet-500" : "bg-blue-500"
                  }`}
                />
              </div>
              <span className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {Math.round(event.confidence * 100)}%
              </span>
            </div>
            {event.action && (
              <p className={`text-sm mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {event.action}
              </p>
            )}
          </motion.div>
        ))}

        {recentEvents.length === 0 && (
          <div className={`text-center py-8 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            <p>No sounds detected yet</p>
            <p className="text-sm mt-2">
              {isListening ? "Listening for sounds..." : "Detection is paused"}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}