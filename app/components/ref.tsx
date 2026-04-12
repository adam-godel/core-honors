"use client";
import React, { useState } from "react";

interface RefProps {
	children: React.ReactNode;
	code: string;
	title: string;
	code2?: string;
	title2?: string;
}

export function Ref({ children, code, title, code2, title2 }: RefProps) {
	const [visible, setVisible] = useState(false);

	return (
		<span
			className="relative inline-block"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
		>
			<span
				style={{
					textDecoration: "underline dotted",
					textUnderlineOffset: "3px",
					textDecorationColor: "rgba(212,212,216,0.55)",
					cursor: "default",
				}}
			>
				{children}
			</span>
			<span
				className="absolute z-50 pointer-events-none"
				style={{
					bottom: "calc(100% + 3px)",
					left: "50%",
					transform: "translateX(-50%)",
					opacity: visible ? 1 : 0,
					transition: "opacity 0.18s ease",
				}}
			>
				<span
					className="block bg-zinc-800 text-white rounded-xl px-4 py-2.5 shadow-xl text-center"
					style={{ width: "210px" }}
				>
					<span className="block text-base font-bold tracking-wide leading-tight">
						{code}
					</span>
					<span className="block text-xs mt-1.5 font-normal not-italic text-zinc-300 leading-snug">
						{title}
					</span>
					{code2 && title2 && (
						<>
							<span className="block my-2 border-t border-zinc-600" />
							<span className="block text-base font-bold tracking-wide leading-tight">
								{code2}
							</span>
							<span className="block text-xs mt-1.5 font-normal not-italic text-zinc-300 leading-snug">
								{title2}
							</span>
						</>
					)}
				</span>
				<span
					className="block mx-auto"
					style={{
						width: 0,
						height: 0,
						borderLeft: "7px solid transparent",
						borderRight: "7px solid transparent",
						borderTop: "7px solid #27272a",
					}}
				/>
			</span>
		</span>
	);
}
