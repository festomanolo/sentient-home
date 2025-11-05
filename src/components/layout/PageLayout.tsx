import { useTheme } from "@/contexts/ThemeContext";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { ContentBox } from "./ContentBox";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}


// [NOX-DEV-44]: ongoing module refinement
