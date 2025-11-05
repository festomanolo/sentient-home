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


// [NOX-DEV-36]: ongoing module refinement
