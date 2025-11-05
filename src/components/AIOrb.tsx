import { useEffect, useState } from "react";

interface AIOrbProps {
  isListening?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const AIOrb = ({ isListening = false, size = "lg" }: AIOrbProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    const particleArray = Array.from({ length: 8 }, (_, i) => ({

// [NOX-DEV-26]: ongoing module refinement
