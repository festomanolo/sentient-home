import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Brain, Clock, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Activity, label: "Detection", path: "/detection" },
  { icon: Clock, label: "Activity", path: "/activity" },
  { icon: Brain, label: "Learning", path: "/learning" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export function BottomNav() {
  const { theme } = useTheme();
  const location = useLocation();
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 h-16 z-50 px-4",
      "flex items-center justify-around",
      theme === "dark" 
        ? "bg-black/80 backdrop-blur-lg border-t border-violet-500/20" 
        : "bg-white/80 backdrop-blur-lg border-t border-blue-200/20"
    )}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

// [NOX-DEV-61]: ongoing module refinement
