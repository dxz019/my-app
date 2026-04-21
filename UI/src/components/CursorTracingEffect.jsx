import React, { useEffect, useRef } from 'react';

const CursorTracingEffect = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const dotsRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let mouseX = 0;
        let mouseY = 0;

        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            // Add multiple scattered dots around cursor
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * 60;
                const offsetY = (Math.random() - 0.5) * 60;
                dotsRef.current.push({
                    x: mouseX + offsetX,
                    y: mouseY + offsetY,
                    size: Math.random() * 4 + 2,
                    life: 1.0
                });
            }

            // Limit dots
            if (dotsRef.current.length > 80) {
                dotsRef.current.shift();
            }
        };

        container.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.fillStyle = '#E0F7FA';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw dots without connecting lines
            for (let i = 0; i < dotsRef.current.length; i++) {
                const dot = dotsRef.current[i];
                
                // Draw dot
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 102, 255, ${dot.life * 0.8})`;
                ctx.fill();
                
                // Decrease life
                dot.life -= 0.006;
            }
            
            // Remove dead dots
            dotsRef.current = dotsRef.current.filter(d => d.life > 0);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
        </div>
    );
};

export default CursorTracingEffect;