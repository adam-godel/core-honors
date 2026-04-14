import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-4xl font-bold text-white font-calsans">Error 404</h1>
      <p className="mt-4 text-zinc-400">Page Not Found</p>
      <Link href="/" className="mt-8 text-zinc-400 hover:text-zinc-200 duration-500">
        ← Back Home
      </Link>
    </div>
  );
}
