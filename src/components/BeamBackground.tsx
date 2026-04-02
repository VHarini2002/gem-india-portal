import { useEffect, useRef } from 'react';

type Beam = {
  x: number;
  y: number;
  length: number;
  speed: number;
  hue: number;
  baseOpacity: number;
  thickness: number;
  lightness: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  isGold: boolean;
};

const BeamBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const beamsRef = useRef<Beam[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const cursorRef = useRef({
    x: -200,
    y: -200,
    tx: -200,
    ty: -200,
    visible: false,
    trail: [] as { x: number; y: number; life: number }[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resetBeam = (b: Beam) => {
      const { w, h } = sizeRef.current;
      b.x = Math.random() * w * 1.5 - w * 0.25;
      b.y = h + Math.random() * 500;
      b.length = 300 + Math.random() * 600;
      b.speed = 0.5 + Math.random() * 1.5;

      if (b.isGold) {
        b.hue = 45 + Math.random() * 10;
        b.baseOpacity = 0.4 + Math.random() * 0.4;
        b.thickness = 20 + Math.random() * 20;
        b.lightness = 75;
      } else {
        b.hue = 190 + Math.random() * 30;
        b.baseOpacity = 0.2 + Math.random() * 0.2;
        b.thickness = 10 + Math.random() * 15;
        b.lightness = 60;
      }

      b.opacity = 0;
      b.pulse = Math.random() * Math.PI * 2;
      b.pulseSpeed = 0.01 + Math.random() * 0.02;
    };

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beamsRef.current.forEach(resetBeam);
    };

    const createBeams = () => {
      const beams: Beam[] = [];
      for (let i = 0; i < 12; i++) beams.push({ isGold: false } as Beam);
      for (let i = 0; i < 10; i++) beams.push({ isGold: true } as Beam);
      beams.forEach((b) => resetBeam(b));
      beamsRef.current = beams;
    };

    const draw = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      for (const b of beamsRef.current) {
        b.y -= b.speed;
        b.pulse += b.pulseSpeed;
        const p = (Math.sin(b.pulse) + 1) / 2;
        b.opacity = b.baseOpacity * (0.8 + p * 0.2);
        if (b.y < -b.length) resetBeam(b);

        const g = ctx.createLinearGradient(b.x, b.y, b.x + b.length * 0.3, b.y - b.length);
        const c = `hsla(${b.hue}, 90%, ${b.lightness}%, ${b.opacity})`;
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, c);
        g.addColorStop(1, 'transparent');

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = b.thickness;
        ctx.lineCap = 'round';
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + b.length * 0.3, b.y - b.length);
        ctx.stroke();
        ctx.restore();
      }

      // Cursor-following gold tail in the background.
      const c = cursorRef.current;
      c.x += (c.tx - c.x) * 0.22;
      c.y += (c.ty - c.y) * 0.22;
      if (c.visible) c.trail.push({ x: c.x, y: c.y, life: 1 });
      c.trail = c.trail
        .map((p) => ({ ...p, life: p.life - 0.03 }))
        .filter((p) => p.life > 0);

      for (const p of c.trail) {
        const r = 28 * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(245,192,0,${0.24 * p.life})`);
        g.addColorStop(1, 'rgba(245,192,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (c.visible) {
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 90);
        g.addColorStop(0, 'rgba(245,192,0,0.26)');
        g.addColorStop(0.35, 'rgba(245,192,0,0.1)');
        g.addColorStop(1, 'rgba(245,192,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    createBeams();
    resize();
    draw();

    const onPointerMove = (e: PointerEvent) => {
      cursorRef.current.tx = e.clientX;
      cursorRef.current.ty = e.clientY;
      cursorRef.current.visible = true;
    };
    const onPointerLeave = () => {
      cursorRef.current.visible = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="beam-bg-canvas" aria-hidden="true" />
      <div className="beam-bg-radial" aria-hidden="true" />
    </>
  );
};

export default BeamBackground;

