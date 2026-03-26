import type { Project } from "@/.contentlayer/generated";
import Link from "next/link";

type Props = {
	project: Project;
};

export const Article: React.FC<Props> = ({ project }) => {
	return (
		<Link href={`/explore/${project.slug}`}>
			<article className="p-4 md:p-8 flex items-center justify-center h-full">
				<h2 className="z-20 text-xl font-medium duration-1000 lg:text-3xl text-zinc-200 group-hover:text-white font-display text-center">
					{project.title}
				</h2>
			</article>
		</Link>
	);
};
