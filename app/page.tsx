import Link from "next/link";
import React from "react";
import Particles from "./components/particles";
import { GlitchTitle } from "./components/glitch-title";

const navigation = [
  { name: "Explore", href: "/explore" },
];

export default function Home() {
  return (
    <div className="relative z-0 flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
      <nav className="my-16 animate-fade-in">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg duration-500 text-zinc-500 hover:text-zinc-300"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />
      <GlitchTitle className="py-3.5 px-0.5 z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-8xl whitespace-nowrap bg-clip-text" />

      <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <div className="my-16 text-center animate-fade-in">
        <h2 className="text-lg text-zinc-500 ">
          Boston University Core Honors Project<br/>Created by Adam Godel
        </h2>
      </div>
    </div>
  );

}
