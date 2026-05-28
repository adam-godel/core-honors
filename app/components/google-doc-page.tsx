"use client";
import * as React from "react";

// ── Decorative Google Docs-style toolbar (purely visual) ───────────────────────
function DocToolbar() {
	const menuItems = [
		"File",
		"Edit",
		"View",
		"Insert",
		"Format",
		"Tools",
		"Help",
	];
	return (
		<div
			style={{
				borderBottom: "1px solid #e0e0e0",
				background: "#fff",
				borderRadius: "2px 2px 0 0",
				userSelect: "none",
				pointerEvents: "none",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					padding: "4px 12px 2px",
					gap: "0px",
				}}
			>
				<svg
					width="18"
					height="22"
					viewBox="0 0 18 22"
					fill="none"
					style={{ marginRight: "8px", flexShrink: 0 }}
				>
					<path
						d="M11 0H2C.9 0 0 .9 0 2v18c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-7-6z"
						fill="#4285F4"
					/>
					<path d="M11 0v6h6L11 0z" fill="#A1C2FA" />
					<path
						d="M4 12h10v1.5H4V12zm0 3h10v1.5H4V15zm0-6h6v1.5H4V9z"
						fill="white"
						fillOpacity="0.85"
					/>
				</svg>
				{menuItems.map((item) => (
					<span
						key={item}
						style={{
							fontSize: "13px",
							color: "#3c4043",
							padding: "3px 7px",
							borderRadius: "4px",
							cursor: "default",
						}}
					>
						{item}
					</span>
				))}
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					padding: "3px 12px 4px",
					gap: "2px",
					borderTop: "1px solid #f1f3f4",
				}}
			>
				<ToolbarSelect label="100%" width={52} />
				<ToolbarSep />
				<ToolbarSelect label="Georgia" width={84} />
				<ToolbarSelect label="11" width={36} />
				<ToolbarSep />
				<ToolbarBtn label="B" bold />
				<ToolbarBtn label="I" italic />
				<ToolbarBtn label="U" underline />
				<ToolbarSep />
				<ToolbarColorBtn />
				<ToolbarSep />
				<ToolbarAlignBtn />
				<ToolbarSep />
				<ToolbarListBtn />
				<ToolbarListBtn ordered />
			</div>

			<DocRuler />
		</div>
	);
}

function ToolbarSelect({ label, width }: { label: string; width: number }) {
	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "space-between",
				width,
				height: "24px",
				border: "1px solid transparent",
				borderRadius: "3px",
				padding: "0 4px",
				fontSize: "12px",
				color: "#3c4043",
				gap: "4px",
				flexShrink: 0,
			}}
		>
			<span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{label}</span>
			<svg width="8" height="5" viewBox="0 0 8 5" fill="none">
				<path
					d="M1 1l3 3 3-3"
					stroke="#5f6368"
					strokeWidth="1.4"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
}

function ToolbarBtn({
	label,
	bold,
	italic,
	underline,
}: {
	label: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
}) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: "26px",
				height: "24px",
				borderRadius: "3px",
				fontSize: "13px",
				color: "#3c4043",
				fontWeight: bold ? "700" : "400",
				fontStyle: italic ? "italic" : "normal",
				textDecoration: underline ? "underline" : "none",
				flexShrink: 0,
			}}
		>
			{label}
		</span>
	);
}

function ToolbarColorBtn() {
	return (
		<span
			style={{
				display: "inline-flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "26px",
				height: "24px",
				borderRadius: "3px",
				fontSize: "13px",
				color: "#3c4043",
				fontWeight: "700",
				lineHeight: 1,
				gap: "1px",
				flexShrink: 0,
			}}
		>
			<span>A</span>
			<span
				style={{
					width: "14px",
					height: "3px",
					background: "#fbbc04",
					borderRadius: "1px",
				}}
			/>
		</span>
	);
}

function ToolbarAlignBtn() {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: "26px",
				height: "24px",
				borderRadius: "3px",
				flexShrink: 0,
			}}
		>
			<svg width="14" height="12" viewBox="0 0 14 12" fill="none">
				<path
					d="M1 1h12M1 4.5h8M1 8h12M1 11.5h8"
					stroke="#5f6368"
					strokeWidth="1.3"
					strokeLinecap="round"
				/>
			</svg>
		</span>
	);
}

function ToolbarListBtn({ ordered }: { ordered?: boolean }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: "26px",
				height: "24px",
				borderRadius: "3px",
				flexShrink: 0,
			}}
		>
			{ordered ? (
				<svg width="14" height="12" viewBox="0 0 14 12" fill="none">
					<path
						d="M5 2h8M5 6h8M5 10h8"
						stroke="#5f6368"
						strokeWidth="1.3"
						strokeLinecap="round"
					/>
					<text x="0" y="3" fontSize="4.5" fill="#5f6368">
						1.
					</text>
					<text x="0" y="7" fontSize="4.5" fill="#5f6368">
						2.
					</text>
					<text x="0" y="11" fontSize="4.5" fill="#5f6368">
						3.
					</text>
				</svg>
			) : (
				<svg width="14" height="12" viewBox="0 0 14 12" fill="none">
					<path
						d="M5 2h8M5 6h8M5 10h8"
						stroke="#5f6368"
						strokeWidth="1.3"
						strokeLinecap="round"
					/>
					<circle cx="2" cy="2" r="1.3" fill="#5f6368" />
					<circle cx="2" cy="6" r="1.3" fill="#5f6368" />
					<circle cx="2" cy="10" r="1.3" fill="#5f6368" />
				</svg>
			)}
		</span>
	);
}

function ToolbarSep() {
	return (
		<span
			style={{
				display: "inline-block",
				width: "1px",
				height: "18px",
				background: "#dadce0",
				margin: "0 3px",
				flexShrink: 0,
			}}
		/>
	);
}

function DocRuler() {
	const ticks = Array.from({ length: 19 }, (_, i) => i);
	return (
		<div
			style={{
				position: "relative",
				height: "18px",
				background: "#f1f3f4",
				borderTop: "1px solid #e0e0e0",
				overflow: "hidden",
				display: "flex",
				alignItems: "flex-end",
				paddingBottom: "2px",
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: "72px",
					background: "#e0e0e0",
					opacity: 0.5,
				}}
			/>
			<div
				style={{
					position: "absolute",
					right: 0,
					top: 0,
					bottom: 0,
					width: "72px",
					background: "#e0e0e0",
					opacity: 0.5,
				}}
			/>
			{ticks.map((i) => {
				const isInch = i % 2 === 0;
				const x = 72 + i * 36;
				return (
					<div
						key={i}
						style={{
							position: "absolute",
							left: x,
							bottom: "2px",
							width: "1px",
							height: isInch ? "8px" : "5px",
							background: "#9aa0a6",
						}}
					/>
				);
			})}
		</div>
	);
}

export function GoogleDocPage({ children }: { children: React.ReactNode }) {
	return (
		<div className="not-prose flex justify-center my-10">
			<div
				className="w-full"
				style={{
					maxWidth: "720px",
					background: "#fff",
					borderRadius: "2px",
					boxShadow: "0 1px 3px rgba(0,0,0,0.25), 0 8px 40px rgba(0,0,0,0.35)",
				}}
			>
				<DocToolbar />
				<div
					className="prose prose-zinc prose-lg prose-quoteless doc-article"
					style={{
						padding: "28px 72px 64px",
						fontFamily: "Georgia, 'Times New Roman', serif",
						color: "#202124",
					}}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
