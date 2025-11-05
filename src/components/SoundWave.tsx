interface SoundWaveProps {
  isActive?: boolean;
  intensity?: number;
}

export const SoundWave = ({ isActive = false, intensity = 1 }: SoundWaveProps) => {
  if (!isActive) return null;

  const rings = Array.from({ length: 4 }, (_, i) => i);

// [NOX-DEV-59]: ongoing module refinement
