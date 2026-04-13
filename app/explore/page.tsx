import React from "react";
import Link from "next/link";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { Article } from "./article";

export default function ProjectsPage() {
  const sorted = allProjects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Explore
          </h2>
          <p className="mt-4 text-zinc-400">
            I recommend you start with <Link href="/explore/welcome" className="text-zinc-300 underline underline-offset-4">Welcome</Link>, then <Link href="/explore/proposal" className="text-zinc-300 underline underline-offset-4">Project Proposal</Link>, then the rest in any order, but finish with <Link href="/explore/tidal-wave" className="text-zinc-300 underline underline-offset-4">Tidal Wave</Link>.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 0)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 1)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 2)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
