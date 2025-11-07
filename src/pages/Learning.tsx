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
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {stat.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={stat.progress} className={
                  theme === "dark" 
                    ? "bg-violet-500/20 [&>div]:bg-violet-500" 
                    : "bg-blue-100 [&>div]:bg-blue-600"
                } />
                <p className={`text-right text-sm ${
                  theme === "dark" ? "text-violet-400" : "text-blue-600"
                }`}>
                  {stat.progress}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Insights */}
      <div className={`p-4 rounded-xl ${
        theme === "dark"
          ? "bg-violet-500/10 border border-violet-500/20"
          : "bg-blue-50 border border-blue-200/20"
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className={
            theme === "dark" ? "text-violet-400" : "text-blue-600"
          } size={20} />
          <h2 className={`font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Recent Insights
          </h2>
        </div>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`p-3 rounded-lg ${
                theme === "dark"
                  ? "bg-violet-500/5 border border-violet-500/10"
                  : "bg-blue-50/50 border border-blue-100/20"
              }`}
            >
              <h4 className={`text-sm font-medium mb-1 ${
                theme === "dark" ? "text-violet-400" : "text-blue-600"
              }`}>
                {insight.title}
              </h4>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}