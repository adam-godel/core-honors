// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Particle = {
	x: number; y: number;
	vx: number; vy: number;
	life: number; maxLife: number;
	size: number; hue: number;
};

// Base rip dimensions — shape breathes organically around these
const BASE_LEN = 24;
const BASE_WID = 17;

export function RipBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef<number>(0);
	const pathname = usePathname();
	const isHome = pathname === "/";

	useEffect(() => {
		// Skip entirely on touch/mobile devices — requires a fine pointer (mouse)
		if (!window.matchMedia("(pointer: fine)").matches) return;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// ── State ────────────────────────────────────────────────────────────────
		let w = 0, h = 0, dpr = 1;
		let mx = -9999, my = -9999;   // mouse (viewport coords)
		let prevX = -9999, prevY = -9999;
		let vx = 0, vy = 0;           // smoothed velocity
		let ang = 0;                   // rip angle (smoothed)
		let t = 0;                     // time in seconds
		let mouseOnScreen = false;
		const parts: Particle[] = [];

		// ── Resize / setup ───────────────────────────────────────────────────────
		function setup() {
			dpr = window.devicePixelRatio || 1;
			w = window.innerWidth;
			h = window.innerHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		// ── Organic shape variation ───────────────────────────────────────────────
		// Returns current rip dimensions — size is constant but shape breathes
		function ripDims() {
			const lenScale =
				1 +
				0.25 * Math.sin(t * 0.5) +
				0.12 * Math.sin(t * 1.3 + 1.1) +
				0.07 * Math.sin(t * 2.8 + 2.4);
			const widScale =
				1 +
				0.22 * Math.cos(t * 0.4 + 0.5) +
				0.10 * Math.cos(t * 1.1 + 1.8);
			return { len: BASE_LEN * lenScale, wid: BASE_WID * widScale };
		}

		// ── Rip path ─────────────────────────────────────────────────────────────
		// Teardrop / cursor shape: pointed at the front (direction of movement),
		// naturally rounded at the back. Organic jag is enveloped so it tapers
		// smoothly to zero at both ends, keeping the tip clean.
		function buildRip(
			c: CanvasRenderingContext2D,
			cx: number, cy: number,
			len: number, wid: number, a: number,
		) {
			const N = 72;
			c.save();
			c.translate(cx, cy);
			c.rotate(a);
			c.beginPath();

			// Top edge: back (left, s=0) → near tip (s=1 = right)
			// env = sin(s·π) gives a symmetric lens; clamping s to 0.93 at the
			// right end leaves env ≈ 0.23 before we manually close to the tip,
			// which creates a noticeably sharper point than a full lens.
			for (let i = 0; i <= N; i++) {
				const s = i / N;
				const x  = (s - 0.5) * len;
				const env = Math.sin(Math.min(s, 0.93) * Math.PI);
				const jag = (
					Math.sin(s * 7  + t * 1.7)       * wid * 0.18 +
					Math.sin(s * 17 + t * 2.5 + 1.1) * wid * 0.09 +
					Math.sin(s * 3  + t * 0.9 + 2.7) * wid * 0.06
				) * env;
				const y = -(wid / 2) * env - Math.abs(jag);
				i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
			}
			// Sharp front tip
			c.lineTo(len / 2, 0);

			// Bottom edge: tip → back
			for (let i = N; i >= 0; i--) {
				const s = i / N;
				const x  = (s - 0.5) * len;
				const env = Math.sin(Math.min(s, 0.93) * Math.PI);
				const jag = (
					Math.sin(s * 7  + t * 1.7 + Math.PI)       * wid * 0.18 +
					Math.sin(s * 17 + t * 2.5 + 1.1 + Math.PI) * wid * 0.09 +
					Math.sin(s * 3  + t * 0.9 + 2.7 + Math.PI) * wid * 0.06
				) * env;
				c.lineTo(x, (wid / 2) * env + Math.abs(jag));
			}

			c.closePath(); // closes to first point (back, y≈0 — naturally rounded)
			c.restore();
		}

		// ── Particles ────────────────────────────────────────────────────────────
		function spawnPart(cx: number, cy: number, len: number, wid: number) {
			if (parts.length >= 55) return;
			// Pick a random point along the rip edge
			const side = Math.random() < 0.5 ? 1 : -1;
			const s = Math.random(); // position along the rip (0-1)
			const edgeX = (s - 0.5) * len;
			const jag = (0.3 + Math.random() * 0.4) * wid;
			const edgeY = side * (wid / 2 + jag);
			// Transform from rip-local to viewport coords
			const cosA = Math.cos(ang), sinA = Math.sin(ang);
			const px = cx + cosA * edgeX - sinA * edgeY;
			const py = cy + sinA * edgeX + cosA * edgeY;
			// Velocity: drift away from rip center
			const outAngle = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 1.2;
			const spd = 0.4 + Math.random() * 1.8;
			parts.push({
				x: px, y: py,
				vx: Math.cos(outAngle) * spd,
				vy: Math.sin(outAngle) * spd - 0.2,
				life: 0,
				maxLife: 60 + Math.random() * 90,
				size: 0.7 + Math.random() * 2.2,
				hue: (t * 60 + Math.random() * 200) % 360,
			});
		}

		function drawParts(c: CanvasRenderingContext2D) {
			for (let i = parts.length - 1; i >= 0; i--) {
				const p = parts[i];
				p.x += p.vx;
				p.y += p.vy;
				p.vy += 0.015; // gentle gravity
				p.life++;
				if (p.life >= p.maxLife) { parts.splice(i, 1); continue; }
				const alpha = (1 - p.life / p.maxLife) * 0.9;
				const r = p.size * 3;
				const grd = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
				grd.addColorStop(0, `oklch(78% 0.22 ${p.hue}deg / ${alpha})`);
				grd.addColorStop(1, `oklch(55% 0.22 ${p.hue}deg / 0)`);
				c.beginPath();
				c.arc(p.x, p.y, r, 0, Math.PI * 2);
				c.fillStyle = grd;
				c.fill();
			}
		}

		// ── Main loop ────────────────────────────────────────────────────────────
		let lastTs = 0;

		function frame(ts: number) {
			const dt = Math.min(ts - lastTs, 50);
			lastTs = ts;
			t += dt * 0.001;

			// Smooth velocity
			vx = vx * 0.80 + (mx - prevX) * 0.20;
			vy = vy * 0.80 + (my - prevY) * 0.20;
			prevX = mx; prevY = my;
			const speed = Math.sqrt(vx * vx + vy * vy);

			// Angle: smoothly tracks movement direction; drifts slowly when still.
			if (speed > 0.5) {
				const rawAng = Math.atan2(vy, vx);
				const diff = ((rawAng - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
				ang += diff * 0.18;
			} else {
				ang += 0.004; // slow idle rotation
			}

			const { len, wid } = ripDims();

			// Center effect on cursor — looks like the cursor itself is glowing rainbow
			const cx = mx;
			const cy = my;

			// ── Render ───────────────────────────────────────────────────────────
			ctx.clearRect(0, 0, w, h);

			// 1. Dark base (full canvas)
			ctx.fillStyle = "#18181b";
			ctx.fillRect(0, 0, w, h);

			// 2. Rainbow fill clipped to rip shape — gradient centered on cursor
			//    so brightness is identical regardless of screen position
			if (mouseOnScreen) {
				const shift = (t * 22) % 360;
				const g = ctx.createLinearGradient(cx - len, cy, cx + len, cy);
				for (let i = 0; i <= 6; i++) {
					g.addColorStop(i / 6, `oklch(72% 0.22 ${(shift + i * 60) % 360}deg)`);
				}
				ctx.save();
				buildRip(ctx, cx, cy, len, wid, ang);
				ctx.clip();
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, w, h);
				ctx.restore();
			}

			// 3. Glowing rip-edge outline
			if (mouseOnScreen) {
				const glowHue = (t * 55) % 360;
				ctx.save();
				ctx.shadowBlur = 22;
				ctx.shadowColor = `hsl(${glowHue},100%,62%)`;
				ctx.strokeStyle = `hsla(${glowHue},100%,72%,0.55)`;
				ctx.lineWidth = 1.5;
				buildRip(ctx, cx, cy, len, wid, ang);
				ctx.stroke();
				ctx.restore();
			}

			// 4. Particles — spawn at a constant rate regardless of cursor speed
			if (mouseOnScreen && Math.random() < 0.14) {
				spawnPart(cx, cy, len, wid);
			}
			drawParts(ctx);

			rafRef.current = requestAnimationFrame(frame);
		}

		const onEnter = () => { mouseOnScreen = true; };
		const onLeave = () => { mouseOnScreen = false; };
		const onMove  = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; mouseOnScreen = true; };

		setup();
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseenter", onEnter);
		window.addEventListener("mouseleave", onLeave);
		window.addEventListener("resize", setup);
		rafRef.current = requestAnimationFrame(frame);

		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseenter", onEnter);
			window.removeEventListener("mouseleave", onLeave);
			window.removeEventListener("resize", setup);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={isHome ? "animate-fade-in" : undefined}
			style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
		/>
	);
}
