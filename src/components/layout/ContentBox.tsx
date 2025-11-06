import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContentBoxProps {
  children: React.ReactNode;

// [NOX-DEV-77]: ongoing module refinement
