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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "var(--gradient-header)",
          }}
        />
        
        {/* Hero content */}
        <div className="container mx-auto px-4 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NOX AI
              </h1>

// [NOX-DEV-35]: ongoing module refinement
