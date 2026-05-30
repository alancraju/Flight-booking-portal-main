import React, { useEffect, useRef } from 'react';

const COLORS = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const Confetti = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -200,
            r: Math.random() * 8 + 4,
            d: Math.random() * 20 + 10,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngle: Math.random() * Math.PI,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
        }));

        let animId;
        let tick = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            tick++;
            pieces.forEach(p => {
                p.tiltAngle += p.tiltAngleIncrement;
                p.y += (Math.cos(p.d) + 2);
                p.tilt = Math.sin(p.tiltAngle) * 12;
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
                ctx.stroke();
                if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
            });
            if (tick < 300) animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

export default Confetti;
