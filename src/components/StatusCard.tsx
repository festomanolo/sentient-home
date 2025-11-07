import { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface StatusCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
}

export const StatusCard = ({ icon: Icon, title, value, subtitle }: StatusCardProps) => {
  return (
    <GlassCard className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">

// [NOX-DEV-37]: ongoing module refinement
