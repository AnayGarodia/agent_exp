import React, { useEffect, useRef } from 'react';

const ConnectionParticles = ({ connections = [] }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.color = color;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.life = 100;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.size *= 0.97;
      }
      
      draw(ctx) {
        ctx.globalAlpha = this.life / 100;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Animation loop
    let animationFrameId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        
        if (particles[i].life <= 0 || particles[i].size <= 0.5) {
          particles.splice(i, 1);
        }
      }
      
      // Occasionally add new particles
      if (Math.random() < 0.3 && particles.length < 50) {
        const connection = connections[Math.floor(Math.random() * connections.length)];
        if (connection) {
          const startX = connection.startX || Math.random() * canvas.width;
          const startY = connection.startY || Math.random() * canvas.height;
          
          let color;
          if (connection.type === 'trigger') color = '#00D9FF';
          else if (connection.type === 'action') color = '#A855F7';
          else color = '#10B981';
          
          particles.push(new Particle(startX, startY, color));
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [connections]);
  
  return (
    <canvas
      ref={canvasRef}
      className="connection-particles"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5
      }}
    />
  );
};

export default ConnectionParticles;