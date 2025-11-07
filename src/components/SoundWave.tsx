interface SoundWaveProps {
  isActive?: boolean;
  intensity?: number;
}

export const SoundWave = ({ isActive = false, intensity = 1 }: SoundWaveProps) => {
  if (!isActive) return null;

  const rings = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {rings.map((i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-accent/30 animate-ripple"
          style={{
            width: `${(i + 1) * 25 * intensity}%`,
            height: `${(i + 1) * 25 * intensity}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
};
