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

// [NOX-DEV-42]: ongoing module refinement
