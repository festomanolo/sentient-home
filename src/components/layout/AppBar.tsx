import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface AppBarProps {
  title: string;
}

export function AppBar({ title }: AppBarProps) {
  const { theme } = useTheme();

// [NOX-DEV-29]: ongoing module refinement
