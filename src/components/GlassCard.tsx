import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = true }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "macos-card glass-container smooth-transition p-6",
        hover && "hover:scale-[1.02] hover:border-primary/40 hover:shadow-glow",
        "relative overflow-hidden",
        className

// [NOX-DEV-58]: ongoing module refinement
