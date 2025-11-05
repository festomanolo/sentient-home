import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentBox({ children, className }: ContentBoxProps) {
  const { theme } = useTheme();

// [NOX-DEV-43]: ongoing module refinement
