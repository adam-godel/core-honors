"use client";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { RefreshCw } from "lucide-react";

// ── Rewrite state machine ──────────────────────────────────────────────────────
type RewriteState = "idle" | "selecting" | "fading" | "typing";

interface DocRewriteCtx {
	state: RewriteState;
	triggerRewrite: () => void;
	allTyped: boolean;
	markAllTyped: () => void;
}

const DocRewriteContext = createContext<DocRewriteCtx>({
	state: "idle",
	triggerRewrite: () => {},
	allTyped: false,
	markAllTyped: () => {},
});

export function DocRewriteProvider({
	children,
}: { children: React.ReactNode }) {
	const [state, setState] = useState<RewriteState>("idle");
	const [allTyped, setAllTyped] = useState(false);

	const triggerRewrite = useCallback(() => {
		if (state !== "idle") return;
		setState("selecting");
		setTimeout(() => setState("fading"), 900);
		setTimeout(() => setState("typing"), 1400);
	}, [state]);

	const markAllTyped = useCallback(() => setAllTyped(true), []);

	return (
		<DocRewriteContext.Provider
			value={{ state, triggerRewrite, allTyped, markAllTyped }}
		>
			{children}
		</DocRewriteContext.Provider>
	);
}

// No-op — kept so the MDX file doesn't error if still referenced
export function DocEditCursor() {
	return null;
}

// ── Inline cursor ─────────────────────────────────────────────────────────────
const CURSOR_STYLE: React.CSSProperties = {
	display: "inline-block",
	width: "2px",
	height: "1.1em",
	background: "#1a73e8",
	verticalAlign: "text-bottom",
	borderRadius: "1px",
	marginLeft: "1px",
};

// ── Character helpers ─────────────────────────────────────────────────────────
function countChars(node: React.ReactNode): number {
	if (node === null || node === undefined || node === false) return 0;
	if (typeof node === "string") return node.length;
	if (typeof node === "number") return String(node).length;
	if (Array.isArray(node))
		return node.reduce((sum, n) => sum + countChars(n), 0);
	if (React.isValidElement(node))
		return countChars(
			(node.props as Record<string, unknown>).children as React.ReactNode,
		);
	return 0;
}

function renderPartial(
	node: React.ReactNode,
	count: number,
): { content: React.ReactNode; consumed: number } {
	if (count <= 0) return { content: null, consumed: 0 };
	if (node === null || node === undefined || node === false)
		return { content: null, consumed: 0 };

	if (typeof node === "string") {
		const take = Math.min(count, node.length);
		return { content: node.slice(0, take), consumed: take };
	}
	if (typeof node === "number") {
		const s = String(node);
		const take = Math.min(count, s.length);
		return { content: s.slice(0, take), consumed: take };
	}
	if (Array.isArray(node)) {
		const parts: React.ReactNode[] = [];
		let remaining = count;
		for (const child of node) {
			if (remaining <= 0) break;
			const { content, consumed } = renderPartial(child, remaining);
			if (content !== null && content !== undefined) parts.push(content);
			remaining -= consumed;
		}
		return {
			content: parts.length > 0 ? parts : null,
			consumed: count - remaining,
		};
	}
	if (React.isValidElement(node)) {
		const nodeChildren = (node.props as Record<string, unknown>)
			.children as React.ReactNode;
		const cost = Math.max(countChars(nodeChildren), 1);
		if (count >= cost) return { content: node, consumed: cost };
		// Partially render the element's children so inline elements (e.g. <em>, <strong>)
		// type character-by-character instead of appearing all-at-once.
		const { content: partial, consumed } = renderPartial(nodeChildren, count);
		if (consumed === 0) return { content: null, consumed: 0 };
		return {
			content: React.cloneElement(
				node as React.ReactElement,
				{},
				partial ?? "",
			),
			consumed,
		};
	}
	return { content: null, consumed: 0 };
}

