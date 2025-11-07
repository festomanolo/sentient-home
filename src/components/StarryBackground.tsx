import { useEffect, useRef } from 'react';

const drawStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number
) => {
  ctx.beginPath();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
};

export const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Array<{ x: number; y: number; size: number; speed: number; alpha: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Initialize stars
    const numStars = Math.floor((canvas.width * canvas.height) / 10000); // Adjust density
    starsRef.current = Array.from({ length: numStars }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.2 + 0.1,
      alpha: Math.random() * 0.5 + 0.3
    }));

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 30; // Limit FPS for performance
    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Throttle frame rate
      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      lastTime = currentTime - (deltaTime % frameInterval);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.alpha = 0.3 + Math.sin(currentTime * star.speed * 0.001) * 0.2;
        drawStar(ctx, star.x, star.y, star.size, star.alpha);
      });
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-gradient-to-b from-background to-black/50"
      style={{ opacity: 0.6 }}
    />
  );
};