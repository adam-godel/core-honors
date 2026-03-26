import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";

type Props = {
  params: {
    slug: string;
  };
};

export default function PostPage({ params }: Props) {
  const slug = params?.slug;
  const project = allProjects.find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="bg-gradient-to-tl from-black via-zinc-900 to-black min-h-screen">
      <Header project={project} />

      <article className="px-4 pt-4 pb-12 mx-auto prose prose-lg prose-invert prose-quoteless text-zinc-300">
        <Mdx code={project.body.code} />
      </article>
    </div>
  );
}