// ── Per-paragraph typing block ────────────────────────────────────────────────
// compact=true       → pending renders null (no space, used in DocOriginal + DocInsert)
// startImmediately=true → skip IntersectionObserver, type as soon as status=typing
function TypingBlock({
	children,
	status,
	onDone,
	compact = false,
	startImmediately = false,
}: {
	children: React.ReactNode;
	status: "pending" | "typing" | "done";
	onDone: () => void;
	compact?: boolean;
	startImmediately?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(startImmediately);
	const [typedCount, setTypedCount] = useState(0);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	const element = React.isValidElement(children)
		? (children as React.ReactElement<Record<string, unknown>>)
		: null;
	const innerContent = element
		? (element.props.children as React.ReactNode)
		: children;
	const totalChars = useMemo(() => countChars(innerContent), [innerContent]);

	useEffect(() => {
		if (startImmediately) return;
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					obs.disconnect();
				}
			},
			{ threshold: 0.05, rootMargin: "0px 0px -20px 0px" },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [startImmediately]);

	// 1 char per 28 ms ≈ 36 chars/sec
	const shouldType = status === "typing" && inView && typedCount < totalChars;
	useEffect(() => {
		if (!shouldType) return;
		const id = setInterval(() => {
			setTypedCount((prev) => {
				const next = Math.min(prev + 1, totalChars);
				if (next >= totalChars) {
					clearInterval(id);
					setTimeout(() => onDoneRef.current(), 180);
				}
				return next;
			});
		}, 28);
		return () => clearInterval(id);
	}, [shouldType, totalChars]);

	const fullyTyped = typedCount >= totalChars;

	if (status === "done" || fullyTyped)
		return (
			<div ref={ref} className="doc-tb">
				{children}
			</div>
		);

	if (status === "pending") {
		if (compact) return null;
		return (
			<div ref={ref} className="doc-tb" style={{ visibility: "hidden" }}>
				{children}
			</div>
		);
	}

	// Typing: partial content + inline cursor
	const { content: partial } = renderPartial(innerContent, typedCount);
	const cursorEl = (
		<span key="__cursor" className="doc-cursor" style={CURSOR_STYLE} />
	);

	if (element) {
		return (
			<div ref={ref} className="doc-tb">
				{React.cloneElement(element, {}, partial ?? "", cursorEl)}
			</div>
		);
	}
	return (
		<div ref={ref} className="doc-tb">
			{partial}
			{cursorEl}
		</div>
	);
}

// ── DocOriginal ───────────────────────────────────────────────────────────────
// All pending blocks are compact (no space). A 1px sentinel triggers the start
// when the section scrolls into view, then blocks type sequentially.
export function DocOriginal({ children }: { children: React.ReactNode }) {
	const { state, markAllTyped } = useContext(DocRewriteContext);
	const [activeIndex, setActiveIndex] = useState(-1); // -1 = not yet started
	const sentinelRef = useRef<HTMLDivElement>(null);

	const isSelecting = state === "selecting";
	const isFading = state === "fading";
	const isGone = state === "typing";

	const childArray = React.Children.toArray(children);
	const childCount = childArray.length;

	// Start when the sentinel pixel scrolls into view
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setActiveIndex(0);
					obs.disconnect();
				}
			},
			{ threshold: 0, rootMargin: "0px 0px -60px 0px" },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	// Notify context when all paragraphs have been typed
	useEffect(() => {
		if (activeIndex >= childCount && childCount > 0) markAllTyped();
	}, [activeIndex, childCount, markAllTyped]);

	return (
		<div
			style={{
				position: "relative",
				opacity: isFading || isGone ? 0 : 1,
				transform: isFading || isGone ? "translateY(-6px)" : "translateY(0)",
				maxHeight: isGone ? "0" : "99999px",
				overflow: isGone ? "hidden" : "visible",
				transition: [
					"opacity 0.4s ease",
					"transform 0.4s ease",
					isGone ? "max-height 0s ease 0.4s" : "",
				]
					.filter(Boolean)
					.join(", "),
			}}
		>
			{/* 1px sentinel — always in the DOM so IO can fire even when all blocks are compact */}
			<div ref={sentinelRef} style={{ height: "1px", margin: 0, padding: 0 }} />

			{/* Sweep-select animation */}
			{isSelecting && (
				<>
					<div
						style={{
							position: "absolute",
							inset: "-2px -6px",
							background: "rgba(26,115,232,0.13)",
							borderRadius: "4px",
							pointerEvents: "none",
							zIndex: 1,
							animationName: "doc-select-highlight",
							animationDuration: "0.9s",
							animationTimingFunction: "ease-out",
							animationFillMode: "forwards",
						}}
					/>
					<div
						style={{
							position: "absolute",
							right: "-4px",
							top: 0,
							width: "2px",
							height: "1.2em",
							background: "#1a73e8",
							borderRadius: "1px",
							pointerEvents: "none",
							zIndex: 2,
							animationName: "doc-select-cursor",
							animationDuration: "0.9s",
							animationTimingFunction: "ease-out",
							animationFillMode: "forwards",
						}}
					/>
				</>
			)}

			{childArray.map((child, i) => {
				const blockStatus =
					activeIndex < 0
						? "pending"
						: i < activeIndex
						? "done"
						: i === activeIndex
						? "typing"
						: "pending";
				return (
					<TypingBlock
						key={i}
						status={blockStatus}
						compact={true}
						startImmediately={true}
						onDone={() => setActiveIndex((prev) => Math.max(prev, i + 1))}
					>
						{child}
					</TypingBlock>
				);
			})}
		</div>
	);
}

