import { useTheme } from "@/contexts/ThemeContext";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { ContentBox } from "./ContentBox";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ title, children, className }: PageLayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      <AppBar title={title} />
      <ContentBox className={className}>
        {children}
      </ContentBox>
      <BottomNav />
    </div>
  );
}