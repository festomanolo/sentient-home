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
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-accent animate-particle-drift"
          style={{
            animationDelay: `${particle.delay}s`,
            left: `${50 + Math.cos((particle.id * Math.PI) / 4) * 40}%`,
            top: `${50 + Math.sin((particle.id * Math.PI) / 4) * 40}%`,
          }}
        />
      ))}

      {/* Main orb */}
      <div
        className={`${sizeClasses[size]} rounded-full backdrop-blur-xl ${glowIntensity} relative overflow-hidden`}
        style={{
          background: "var(--gradient-orb)",
          boxShadow: isListening 
            ? "0 0 80px hsl(var(--nox-violet) / 0.6), 0 0 120px hsl(var(--nox-teal) / 0.4)" 
            : "var(--shadow-glow)",
        }}
      >
        {/* Inner core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-br from-primary to-accent animate-breathe" />
        </div>

        {/* Scanning line effect when listening */}
        {isListening && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-1 bg-accent/50 blur-sm animate-float" />
          </div>
        )}
      </div>
    </div>
  );
};
