import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentBox({ children, className }: ContentBoxProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}

// [NOX-DEV-62]: ongoing module refinement
