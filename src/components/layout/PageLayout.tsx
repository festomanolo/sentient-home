import { useTheme } from "@/contexts/ThemeContext";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { ContentBox } from "./ContentBox";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;

// [NOX-DEV-33]: ongoing module refinement
