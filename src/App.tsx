import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
// Page imports
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SmartDashboard from "./pages/SmartDashboard";
import Settings from "./pages/Settings";
import AdvancedSettings from "./pages/AdvancedSettings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { DetectionFeed } from "./pages/DetectionFeed";
import { ActivityLog } from "./pages/ActivityLog";
import { Learning } from "./pages/Learning";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/smart" element={<SmartDashboard />} />
              <Route path="/detection" element={<DetectionFeed />} />
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/advanced-settings" element={<AdvancedSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
