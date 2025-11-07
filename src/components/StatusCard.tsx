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
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-accent mt-1">{subtitle}</p>}
      </div>
    </GlassCard>
  );
};
