"use client";

import { useState, useEffect, useRef } from "react";

function randomBinary() {
	return Array.from({ length: 8 }, () => (Math.random() > 0.5 ? "1" : "0")).join("");
}

interface GlitchWordProps {
	normal: string;
	getAlt: () => string;
	/** Class(es) applied to the alt overlay span (e.g. bg-white bg-clip-text) */
	altClassName?: string;
	/** Extra inline style applied to the alt overlay span */
	altStyle?: React.CSSProperties;
	/** CSS animation name applied to the alt overlay span */
	animationName?: string;
	/** Delay (ms) before the very first glitch fires */
	initialDelay?: number;
}

/**
 * Renders a word that periodically glitches to an alternate string.
 * The container is sized to the normal text; the alt text is absolutely
 * centred on top so no layout shift occurs.
 */
function GlitchWord({
	normal,
	getAlt,
	altClassName = "",
	altStyle = {},
	animationName = "glitch-math",
	initialDelay = 3200,
}: GlitchWordProps) {
	const [glitching, setGlitching] = useState(false);
	const [altText, setAltText] = useState("");
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;

		function schedule(extraDelay: number) {
			// Each cycle: wait → glitch for ~250ms → wait → repeat
			const wait = extraDelay + 2000 + Math.random() * 4000;
			const t1 = setTimeout(() => {
				if (!mounted.current) return;
				setAltText(getAlt());
				setGlitching(true);

				const glitchDuration = 500 + Math.random() * 600;
				const t2 = setTimeout(() => {
					if (!mounted.current) return;
					setGlitching(false);
					// schedule next with no extra initial delay
					schedule(0);
				}, glitchDuration);

				return () => clearTimeout(t2);
			}, wait);

			return () => clearTimeout(t1);
		}

		const cancel = schedule(initialDelay);
		return () => {
			mounted.current = false;
			cancel?.();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<span className="bg-white bg-clip-text" style={{ position: "relative", display: "inline-block", lineHeight: "1.3" }}>
			{/* Always in layout flow — bg-clip-text lives on the inline-block wrapper so
			    any implicit overflow clip is scoped to the 1.3em box (safe for descenders).
			    Invisible while glitching. */}
			<span style={{ opacity: glitching ? 0 : 1 }}>{normal}</span>

			{/* Alt text: absolutely centred over the normal text; overflows for wider strings */}
			{glitching && (
				<span
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translateX(-50%) translateY(-50%)",
						whiteSpace: "nowrap",
						display: "inline-block",
					}}
				>
					<span
						className={altClassName}
						style={{
							display: "inline-block",
							animationName,
							animationDuration: "0.32s",
							animationTimingFunction: "linear",
							animationFillMode: "both",
							animationIterationCount: "infinite",
							...altStyle,
						}}
					>
						{altText}
					</span>
				</span>
			)}
		</span>
	);
}

interface GlitchTitleProps {
	className?: string;
}

export function GlitchTitle({ className }: GlitchTitleProps) {
	return (
		<h1 className={className}>
			{"On "}
			<GlitchWord
				normal="Math"
				getAlt={() => "μανθάνω"}
				altStyle={{ fontSize: "0.6em" }}
				animationName="glitch-math"
				initialDelay={3200}
			/>
			{" and "}
			<GlitchWord
				normal="Pedagogy"
				getAlt={randomBinary}
				altStyle={{
					fontFamily: "'Courier New', 'Consolas', monospace",
					color: "#00ff41",
					WebkitTextStroke: "0px",
					textShadow:
						"0 0 6px #00ff41, 0 0 18px #00ff41, 0 0 36px rgba(0,255,65,0.4)",
					letterSpacing: "0.04em",
					fontWeight: 700,
					fontSize: "0.92em",
				}}
				animationName="glitch-binary"
				initialDelay={4800}
			/>
		</h1>
	);
}
