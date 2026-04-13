export default function ProjectsLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="relative z-0 min-h-screen">
			{children}
		</div>
	);
}
