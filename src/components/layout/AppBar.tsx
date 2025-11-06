import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface AppBarProps {
  title: string;
}

export function AppBar({ title }: AppBarProps) {
  const { theme } = useTheme();
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 z-50 px-4",
      "flex items-center justify-center",
      theme === "dark" 
        ? "bg-black/80 backdrop-blur-lg border-b border-violet-500/20" 
        : "bg-white/80 backdrop-blur-lg border-b border-blue-200/20"

// [NOX-DEV-59]: ongoing module refinement
