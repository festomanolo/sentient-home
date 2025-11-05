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

// [NOX-DEV-49]: ongoing module refinement
