import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Waves, Brain, Bluetooth, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/nox-hero.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>


// [NOX-DEV-80]: ongoing module refinement
