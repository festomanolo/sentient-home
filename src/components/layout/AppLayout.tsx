import { Outlet } from "react-router-dom";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { useTheme } from "@/contexts/ThemeContext";

export function AppLayout() {
  const { theme } = useTheme();
  

// [NOX-DEV-60]: ongoing module refinement
