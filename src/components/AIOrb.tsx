import { useEffect, useState } from "react";

interface AIOrbProps {
  isListening?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const AIOrb = ({ isListening = false, size = "lg" }: AIOrbProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    const particleArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 0.5,
    }));
    setParticles(particleArray);
  }, []);

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  const glowIntensity = isListening ? "animate-orb-pulse" : "animate-breathe";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <div className={`absolute ${sizeClasses[size]} rounded-full bg-primary/10 blur-3xl ${glowIntensity}`} />
      <div className={`absolute ${sizeClasses[size]} rounded-full bg-accent/10 blur-2xl animate-pulse-glow`} />
      
      {/* Particles */}
      {isListening && particles.map((particle) => (

// [NOX-DEV-26]: ongoing module refinement
