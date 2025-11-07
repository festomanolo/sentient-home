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

// [NOX-DEV-36]: ongoing module refinement
