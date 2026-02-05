import React, { useEffect, useRef } from 'react';
import './AnimatedGrid.css';

const AnimatedGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Grid settings
    const gridSize = 60;
    const dots = [];
    const mouseRadius = 150;
    let mouseX = -1000;
    let mouseY = -1000;

    // Create dot grid
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        dots.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0
        });
      }
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get theme colors
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const dotColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(26, 22, 20, 0.15)';
      const lineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 22, 20, 0.08)';
      const accentColor = isDark ? 'rgba(232, 139, 111, 0.3)' : 'rgba(212, 116, 92, 0.3)';

      dots.forEach((dot, i) => {
        // Calculate distance from mouse
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply force away from mouse
        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          dot.vx -= Math.cos(angle) * force * 2;
          dot.vy -= Math.sin(angle) * force * 2;
        }

        // Apply spring force back to base position
        const returnForce = 0.05;
        dot.vx += (dot.baseX - dot.x) * returnForce;
        dot.vy += (dot.baseY - dot.y) * returnForce;

        // Apply damping
        dot.vx *= 0.9;
        dot.vy *= 0.9;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw connections
        dots.forEach((otherDot, j) => {
          if (j <= i) return;
          const dx = otherDot.x - dot.x;
          const dy = otherDot.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < gridSize * 1.5) {
            const opacity = 1 - (distance / (gridSize * 1.5));
            ctx.strokeStyle = distance < mouseRadius && 
              Math.sqrt((mouseX - dot.x) ** 2 + (mouseY - dot.y) ** 2) < mouseRadius
              ? accentColor 
              : lineColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(otherDot.x, otherDot.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });

        // Draw dot
        const mouseDistance = Math.sqrt((mouseX - dot.x) ** 2 + (mouseY - dot.y) ** 2);
        const isNearMouse = mouseDistance < mouseRadius;
        
        ctx.fillStyle = isNearMouse ? accentColor : dotColor;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, isNearMouse ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="animated-grid" />;
};

export default AnimatedGrid;
