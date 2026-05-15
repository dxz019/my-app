import React, { useEffect, useRef } from 'react';
import './AntigravityCursor.css';

const AntigravityCursor = () => {
    const canvasRef = useRef(null);
    const cursorRef = useRef({ x: -1000, y: -1000 });
    const followerRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef([]); // Background roaming particles
    const trailRef = useRef([]); // Cursor trail particles
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const getColors = () => {
            const s = getComputedStyle(document.documentElement);
            return {
                dot: s.getPropertyValue('--cursor-dot').trim() || '#0066FF',
                glow: s.getPropertyValue('--cursor-glow').trim() || 'rgba(0, 102, 255, 0.25)',
            };
        };

        let colors = getColors();
        const observer = new MutationObserver(() => { colors = getColors(); });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Initialize background roaming particles
        const initParticles = () => {
            const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 10000), 120);
            const p = [];
            for (let i = 0; i < count; i++) {
                p.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 6 + 2, // Larger dots as requested
                    baseX: Math.random() * canvas.width,
                    baseY: Math.random() * canvas.height,
                });
            }
            particlesRef.current = p;
        };

        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
            
            // Spawn trail particles
            for (let i = 0; i < 2; i++) {
                trailRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    size: Math.random() * 3 + 1,
                    life: 1.0,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2
                });
            }
            if (trailRef.current.length > 50) trailRef.current.shift();
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cursor = cursorRef.current;
            const follower = followerRef.current;

            // Follower smooth follow
            follower.x += (cursor.x - follower.x) * 0.1;
            follower.y += (cursor.y - follower.y) * 0.1;

            // 1. Draw Background Roaming Particles with Attraction
            particlesRef.current.forEach(p => {
                // Roaming movement
                p.x += p.vx;
                p.y += p.vy;

                // Boundary check
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse attraction logic
                const dx = cursor.x - p.x;
                const dy = cursor.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceRange = 250;

                if (distance < forceRange) {
                    const force = (forceRange - distance) / forceRange;
                    p.x += (dx / distance) * force * 2;
                    p.y += (dy / distance) * force * 2;
                }

                // Draw roaming particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.dot;
                ctx.globalAlpha = 0.4; // Slightly more visible
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            // 2. Draw Cursor Glow
            if (cursor.x > -500) {
                const g1 = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 40);
                g1.addColorStop(0, colors.glow);
                g1.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, 40, 0, Math.PI * 2);
                ctx.fillStyle = g1;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = colors.dot;
                ctx.fill();
            }

            // 3. Draw Follower
            const d = Math.hypot(cursor.x - follower.x, cursor.y - follower.y);
            if (d > 2) {
                ctx.beginPath();
                ctx.arc(follower.x, follower.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = colors.dot;
                ctx.globalAlpha = 0.5;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // 4. Draw Trail
            trailRef.current.forEach((p, i) => {
                p.life -= 0.02;
                p.x += p.vx;
                p.y += p.vy;
                if (p.life > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fillStyle = colors.dot;
                    ctx.globalAlpha = p.life * 0.4;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            });
            trailRef.current = trailRef.current.filter(p => p.life > 0);

            rafRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            observer.disconnect();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

     return (
        <canvas
            ref={canvasRef}
            className="antigravity-canvas"
style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 width: '100%',
                 height: '100%',
                 pointerEvents: 'none',
                 zIndex: 0
             }}
        />
    );
};

export default AntigravityCursor;
