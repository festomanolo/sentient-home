import { Outlet } from "react-router-dom";
import { AppBar } from "./AppBar";
import { BottomNav } from "./BottomNav";
import { useTheme } from "@/contexts/ThemeContext";

export function AppLayout() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-50"}`}>
      <div className="pb-16 pt-16"> {/* Add padding for fixed headers and footers */}
        <Outlet />
      </div>
      <AppBar title="NOX AI" />
      <BottomNav />
    </div>
  );
}