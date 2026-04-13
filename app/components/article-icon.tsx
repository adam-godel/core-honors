import {
	Globe,
	Waves,
	GraduationCap,
	BookOpen,
	Landmark,
	Monitor,
	Library,
	Cpu,
	MessagesSquare,
	type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
	globe: Globe,
	waves: Waves,
	"graduation-cap": GraduationCap,
	"book-open": BookOpen,
	landmark: Landmark,
	monitor: Monitor,
	library: Library,
	cpu: Cpu,
	"messages-square": MessagesSquare,
};

// Styling knobs — change these to restyle all icons at once
const SIZE = 500;
const OVERLAP = 200; // px the icon dips into the text column
const COLOR = "#3f3f46"; // zinc-700
const OPACITY = 0.6;
const STROKE_WIDTH = 0.65;

type Props = {
	icon: string;
	side: "left" | "right";
};

export function ArticleIcon({ icon, side }: Props) {
	const Icon = ICONS[icon];
	if (!Icon) return null;

	const inset = -(SIZE - OVERLAP);

	return (
		<div
			className="hidden lg:block"
			style={{
				position: "relative",
				height: 0,
				overflow: "visible",
				pointerEvents: "none",
				userSelect: "none",
			}}
		>
			<div
				style={{
					position: "absolute",
					[side]: inset,
					top: 0,
					width: SIZE,
					height: SIZE,
					color: COLOR,
					opacity: OPACITY,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: -1,
				}}
			>
				<Icon size={SIZE} strokeWidth={STROKE_WIDTH} />
			</div>
		</div>
	);
}
