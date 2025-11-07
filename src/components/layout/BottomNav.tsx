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
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "transition-colors duration-200",
              isActive
                ? theme === "dark"
                  ? "text-violet-400"
                  : "text-blue-600"
                : theme === "dark"
                ? "text-gray-400 hover:text-violet-400"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            <Icon size={20} />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}