// ── DocRefreshButton ───────────────────────────────────────────────────────────
export function DocRefreshButton() {
	const { state, triggerRewrite, allTyped } = useContext(DocRewriteContext);
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setInView(true);
			},
			{ threshold: 0.4 },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	// Disappear immediately when the button is clicked (any non-idle state)
	if (state !== "idle") return null;

	const visible = inView && allTyped;

	return (
		<div
			ref={ref}
			style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				margin: "12px 0 8px",
				opacity: visible ? 1 : 0,
				transform: visible ? "translateY(0)" : "translateY(4px)",
				transition: "opacity 0.6s ease, transform 0.6s ease",
				pointerEvents: visible ? "auto" : "none",
			}}
		>
			<span
				style={{
					fontSize: "inherit",
					lineHeight: "inherit",
					color: "#80868b",
					fontStyle: "italic",
				}}
			>
				Clean this up?
			</span>
			<button
				onClick={triggerRewrite}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				disabled={state !== "idle"}
				aria-label="Clean this up"
				title="Clean this up"
				style={{
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					width: "30px",
					height: "30px",
					borderRadius: "50%",
					border: "none",
					outline: "none",
					background: hovered && state === "idle" ? "#e8f0fe" : "transparent",
					cursor: state === "idle" ? "pointer" : "default",
					color: "#1a73e8",
					transition: "background 0.2s ease",
					padding: 0,
					flexShrink: 0,
				}}
			>
				<RefreshCw
					size={15}
					strokeWidth={2.2}
					style={{
						transition: "transform 0.9s ease",
						transform: "rotate(0deg)",
					}}
				/>
			</button>
		</div>
	);
}

// ── DocInsert ─────────────────────────────────────────────────────────────────
// Same sequential TypingBlock approach as DocOriginal.
// Compact blocks so the document grows as text is typed.
export function DocInsert({ children }: { children: React.ReactNode }) {
	const { state } = useContext(DocRewriteContext);
	const [activeIndex, setActiveIndex] = useState(-1);

	const childArray = React.Children.toArray(children);

	useEffect(() => {
		if (state === "typing" && activeIndex === -1) {
			const id = setTimeout(() => setActiveIndex(0), 2000);
			return () => clearTimeout(id);
		}
	}, [state, activeIndex]);

	if (activeIndex === -1) return null;

	return (
		<div>
			{childArray.map((child, i) => (
				<TypingBlock
					key={i}
					status={
						i < activeIndex ? "done" : i === activeIndex ? "typing" : "pending"
					}
					compact={true}
					startImmediately={true}
					onDone={() => setActiveIndex((prev) => Math.max(prev, i + 1))}
				>
					{child}
				</TypingBlock>
			))}
		</div>
	);
}
