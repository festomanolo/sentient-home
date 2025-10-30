import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Brain, Clock, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },

// [NOX-DEV-42]: ongoing module refinement
