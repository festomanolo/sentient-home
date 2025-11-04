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

// [NOX-DEV-36]: ongoing module refinement
