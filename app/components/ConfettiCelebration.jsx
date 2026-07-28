"use client";

import { useEffect, useRef } from "react";

export default function ConfettiCelebration({ duration = 4000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let isActive = true;

    // Handle Resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Confetti Particles
    const colors = ["#f59e0b", "#fb923c", "#fcd34d", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"];
    const particles = [];

    class ConfettiParticle {
      constructor(x, y, angle, spread) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Convert angle to radians and calculate velocities
        const radAngle = (angle * Math.PI) / 180;
        const velocity = Math.random() * 15 + 15; // Shoot speed
        this.vx = Math.cos(radAngle + (Math.random() - 0.5) * spread) * velocity;
        this.vy = Math.sin(radAngle + (Math.random() - 0.5) * spread) * velocity;
        
        this.gravity = 0.4;
        this.drag = 0.96;
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.shape = Math.random() > 0.5 ? "circle" : "rect";
      }

      update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fadeSpeed;
      }

      draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        ctx.restore();
      }
    }

    // Launch bursts from bottom corners
    const launchBursts = () => {
      // Left corner shooting up-right
      for (let i = 0; i < 70; i++) {
        particles.push(new ConfettiParticle(0, canvas.height, -45, 0.6));
      }
      // Right corner shooting up-left
      for (let i = 0; i < 70; i++) {
        particles.push(new ConfettiParticle(canvas.width, canvas.height, -135, 0.6));
      }
    };

    // Initial launch
    launchBursts();

    // Secondary burst shortly after
    const timer1 = setTimeout(launchBursts, 700);
    const timer2 = setTimeout(launchBursts, 1500);

    // Animation Loop
    const animate = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup timer
    const durationTimer = setTimeout(() => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    }, duration);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(durationTimer);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [duration]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-50" />;
}
