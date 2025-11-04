import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

// [NOX-DEV-32]: ongoing module refinement
